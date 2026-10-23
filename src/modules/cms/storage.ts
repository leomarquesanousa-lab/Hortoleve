import "server-only";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { localStoragePath, writeLocalMedia } from "./local-storage";
export function storageConfig() {
    if (process.env.CMS_STORAGE_PATH) return localStoragePath() ? { driver: "local" as const, directory: localStoragePath() } : null;
    const { CMS_STORAGE_ENDPOINT: endpoint, CMS_STORAGE_BUCKET: bucket, CMS_STORAGE_ACCESS_KEY: key, CMS_STORAGE_SECRET_KEY: secret, CMS_STORAGE_PUBLIC_URL: publicURL } = process.env;
    if (!endpoint || !bucket || !key || !secret || !publicURL) return null;
    try { const a = new URL(endpoint), b = new URL(publicURL); if (a.protocol !== "https:" || b.protocol !== "https:" || a.username || b.username || a.password || b.password || a.search || b.search) return null; } catch { return null; }
    return { driver: "s3" as const, endpoint: endpoint.replace(/\/$/, ""), bucket, key, secret, publicURL: publicURL.replace(/\/$/, ""), region: process.env.CMS_STORAGE_REGION || "auto" };
}
const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const hmac = (key: string | Buffer, value: string) => createHmac("sha256", key).update(value).digest();
export async function putMedia(buffer: Buffer) {
    const config = storageConfig(); if (!config) throw new Error("Storage não configurado");
    if (config.driver === "local") return writeLocalMedia(buffer);
    const key = "hortoleve/" + randomUUID() + ".webp";
    const url = new URL(config.endpoint + "/" + encodeURIComponent(config.bucket) + "/" + key);
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""), day = date.slice(0, 8);
    const payload = sha(buffer), scope = `${day}/${config.region}/s3/aws4_request`;
    const canonicalHeaders = `content-type:image/webp\nhost:${url.host}\nx-amz-content-sha256:${payload}\nx-amz-date:${date}\n`;
    const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
    const canonical = ["PUT", url.pathname, "", canonicalHeaders, signedHeaders, payload].join("\n");
    const signingKey = hmac(hmac(hmac(hmac("AWS4" + config.secret, day), config.region), "s3"), "aws4_request");
    const signature = createHmac("sha256", signingKey).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${sha(canonical)}`).digest("hex");
    const response = await fetch(url, { method: "PUT", redirect: "error", headers: { "content-type": "image/webp", "x-amz-content-sha256": payload, "x-amz-date": date, authorization: `AWS4-HMAC-SHA256 Credential=${config.key}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}` }, body: new Uint8Array(buffer), signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("Storage recusou upload");
    return { src: config.publicURL + "/" + key, objectKey: key };
}
