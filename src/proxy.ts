import { NextResponse, type NextRequest } from "next/server";
import { Pool } from "pg";

let pool: Pool | undefined;
// Apenas redirecionamentos de catálogo. Autorização administrativa permanece no servidor.
export async function proxy(request: NextRequest) {
    if (process.env.CMS_PUBLIC_ENABLED !== "true" || !process.env.DATABASE_URL) return NextResponse.next();
    pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 2500, query_timeout: 2000, idleTimeoutMillis: 10000 });
    try {
        let path = request.nextUrl.pathname; const seen = new Set<string>();
        for (let i = 0; i < 10; i++) {
            if (seen.has(path)) return NextResponse.next(); seen.add(path);
            const result = await pool.query('SELECT value FROM "SiteSetting" WHERE key=$1', ["redirect:" + path]);
            const to = result.rows[0]?.value?.to;
            if (typeof to !== "string" || !to.startsWith("/produtos/") || to.includes("\\") || to.includes("?")) break;
            path = to;
        }
        if (path !== request.nextUrl.pathname) {
            const destination = new URL(path, process.env.BETTER_AUTH_URL ?? "https://hortoleve.com.br"); destination.search = request.nextUrl.search;
            return NextResponse.redirect(destination, 301);
        }
    } catch { /* A rota pública ainda resolve o catálogo; nenhum erro ou segredo é exposto. */ }
    return NextResponse.next();
}
export const config = { matcher: "/produtos/:path*" };
