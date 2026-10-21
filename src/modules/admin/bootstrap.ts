import type { PrismaClient } from "../../generated/prisma/client.ts";

export function bootstrapMode(env: NodeJS.ProcessEnv, args: string[]) {
    if (env.ADMIN_BOOTSTRAP_ALLOWED !== "true") throw new Error("Bootstrap bloqueado.");
    const production = env.NODE_ENV === "production";
    if (!args.includes(production ? "--allow-production-write" : "--allow-development-write")) throw new Error("Autorização explícita ausente.");
    const url = new URL(env.DATABASE_URL ?? "");
    if (!["postgres:", "postgresql:"].includes(url.protocol) || (production && !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? ""))) throw new Error("Configuração de banco inválida.");
    return production ? "production" : "development";
}

export async function createFirstOwner(db: PrismaClient, data: { name: string; email: string; passwordHash: string }) {
    // O lock é transacional: duas execuções concorrentes não criam dois OWNER.
    return db.$transaction(async tx => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(72836491)::text`;
        if (await tx.user.count({ where: { role: "OWNER" } })) throw new Error("OWNER já existente.");
        const user = await tx.user.create({ data: { name: data.name, email: data.email, emailVerified: false, role: "OWNER", active: true } });
        await tx.account.create({ data: { userId: user.id, providerId: "credential", accountId: user.id, password: data.passwordHash } });
        await tx.auditLog.create({ data: { userId: user.id, action: "FIRST_OWNER_CREATED", entity: "User", recordId: user.id } });
    }, { timeout: 20000 });
}
