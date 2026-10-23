import { constants } from "node:fs";
import { access, open, realpath, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const mediaFilename = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp|[0-9a-f]{64}\.(?:png|jpe?g|webp))$/;

export function localStoragePath() {
    const directory = process.env.CMS_STORAGE_PATH;
    if (!directory || !path.isAbsolute(directory)) return null;
    return path.resolve(directory);
}

export async function storageRoot() {
    const directory = localStoragePath();
    if (!directory) throw new Error("Configure um caminho absoluto para CMS_STORAGE_PATH.");
    const resolved = await realpath(directory);
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
    const directory = await storageRoot();
    const handle = await open(path.join(directory, filename), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
        const info = await handle.stat();
        if (!info.isFile() || info.size > 32000000) throw new Error("Arquivo inválido.");
        return await handle.readFile();
    } finally { await handle.close(); }
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
