import "server-only";
import { createHmac } from "node:crypto";
import { getDatabase } from "./database";

export async function allowAccountLogin(email: string, secret: string) {
    const now = Date.now();
    const key = "admin-email:" + createHmac("sha256", secret).update(email.toLowerCase()).digest("hex") + ":" + Math.floor(now / 900000);
    const db = getDatabase();
    const record = await db.rateLimit.upsert({ where: { key }, create: { key, count: 1, lastRequest: BigInt(now) }, update: { count: { increment: 1 }, lastRequest: BigInt(now) } });
    await db.rateLimit.deleteMany({ where: { key: { startsWith: "admin-email:" }, lastRequest: { lt: BigInt(now - 86400000) } } });
    return record.count <= 5;
}
