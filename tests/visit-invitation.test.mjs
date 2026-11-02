import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const code = ts.transpileModule(fs.readFileSync("src/components/VisitInvitation.tsx", "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function mount(path = "/", stored = {}, options = {}) {
    const values = []; let stateIndex = 0;
    const effects = [], timers = [], listeners = new Map(), modalListeners = new Map();
    const storage = stored instanceof Map ? stored : new Map(Object.entries(stored));
    let focused = 0, busy = false, now = 10000;
    class Element { isConnected = true; closest() { return busy; } focus() { focused++; } }
    const active = new Element();
    const document = { hidden: false, activeElement: active, body: { style: { overflow: "auto" } }, querySelectorAll: () => [],
        addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
    const window = { innerWidth: 1280, matchMedia: () => ({ matches: true }), getComputedStyle: () => ({ visibility: "visible" }),
        addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
    const modal = { open: false, shows: 0, showModal() { this.open = true; this.shows++; },
        close() { this.open = false; modalListeners.get("close")?.(); },
        addEventListener: (name, fn) => modalListeners.set(name, fn), removeEventListener: name => modalListeners.delete(name) };
    const jsx = (type, props) => ({ type, props });
    const mod = { exports: {} };
    vm.runInNewContext(code, { module: mod, exports: mod.exports, document, window, HTMLElement: Element,
        performance: { timeOrigin: options.navigationStartedAt },
        Date: { now: () => now }, sessionStorage: { getItem: key => { if (options.storageThrows) throw new Error("Storage unavailable"); return storage.get(key); }, setItem: (key, value) => { if (options.storageThrows) throw new Error("Storage unavailable"); storage.set(key, value); } },
        setTimeout: (fn, delay) => { const timer = { fn, delay }; timers.push(timer); return timer; }, clearTimeout: timer => { timer.cancelled = true; },
        require: name => {
            if (name === "react") return { useState: value => { const index = stateIndex++; if (!(index in values)) values[index] = value; return [values[index], next => { values[index] = next; }]; }, useEffect: fn => effects.push(fn), useRef: value => ({ current: value }), useId: () => "test-id" };
            if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
            if (name === "next/navigation") return { usePathname: () => path };
            if (name === "@/app/agendar/VisitForm") return { default: "VisitForm" };
            return { default: {} };
        },
    });
    const tree = mod.exports.VisitInvitation();
    function find(node, type) {
        if (!node || typeof node !== "object") return null;
        if (node.type === type) return node;
        for (const child of [node.props?.children].flat()) { const found = find(child, type); if (found) return found; }
        return null;
    }
    const dialog = find(tree, "dialog");
    if (dialog) dialog.props.ref.current = modal;
    const cleanup = effects[0]();
    return { modal, storage, timers, listeners, document, window, tree, cleanup, find,
        busy: value => { busy = value; }, advance: value => { now += value; }, focused: () => focused, restartEffect: () => { cleanup?.(); return effects[0](); }, render: () => { stateIndex = 0; return mod.exports.VisitInvitation(); } };
}

test("first visit opens after 3 seconds once per session; close restores scrolling and focus", () => {
    const app = mount();
    assert.equal(app.timers[0].delay, 3000);
    app.timers[0].fn();
    assert.equal(app.modal.shows, 1);
    assert.equal(app.storage.get("visit-invitation-status"), "shown");
    assert.equal(app.document.body.style.overflow, "hidden");
    app.modal.close();
    assert.equal(app.modal.open, false);
    assert.equal(app.storage.get("visit-invitation-status"), "dismissed");
    assert.equal(app.document.body.style.overflow, "auto");
    assert.equal(app.focused(), 1);
    app.listeners.get("mouseout")({ relatedTarget: null, clientY: 0 });
    assert.equal(app.modal.shows, 1);
    app.cleanup();
});
test("protects forms and resumes promptly without an extra interaction cooldown", () => {
    const app = mount(); app.busy(true); app.timers[0].fn();
    assert.equal(app.modal.open, false); assert.equal(app.timers[1].delay, 250);
    app.busy(false); app.timers[1].fn(); assert.equal(app.modal.open, true); app.cleanup();
});
test("desktop exit intent opens; mobile exit intent does not", () => {
    const desktop = mount(); desktop.listeners.get("mouseout")({ relatedTarget: null, clientY: 0 });
    assert.equal(desktop.modal.open, false); desktop.advance(3000);
    desktop.listeners.get("mouseout")({ relatedTarget: null, clientY: 0 });
    assert.equal(desktop.modal.open, true); desktop.cleanup();
    const mobile = mount(); mobile.window.innerWidth = 390; mobile.advance(3000);
    mobile.listeners.get("mouseout")({ relatedTarget: null, clientY: 0 });
    assert.equal(mobile.modal.open, false); mobile.cleanup();
});

test("counts from page navigation rather than hydration and retains the deadline on effect restart", () => {
    const delayed = mount("/", {}, { navigationStartedAt: 8000 });
    assert.equal(delayed.timers[0].delay, 1000); delayed.cleanup();
    const overdue = mount("/", {}, { navigationStartedAt: 6000 });
    assert.equal(overdue.timers[0].delay, 0); overdue.timers[0].fn(); assert.equal(overdue.modal.open, true); overdue.cleanup();
    const app = mount(); app.advance(1000); const cleanup = app.restartEffect();
    assert.equal(app.timers[0].cancelled, true); assert.equal(app.timers[1].delay, 2000); cleanup();
});

test("holding the pointer defers opening but releasing it does not restart the deadline", () => {
    const app = mount(); app.listeners.get("pointerdown")(); app.timers[0].fn();
    assert.equal(app.modal.open, false); app.listeners.get("pointerup")(); app.timers[1].fn();
    assert.equal(app.modal.open, true); app.cleanup();
});
test("does not reopen after booking or dismissal, or outside homepage", () => {
    for (const marker of ["visit-booked", "visit-invitation-status"]) { const app = mount("/", { [marker]: "1" }); app.timers[0].fn(); assert.equal(app.modal.open, false); app.cleanup(); }
    for (const path of ["/agendar", "/produtos", "/admin"]) { const app = mount(path); assert.equal(app.timers.length, 0); assert.equal(app.find(app.tree, "dialog"), null); }
});
test("fixed button opens the same popup; cleanup closes it and removes handlers", () => {
    const app = mount(); app.timers[0].fn();
    const fixed = app.find(app.tree, "button"); assert.equal(fixed.props.children, "Agendar visita");
    app.modal.close(); fixed.props.onClick(); assert.equal(app.modal.open, true);
    app.cleanup(); assert.equal(app.modal.open, false); assert.equal(app.listeners.size, 0); assert.equal(app.document.body.style.overflow, "auto");
});

test("primary CTA mounts the existing form inside the same dialog and supports back", () => {
    const app = mount(); app.timers[0].fn();
    const cta = app.find(app.find(app.tree, "dialog"), "button");
    assert.equal(cta.props.children[0], "Agendar minha visita ");
    cta.props.onClick();
    const booking = app.render();
    const form = app.find(booking, "VisitForm");
    assert.ok(form); assert.ok(app.find(booking, "dialog")); assert.equal(app.modal.open, true);
    form.props.onBack(); assert.equal(app.find(app.render(), "VisitForm"), null);
    app.cleanup();
});

test("legacy manual-open marker does not suppress the new automatic invitation", () => {
    const app = mount("/", { "visit-invitation": "1" });
    app.timers[0].fn(); assert.equal(app.modal.open, true); app.cleanup();
});

test("dismissal survives navigation away and back in the same session", () => {
    const app = mount(); app.timers[0].fn(); app.modal.close(); app.cleanup();
    const otherPage = mount("/produtos", app.storage); assert.equal(otherPage.timers.length, 0);
    const returned = mount("/", app.storage); returned.timers[0].fn(); assert.equal(returned.modal.open, false); returned.cleanup();
});

test("hidden menus do not block automatic opening; visible menus defer it", () => {
    const app = mount();
    app.document.querySelectorAll = () => [{ closest: () => null, getClientRects: () => [] }];
    app.timers[0].fn(); assert.equal(app.modal.open, true); app.cleanup();
    const blocked = mount();
    blocked.document.querySelectorAll = () => [{ closest: () => null, getClientRects: () => [{}] }];
    blocked.timers[0].fn(); assert.equal(blocked.modal.open, false);
    blocked.document.querySelectorAll = () => []; blocked.timers[1].fn(); assert.equal(blocked.modal.open, true); blocked.cleanup();
});

test("blocked sessionStorage does not disable automatic or manual opening", () => {
    const app = mount("/", {}, { storageThrows: true });
    app.timers[0].fn(); assert.equal(app.modal.open, true);
    app.modal.close(); app.timers[0].fn(); assert.equal(app.modal.shows, 1);
    app.find(app.tree, "button").props.onClick(); assert.equal(app.modal.shows, 2); app.cleanup();
});

test("X and secondary option close immediately; successful booking suppresses a future automatic open", () => {
    const app = mount(); app.timers[0].fn();
    const modalTree = app.find(app.tree, "dialog");
    function all(node, predicate) { if (!node || typeof node !== "object") return []; return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap(child => all(child, predicate))]; }
    const secondary = all(modalTree, node => node.type === "button" && node.props.children === "Agora não, continuar navegando")[0];
    secondary.props.onClick(); assert.equal(app.modal.open, false);
    app.find(app.tree, "button").props.onClick();
    all(modalTree, node => node.props["aria-label"] === "Fechar convite")[0].props.onClick(); assert.equal(app.modal.open, false);
    app.storage.set("visit-booked", "1"); app.cleanup();
    const returned = mount("/", app.storage); returned.timers[0].fn(); assert.equal(returned.modal.open, false); returned.cleanup();
});
