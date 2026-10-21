import { toNextJsHandler } from "better-auth/next-js";
import { getAdminAuth } from "@/modules/admin/auth";
import { adminEnvironment } from "@/modules/admin/environment";
import { allowAccountLogin } from "@/modules/admin/login-limit";
import { isIP } from "node:net";
import { validAdminPassword } from "@/modules/admin/password";

async function handle(request: Request) {
    const requestURL = new URL(request.url);
    const path = requestURL.pathname;
    const environment = adminEnvironment();
    // Somente os endpoints necessários: nenhum cadastro, recuperação ou alteração de conta público.
    if (!["/api/auth/sign-in/email", "/api/auth/sign-out", "/api/auth/get-session"].includes(path)) return Response.json({ error: "Rota indisponível." }, { status: 404 });
    // O proxy pode entregar uma URL interna HTTP. A origem confiável vem apenas
    // da configuração do servidor, nunca de Host/X-Forwarded-* enviados pelo cliente.
    const publicOrigin = environment?.baseURL ?? requestURL.origin;
    if (request.method === "POST" && request.headers.get("origin") !== publicOrigin) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 8192) return Response.json({ error: "Solicitação inválida." }, { status: 413 });
    const auth = getAdminAuth();
    if (!auth) return Response.json({ error: "Atendimento administrativo indisponível: configuração pendente." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    try {
        const normalizedHeaders = new Headers(request.headers);
        const clientIP = process.env.ADMIN_TRUSTED_IP_HEADER ? request.headers.get(process.env.ADMIN_TRUSTED_IP_HEADER) : null;
        normalizedHeaders.set("x-hortoleve-client-ip", clientIP && isIP(clientIP) ? clientIP : "127.0.0.1");
        let body: string | undefined;
        if (request.method === "POST") {
            const reader = request.body?.getReader();
            let bytes = 0;
            const chunks: Uint8Array[] = [];
            if (reader) while (true) {
                const result = await reader.read();
                if (result.done) break;
                bytes += result.value.byteLength;
                if (bytes > 8192) { await reader.cancel(); return Response.json({ error: "Solicitação inválida." }, { status: 413 }); }
                chunks.push(result.value);
            }
            body = Buffer.concat(chunks).toString("utf8");
            if (path.endsWith("/sign-in/email")) {
                let credentials: Record<string, unknown>;
                try { credentials = JSON.parse(body); } catch { return Response.json({ error: "Credenciais inválidas." }, { status: 400 }); }
                if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string" || credentials.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) || !validAdminPassword(credentials.password)) return Response.json({ error: "Credenciais inválidas." }, { status: 400 });
                const email = credentials.email.trim().toLowerCase();
                if (!await allowAccountLogin(email, environment!.secret)) return Response.json({ error: "Aguarde antes de tentar novamente." }, { status: 429, headers: { "Retry-After": "900" } });
                body = JSON.stringify({ email, password: credentials.password, rememberMe: false, callbackURL: "/admin" });
            }
        }
        normalizedHeaders.delete("content-length");
        const publicURL = new URL(path + requestURL.search, publicOrigin);
        const normalized = new Request(publicURL, { method: request.method, headers: normalizedHeaders, ...(body !== undefined ? { body } : {}) });
        const handler = toNextJsHandler(auth);
        const response = request.method === "GET" ? await handler.GET(normalized) : await handler.POST(normalized);
        // Better Auth pode responder sucesso mesmo se a exclusão no banco falhar.
        // Só confirmar logout depois de verificar a revogação do cookie original.
        if (path.endsWith("/sign-out") && response.ok && await auth.api.getSession({ headers: normalizedHeaders })) {
            return Response.json({ error: "Não foi possível encerrar a sessão. Tente novamente." }, { status: 503, headers: { "Cache-Control": "no-store" } });
        }
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch { return Response.json({ error: "Não foi possível concluir a autenticação." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
export { handle as GET, handle as POST };
