import env from "@next/env";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { synchronizeContent } from "../src/modules/cms/synchronize.ts";
env.loadEnvConfig(process.cwd());
import { initialContent as items } from "../src/modules/cms/initial-content.ts";
console.log("Plano de importação (nenhum segredo):", JSON.stringify(Object.fromEntries([...new Set(items.map(i => i.resource))].map(r => [r, items.filter(i => i.resource === r).length]))));
async function main() {
    if (!process.argv.includes("--apply")) { console.log("Simulação local concluída. Nenhuma conexão ou escrita executada."); return; }
    if (process.env.CMS_IMPORT_ALLOWED !== "true" || !process.stdin.isTTY || (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production-write"))) throw Error("Não autorizado");
    const url = new URL(process.env.DATABASE_URL ?? ""); if (!["postgres:", "postgresql:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? ""))) throw Error("Destino inválido");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try { if (await rl.question("Após backup e aprovação, digite IMPORTAR CONTEUDO SEM SOBRESCREVER: ") !== "IMPORTAR CONTEUDO SEM SOBRESCREVER") throw Error("Cancelado"); } finally { rl.close(); }
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }), log: [] });
    try {
        const plan = await db.$transaction(tx => synchronizeContent(tx, true), { timeout: 60000, maxWait: 10000 });
        if (plan.conflicts.length) { console.error(plan.conflicts.join("\n")); throw Error("Conflitos de importacao"); }
        console.log("Sincronizacao concluida, sem sobrescrever registros existentes:", JSON.stringify(plan.create));
        console.log("Revogue CMS_IMPORT_ALLOWED.");
    } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Importação não concluída. Verifique autorização, destino e conteúdo existente. Nenhum detalhe de conexão foi exibido."); process.exitCode = 1; });
