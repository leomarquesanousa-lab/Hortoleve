import { constants } from "node:fs";
import { access, open, realpath, stat, unlink, readdir, lstat } from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";

export const mediaFilename = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp|[0-9a-f]{64}\.(?:png|jpe?g|webp))$/;

export function localStoragePath() {
    const directory = process.env.CMS_STORAGE_PATH;
    if (!directory || !path.isAbsolute(directory)) return null;
    return path.resolve(directory);
}

export async function storageRoot() {
    const directory = localStoragePath();
    if (!directory) throw new Error("Configure um caminho absoluto para CMS_STORAGE_PATH.");
    // Storage externo existe somente no servidor; não deve entrar no bundle.
    // O comentário afeta apenas o tracing, mantendo realpath e todas as validações.
    const resolved = await realpath(/* turbopackIgnore: true */ directory);
    const application = await realpath(process.cwd());
    const relative = path.relative(application, resolved);
    if (!relative || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative))) throw new Error("Storage deve ficar fora da pasta da aplicação.");
    if (!(await stat(resolved)).isDirectory()) throw new Error("Storage não é um diretório.");
    return resolved;
}

export async function writeLocalMedia(bytes: Buffer) {
    const directory = await storageRoot();
    const filename = randomUUID() + ".webp";
    const handle = await open(path.join(directory, filename), "wx", 0o600);
    try { await handle.writeFile(bytes); await handle.sync(); }
    finally { await handle.close(); }
    return { src: "/media/products/" + filename, objectKey: filename };
}

export async function readLocalMedia(filename: string) {
    if (!mediaFilename.test(filename)) throw new Error("Nome inválido.");
    return readMediaFromDirectory(await storageRoot(), filename);
}

async function readMediaFromDirectory(directory: string, filename: string) {
    if (!mediaFilename.test(filename)) throw new Error("Nome inválido.");
    const handle = await open(path.join(directory, filename), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
        const info = await handle.stat();
        if (!info.isFile() || info.size > 32000000) throw new Error("Arquivo inválido.");
        return await handle.readFile();
    } finally { await handle.close(); }
}

// Somente leitura; executado explicitamente pelo OWNER após a extração do pacote.
export async function validateStorageImages(assets: { filename: string; sha256: string; bytes: number }[]) {
    // Erros do diretório não podem ser contabilizados como 112 arquivos ausentes.
    const directory = await storageRoot();
    await access(directory, constants.R_OK | constants.X_OK);
    const missing: string[] = [], invalid: string[] = [];
    for (const asset of assets) {
        try {
            const bytes = await readMediaFromDirectory(directory, asset.filename);
            if (bytes.length !== asset.bytes || createHash("sha256").update(bytes).digest("hex") !== asset.sha256) invalid.push(asset.filename);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") missing.push(asset.filename);
            else invalid.push(asset.filename);
        }
    }
    return { expected: assets.length, verified: assets.length - missing.length - invalid.length, missing, invalid, valid: !missing.length && !invalid.length };
}

// Retornar somente pelo endpoint OWNER autenticado. Não registrar caminhos em logs.
export async function diagnoseStorage(assets: { filename: string }[]) {
    const configuredPath = localStoragePath();
    const runtime = { configuredPath, applicationPath: process.cwd() };
    try {
        const directory = await storageRoot();
        await access(directory, constants.R_OK | constants.X_OK);
        const entries = await readdir(directory);
        const expectedNames = new Set(assets.map(asset => asset.filename));
        let nestedProductsMatches: number | null = null;
        const child = path.join(directory, "products");
        try {
            const info = await lstat(child);
            if (info.isDirectory() && !info.isSymbolicLink()) nestedProductsMatches = (await readdir(child)).filter(name => expectedNames.has(name)).length;
        } catch { /* Pasta extra opcional; nenhum outro caminho é percorrido. */ }
        const sample = assets[0]?.filename;
        return { ...runtime, readable: true, resolvedPath: directory, expected: assets.length,
            matchingNames: entries.filter(name => expectedNames.has(name)).length,
            directoryEntries: entries.length, nestedProductsMatches,
            sampleExpectedPath: sample && mediaFilename.test(sample) ? path.join(directory, sample) : null };
    } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        return { ...runtime, readable: false, errorCode: code && ["ENOENT", "EACCES", "EPERM", "ENOTDIR", "ELOOP"].includes(code) ? code : "INVALID_STORAGE_CONFIGURATION" };
    }
}

// Executar sob a identidade do processo Node, não apenas no terminal SSH.
export async function probeLocalStorage() {
    const directory = await storageRoot();
    await access(directory, constants.R_OK | constants.W_OK | constants.X_OK);
    const filename = path.join(directory, ".hortoleve-probe-" + randomUUID());
    const handle = await open(filename, "wx+", 0o600);
    try {
        const sample = Buffer.from(randomUUID());
        await handle.writeFile(sample); await handle.sync();
        const read = Buffer.alloc(sample.length);
        await handle.read(read, 0, read.length, 0);
        if (!sample.equals(read)) throw new Error("Leitura divergente.");
    } finally { await handle.close(); await unlink(filename); }
    return { readable: true, writable: true };
}
