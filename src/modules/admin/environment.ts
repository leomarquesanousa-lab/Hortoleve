export function adminEnvironment() {
    const databaseUrl = process.env.DATABASE_URL;
    const secret = process.env.BETTER_AUTH_SECRET;
    const baseURL = process.env.BETTER_AUTH_URL;
    if (!databaseUrl || !secret || secret.length < 32 || !baseURL || process.env.ADMIN_DATABASE_READY !== "true") return null;
    try {
        const origin = new URL(baseURL);
        const db = new URL(databaseUrl);
        if (!["postgres:", "postgresql:"].includes(db.protocol) || !["http:", "https:"].includes(origin.protocol)) return null;
        if (origin.username || origin.password || origin.pathname !== "/") return null;
        if (process.env.NODE_ENV === "production" && (origin.protocol !== "https:" || !["require", "verify-full"].includes(db.searchParams.get("sslmode") ?? ""))) return null;
        return { databaseUrl, secret, baseURL: origin.origin };
    } catch { return null; }
}
