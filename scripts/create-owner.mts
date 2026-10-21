import nextEnv from "@next/env";
import { createInterface, emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { hashAdminPassword, validAdminPassword } from "../src/modules/admin/password.ts";
import { bootstrapMode, createFirstOwner } from "../src/modules/admin/bootstrap.ts";

nextEnv.loadEnvConfig(process.cwd());
let stage = "configuração e autorização";

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
    const mode = bootstrapMode(process.env, process.argv);
    if (!stdin.isTTY || !process.env.DATABASE_URL) throw new Error("Configuração ou terminal ausente");
    stdout.write(mode === "production" ? "PRODUÇÃO: confirme aprovação para criar o primeiro OWNER no banco configurado. Nenhuma URL será exibida.\n" : "Confirme que DATABASE_URL aponta para uma branch de DESENVOLVIMENTO autorizada. Nenhuma URL será exibida.\n");
    const rl = createInterface({ input: stdin, output: stdout });
    const question = (prompt: string) => new Promise<string>(resolve => rl.question(prompt, resolve));
    const required = mode === "production" ? "CRIAR PRIMEIRO OWNER EM PRODUCAO" : "CRIAR PRIMEIRO OWNER";
    const confirmation = await question("Digite " + required + " para continuar: ");
    if (confirmation !== required) { rl.close(); throw new Error("Confirmação ausente"); }
    const name = (await question("Nome: ")).trim();
    const email = (await question("E-mail: ")).trim().toLowerCase();
    rl.close();
    if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Dados inválidos");
    stage = "leitura e validação da senha";
    const password = await secretQuestion("Senha nova (mínimo 14 caracteres, máximo 72 bytes UTF-8; não será exibida): ");
    const repeated = await secretQuestion("Repita a senha: ");
    if (!validAdminPassword(password)) throw new Error("PASSWORD_POLICY");
    if (password !== repeated) throw new Error("PASSWORD_MISMATCH");
    stage = "geração do hash";
    const passwordHash = await hashAdminPassword(password);
    stage = "criação transacional no banco";
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 }), log: [] });
    try {
        await createFirstOwner(db, { name, email, passwordHash });
        stdout.write("Primeiro OWNER criado. Desative ADMIN_BOOTSTRAP_ALLOWED antes de continuar.\n");
    } finally { await db.$disconnect(); }
}
main().catch(error => {
    // Não imprimir objetos de erro: podem conter consultas, URLs ou dados pessoais.
    const message = error instanceof Error ? error.message : "";
    if (message === "PASSWORD_POLICY") console.error("OWNER não criado: a senha deve ter pelo menos 14 caracteres e no máximo 72 bytes UTF-8, sem caractere nulo. Acentos podem ocupar mais de um byte.");
    else if (message === "PASSWORD_MISMATCH") console.error("OWNER não criado: as duas senhas digitadas não coincidem.");
    else if (message === "OWNER já existente.") console.error("OWNER não criado: já existe um OWNER. Nenhuma conta adicional foi criada.");
    else console.error("Bootstrap não concluído na etapa: " + stage + ". Nenhuma credencial ou detalhe interno foi exibido. Confira a autorização e a configuração; antes de repetir, verifique se já existe um OWNER.");
    process.exitCode = 1;
});
