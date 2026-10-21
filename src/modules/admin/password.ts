import { compare, hash } from "bcryptjs";

// bcrypt limita a entrada a 72 bytes: rejeitar, nunca truncar silenciosamente.
export function validAdminPassword(password: string) {
    return password.length >= 14 && Buffer.byteLength(password, "utf8") <= 72 && !password.includes("\0");
}
export async function hashAdminPassword(password: string) {
    if (!validAdminPassword(password)) throw new Error("Senha fora dos limites permitidos.");
    return hash(password, 12);
}
export async function verifyAdminPassword({ hash: encoded, password }: { hash: string; password: string }) {
    if (!validAdminPassword(password) || !/^\$2[ab]\$12\$[./A-Za-z0-9]{53}$/.test(encoded)) return false;
    return compare(password, encoded);
}
