import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), ts = require("typescript");
const compile = file => ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const jsx = (type, props) => ({ type, props });
function nodes(node, predicate) {
    if (!node || typeof node !== "object") return [];
    return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap(child => nodes(child, predicate))];
}
function harness(status = 201) {
    const states = [], effects = [], refs = [], calls = [], storage = new Map();
    let index = 0, effectIndex = 0, refIndex = 0, done = false;
    const dependencies = [], pending = [];
    const react = {
        useState(initial) { const i = index++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; },
        useRef(initial) { const i = refIndex++; return refs[i] ??= { current: initial }; },
        useEffect(fn, deps) { const i = effectIndex++; if (!dependencies[i] || deps.some((d, n) => d !== dependencies[i][n])) { dependencies[i] = deps; effects[i]?.(); pending.push(() => { effects[i] = fn(); }); } },
    };
    const mod = { exports: {} };
    vm.runInNewContext(compile("src/app/agendar/VisitForm.tsx"), { module: mod, exports: mod.exports, AbortController,
        crypto: { randomUUID: () => "01234567-1234-1234-1234-123456789abc" },
        sessionStorage: { setItem: (key, value) => storage.set(key, value) },
        FormData: class { constructor() { return new Map(Object.entries({ name: "Cliente Teste", phone: "71999991234", email: "test@example.invalid", city: "Salvador Centro", address: "Rua Teste, 123", notes: "", website: "", consent: "on" })); } },
        fetch: async (url, options) => { calls.push({ url, options }); return { ok: !options.method || status === 201, status: options.method ? status : 200,
            json: async () => options.method ? status === 201 ? { protocol: "HL-TEST", message: "Solicitação registrada (America/Bahia)" } : { error: "Horário ocupado" } : { today: "2026-11-02", zone: "America/Bahia", times: ["10:00", "14:00"] } }; },
        require: name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : name.includes("VisitCalendar") ? { VisitCalendar: "Calendar" } : name.includes("validation") ? { TIMES: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"] } : { default: {} },
    });
    function render() { index = 0; effectIndex = 0; refIndex = 0; return mod.exports.default({ onBack: () => {}, onSuccess: () => { done = true; } }); }
    async function settle() { pending.splice(0).forEach(fn => fn()); for (let n = 0; n < 8; n++) await Promise.resolve(); return render(); }
    return { render, settle, calls, storage, done: () => done };
}
async function choose(app) {
    app.render(); let tree = await app.settle();
    nodes(tree, n => n.type === "Calendar")[0].props.onSelect("2026-11-03");
    app.render(); tree = await app.settle();
    const slots = nodes(tree, n => n.type === "button" && n.props["aria-pressed"] !== undefined);
    assert.equal(slots.length, 6); assert.equal(slots.filter(n => n.props.disabled).length, 4);
    slots.find(n => n.props["aria-label"].startsWith("10:00")).props.onClick();
    tree = app.render(); nodes(tree, n => n.type === "button" && n.props.children === "Continuar")[0].props.onClick();
    return app.render();
}
test("calendar preserves month lengths and blocks weekends and past dates", () => {
    const mod = { exports: {} };
    vm.runInNewContext(compile("src/components/VisitCalendar.tsx"), { module: mod, exports: mod.exports,
        require: name => name === "react" ? { useState: initial => [initial(), () => {}] } : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : { default: {} } });
    assert.equal(mod.exports.calendarDays("2028-02").days.length, 29);
    assert.equal(mod.exports.calendarDays("2026-11").offset, 6);
    const tree = mod.exports.VisitCalendar({ today: "2026-11-04", selected: "", onSelect: () => {} });
    const days = nodes(tree, n => n.type === "button" && n.props["aria-pressed"] !== undefined);
    assert.equal(days.find(n => n.props.children === 3).props.disabled, true);
    assert.equal(days.find(n => n.props.children === 7).props.disabled, true);
    assert.equal(days.find(n => n.props.children === 8).props.disabled, true);
    assert.equal(days.find(n => n.props.children === 5).props.disabled, false);
});
test("calendar, form, back and success reuse API and retain consent without real requests", async () => {
    const app = harness(); let tree = await choose(app);
    assert.ok(nodes(tree, n => n.type === "input" && n.props.name === "consent")[0].props.required);
    assert.ok(nodes(tree, n => n.type === "input" && n.props.name === "address").length);
    nodes(tree, n => n.type === "button" && n.props.children === "Voltar ao calendário")[0].props.onClick();
    tree = app.render(); assert.equal(nodes(tree, n => n.type === "div" && n.props.hidden === false).length > 0, true);
    nodes(tree, n => n.type === "button" && n.props.children === "Continuar")[0].props.onClick();
    tree = app.render(); await tree.props.onSubmit({ preventDefault() {}, currentTarget: {} });
    tree = app.render(); const post = app.calls.find(call => call.options.method === "POST");
    assert.equal(post.url, "/api/visits"); const payload = JSON.parse(post.options.body);
    assert.equal(payload.date, "2026-11-03"); assert.equal(payload.time, "10:00"); assert.equal(payload.consent, true);
    assert.equal(app.storage.get("visit-booked"), "1"); assert.equal(app.done(), true); assert.equal(tree.props.role, "status");
    assert.equal(JSON.stringify(tree).includes("America/Bahia"), false);
});

test("public steps omit technical time zones and keep navigation in a separate footer", async () => {
    const app = harness(); app.render(); const calendar = await app.settle();
    assert.equal(JSON.stringify(calendar).includes("America/Bahia"), false);
    const footer = calendar.props.children.find(child => child?.type === "footer");
    assert.ok(footer);
    assert.equal(nodes(footer, n => n.type === "button" && n.props.children === "Continuar").length, 1);
    const details = await choose(app);
    assert.equal(JSON.stringify(details).includes("America/Bahia"), false);
    assert.equal(nodes(details.props.children.find(child => child?.type === "footer"), n => n.type === "button").length, 2);
});

test("monthly grid handles four, five and six weeks and distinguishes known full dates", () => {
    const mod = { exports: {} };
    vm.runInNewContext(compile("src/components/VisitCalendar.tsx"), { module: mod, exports: mod.exports,
        require: name => name === "react" ? { useState: initial => [initial(), () => {}] } : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : { default: {} } });
    for (const [month, weeks] of [["2027-02", 4], ["2026-04", 5], ["2026-11", 6]]) {
        const { offset, days } = mod.exports.calendarDays(month);
        assert.equal(Math.ceil((offset + days.length) / 7), weeks);
    }
    const tree = mod.exports.VisitCalendar({ today: "2026-11-02", selected: "2026-11-03", unavailableDates: ["2026-11-04"], onSelect: () => {} });
    const days = nodes(tree, n => n.type === "button" && n.props["aria-pressed"] !== undefined);
    assert.equal(days.find(n => n.props.children === 3).props["aria-pressed"], true);
    assert.equal(days.find(n => n.props.children === 4).props["data-status"], "full");
    assert.equal(days.find(n => n.props.children === 4).props.disabled, true);
    assert.equal(days.find(n => n.props.children === 7).props["data-status"], "unavailable");
    assert.equal(days.find(n => n.props.children === 5).props["data-status"], "available");
});
test("atomic conflict from API returns to calendar without reporting success", async () => {
    const app = harness(409); const tree = await choose(app);
    await tree.props.onSubmit({ preventDefault() {}, currentTarget: {} });
    const updated = app.render(); assert.equal(app.done(), false); assert.equal(app.storage.has("visit-booked"), false);
    assert.equal(nodes(updated, n => n.props.role === "alert").length, 1);
    assert.equal(nodes(updated, n => n.type === "button" && n.props.children === "Continuar")[0].props.disabled, true);
});

test("image fallback is limited to development and preserves production storage", async () => {
    for (const mode of ["development", "production"]) {
        const mod = { exports: {} }; let originals = 0, storage = 0;
        vm.runInNewContext(compile("src/app/media/products/[filename]/route.ts"), { module: mod, exports: mod.exports, Response, Uint8Array,
            process: { env: { NODE_ENV: mode }, cwd: () => process.cwd() },
            require: name => {
                if (name.includes("local-storage")) return { mediaFilename: /^[a-f0-9]{64}\.png$/, readLocalMedia: async () => { storage++; return new Uint8Array([1, 2]); } };
                if (name.includes("storage-images")) return { originalImageURLs: () => ["/majestic/4.png"] };
                if (name === "node:fs/promises") return { readFile: async () => { originals++; return new Uint8Array([1, 2]); } };
                if (name === "node:path") return { default: require("node:path") };
                throw new Error("Unexpected import");
            },
        });
        const response = await mod.exports.GET(null, { params: Promise.resolve({ filename: "a".repeat(64) + ".png" }) });
        assert.equal(response.status, 200); assert.equal(originals, mode === "development" ? 1 : 0); assert.equal(storage, mode === "production" ? 1 : 0);
        const invalid = await mod.exports.GET(null, { params: Promise.resolve({ filename: "../private" }) });
        assert.equal(invalid.status, 404);
    }
});
