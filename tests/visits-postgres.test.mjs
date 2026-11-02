import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createHmac, randomInt, randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const target = new URL(process.env.DATABASE_URL || "postgresql://invalid");
// This test must never write to a remote database or the default PostgreSQL instance.
if (target.hostname !== "127.0.0.1" || target.port !== "55439" || target.pathname !== "/hortoleve_visits_dev") {
    throw new Error("Integration test requires the isolated local Hortoleve development database.");
}
process.env.VISITS_EMAIL_ENABLED = "false";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: target.toString(), max: 4 }) });
const require = createRequire(import.meta.url), ts = require("typescript");
function load(file) {
    const mod = { exports: {} };
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("require", "module", "exports", source)(name => {
        if (name === "server-only") return {};
        if (name === "@/modules/admin/database") return { getDatabase: () => db };
        if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name + ".ts"));
        return require(name);
    }, mod, mod.exports);
    return mod.exports;
}
const { reserve, changeVisit, visitZone } = load("src/modules/visits/service.ts");
const { localNow } = load("src/modules/visits/validation.ts");

test("real PostgreSQL persistence, atomic exclusivity, cancellation and slot release", async t => {
    const ids = [], phones = [], actorId = "visit-test-" + randomUUID();
    const testPhone = () => { const phone = "71000" + randomInt(100000, 1000000); phones.push(phone); return phone; };
    const before = { users: await db.user.count(), products: await db.product.count() };
    const date = new Date(Date.now() + 30 * 86400000);
    while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() + 1);
    const day = localNow(visitZone(), date).date;
    const input = { name: "Cliente de Teste Local", phone: testPhone(), email: "visits-test@example.invalid", city: "Cidade Teste, Bairro Teste", address: "Endereco ficticio para teste, 123", notes: "INTEGRATION TEST - NO EMAIL", date: day, time: "10:00", consent: true, website: "", requestKey: randomUUID() };
    const slotKeys = [day + "/10:00", day + "/14:00"];
    if (await db.homeVisit.count({ where: { slotKey: { in: slotKeys } } })) throw new Error("Test slots are in use. Existing reservations were preserved.");
    let first;
    try {
        await db.user.create({ data: { id: actorId, name: "Visit Integration Test", email: actorId + "@example.invalid", role: "ADMIN" } });
        await t.test("creates durable booking and two notification jobs atomically", async () => {
            first = await reserve(input); ids.push(first.id);
            assert.equal(first.status, "PENDING");
            assert.equal(await db.visitNotification.count({ where: { visitId: first.id, sentAt: null } }), 2);
        });
        await t.test("queries the saved visit through a separate database connection", async () => {
            const { Pool } = require("pg"); const pool = new Pool({ connectionString: target.toString(), max: 1 });
            try { const result = await pool.query('SELECT "id", "status", "date", "time" FROM "HomeVisit" WHERE "id" = $1', [first.id]); assert.equal(result.rows[0].status, "PENDING"); assert.equal(result.rows[0].date, day); }
            finally { await pool.end(); }
        });
        await t.test("repeated request returns the same protocol without extra notifications", async () => {
            assert.equal((await reserve(input)).id, first.id);
            assert.equal(await db.visitNotification.count({ where: { visitId: first.id } }), 2);
        });
        await t.test("occupied slot rejects a different request", async () => {
            await assert.rejects(reserve({ ...input, requestKey: randomUUID() }), error => error.status === 409);
        });
        await t.test("two simultaneous requests create exactly one reservation", async () => {
            const candidates = [1, 2].map(() => ({ ...input, time: "14:00", phone: testPhone(), requestKey: randomUUID() }));
            const results = await Promise.allSettled(candidates.map(candidate => reserve(candidate)));
            for (const result of results) if (result.status === "fulfilled") ids.push(result.value.id);
            assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
            assert.equal(results.find(result => result.status === "rejected").reason.status, 409);
            assert.equal(await db.homeVisit.count({ where: { slotKey: day + "/14:00" } }), 1);
        });
        await t.test("cancellation persists, releases the slot and allows a new booking", async () => {
            const cancelled = await changeVisit(first.id, "CANCELLED", day, "10:00", first.version, actorId);
            assert.equal(cancelled.status, "CANCELLED"); assert.equal(cancelled.slotKey, null);
            const replacement = await reserve({ ...input, requestKey: randomUUID() }); ids.push(replacement.id);
            assert.notEqual(replacement.id, first.id);
            assert.equal(await db.homeVisit.count({ where: { slotKey: day + "/10:00" } }), 1);
            assert.equal(await db.visitNotification.count({ where: { visitId: first.id, sentAt: { not: null } } }), 0);
        });
    } finally {
        await db.homeVisit.deleteMany({ where: { id: { in: ids } } });
        await db.auditLog.deleteMany({ where: { userId: actorId } });
        await db.user.deleteMany({ where: { id: actorId } });
        await db.rateLimit.deleteMany({ where: { key: { in: phones.map(phone => "visit-phone:" + createHmac("sha256", process.env.BETTER_AUTH_SECRET).update(phone).digest("hex")) } } });
        assert.equal(await db.user.count(), before.users);
        assert.equal(await db.product.count(), before.products);
        await db.$disconnect();
    }
});
