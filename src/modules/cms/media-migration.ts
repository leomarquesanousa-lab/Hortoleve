import { createHash } from "node:crypto";
import { open, realpath, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { readLocalMedia, storageRoot } from "./local-storage.ts";
import { originalImageURLs } from "../catalog/storage-images.ts";

export type Asset = { source: string; filename: string; sha256: string; bytes: number };
export const digest = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");

// Somente campos de imagens de produtos; não inclui logotipos ou páginas institucionais.
export function productImagePaths(items: { resource: string; data: Record<string, unknown> }[]) {
    const paths = new Set<string>();
    for (const { resource, data } of items) {
        if (resource !== "produtos") continue;
        for (const value of [data.cardImage, data.seoImage, ...[data.gallery, data.media].flatMap(images => Array.isArray(images) ? images.map(image => image.src) : [])]) {
            if (typeof value === "string" && value.startsWith("/media/")) for (const original of originalImageURLs(value)) paths.add(original);
            if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/media/")) paths.add(value);
        }
    }
    return [...paths].sort();
}

export async function inventoryImages(publicDirectory: string, sources: string[]): Promise<Asset[]> {
    const root = await realpath(publicDirectory);
    const assets: Asset[] = [];
    for (const source of [...new Set(sources)].sort()) {
        if (!source.startsWith("/") || source.startsWith("//") || /[\\\u0000?#]/.test(source)) throw new Error("Caminho de origem inválido.");
        const filename = await realpath(path.join(root, source.slice(1)));
        const relative = path.relative(root, filename);
        if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Origem fora de public.");
        const extension = path.extname(source).toLowerCase();
        if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) throw new Error("Formato não suportado.");
        const bytes = await readFile(filename);
        if (bytes.length > 32000000) throw new Error("Imagem acima do limite de 32 MB para migração.");
        const info = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
        if (info.format !== ({ ".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg", ".webp": "webp" }[extension]) || (info.pages ?? 1) > 1) throw new Error("Conteúdo incompatível com a extensão.");
        const hash = digest(bytes);
        assets.push({ source, filename: hash + (extension === ".jpeg" ? ".jpg" : extension), sha256: hash, bytes: bytes.length });
    }
    return assets;
}

export async function copyImages(publicDirectory: string, assets: Asset[]) {
    // Revalida todos os originais antes da primeira cópia; o manifesto não concede acesso ao disco.
    const actual = await inventoryImages(publicDirectory, assets.map(a => a.source));
    if (JSON.stringify(actual) !== JSON.stringify(assets)) throw new Error("Origens mudaram desde a prévia.");
    const root = await storageRoot();
    let copied = 0;
    for (const asset of assets) {
        try {
            const existing = await readLocalMedia(asset.filename);
            if (digest(existing) !== asset.sha256) throw new Error("Conflito no destino.");
            continue;
        } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
        const bytes = await readFile(path.join(publicDirectory, asset.source.slice(1)));
        if (digest(bytes) !== asset.sha256) throw new Error("Origem modificada durante a cópia.");
        const handle = await open(path.join(root, asset.filename), "wx", 0o600);
        try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
        if (digest(await readLocalMedia(asset.filename)) !== asset.sha256) throw new Error("Cópia divergente.");
        copied++;
    }
    return copied;
}

export function replaceImageReferences(value: unknown, map: Map<string, string>): unknown {
    if (typeof value === "string") return map.get(value) ?? value;
    if (Array.isArray(value)) return value.map(item => replaceImageReferences(item, map));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceImageReferences(item, map)]));
    return value;
}
