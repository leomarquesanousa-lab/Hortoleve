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
        const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
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
    assert.equal(adminModules.length, 9);
    assert.ok(fs.existsSync("src/app/admin/(protected)/page.tsx"));
    assert.ok(fs.readFileSync("src/components/SiteChrome.tsx", "utf8").includes('pathname?.startsWith("/admin/")'));
    assert.ok(fs.readFileSync("scripts/create-owner.mts", "utf8").includes("--allow-development-write"));
});
