import { loadEnvConfig } from "@next/env";
import { createInterface, emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hashPassword } from "better-auth/crypto";

loadEnvConfig(process.cwd());

function secretQuestion(prompt: string): Promise<string> {
    stdout.write(prompt);
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    return new Promise((resolve, reject) => {
        let value = "";
        const done = () => { stdin.removeListener("keypress", keypress); stdin.setRawMode(false); stdin.pause(); stdout.write("\n"); };
        const keypress = (text: string, key: { name?: string; ctrl?: boolean }) => {
            if (key.ctrl && key.name === "c") { done(); reject(new Error("Cancelado")); }
            else if (key.name === "return" || key.name === "enter") { done(); resolve(value); }
            else if (key.name === "backspace") value = value.slice(0, -1);
            else if (text && !key.ctrl && !/\p{C}/u.test(text) && value.length + text.length <= 128) value += text;
        };
        stdin.on("keypress", keypress);
    });
}

async function main() {
    if (process.env.NODE_ENV === "production" || process.env.ADMIN_BOOTSTRAP_ALLOWED !== "true" || !process.argv.includes("--allow-development-write")) throw new Error("Bootstrap bloqueado");
    if (!stdin.isTTY || !process.env.DATABASE_URL) throw new Error("Configuração ou terminal ausente");
    const url = new URL(process.env.DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("Banco inválido");
    stdout.write("Confirme que DATABASE_URL aponta para uma branch de DESENVOLVIMENTO autorizada. Nenhuma URL será exibida.\n");
    const rl = createInterface({ input: stdin, output: stdout });
    const question = (prompt: string) => new Promise<string>(resolve => rl.question(prompt, resolve));
    const confirmation = await question("Digite CRIAR PRIMEIRO OWNER para continuar: ");
    if (confirmation !== "CRIAR PRIMEIRO OWNER") { rl.close(); return; }
    const name = (await question("Nome: ")).trim();
    const email = (await question("E-mail: ")).trim().toLowerCase();
    rl.close();
    if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Dados inválidos");
    const password = await secretQuestion("Senha nova (14–128 caracteres; não será exibida): ");
    const repeated = await secretQuestion("Repita a senha: ");
    if (password.length < 14 || password.length > 128 || password !== repeated) throw new Error("Senha inválida");
    const passwordHash = await hashPassword(password);
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 }), log: [] });
    try {
        await db.$transaction(async tx => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(72836491)::text`;
            if (await tx.user.count({ where: { role: "OWNER" } })) throw new Error("OWNER já existente");
            const user = await tx.user.create({ data: { name, email, emailVerified: true, role: "OWNER", active: true } });
            await tx.account.create({ data: { userId: user.id, providerId: "credential", accountId: user.id, password: passwordHash } });
            await tx.auditLog.create({ data: { userId: user.id, action: "FIRST_OWNER_CREATED", entity: "User", recordId: user.id } });
        }, { timeout: 20000 });
        stdout.write("Primeiro OWNER criado. Desative ADMIN_BOOTSTRAP_ALLOWED antes de continuar.\n");
    } finally { await db.$disconnect(); }
}
main().catch(() => {
    // Não imprimir objetos de erro: podem conter consultas, URLs ou dados pessoais.
    console.error("OWNER não criado. Confira a autorização, a branch de desenvolvimento, os dados, as tabelas e se já existe um OWNER.");
    process.exitCode = 1;
});
