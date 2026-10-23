import env from "@next/env";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client.ts";
import { initialContent } from "../src/modules/cms/initial-content.ts";
import { copyImages, digest, inventoryImages, productImagePaths, replaceImageReferences } from "../src/modules/cms/media-migration.ts";
import { probeLocalStorage, readLocalMedia } from "../src/modules/cms/local-storage.ts";

env.loadEnvConfig(process.cwd());
const args = new Set(process.argv.slice(2));
const marker = "cms-media-migration:v1";
type Backup = { documents: { key: string; before: Prisma.JsonValue; after: Prisma.JsonValue }[]; media: { id: string; before: string; after: string }[] };
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

async function authorizeWrite() {
    if (process.env.CMS_MEDIA_MIGRATION_ALLOWED !== "true" || !process.stdin.isTTY || (process.env.NODE_ENV === "production" && !args.has("--allow-production-write"))) throw Error("Escrita não autorizada.");
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try { if (await prompt.question("Após backup e aprovação, digite MIGRAR IMAGENS SEM EXCLUIR: ") !== "MIGRAR IMAGENS SEM EXCLUIR") throw Error("Cancelado."); } finally { prompt.close(); }
}

async function main() {
    const modes = ["--copy", "--apply-cms", "--rollback-cms"].filter(mode => args.has(mode));
    if (modes.length > 1) throw Error("Execute apenas uma etapa por vez.");
    if (modes.length) await authorizeWrite();
    const needsDatabase = args.has("--with-cms") || args.has("--apply-cms") || args.has("--rollback-cms");
    let db: PrismaClient | undefined;
    try {
        if (needsDatabase) {
            const url = new URL(process.env.DATABASE_URL ?? "");
            if (!["postgres:", "postgresql:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? ""))) throw Error("Conexão inválida.");
            db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }), log: [] });
        }
        if (args.has("--rollback-cms")) {
            await db!.$transaction(async tx => {
                await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
                const row = await tx.siteSetting.findUnique({ where: { key: marker } });
                if (!row) throw Error("Não há migração registrada.");
                const backup = row.value as unknown as Backup;
                for (const item of backup.documents) {
                    const current = await tx.siteSetting.findUnique({ where: { key: item.key } });
                    if (!isDeepStrictEqual(current?.value, item.after)) throw Error("Documento editado após migração; reversão automática bloqueada.");
                }
                for (const item of backup.media) {
                    const current = await tx.productMedia.findUnique({ where: { id: item.id } });
                    if (current?.url !== item.after) throw Error("Galeria alterada após migração; reversão bloqueada.");
                }
                for (const item of backup.documents) {
                    const before = json(item.before) as Record<string, Prisma.InputJsonValue>;
                    before.revision = Number((item.after as Record<string, unknown>).revision ?? 0) + 1;
                    await tx.siteSetting.update({ where: { key: item.key }, data: { value: before } });
                }
                for (const item of backup.media) await tx.productMedia.update({ where: { id: item.id }, data: { url: item.before } });
                await tx.siteSetting.delete({ where: { key: marker } });
            }, { timeout: 60000 });
            console.log("Referências anteriores restauradas; arquivos físicos preservados."); return;
        }
        const docs = db ? await db.siteSetting.findMany({ where: { key: { startsWith: "cms:" } } }) : [];
        const cmsItems = docs.filter(row => row.key.startsWith("cms:produtos:")).flatMap(row => {
            const doc = row.value as unknown as { draft: Record<string, unknown>; published?: Record<string, unknown> };
            return [doc.draft, doc.published].filter(Boolean).map(data => ({ resource: "produtos", data: data! }));
        });
        const sources = productImagePaths([...initialContent, ...cmsItems]);
        const publicDirectory = path.resolve("public");
        const assets = await inventoryImages(publicDirectory, sources);
        const plan = { version: 1, productsStatic: initialContent.filter(i => i.resource === "produtos").length, cmsInspected: needsDatabase, productsCMS: needsDatabase ? docs.filter(d => d.key.startsWith("cms:produtos:")).length : null, uniqueFiles: new Set(assets.map(a => a.filename)).size, assets: assets.map(a => ({ ...a, target: "/media/products/" + a.filename })) };
        const output = process.argv.find(a => a.startsWith("--out="))?.slice(6);
        if (output) await writeFile(output, JSON.stringify(plan, null, 2), { flag: "wx", mode: 0o600 });
        console.log(JSON.stringify(plan, null, 2));
        if (args.has("--copy")) {
            await probeLocalStorage();
            console.log("Novas cópias validadas:", await copyImages(publicDirectory, assets));
        }
        if (args.has("--apply-cms")) {
            await probeLocalStorage();
            for (const asset of assets) if (digest(await readLocalMedia(asset.filename)) !== asset.sha256) throw Error("Cópia não validada; banco não alterado.");
            const map = new Map(assets.map(a => [a.source, "/media/products/" + a.filename]));
            await db!.$transaction(async tx => {
                await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
                if (await tx.siteSetting.findUnique({ where: { key: marker } })) throw Error("Migração já registrada; nenhuma reaplicação automática.");
                if ((await tx.siteSetting.findUnique({ where: { key: "cms-import-completed" } }))?.value !== true) throw Error("Sincronize primeiro os produtos no CMS.");
                const current = await tx.siteSetting.findMany({ where: { key: { startsWith: "cms:" } } });
                // Uma edição concorrente exige gerar nova prévia.
                if (!isDeepStrictEqual(current.sort((a,b) => a.key.localeCompare(b.key)), docs.sort((a,b) => a.key.localeCompare(b.key)))) throw Error("CMS mudou desde a prévia.");
                const backup: Backup = { documents: [], media: [] };
                for (const row of current) {
                    const updated = replaceImageReferences(row.value, map) as Record<string, unknown>;
                    if (JSON.stringify(updated) === JSON.stringify(row.value)) continue;
                    updated.revision = Number(updated.revision ?? 0) + 1;
                    backup.documents.push({ key: row.key, before: row.value, after: json(updated) as Prisma.JsonValue });
                }
                for (const row of await tx.productMedia.findMany()) {
                    const target = map.get(row.url);
                    if (target) backup.media.push({ id: row.id, before: row.url, after: target });
                }
                for (const item of backup.documents) await tx.siteSetting.update({ where: { key: item.key }, data: { value: json(item.after) } });
                for (const item of backup.media) await tx.productMedia.update({ where: { id: item.id }, data: { url: item.after } });
                await tx.siteSetting.create({ data: { key: marker, value: json(backup) } });
            }, { timeout: 60000 });
            console.log("Referências migradas atomicamente. Backup de reversão registrado; nenhum original excluído.");
        }
        if (!modes.length) console.log("Prévia apenas. Nenhuma imagem ou dado alterado.");
    } finally { await db?.$disconnect(); }
}

main().catch(() => { console.error("Etapa interrompida. Confira origens, permissões, cópias, prévia e autorizações. Nenhuma credencial foi exibida. Arquivos originais permanecem preservados."); process.exitCode = 1; });
