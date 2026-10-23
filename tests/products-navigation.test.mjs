import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function render(mobile = false) {
    const writes = [], timers = new Map();
    let next = 0;
    const jsx = (type, props) => ({ type, props });
    const react = {
        useState: initial => [initial, value => writes.push(typeof value === 'function' ? value(true) : value)],
        useRef: () => ({ current: { contains: () => false, focus: () => {} } }),
        useId: () => 'menu-test',
        useEffect: () => {},
    };
    const node = { category: { id: 'colchoes', slug: 'colchoes', icon: '' }, label: 'Colchoes', children: [], models: [{ href: '/produto', label: 'Produto' }] };
    const imports = {
        react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': { default: 'a', __esModule: true },
        '@/modules/catalog/navigation': { categoryNavigation: () => [node] },
        './ProductsNavigation.module.css': { default: {}, __esModule: true },
        './PublicConfig': { usePublicConfig: () => ({ products: [] }) },
    };
    const code = ts.transpileModule(fs.readFileSync('src/components/ProductsNavigation.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const mod = { exports: {} };
    new Function('require', 'module', 'exports', 'setTimeout', 'clearTimeout', 'window', 'document', code)(
        name => { assert.ok(name in imports, name); return imports[name]; }, mod, mod.exports,
        (callback, delay) => { assert.equal(delay, 250); timers.set(++next, callback); return next; },
        id => timers.delete(id), { matchMedia: () => ({ matches: true }) }, { activeElement: null },
    );
    const root = mod.exports.ProductsNavigation({ categories: [], mobile });
    const child = root.props.children[1].props.children[1].props.children[0];
    const branch = child.type(child.props);
    return { root, branch, writes, timers, flush: () => { for (const fn of timers.values()) fn(); timers.clear(); } };
}

for (const level of ['root', 'branch']) {
    test(level + ': hover, passagem entre areas e foco preservam abertura', () => {
        const ctx = render(), menu = ctx[level];
        menu.props.onPointerEnter({ pointerType: 'mouse' });
        assert.equal(ctx.writes.at(-1), true);
        menu.props.onPointerLeave({ pointerType: 'mouse' });
        assert.equal(ctx.timers.size, 1);
        menu.props.onPointerEnter({ pointerType: 'mouse' });
        assert.equal(ctx.timers.size, 0);
        menu.props.onPointerLeave({ pointerType: 'mouse' });
        menu.props.onFocusCapture();
        assert.equal(ctx.timers.size, 0);
        menu.props.onPointerLeave({ pointerType: 'mouse' });
        ctx.flush();
        assert.equal(ctx.writes.at(-1), false);
    });
    test(level + ': clique apos hover nao fecha; toque e teclado alternam', () => {
        for (const mobile of [false, true]) {
            const ctx = render(mobile), menu = ctx[level];
            const button = level === 'root' ? menu.props.children[0] : menu.props.children.props.children[0];
            button.props.onClick({ detail: 1 });
            assert.equal(ctx.writes.at(-1), !mobile);
            button.props.onClick({ detail: 0 });
            assert.equal(ctx.writes.at(-1), false);
            menu.props.onBlur({ currentTarget: { contains: () => true }, relatedTarget: {} });
            menu.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: {} });
            assert.equal(ctx.writes.at(-1), false);
        }
    });
}

test('Escape fecha o menu principal e cancela fechamento pendente', () => {
    const ctx = render();
    ctx.root.props.onPointerLeave({ pointerType: 'mouse' });
    let prevented = false, stopped = false;
    ctx.root.props.onKeyDown({ key: 'Escape', preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
    assert.equal(ctx.writes.at(-1), false);
    assert.equal(ctx.timers.size, 0);
    assert.ok(prevented && stopped);
});
