import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loader(overrides = {}) {
    const cache = new Map();
    function load(file) {
        file = path.resolve(file);
        if (cache.has(file)) return cache.get(file);
        const mod = { exports: {} };
        const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
        function local(name) {
            if (name in overrides) return overrides[name];
            if (name === "server-only") return {};
            if (name.startsWith("@/") || name.startsWith(".")) {
                const base = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(path.dirname(file), name);
                return load([base, base + ".ts", base + ".tsx"].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()));
            }
            return require(name);
        }
        new Function("require", "module", "exports", code)(local, mod, mod.exports);
        cache.set(file, mod.exports);
        return mod.exports;
    }
    return load;
}
const user = { id: "test-user", name: "Test", email: "test@example.test", role: "ADMIN", active: true, permissions: [] };
const routeFile = "src/app/api/auth/[...all]/route.ts";
function request(pathname, body = {}, origin = "https://example.test") {
    return new Request("https://example.test/api/auth/" + pathname, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
}

test("OWNER completo, ADMIN somente com delegação permitida e usuário ativo", () => {
    const { hasAdminPermission } = loader()("src/modules/admin/authorization.ts");
    assert.equal(hasAdminPermission(user, "content:write"), false);
    assert.equal(hasAdminPermission({ ...user, permissions: ["content:write"] }, "content:write"), true);
    assert.equal(hasAdminPermission({ ...user, permissions: ["users:manage"] }, "users:manage"), false);
    assert.equal(hasAdminPermission({ ...user, role: "OWNER" }, "users:manage"), true);
    assert.equal(hasAdminPermission({ ...user, role: "OWNER", active: false }, "users:manage"), false);
});

test("acesso sem sessão redireciona; revogação e permissão são verificadas no servidor", async () => {
    let session = null;
    let activeUser = user;
    const load = loader({
        "next/headers": { headers: async () => new Headers() },
        "next/navigation": { redirect: url => { throw Object.assign(new Error("redirect"), { url }); } },
        "./auth": { getAdminAuth: () => ({ api: { getSession: async () => session } }) },
        "./database": { getDatabase: () => ({ user: { findUnique: async () => activeUser } }) },
    });
    const auth = load("src/modules/admin/session.ts");
    await assert.rejects(auth.requireAdmin(), error => error.url === "/admin/login");
    session = { user: { id: user.id } };
    assert.equal((await auth.requireAdmin()).id, user.id);
    await assert.rejects(auth.requireAdminPermission("users:manage"));
    activeUser = { ...user, active: false };
    assert.equal(await auth.currentAdmin(), null);
    activeUser = { ...user, role: "OWNER" };
    assert.equal((await auth.requireAdminPermission("users:manage")).role, "OWNER");
});

test("API fecha sem configuração, rejeita origem externa e não oferece cadastro", async () => {
    const route = loader({ "@/modules/admin/auth": { getAdminAuth: () => null }, "@/modules/admin/login-limit": { allowAccountLogin: async () => { throw new Error("não deve consultar banco"); } } })(routeFile);
    assert.equal((await route.POST(request("sign-up/email"))).status, 404);
    assert.equal((await route.POST(request("sign-in/email", {}, "https://other.test"))).status, 403);
    assert.equal((await route.POST(request("sign-in/email"))).status, 503);
});

test("login limita corpo e conta; normaliza IP e ignora redirect externo", async () => {
    let allowed = false;
    let received;
    const route = loader({
        "@/modules/admin/auth": { getAdminAuth: () => ({}) },
        "@/modules/admin/environment": { adminEnvironment: () => ({ secret: "unit-test-only" }) },
        "@/modules/admin/login-limit": { allowAccountLogin: async () => allowed },
        "better-auth/next-js": { toNextJsHandler: () => ({ POST: async req => { received = req; return Response.json({ ok: true }); } }) },
    })(routeFile);
    const credentials = { email: "TEST@example.test", password: "unit-test-password-only", callbackURL: "https://other.test" };
    assert.equal((await route.POST(request("sign-in/email", credentials))).status, 429);
    assert.equal((await route.POST(request("sign-in/email", { ...credentials, password: "x".repeat(9000) }))).status, 413);
    allowed = true;
    assert.equal((await route.POST(request("sign-in/email", credentials))).status, 200);
    assert.equal((await received.json()).callbackURL, "/admin");
    assert.equal(received.headers.get("x-hortoleve-client-ip"), "127.0.0.1");
});

test("proxy HTTP interno aceita somente a origem pública configurada e ignora headers forjados", async () => {
    let received;
    const route = loader({
        "@/modules/admin/auth": { getAdminAuth: () => ({}) },
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://example.test", secret: "unit-test-only" }) },
        "@/modules/admin/login-limit": { allowAccountLogin: async () => true },
        "better-auth/next-js": { toNextJsHandler: () => ({ POST: async req => { received = req; return Response.json({ ok: true }); } }) },
    })(routeFile);
    const proxied = origin => new Request("http://127.0.0.1:3000/api/auth/sign-in/email", {
        method: "POST", headers: { origin, host: "untrusted.test", "x-forwarded-host": "untrusted.test", "x-forwarded-proto": "http", "content-type": "application/json" },
        body: JSON.stringify({ email: user.email, password: "unit-test-password-only" }),
    });
    assert.equal((await route.POST(proxied("https://example.test"))).status, 200);
    assert.equal(received.url, "https://example.test/api/auth/sign-in/email");
    assert.equal((await route.POST(proxied("http://127.0.0.1:3000"))).status, 403);
    assert.equal((await route.POST(proxied("https://untrusted.test"))).status, 403);
    assert.equal((await route.POST(proxied("null"))).status, 403);
});

test("limite por conta usa incremento atômico e chave sem e-mail", async () => {
    let count = 0;
    let key;
    const { allowAccountLogin } = loader({ "./database": { getDatabase: () => ({ rateLimit: { upsert: async options => { key = options.where.key; assert.equal(options.update.count.increment, 1); return { count: ++count }; }, deleteMany: async () => ({ count: 0 }) } }) } })("src/modules/admin/login-limit.ts");
    for (let i = 0; i < 5; i++) assert.equal(await allowAccountLogin("test@example.test", "unit-test-only"), true);
    assert.equal(await allowAccountLogin("test@example.test", "unit-test-only"), false);
    assert.ok(!key.includes("test@example.test"));
});

test("configuração Better Auth é fechada e usa cookies e rate limit seguros", async () => {
    let options;
    let active = false;
    const { getAdminAuth } = loader({
        "./environment": { adminEnvironment: () => ({ secret: "unit-test-only", baseURL: "https://example.test" }) },
        "./database": { getDatabase: () => ({ user: { findUnique: async () => ({ active, role: "ADMIN" }) }, auditLog: { create: async () => ({}) } }) },
        "better-auth": { betterAuth: config => { options = config; return {}; } },
        "better-auth/adapters/prisma": { prismaAdapter: () => ({}) },
    })("src/modules/admin/auth.ts");
    getAdminAuth();
    assert.equal(options.emailAndPassword.disableSignUp, true);
    assert.equal(options.session.cookieCache.enabled, false);
    assert.equal(options.advanced.defaultCookieAttributes.httpOnly, true);
    assert.equal(options.advanced.defaultCookieAttributes.sameSite, "lax");
    assert.equal(options.rateLimit.storage, "database");
    assert.equal(options.user.additionalFields.role.input, false);
    assert.equal(await options.databaseHooks.session.create.before({ userId: user.id }), false);
    active = true;
    assert.ok((await options.databaseHooks.session.create.before({ userId: user.id })).data);
});

test("ambiente incompleto não habilita administração", () => {
    const { adminEnvironment } = loader()("src/modules/admin/environment.ts");
    const previous = process.env.ADMIN_DATABASE_READY;
    process.env.ADMIN_DATABASE_READY = "false";
    assert.equal(adminEnvironment(), null);
    if (previous === undefined) delete process.env.ADMIN_DATABASE_READY; else process.env.ADMIN_DATABASE_READY = previous;
});

test("migração e rotas preparadas; nenhuma senha padrão ou integração pública de banco", () => {
    const sql = fs.readFileSync("prisma/migrations/202610190001_admin_foundation/migration.sql", "utf8");
    for (const model of ["User", "Account", "Session", "RateLimit", "Banner", "Category", "Product", "ProductMedia", "SocialLink", "SiteSetting", "SeoSetting", "ContactLead", "AuditLog"]) assert.ok(sql.includes('CREATE TABLE "' + model + '"'));
    const { adminModules } = loader()("src/modules/admin/modules.ts");
    assert.ok(["produtos", "categorias", "tecnologias", "midia", "home", "paginas", "usuarios"].every(slug => adminModules.some(m => m.slug === slug)));
    assert.ok(fs.existsSync("src/app/admin/(protected)/page.tsx"));
    assert.ok(fs.readFileSync("src/components/SiteChrome.tsx", "utf8").includes('pathname?.startsWith("/admin/")'));
    assert.ok(fs.readFileSync("scripts/create-owner.mts", "utf8").includes("bootstrapMode(process.env, process.argv)"));
});

test("bcrypt real: salt único, senha correta, inválida e limite UTF-8 sem truncamento", async () => {
    const { hashAdminPassword, verifyAdminPassword, validAdminPassword } = loader()("src/modules/admin/password.ts");
    const password = "local-test-only-" + (await import("node:crypto")).randomBytes(16).toString("hex");
    const a = await hashAdminPassword(password);
    const b = await hashAdminPassword(password);
    assert.match(a, /^\$2[ab]\$12\$/);
    assert.notEqual(a, b);
    assert.equal(await verifyAdminPassword({ hash: a, password }), true);
    assert.equal(await verifyAdminPassword({ hash: a, password: password + "wrong" }), false);
    assert.equal(validAdminPassword("é".repeat(37)), false);
    assert.equal(validAdminPassword("a".repeat(73)), false);
    await assert.rejects(hashAdminPassword("a".repeat(73)));
    assert.equal(await verifyAdminPassword({ hash: "invalid", password }), false);
});

test("bootstrap: produção exige flag, TLS e autorização; OWNER existente nunca é recriado", async () => {
    const { bootstrapMode, createFirstOwner } = loader()("src/modules/admin/bootstrap.ts");
    const env = { ADMIN_BOOTSTRAP_ALLOWED: "true", NODE_ENV: "production", DATABASE_URL: "postgresql://example.test/test?sslmode=require" };
    assert.throws(() => bootstrapMode(env, ["--allow-development-write"]));
    assert.throws(() => bootstrapMode({ ...env, ADMIN_BOOTSTRAP_ALLOWED: "false" }, ["--allow-production-write"]));
    assert.throws(() => bootstrapMode({ ...env, DATABASE_URL: "postgresql://example.test/test" }, ["--allow-production-write"]));
    assert.equal(bootstrapMode(env, ["--allow-production-write"]), "production");
    let exists = true;
    const calls = [];
    const tx = {
        $queryRaw: async () => { calls.push("lock"); },
        user: { count: async () => { calls.push("count"); return exists ? 1 : 0; }, create: async ({ data }) => { calls.push("user"); assert.equal(data.role, "OWNER"); assert.equal(data.emailVerified, false); return { id: "local-test" }; } },
        account: { create: async ({ data }) => { calls.push("account"); assert.equal(data.providerId, "credential"); assert.equal(data.password, "hash-only-test"); } },
        auditLog: { create: async ({ data }) => { calls.push("audit"); assert.ok(!JSON.stringify(data).includes("hash-only-test")); } },
    };
    const db = { $transaction: async fn => fn(tx) };
    await assert.rejects(createFirstOwner(db, { name: "Test", email: "test@example.test", passwordHash: "hash-only-test" }));
    assert.deepEqual(calls, ["lock", "count"]);
    calls.length = 0; exists = false;
    await createFirstOwner(db, { name: "Test", email: "test@example.test", passwordHash: "hash-only-test" });
    assert.deepEqual(calls, ["lock", "count", "user", "account", "audit"]);
});

test("Better Auth real em memória: login, cookie HttpOnly, sessão e logout revogado", async () => {
    const { betterAuth } = await import("better-auth");
    const { memoryAdapter } = await import("better-auth/adapters/memory");
    const { randomBytes } = await import("node:crypto");
    const { hashAdminPassword } = loader()("src/modules/admin/password.ts");
    const password = randomBytes(24).toString("hex");
    const date = new Date();
    const memory = {
        user: [{ ...user, role: "OWNER", emailVerified: false, createdAt: date, updatedAt: date }],
        account: [{ id: "test-account", userId: user.id, accountId: user.id, providerId: "credential", password: await hashAdminPassword(password), createdAt: date, updatedAt: date }],
        session: [], verification: [], rateLimit: [],
    };
    const audits = [];
    const { getAdminAuth } = loader({
        "./environment": { adminEnvironment: () => ({ secret: randomBytes(32).toString("hex"), baseURL: "https://example.test" }) },
        "./database": { getDatabase: () => ({ user: { findUnique: async () => memory.user[0] }, auditLog: { create: async ({ data }) => { audits.push(data.action); } } }) },
        "better-auth": { betterAuth: options => betterAuth({ ...options, advanced: { ...options.advanced, useSecureCookies: true, defaultCookieAttributes: { ...options.advanced.defaultCookieAttributes, secure: true } } }) },
        "better-auth/adapters/prisma": { prismaAdapter: () => memoryAdapter(memory) },
    })("src/modules/admin/auth.ts");
    const auth = getAdminAuth();
    const route = loader({
        "@/modules/admin/auth": { getAdminAuth: () => auth },
        "@/modules/admin/environment": { adminEnvironment: () => ({ secret: "test-only", baseURL: "https://example.test" }) },
        "@/modules/admin/login-limit": { allowAccountLogin: async () => true },
    })(routeFile);
    const post = (endpoint, body, cookie = "") => route.POST(new Request("http://127.0.0.1:3000/api/auth/" + endpoint, { method: "POST", headers: { origin: "https://example.test", "content-type": "application/json", cookie }, body: JSON.stringify(body) }));
    const getSession = cookie => route.GET(new Request("https://example.test/api/auth/get-session", { headers: { cookie } }));
    assert.equal(await (await getSession("")).json(), null);
    assert.equal((await post("sign-in/email", { email: user.email, password: password + "invalid" })).status, 401);
    const login = await post("sign-in/email", { email: user.email, password, rememberMe: false });
    assert.equal(login.status, 200);
    const cookies = login.headers.getSetCookie();
    const sessionCookie = cookies.find(value => value.startsWith("__Secure-better-auth.session_token="));
    assert.ok(sessionCookie);
    assert.match(sessionCookie, /HttpOnly/i);
    assert.match(sessionCookie, /Secure/i);
    assert.match(sessionCookie, /SameSite=Lax/i);
    const cookie = cookies.map(value => value.split(";")[0]).join("; ");
    assert.equal((await (await getSession(cookie)).json()).user.id, user.id);
    assert.equal(memory.session.length, 1);
    assert.equal((await post("sign-out", {}, cookie)).status, 200);
    assert.equal(memory.session.length, 0);
    assert.equal(await (await getSession(cookie)).json(), null);
    assert.deepEqual(audits, ["ADMIN_LOGIN", "ADMIN_LOGOUT"]);
});

test("logout não declara sucesso se a sessão permanecer válida no banco", async () => {
    const route = loader({
        "@/modules/admin/auth": { getAdminAuth: () => ({ api: { getSession: async () => ({ user }) } }) },
        "@/modules/admin/login-limit": { allowAccountLogin: async () => true },
        "better-auth/next-js": { toNextJsHandler: () => ({ POST: async () => Response.json({ success: true }) }) },
    })(routeFile);
    assert.equal((await route.POST(request("sign-out"))).status, 503);
});

test("CMS valida campos, rejeita XSS em links e exige imagem para publicar", () => {
    const { validateData, safeLink, mediaPath, hasReference } = loader()("src/modules/cms/validation.ts");
    assert.equal(safeLink("javascript:alert(1)"), false);
    assert.equal(safeLink("//other.test/x"), false);
    assert.equal(mediaPath("/images/%2e%2e/private.png"), false);
    assert.equal(mediaPath("https://example.test/a.svg"), false);
    assert.equal(mediaPath("/majestic/4.png"), true);
    assert.equal(mediaPath("/tecnologia/cromoterapia e massagem.png"), true);
    assert.equal(hasReference({ technologyIds: "tech-a\ntech-b\ntech-c" }, ["tech-b"]), true);
    assert.throws(() => validateData("usuarios", { name: "Test", email: "invalid", role: "OWNER" }));
    assert.throws(() => validateData("redes-sociais", { name: "Instagram", channel: "instagram", url: "https://facebook.com/test" }));
    assert.throws(() => validateData("produtos", { name: "Test", slug: "test", categoryId: "colchoes", summary: "Test", description: "Test", published: true, gallery: [] }));
    const data = validateData("configuracoes", { name: "Hortoleve", whatsapp: "5511999999999", secret: "must-not-persist" });
    assert.equal(data.secret, undefined);
});

test("CMS API: visitante 401, ADMIN sem delegação 403 e CSRF rejeitado sem escrita", async () => {
    let identity = null, writes = 0;
    const load = loader({
        "@/modules/admin/session": { currentAdmin: async () => identity },
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://example.test" }) },
        "@/modules/admin/database": { getDatabase: () => { writes++; throw Error("Não deve acessar banco"); } },
    });
    const route = load("src/app/api/admin/[resource]/route.ts");
    const context = { params: Promise.resolve({ resource: "usuarios" }) };
    const req = origin => new Request("http://127.0.0.1/api/admin/usuarios", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{}" });
    assert.equal((await route.POST(req("https://example.test"), context)).status, 401);
    identity = { ...user, permissions: ["users:manage"] };
    assert.equal((await route.POST(req("https://example.test"), context)).status, 403);
    identity = { ...user, role: "OWNER" };
    assert.equal((await route.POST(req("https://other.test"), context)).status, 403);
    assert.equal(writes, 0);
});

test("CMS usuários: último OWNER protegido e senha/hash nunca retornados na listagem", async () => {
    const existing = { ...user, role: "OWNER", active: true, updatedAt: new Date(1000), password: "not-public" };
    let updates = 0;
    const tx = { $queryRaw: async () => [], user: { findUnique: async () => existing, count: async () => 1, update: async () => { updates++; } } };
    const db = { $transaction: async fn => fn(tx), user: { findMany: async () => [existing] } };
    const repo = loader({ "@/modules/admin/database": { getDatabase: () => db } })("src/modules/cms/repository.ts");
    await assert.rejects(repo.saveDocument({ ...user, role: "OWNER" }, "usuarios", { name: "Test", email: "test@example.test", role: "ADMIN", active: true }, user.id, 1000, true), /último OWNER/);
    assert.equal(updates, 0);
    assert.ok(!JSON.stringify(await repo.listDocuments("usuarios")).includes("not-public"));
});

test("CMS rascunho, publicação, revisão concorrente e referências antes da exclusão", async () => {
    const records = new Map(), calls = [];
    const tx = {
        $queryRaw: async () => [],
        siteSetting: {
            findUnique: async ({ where }) => records.get(where.key) ?? null,
            findMany: async ({ where }) => [...records.values()].filter(r => r.key.startsWith(where.key.startsWith) && r.key !== where.key.not),
            upsert: async ({ where, create, update }) => { records.set(where.key, { key: where.key, value: records.has(where.key) ? update.value : create.value }); },
            delete: async ({ where }) => records.delete(where.key),
        },
        category: { findUnique: async () => ({ id: "colchoes", slug: "colchoes", active: true }), findUniqueOrThrow: async () => ({ id: "colchoes", slug: "colchoes", active: true }) },
        product: { findUnique: async () => null, upsert: async () => { calls.push("product-published"); }, deleteMany: async () => { calls.push("product-deleted"); } },
        productMedia: { deleteMany: async () => {}, createMany: async () => {} }, contactLead: { count: async () => 0 },
        auditLog: { create: async () => { calls.push("audit"); } },
    };
    const repo = loader({ "@/modules/admin/database": { getDatabase: () => ({ $transaction: async fn => fn(tx) }) } })("src/modules/cms/repository.ts");
    const owner = { ...user, role: "OWNER" }, data = { name: "Test", slug: "test", categoryId: "colchoes", summary: "Summary", description: "Description", published: true, order: 0, gallery: [{ id: "front", src: "/majestic/4.png", alt: "Test mattress", width: 1536, height: 1024 }] };
    const id = await repo.saveDocument(owner, "produtos", data, undefined, 0, false);
    assert.equal(records.get("cms:produtos:" + id).value.published, null);
    assert.ok(!calls.includes("product-published"));
    await repo.saveDocument(owner, "produtos", data, id, 1, true);
    assert.ok(calls.includes("product-published"));
    await assert.rejects(repo.saveDocument(owner, "produtos", data, id, 1, true), /outro operador/);
    await assert.rejects(repo.removeDocument(owner, "produtos", id, 2), /Despublique/);
    await repo.saveDocument(owner, "produtos", { ...data, published: false }, id, 2, true);
    records.set("cms:home:principal", { key: "cms:home:principal", value: { resource: "home", draft: { productId: id } } });
    await assert.rejects(repo.removeDocument(owner, "produtos", id, 3), /referenciado/);
    records.delete("cms:home:principal");
    await repo.removeDocument(owner, "produtos", id, 3);
    assert.ok(!records.has("cms:produtos:" + id));
});

test("CMS público desativado preserva catálogo sem consultar banco", async () => {
    const previous = process.env.CMS_PUBLIC_ENABLED; process.env.CMS_PUBLIC_ENABLED = "false";
    try {
        const pub = loader({ "next/server": { connection: async () => {} }, "@/modules/admin/database": { getDatabase: () => { throw Error("não consultar"); } } })("src/modules/cms/public.ts");
        const snapshot = await pub.getPublicSnapshot();
        assert.equal(snapshot.enabled, false); assert.equal(snapshot.products.length, 5); assert.equal(snapshot.categories.length, 8);
    } finally { if (previous === undefined) delete process.env.CMS_PUBLIC_ENABLED; else process.env.CMS_PUBLIC_ENABLED = previous; }
});

test("uploads exigem sessão e storage real; não há gravação em disco temporário", async () => {
    let identity = null, storageWrites = 0;
    const route = loader({ "@/modules/admin/session": { currentAdmin: async () => identity }, "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://example.test" }) }, "@/modules/cms/storage": { storageConfig: () => null, putMedia: async () => { storageWrites++; } }, "@/modules/admin/database": { getDatabase: () => { throw Error("não consultar"); } } })("src/app/api/admin-upload/route.ts");
    const req = () => new Request("https://example.test/api/admin-upload", { method: "POST", headers: { origin: "https://example.test" } });
    assert.equal((await route.POST(req())).status, 401);
    identity = { ...user, permissions: ["content:write"] };
    assert.equal((await route.POST(req())).status, 503); assert.equal(storageWrites, 0);
});

test("CMS público usa somente a versão publicada, mantém URLs e oculta rascunhos", async () => {
    const old = process.env.CMS_PUBLIC_ENABLED; process.env.CMS_PUBLIC_ENABLED = "true";
    const rows = [
        { key: "cms:categorias:colchoes", value: { id: "colchoes", resource: "categorias", published: { name: "Colchões", slug: "colchoes", order: 0 }, draft: { name: "Rascunho privado" } } },
        { key: "cms:produtos:test", value: { id: "test", resource: "produtos", published: { name: "Produto publicado", categoryId: "colchoes", slug: "test", summary: "Texto publicado", description: "Descrição", gallery: [{ id: "front", src: "/majestic/4.png", alt: "Colchão", width: 1536, height: 1024 }] }, draft: { name: "Não publicar este texto" } } },
        { key: "cms:produtos:draft", value: { id: "draft", resource: "produtos", published: null, draft: { name: "Somente rascunho" } } },
    ];
    try {
        const pub = loader({ "next/server": { connection: async () => {} }, "@/modules/admin/database": { getDatabase: () => ({ siteSetting: { findUnique: async () => ({ value: true }), findMany: async () => rows } }) } })("src/modules/cms/public.ts");
        const snapshot = await pub.getPublicSnapshot(); assert.equal(snapshot.products.length, 1); assert.equal(snapshot.products[0].categorySlug, "colchoes");
        assert.equal(snapshot.products[0].name, "Produto publicado");
        assert.ok(!JSON.stringify(snapshot).includes("Não publicar este texto"));
        assert.ok(!JSON.stringify(snapshot).includes("Rascunho privado"));
    } finally { if (old === undefined) delete process.env.CMS_PUBLIC_ENABLED; else process.env.CMS_PUBLIC_ENABLED = old; }
});

test("upload real de PNG é decodificado e convertido; SVG é rejeitado antes do storage", async () => {
    const sharp = require("sharp"); let writes = 0; const saved = [];
    const route = loader({
        "@/modules/admin/session": { currentAdmin: async () => ({ ...user, role: "OWNER" }) },
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://example.test" }) },
        "@/modules/cms/storage": { storageConfig: () => ({}), putMedia: async bytes => { writes++; const info = await sharp(bytes).metadata(); assert.equal(info.format, "webp"); return { src: "https://storage.example.test/image.webp", objectKey: "image.webp" }; } },
        "@/modules/admin/database": { getDatabase: () => ({ $transaction: async fn => fn({ $queryRaw: async () => [], siteSetting: { findUnique: async () => null, upsert: async ({ create }) => { saved.push(create); } }, auditLog: { create: async () => {} } }) }) },
    })("src/app/api/admin-upload/route.ts");
    const req = file => { const form = new FormData(); form.append("files", file); form.append("replaceId", ""); return new Request("https://example.test/api/admin-upload", { method: "POST", headers: { origin: "https://example.test" }, body: form }); };
    assert.equal((await route.POST(req(new File(["<svg></svg>"], "bad.svg", { type: "image/svg+xml" })))).status, 400);
    assert.equal(writes, 0);
    const png = await sharp({ create: { width: 16, height: 10, channels: 3, background: "#213c37" } }).png().toBuffer();
    const response = await route.POST(req(new File([png], "test.png", { type: "image/png" })));
    assert.equal(response.status, 200); assert.equal(writes, 1);
    assert.ok(saved[0].key.length > "cms:midia:".length);
    assert.equal(saved[0].value.draft.width, 16);
});
