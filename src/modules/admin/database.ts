import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDatabase = globalThis as unknown as { hortoleveDatabase?: PrismaClient };
export function getDatabase() {
    if (globalDatabase.hortoleveDatabase) return globalDatabase.hortoleveDatabase;
    if (!process.env.DATABASE_URL) throw new Error("Banco administrativo não configurado.");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });
    const database = new PrismaClient({ adapter, log: [] });
    globalDatabase.hortoleveDatabase = database;
    return database;
}
