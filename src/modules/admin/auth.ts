import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDatabase } from "./database";
import { adminEnvironment } from "./environment";

function createAuth() {
    const env = adminEnvironment();
    if (!env) return null;
    const db = getDatabase();
    return betterAuth({
        database: prismaAdapter(db, { provider: "postgresql" }),
        secret: env.secret,
        baseURL: env.baseURL,
        trustedOrigins: [env.baseURL],
        emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 14, maxPasswordLength: 128 },
        session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30, cookieCache: { enabled: false } },
        rateLimit: { enabled: true, storage: "database", window: 60, max: 60, customRules: { "/sign-in/email": { window: 300, max: 5 } } },
        advanced: { useSecureCookies: process.env.NODE_ENV === "production", defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }, ipAddress: { ipAddressHeaders: ["x-hortoleve-client-ip"] } },
        user: { additionalFields: { role: { type: "string", defaultValue: "ADMIN", input: false }, active: { type: "boolean", defaultValue: true, input: false } } },
        databaseHooks: { session: { create: { before: async session => {
            const user = await db.user.findUnique({ where: { id: session.userId }, select: { active: true, role: true } });
            return user?.active && ["OWNER", "ADMIN"].includes(user.role) ? { data: session } : false;
        }, after: async session => { await db.auditLog.create({ data: { userId: session.userId, action: "ADMIN_LOGIN", entity: "Session", recordId: session.id } }); } },
        delete: { after: async session => { await db.auditLog.create({ data: { userId: session.userId, action: "ADMIN_LOGOUT", entity: "Session", recordId: session.id } }); } } } },
        logger: { disabled: true },
    });
}
let authInstance: ReturnType<typeof createAuth>;
export function getAdminAuth() {
    if (!adminEnvironment()) return null;
    return authInstance ??= createAuth();
}
