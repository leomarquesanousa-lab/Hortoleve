import env from "@next/env";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { Pool } from "pg";
import { initialContent } from "../src/modules/cms/initial-content.ts";
import { storageImageURL } from "../src/modules/catalog/storage-images.ts";

env.loadEnvConfig(process.cwd());
async function walk(directory: string): Promise<string[]> {
    const result: string[] = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) result.push(...await walk(file));
        else if (/\.(png|jpe?g|webp|avif|gif|svg|ico)$/i.test(entry.name)) result.push(file);
    }
    return result.sort();
}
async function main() {
    const items = initialContent.filter(i => i.resource !== "midia");
    const files = await walk(path.resolve("public"));
    const images: { src: string; name: string; alt: string; width: number; height: number; folder: string; area: string; productIds: string; valid: boolean; references: string[] }[] = [];
    for (const file of files) {
        const src = "/" + path.relative(path.resolve("public"), file).split(path.sep).join("/");
        const references = items.filter(i => [src, storageImageURL(src)].some(url => JSON.stringify(i.data).includes(JSON.stringify(url))));
        const products = references.filter(i => i.resource === "produtos");
        const legacy = /(?:_old|old\.)/i.test(src);
        const area = products.length ? "Produtos" : legacy ? "Versões antigas" : /^\/(logo|favicom|favicon)\//i.test(src) ? "Identidade visual" : /^\/tecnologia\//i.test(src) ? "Tecnologias" : references.length ? "Institucional e Home" : "Sem associação publicada";
        let width = 0, height = 0, format = "", valid = false;
        try { const meta = await sharp(await readFile(file)).metadata(); width = meta.width ?? 0; height = meta.height ?? 0; format = meta.format ?? ""; valid = ["png", "jpeg", "webp", "avif", "gif"].includes(format) && width > 0 && height > 0; } catch { /* Relatório inclui ícones e arquivos não decodificáveis sem importá-los. */ }
        const filename = path.basename(file);
        const folder = path.posix.dirname(src).slice(1);
        images.push({ src, name: `${products.map(p => String(p.data.name)).join(" / ") || area} — ${folder} / ${filename}`, alt: products.length ? `${products.map(p => String(p.data.name)).join(" / ")} — ${filename}` : filename, width, height, folder, area, productIds: products.map(p => p.id).join("\n"), valid, references: references.map(i => `${i.resource}:${i.id}`) });
    }
    const report: Record<string, unknown> = {
        products: items.filter(i => i.resource === "produtos").map(i => ({ id: i.id, name: i.data.name, categoryId: i.data.categoryId })),
        categories: items.filter(i => i.resource === "categorias").map(i => ({ id: i.id, name: i.data.name, parentId: i.data.parentId ?? null })),
        totalImages: images.length, selectableImages: images.filter(i => i.valid).length,
        byArea: Object.fromEntries([...new Set(images.map(i => i.area))].map(area => [area, images.filter(i => i.area === area).length])), images, cmsInspected: false,
    };
    if (process.argv.includes("--with-cms")) {
        const url = new URL(process.env.DATABASE_URL ?? "");
        if (url.hostname !== "ep-little-bread-b6jug9wz-pooler.c-2.sa-east-1.aws.neon.tech" || url.pathname !== "/neondb") throw Error("Identidade do banco divergente; inspeção cancelada.");
        const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });
        const client = await pool.connect();
        try {
            await client.query("BEGIN READ ONLY");
            await client.query("SET LOCAL statement_timeout = '15000ms'");
            const { rows } = await client.query('SELECT key, value FROM "SiteSetting" WHERE key LIKE \'cms:%\' OR key LIKE \'cms-deleted:%\'');
            const relational = await client.query('SELECT id, name, slug FROM "Product"');
            const relationalCategories = await client.query('SELECT id, name, slug FROM "Category"');
            const media = rows.filter(r => r.key.startsWith("cms:midia:"));
            const savedImages = new Set(media.flatMap(r => [r.value?.draft?.src, r.value?.published?.src]).filter(Boolean));
            const deleted = new Set(rows.filter(r => r.key.startsWith("cms-deleted:")).map(r => r.key));
            report.cmsInspected = true;
            report.cms = {
                databaseIdentityConfirmed: true, products: relational.rows, categories: relationalCategories.rows,
                productDocuments: rows.filter(r => r.key.startsWith("cms:produtos:")).length,
                missingProducts: items.filter(i => i.resource === "produtos" && !rows.some(r => r.key === "cms:produtos:" + i.id)).map(i => ({ id: i.id, name: i.data.name, deleted: deleted.has("cms-deleted:produtos:" + i.id) })),
                missingCategories: items.filter(i => i.resource === "categorias" && !rows.some(r => r.key === "cms:categorias:" + i.id)).map(i => ({ id: i.id, name: i.data.name, deleted: deleted.has("cms-deleted:categorias:" + i.id) })),
                mediaDocuments: media.length,
                missingImages: images.filter(i => !savedImages.has(i.src)).map(i => ({ src: i.src, area: i.area, selectable: i.valid })),
            };
            await client.query("ROLLBACK");
        } finally { client.release(); await pool.end(); }
    }
    if (process.argv.includes("--generate")) {
        const eligible = images.filter(i => i.valid).map(({ src, name, alt, width, height, folder, area, productIds }) => ({ src, name, alt, width, height, folder, area, productIds }));
        await writeFile("src/modules/cms/public-media.generated.ts", "// Generated by scripts/inventory-catalog.mts. No runtime filesystem scan.\nexport const publicMedia = " + JSON.stringify(eligible, null, 2) + ";\n");
    }
    await writeFile("src/modules/cms/catalog-inventory.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ products: (report.products as unknown[]).length, categories: (report.categories as unknown[]).length, images: images.length, selectable: report.selectableImages, byArea: report.byArea, cms: report.cms ?? "Não consultado" }, null, 2));
}
main().catch(() => { console.error("Inventário interrompido; confira arquivos e conexão. Nenhuma escrita no banco foi executada e nenhuma credencial foi exibida."); process.exitCode = 1; });
