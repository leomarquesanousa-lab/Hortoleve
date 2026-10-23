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

function syncDatabase() {
    const rows = new Map(), categories = [], products = [], media = [];
    let writes = 0;
    const tx = {
        $queryRaw: async () => [],
        siteSetting: {
            findMany: async () => [...rows].map(([key, value]) => ({ key, value })),
            create: async ({ data }) => { assert.ok(!rows.has(data.key)); rows.set(data.key, data.value); writes++; },
            upsert: async ({ where, create, update }) => { rows.set(where.key, rows.has(where.key) ? update.value : create.value); writes++; },
        },
        category: { findMany: async () => categories, create: async ({ data }) => { categories.push(data); writes++; } },
        product: { findMany: async () => products, create: async ({ data }) => { products.push(data); writes++; } },
        productMedia: { createMany: async ({ data }) => { media.push(...data); writes++; } },
        auditLog: { create: async () => { writes++; } },
    };
    return { tx, rows, categories, products, media, writes: () => writes };
}

test("Importação preserva ícones e apresentação; novos produtos recebem o template premium", () => {
    const load = loader({ "@/modules/admin/database": { getDatabase: () => { throw Error("Banco não deve ser consultado neste teste"); } } });
    const { initialContent } = load("src/modules/cms/initial-content.ts");
    const { validateData } = load("src/modules/cms/validation.ts");
    const { toPresentation } = load("src/modules/cms/public.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    for (const item of initialContent.filter(i => i.resource === "produtos")) {
        const source = presentations[item.data.slug];
        const restored = toPresentation(validateData("produtos", item.data));
        assert.deepEqual(restored.media, source.media);
        assert.deepEqual(restored.technologyIcons, source.technologyIcons ?? {});
        assert.deepEqual(restored.technologyDescriptions, source.technologyDescriptions ?? {});
    }
    const source = initialContent.find(i => i.resource === "produtos").data;
    const fresh = validateData("produtos", { ...source, title: "", paragraphs: "", name: "Novo produto", description: "Descrição completa" });
    assert.equal(fresh.title, "Novo produto"); assert.equal(fresh.paragraphs, "Descrição completa");
    assert.throws(() => validateData("produtos", { ...source, gallery: [source.gallery[0], source.gallery[0]] }), /únicos/);
});

test("Categorias recusam ciclos no servidor antes de gravar", async () => {
    const tx = {
        $queryRaw: async () => [],
        siteSetting: { findUnique: async () => null, findMany: async () => [{ value: { id: "b", resource: "categorias", draft: {}, published: { parentId: "a" } } }] },
    };
    const repo = loader({ "@/modules/admin/database": { getDatabase: () => ({ $transaction: fn => fn(tx) }) } })("src/modules/cms/repository.ts");
    await assert.rejects(repo.saveDocument({ ...user, role: "OWNER" }, "categorias", { name: "Categoria A", slug: "a", parentId: "b", published: true }, "a", 0, true), /ciclo/);
});

test("SEO editado no produto reflete a publicação sem expor o rascunho", async () => {
    const old = process.env.CMS_PUBLIC_ENABLED; process.env.CMS_PUBLIC_ENABLED = "true";
    const rows = [
        { value: { id: "category", resource: "categorias", draft: {}, published: { name: "Categoria", slug: "categoria" } } },
        { value: { id: "product", resource: "produtos", draft: { seoTitle: "Privado" }, published: { name: "Produto", categoryId: "category", slug: "produto", gallery: [], seoTitle: "Título SEO atualizado", seoDescription: "Descrição SEO atualizada" } } },
        { value: { id: "seo", resource: "seo", draft: {}, published: { route: "/produtos/categoria/produto", title: "SEO anterior", description: "Anterior", canonical: "/produtos/categoria/produto", indexable: false } } },
    ];
    try {
        const pub = loader({ "next/server": { connection: async () => {} }, "@/modules/admin/database": { getDatabase: () => ({ siteSetting: { findUnique: async () => ({ value: true }), findMany: async () => rows } }) } })("src/modules/cms/public.ts");
        const metadata = await pub.seoMetadata("/produtos/categoria/produto", { title: "Fallback" });
        assert.equal(metadata.title, "Título SEO atualizado");
        assert.equal(metadata.description, "Descrição SEO atualizada");
        assert.equal(metadata.openGraph.title, "Título SEO atualizado");
        assert.ok(!JSON.stringify(metadata).includes("Privado"));
    } finally { if (old === undefined) delete process.env.CMS_PUBLIC_ENABLED; else process.env.CMS_PUBLIC_ENABLED = old; }
});

test("Sincronização faz prévia sem escrita e importa todo o catálogo sem duplicar ou sobrescrever edições", async () => {
    const db = syncDatabase(), load = loader();
    const { synchronizeContent } = load("src/modules/cms/synchronize.ts");
    const { products, categories } = load("src/modules/catalog/data.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const plan = await synchronizeContent(db.tx);
    assert.equal(plan.create.produtos, products.length); assert.equal(db.writes(), 0);
    const applied = await synchronizeContent(db.tx, true, "owner-id");
    assert.equal(applied.applied, true);
    assert.equal(db.products.length, products.length); assert.equal(db.categories.length, categories.length);
    for (const p of products) {
        const imported = db.rows.get("cms:produtos:" + p.id);
        assert.equal(imported.published.slug, p.slug);
        assert.deepEqual(imported.published.gallery, presentations[p.slug]?.media ?? p.media);
    }
    const first = db.rows.get("cms:produtos:" + products[0].id);
    first.draft.name = first.published.name = "Edição do cliente";
    const again = await synchronizeContent(db.tx, true);
    assert.deepEqual(again.create, {});
    assert.equal(db.products.length, products.length);
    assert.equal(first.published.name, "Edição do cliente");
});

test("Sincronização preserva exclusões registradas e bloqueia conflitos sem gravação parcial", async () => {
    const load = loader(); const { synchronizeContent } = load("src/modules/cms/synchronize.ts");
    const db = syncDatabase(); db.rows.set("cms-deleted:produtos:elite-azul", true);
    await synchronizeContent(db.tx, true);
    assert.ok(!db.products.some(p => p.id === "elite-azul"));
    const conflict = syncDatabase(); conflict.categories.push({ id: "other-id", slug: "colchoes", active: true });
    const result = await synchronizeContent(conflict.tx, true);
    assert.ok(result.conflicts.length); assert.equal(result.applied, false); assert.equal(conflict.writes(), 0);
});

test("Sincronização administrativa exige OWNER ativo e origem válida antes de consultar o banco", async () => {
    let identity = null, calls = 0;
    const route = loader({
        "@/modules/admin/session": { currentAdmin: async () => identity },
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://hortoleve.com.br" }) },
        "@/modules/admin/database": { getDatabase: () => { calls++; throw Error("not expected"); } },
    })("src/app/api/admin-catalog-sync/route.ts");
    const get = new Request("https://hortoleve.com.br/api/admin-catalog-sync");
    assert.equal((await route.GET(get)).status, 401);
    identity = user; assert.equal((await route.GET(get)).status, 403);
    identity = { ...user, role: "OWNER", active: false }; assert.equal((await route.GET(get)).status, 401);
    identity = { ...user, role: "OWNER" };
    assert.equal((await route.POST(new Request(get.url, { method: "POST", headers: { origin: "https://evil.test" } }))).status, 403);
    assert.equal(calls, 0);
});

test("Painel continua mostrando novos itens estáticos após importação, sem ressuscitar exclusões", async () => {
    const rows = [{ key: "cms-deleted:produtos:elite-azul", value: true }];
    const repo = loader({ "@/modules/admin/database": { getDatabase: () => ({ siteSetting: { findMany: async ({ where }) => rows.filter(r => r.key.startsWith(where.key.startsWith)), findUnique: async () => ({ value: true }) } }) } })("src/modules/cms/repository.ts");
    const records = await repo.listDocuments("produtos");
    assert.ok(records.some(r => r.id === "travesseiro-future" && r.source === "static"));
    assert.ok(!records.some(r => r.id === "elite-azul"));
});

test("Future e Cervical Orto Plus têm galerias independentes, materiais próprios e ficam fora da Home", () => {
    const load = loader();
    const { products, categories, productHref } = load("src/modules/catalog/data.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const cases = [
        ["future", "future", "future"],
        ["cervical-orto-plus", "cervicalortoplus", "cervical"],
    ];
    for (const [line, folder, filename] of cases) {
        const product = products.find(p => p.slug === "travesseiro-" + line);
        const presentation = presentations[product.slug];
        assert.equal(products.filter(p => p.slug === product.slug).length, 1);
        assert.equal(categories.find(c => c.id === product.categoryId).parentId, "travesseiros");
        assert.equal(productHref(product), `/produtos/linha-${line}/travesseiro-${line}`);
        assert.equal(product.featured, false);
        assert.equal(product.media[0].src, presentation.media[0].src);
        assert.deepEqual(presentation.media.map(m => m.src), [1, 2, 3].map(n => `/travesseiros/${folder}/travesseiro_${filename}_${n}.png`));
        assert.ok(presentation.specifications.some(s => s.value === "Malha"));
        assert.ok(presentation.specifications.some(s => s.value === "Soft"));
        assert.ok(!presentation.specifications.some(s => /garantia|densidade|certificação/i.test(s.label)));
        assert.ok(presentation.media.every(m => m.width / m.height === 1.5));
    }
    assert.ok(presentations["travesseiro-future"].technologies.includes("Cerâmica Future"));
    assert.ok(!presentations["travesseiro-cervical-orto-plus"].technologies.includes("Cerâmica Future"));
    assert.ok(presentations["travesseiro-cervical-orto-plus"].technologies.includes("Formato ergonômico"));
});

test("Menu organiza oito categorias principais e linhas exclusivamente dentro dos pais", () => {
    const load = loader();
    const { categories } = load("src/modules/catalog/data.ts");
    const { categoryNavigation } = load("src/modules/catalog/navigation.ts");
    const tree = categoryNavigation(categories);
    assert.deepEqual(tree.map(n => n.label), ["Colchões", "Poltronas", "Vibrocar", "Linha a Vácuo", "Cama Box", "Travesseiros", "Cabeceiras", "Dream Patch"]);
    assert.deepEqual(tree.find(n => n.category.id === "poltronas").children.map(n => n.category.id), ["linha-divan", "linha-house"]);
    assert.deepEqual(tree.find(n => n.category.id === "travesseiros").children.map(n => n.category.id), ["linha-viscoelastico", "linha-future", "linha-cervical-orto-plus"]);
    assert.equal(tree.find(n => n.label === "Dream Patch").category.slug, "dream-pet");
    const extra = { id: "future-line", parentId: "travesseiros", name: "Futura linha", slug: "future-line" };
    assert.ok(categoryNavigation([...categories, extra]).find(n => n.category.id === "travesseiros").children.some(n => n.category.id === extra.id));
});

test("Viscoelástico preserva materiais documentados, ordem 1–3 e categoria Travesseiros", () => {
    const load = loader();
    const { products, categories, productHref, getCategoryProducts } = load("src/modules/catalog/data.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const product = products.find(p => p.id === "travesseiro-viscoelastico");
    const p = presentations[product.slug];
    assert.equal(categories.find(c => c.id === product.categoryId).parentId, "travesseiros");
    assert.equal(getCategoryProducts("travesseiros").length, 3);
    assert.equal(product.featured, false);
    assert.equal(productHref(product), "/produtos/linha-viscoelastico/travesseiro-viscoelastico");
    assert.deepEqual(p.media.map(m => m.src), [1, 2, 3].map(n => `/travesseiros/viscoelastico/travesseiro_viscoelastico_${n}.png`));
    assert.ok(p.technologies.includes("Espuma viscoelástica"));
    assert.ok(p.specifications.some(s => s.value === "Tecido branco"));
    assert.ok(!p.specifications.some(s => /garantia|densidade|certificação/i.test(s.label)));
});

test("House integra Poltronas, mantém galeria 1–2–3, cores e recursos sem inventar especificações", () => {
    const load = loader();
    const { products, categories, getCategoryProducts, productHref } = load("src/modules/catalog/data.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const product = products.find(p => p.id === "house");
    const p = presentations.house;
    assert.equal(products.filter(p => p.id === "house").length, 1);
    assert.equal(categories.find(c => c.id === product.categoryId).parentId, "poltronas");
    assert.ok(getCategoryProducts("poltronas").some(p => p.id === "house"));
    assert.ok(getCategoryProducts("poltronas").some(p => p.id === "divan"));
    assert.equal(getCategoryProducts("linha-house").length, 1);
    assert.equal(product.featured, false);
    assert.equal(productHref(product), "/produtos/linha-house/house");
    assert.equal(product.media[0].src, p.media[0].src);
    assert.deepEqual(p.media.map(m => m.src), [1, 2, 3].map(n => `/poltronas/house/poltronahouse_${n}.png`));
    assert.equal(p.technicalSheetId, p.media[1].id);
    assert.ok(p.specifications.some(s => s.value === "Preto, bege e marrom"));
    assert.ok(p.specifications.some(s => s.value === "Tecido suede"));
    assert.ok(p.specifications.some(s => s.value === "Controle Vibro"));
    assert.ok(!p.specifications.some(s => /garantia|capacidade|\bD\d{2}\b/i.test(s.label + s.value)));
    assert.ok(!p.technologies.some(t => /magnético|infravermelho|cromoterapia/i.test(t)));
});

test("Divan preserva hierarquia Poltronas, galeria 1–3 e dados documentados sem entrar na Home", () => {
    const load = loader();
    const { products, categories, getCategoryProducts, productHref } = load("src/modules/catalog/data.ts");
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const product = products.find(p => p.id === "divan");
    assert.equal(categories.find(c => c.id === product.categoryId).parentId, "poltronas");
    assert.equal(products.filter(p => p.id === "divan").length, 1);
    assert.equal(product.featured, false);
    assert.ok(getCategoryProducts("poltronas").includes(product));
    assert.ok(getCategoryProducts("linha-divan").includes(product));
    assert.equal(productHref(product), "/produtos/linha-divan/divan");
    const p = presentations.divan;
    assert.deepEqual(p.media.map(m => m.src.match(/-(\d)\.png$/)[1]), ["1", "2", "3"]);
    assert.equal(product.media[0].src, p.media[0].src);
    assert.equal(p.technicalSheetId, p.media[2].id);
    assert.ok(p.specifications.some(s => s.value === "Preto e marrom"));
    assert.ok(p.specifications.some(s => s.value === "Controle Vibro"));
    assert.ok(!p.specifications.some(s => /garantia|capacidade|\bD\d{2}\b/i.test(s.label + s.value)));
});

test("Recovery Mais reutiliza apresentação premium, capa e cinco arquivos na ordem explícita", () => {
    const load = loader();
    const { presentations } = load("src/modules/catalog/presentations.ts");
    const { products, productHref } = load("src/modules/catalog/data.ts");
    const product = products.find(p => p.slug === "recover-mais");
    const p = presentations[product.slug];
    assert.equal(product.name, "Colchão Recovery⁺");
    assert.equal(p.title, product.name);
    assert.equal(p.displayName, product.name);
    assert.ok(product.media[0].alt.includes("Colchão Recovery+"));
    assert.ok(p.media.every(m => !/Recovery Mais|Recover Mais/.test(m.alt)));
    const seo = load("src/modules/cms/initial-content.ts").initialContent.find(i => i.resource === "seo" && i.data.route === productHref(product));
    assert.equal(seo.data.title, "Colchão Recovery+");
    assert.equal(productHref(product), "/produtos/colchoes/recover-mais");
    assert.equal(product.media[0].src, p.media[0].src);
    assert.deepEqual(p.media.map(m => m.src), [1, 2, 3, 4, 5].map(n => `/recover+/${n}.png`));
    for (const m of p.media) { assert.ok(fs.existsSync("public" + m.src)); assert.equal(m.width / m.height, 1.5); }
    assert.equal(p.technicalSheetId, p.media[2].id);
    assert.ok(!p.specifications.some(s => /garantia|capacidade/i.test(s.label)));
});

test("WhatsApp do formulário codifica dados, identifica origem e rejeita destinos falsos", () => {
    const { leadWhatsappUrl } = loader()("src/modules/leads/whatsapp.ts");
    const input = { name: "Cliente Teste", phone: "71999999999", email: "test@example.test", message: "Dúvida & conforto?", subject: "colchoes", line: "recover-mais", consent: true, website: "" };
    const url = new URL(leadWhatsappUrl("https://wa.me/5571996461138", input, "Recovery Mais"));
    assert.equal(url.origin + url.pathname, "https://wa.me/5571996461138");
    const message = url.searchParams.get("text");
    for (const value of [input.name, input.phone, input.email, input.message, "Recovery Mais", "Origem: Página Contato"]) assert.ok(message.includes(value));
    assert.equal(leadWhatsappUrl("https://evil.test/5571996461138", input), null);
    assert.equal(leadWhatsappUrl(null, input), null);
    const { validateLead } = loader()("src/modules/leads/contracts.ts");
    assert.ok(validateLead({ ...input, consent: false }, ["recover-mais"]).errors.consent);
    assert.ok(validateLead({ ...input, website: "spam" }, ["recover-mais"]).errors.website);
});

test("Home preserva seis produtos e experiências verdes, com FAQ em seção própria", () => {
    const card = () => null, faq = () => null;
    const load = loader({
        "@/components/HomeHero": { HomeHero: () => null },
        "@/components/SectionHeading": { SectionHeading: () => null },
        "@/components/ProductCard": { ProductCard: card },
        "@/components/CTAWhatsApp": { CTAWhatsApp: () => null },
        "@/components/FAQ": { FAQ: faq },
        "@/components/site.module.css": { dark: "dark", section: "section", helpSection: "helpSection" },
    });
    const { products } = load("src/modules/catalog/data.ts");
    const { ApprovedHome } = load("src/components/ApprovedHome.tsx");
    const nodes = []; const visit = (node, parents = []) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) { node.forEach(n => visit(n, parents)); return; }
        nodes.push({ node, parents }); visit(node.props?.children, [...parents, node]);
    };
    visit(ApprovedHome({ content: null, snapshot: { products } }));
    const ids = nodes.filter(({ node }) => node.type === card).map(({ node }) => node.props.product.id);
    assert.deepEqual(ids, ["recover-mais", "diamond", "elegance", "majestic", "comfort", "elite-azul"]);
    assert.equal(new Set(ids).size, 6);
    assert.equal(nodes.filter(({ node }) => node.props?.className === "dark").length, 1);
    const faqParents = nodes.find(({ node }) => node.type === faq).parents;
    assert.ok(!faqParents.some(node => node.props?.className === "dark"));
    assert.ok(faqParents.some(node => node.props?.className === "section helpSection"));
    assert.ok(nodes.some(({ node }) => node.props?.title === "Descubra novas possibilidades."));
    const slots = load("src/modules/content/page-defaults.ts").pageDefaults.home.texts;
    assert.ok(!slots.some(slot => /^home-(2|3|4|5|6|7|15|16|17|18|22)$/.test(slot.key)));
    const published = [{ id: "published", question: "Conteúdo CMS", answer: "Preservar publicação existente" }];
    nodes.length = 0;
    visit(ApprovedHome({ content: { faq: published }, snapshot: { products } }));
    assert.equal(nodes.find(({ node }) => node.type === faq).node.props.items, published);
});

test("FAQ contém os quatro textos comerciais e parágrafos fornecidos, sem promessa de teste", () => {
    const load = loader(); const { faqs } = load("src/modules/content/data.ts");
    assert.deepEqual(faqs.map(faq => faq.question), ["Os colchões apresentados estão disponíveis para compra?", "Como funciona o atendimento para escolher meu colchão?", "É possível conhecer melhor os modelos antes de decidir?", "Posso comprar meu colchão diretamente pelo site?"]);
    assert.deepEqual(faqs.map(faq => faq.answer.split("\n\n").length), [2, 3, 3, 4]);
    assert.ok(faqs[0].answer.includes("até 30 dias"));
    assert.ok(faqs[1].answer.includes("mediante disponibilidade"));
    assert.ok(!faqs.some(faq => /simulador|período de teste|teste gratuito/i.test(faq.question + faq.answer)));
    const imported = load("src/modules/cms/initial-content.ts").initialContent.find(i => i.resource === "home");
    assert.deepEqual(imported.data.faq, faqs);
});

test("Orbit muda de contraste somente ao cruzar o rodapé e restaura ao sair", () => {
    const { footerOrbitPosition } = loader()("src/components/social-orbit-position.ts");
    for (const size of [50, 56]) {
        const icon = { left: 900, right: 900 + size, top: 700, bottom: 700 + size };
        const footer = { left: 0, right: 1000, top: icon.bottom, bottom: 1600 };
        assert.equal(footerOrbitPosition(icon, footer, []).overFooter, false);
        assert.equal(footerOrbitPosition(icon, { ...footer, top: icon.bottom - 1 }, []).overFooter, true);
        assert.equal(footerOrbitPosition(icon, { ...footer, top: 600 }, []).overFooter, true);
        assert.equal(footerOrbitPosition(icon, { ...footer, top: 790 }, []).overFooter, false);
        assert.equal(footerOrbitPosition(icon, { ...footer, left: 0, right: 800, top: 600 }, []).overFooter, false);
    }
});

test("Orbit desvia de links do rodapé com deslocamento limitado e considera a posição final", () => {
    const { footerOrbitPosition } = loader()("src/components/social-orbit-position.ts");
    const icon = { left: 924, right: 980, top: 700, bottom: 756 };
    const footer = { left: 0, right: 1000, top: 650, bottom: 1600 };
    const link = { left: 910, right: 980, top: 730, bottom: 748 };
    assert.deepEqual(footerOrbitPosition(icon, footer, [link]), { lift: 34, overFooter: true });
    assert.deepEqual(footerOrbitPosition(icon, { ...footer, top: 745 }, [{ ...link, top: 750 }]), { lift: 14, overFooter: false });
    assert.equal(footerOrbitPosition(icon, footer, [link], 20).lift, 0);
});

test("WhatsApp comercial usa configuração única e redes sem perfil continuam sem destino", () => {
    const load = loader(); const { site, whatsappUrl } = load("src/config/site.ts");
    const { socialChannels, socialChannelUrl } = load("src/config/social.ts");
    assert.equal(site.whatsapp, "5571996461138");
    const link = new URL(whatsappUrl("Olá! Quero conhecer o Elite Azul."));
    assert.equal(link.hostname, "wa.me"); assert.equal(link.pathname, "/" + site.whatsapp);
    assert.equal(link.searchParams.get("text"), "Olá! Quero conhecer o Elite Azul.");
    assert.equal(whatsappUrl("", site.whatsapp), "https://wa.me/" + site.whatsapp);
    assert.equal(whatsappUrl("Teste", null), null);
    assert.equal(whatsappUrl("Teste", "número inválido"), null);
    assert.ok(socialChannelUrl(socialChannels.find(channel => channel.id === "whatsapp")));
    for (const channel of socialChannels.filter(channel => channel.id !== "whatsapp")) assert.equal(socialChannelUrl(channel), null);
});

test("conteúdo inicial é validável, único e preserva cards, galerias e páginas reais", () => {
    const load = loader();
    const { initialContent } = load("src/modules/cms/initial-content.ts");
    const { validateData } = load("src/modules/cms/validation.ts");
    const keys = initialContent.map(i => i.resource + ":" + i.id);
    assert.equal(new Set(keys).size, keys.length);
    for (const item of initialContent) {
        const validated = validateData(item.resource, item.data);
        if (item.resource === "produtos") {
            assert.equal(validated.cardImage, item.data.cardImage);
            assert.deepEqual(validated.gallery.map(m => m.src), item.data.gallery.map(m => m.src));
        }
    }
    assert.equal(initialContent.filter(i => i.resource === "produtos").length, 12);
    assert.equal(initialContent.filter(i => i.resource === "categorias").length, 13);
    assert.equal(initialContent.find(i => i.resource === "home").data.banners.length, 3);
    assert.equal(initialContent.find(i => i.resource === "paginas" && i.id === "tecnologias").data.slides.length, 1);
    assert.equal(initialContent.filter(i => i.resource === "seo").length, 30);
    for (const asset of initialContent.filter(i => i.resource === "midia")) {
        let directory = "public";
        for (const segment of asset.data.src.split("/").filter(Boolean)) {
            assert.ok(fs.readdirSync(directory).includes(segment), "Maiúsculas/minúsculas do caminho: " + asset.data.src);
            directory = path.join(directory, segment);
        }
    }
});

test("carrosséis recusam sexto item mesmo desativado e GA4 exige ID válido", () => {
    const load = loader(); const { initialContent } = load("src/modules/cms/initial-content.ts");
    const { validateData } = load("src/modules/cms/validation.ts");
    const home = initialContent.find(i => i.resource === "home").data;
    assert.throws(() => validateData("home", { ...home, banners: Array.from({ length: 6 }, () => ({ ...home.banners[0], visible: false })) }), /limite de 5/);
    const tech = initialContent.find(i => i.resource === "paginas" && i.id === "tecnologias").data;
    assert.throws(() => validateData("paginas", { ...tech, slides: Array(6).fill(tech.slides[0]) }), /limite de 5/);
    assert.throws(() => validateData("analytics", { enabled: true, measurementId: "<script>" }), /Measurement/);
    assert.equal(validateData("analytics", { enabled: true, measurementId: "G-1234567890" }).enabled, true);
});

test("pré-importação exibe fonte sem gravar e bloqueia edição implícita", async () => {
    let writes = 0;
    const tx = { $queryRaw: async () => [], siteSetting: { findMany: async () => [], findUnique: async () => null, upsert: async () => { writes++; } } };
    const repo = loader({ "@/modules/admin/database": { getDatabase: () => ({ ...tx, $transaction: async fn => fn(tx) }) } })("src/modules/cms/repository.ts");
    const records = await repo.listDocuments("produtos");
    assert.equal(records.length, 12); assert.ok(records.every(r => r.source === "static"));
    await assert.rejects(repo.saveDocument({ ...user, role: "OWNER" }, "produtos", records[0].draft, records[0].id, 0, true), /importação inicial exige autorização/);
    assert.equal(writes, 0);
});

test("Analytics protege leitura e não consulta Google sem configuração externa", async () => {
    let identity = null, calls = 0;
    const route = loader({ "@/modules/admin/session": { currentAdmin: async () => identity }, "@/modules/cms/analytics": { analyticsReport: async () => { calls++; return null; } } })("src/app/api/admin-analytics/route.ts");
    assert.equal((await route.GET()).status, 401);
    identity = user; assert.equal((await route.GET()).status, 403); assert.equal(calls, 0);
    identity = { ...user, role: "OWNER" }; assert.equal((await route.GET()).status, 503);
    const previous = process.env.GA4_PROPERTY_ID; delete process.env.GA4_PROPERTY_ID;
    try { assert.equal(await loader()("src/modules/cms/analytics.ts").analyticsReport(), null); }
    finally { if (previous !== undefined) process.env.GA4_PROPERTY_ID = previous; }
});

test("Data API usa JWT com escopo mínimo e retorna somente métricas recebidas", async () => {
    const { generateKeyPairSync } = require("node:crypto");
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const keys = ["GA4_PROPERTY_ID", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY"];
    const previous = keys.map(k => process.env[k]); const originalFetch = globalThis.fetch;
    process.env.GA4_PROPERTY_ID = "123456"; process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "reader@example.test";
    process.env.GOOGLE_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" });
    const requests = [];
    globalThis.fetch = async (url, options) => {
        requests.push(url);
        if (requests.length === 1) {
            const jwt = options.body.get("assertion");
            const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url"));
            assert.equal(claims.scope, "https://www.googleapis.com/auth/analytics.readonly");
            assert.equal(claims.aud, "https://oauth2.googleapis.com/token");
            return Response.json({ access_token: "test-only-token" });
        }
        assert.equal(JSON.parse(options.body).dateRanges[0].endDate, "yesterday");
        return Response.json({ rows: [{ metricValues: [{ value: "17" }, { value: "23" }, { value: "91" }, { value: "3" }] }] });
    };
    try {
        const report = await loader()("src/modules/cms/analytics.ts").analyticsReport();
        assert.equal(report.metrics[0].value, "17"); assert.equal(report.metrics[3].value, "3");
        assert.deepEqual(requests, ["https://oauth2.googleapis.com/token", "https://analyticsdata.googleapis.com/v1beta/properties/123456:runReport"]);
    } finally { globalThis.fetch = originalFetch; keys.forEach((k,i) => { if (previous[i] === undefined) delete process.env[k]; else process.env[k] = previous[i]; }); }
});

test("textos e imagens editam espaços reais sem perder a fonte original", () => {
    const load = loader(); const { pageDefaults, getPageText, getPageImage } = load("src/modules/content/page-defaults.ts");
    for (const [page, template] of Object.entries(pageDefaults)) for (const slot of template.texts) assert.equal(getPageText(null, page, slot.key), slot.text);
    const slot = pageDefaults.sobre.texts.find(t => t.key === "sobre-1");
    assert.equal(getPageText({ texts: [{ ...slot, text: "Título revisado" }] }, "sobre", slot.key), "Título revisado");
    const photo = pageDefaults.sobre.images[0];
    const updated = getPageImage({ images: [{ ...photo, src: "/image.webp" }] }, photo.key, photo);
    assert.equal(updated.src, "/image.webp"); assert.ok(!("key" in updated));
    const validation = load("src/modules/cms/validation.ts"); assert.equal(validation.mediaPath("#banner"), false);
});
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

test("regressão Hostinger: origem HTTPS Hortoleve, proxy interno e CSRF sem confiar em forwarded", async () => {
    const publicOrigin = "https://hortoleve.com.br";
    const internalURL = "http://127.0.0.1:3000/api/auth/sign-in/email";
    // Reproduz o motivo do 403 na comparação anterior, independente da senha.
    assert.notEqual(new URL(internalURL).origin, publicOrigin);
    let handlerCalls = 0;
    const route = loader({
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: publicOrigin, secret: "test-only" }) },
        "@/modules/admin/auth": { getAdminAuth: () => ({}) },
        "@/modules/admin/login-limit": { allowAccountLogin: async () => { throw Error("Corpo vazio não deve consultar banco"); } },
        "better-auth/next-js": { toNextJsHandler: () => { handlerCalls++; throw Error("Credenciais vazias não chegam ao Better Auth"); } },
    })(routeFile);
    const req = (origin, url = internalURL) => new Request(url, {
        method: "POST", headers: { "content-type": "application/json", ...(origin === undefined ? {} : { origin }), host: "untrusted.test", "x-forwarded-host": "hortoleve.com.br", "x-forwarded-proto": "https", forwarded: "proto=https;host=hortoleve.com.br" }, body: "{}",
    });
    for (const url of [internalURL, "http://internal-hostinger:8080/api/auth/sign-in/email", publicOrigin + "/api/auth/sign-in/email"]) {
        assert.equal((await route.POST(req(publicOrigin, url))).status, 400);
    }
    for (const origin of [undefined, "null", "http://hortoleve.com.br", "https://www.hortoleve.com.br", "https://other.test", "https://hortoleve.com.br.other.test"]) {
        assert.equal((await route.POST(req(origin))).status, 403);
    }
    assert.equal(handlerCalls, 0);
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
        assert.equal(snapshot.enabled, false); assert.equal(snapshot.products.length, 12); assert.equal(snapshot.categories.length, 13);
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

test("storage local grava e le; bloqueia caminhos invalidos", async () => {
    const os = require("node:os");
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hortoleve-storage-"));
    const previous = process.env.CMS_STORAGE_PATH;
    try {
        process.env.CMS_STORAGE_PATH = directory;
        const storage = loader()("src/modules/cms/local-storage.ts");
        assert.deepEqual(await storage.probeLocalStorage(), { readable: true, writable: true });
        assert.deepEqual(fs.readdirSync(directory), []);
        const first = await storage.writeLocalMedia(Buffer.from("test-image"));
        const second = await storage.writeLocalMedia(Buffer.from("other-image"));
        assert.notEqual(first.src, second.src);
        assert.equal((await storage.readLocalMedia(first.objectKey)).toString(), "test-image");
        await assert.rejects(storage.readLocalMedia("../.env"));
        const route = loader()("src/app/media/products/[filename]/route.ts");
        const response = await route.GET(new Request("https://example.test" + first.src), { params: Promise.resolve({ filename: first.objectKey }) });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("content-type"), "image/webp");
        assert.equal((await route.GET(new Request("https://example.test"), { params: Promise.resolve({ filename: "bad.svg" }) })).status, 404);
        process.env.CMS_STORAGE_PATH = process.cwd();
        await assert.rejects(storage.writeLocalMedia(Buffer.from("blocked")));
    } finally {
        if (previous === undefined) delete process.env.CMS_STORAGE_PATH; else process.env.CMS_STORAGE_PATH = previous;
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("checagem de disco exige OWNER ativo e Origin correto", async () => {
    let identity = null, probes = 0;
    const route = loader({
        "@/modules/admin/session": { currentAdmin: async () => identity },
        "@/modules/admin/environment": { adminEnvironment: () => ({ baseURL: "https://example.test" }) },
        "@/modules/cms/local-storage": { probeLocalStorage: async () => { probes++; return { readable: true, writable: true }; } },
    })("src/app/api/admin-storage-check/route.ts");
    const request = (origin = "https://example.test") => new Request("https://example.test/api/admin-storage-check", { method: "POST", headers: { origin } });
    assert.equal((await route.POST(request())).status, 401);
    identity = user;
    assert.equal((await route.POST(request())).status, 403);
    identity = { ...user, role: "OWNER" };
    assert.equal((await route.POST(request("https://evil.test"))).status, 403);
    assert.equal(probes, 0);
    assert.equal((await route.POST(request())).status, 200);
    assert.equal(probes, 1);
});

test("migracao copia bytes originais, deduplica e preserva referencias e ordem", async () => {
    const os = require("node:os");
    const sharp = require("sharp");
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "hortoleve-migration-"));
    const original = process.env.CMS_STORAGE_PATH;
    try {
        const publicDirectory = path.join(temporary, "public"), destination = path.join(temporary, "storage");
        fs.mkdirSync(publicDirectory); fs.mkdirSync(destination);
        process.env.CMS_STORAGE_PATH = destination;
        const image = await sharp({ create: { width: 12, height: 8, channels: 3, background: "blue" } }).png().toBuffer();
        fs.writeFileSync(path.join(publicDirectory, "one.png"), image);
        fs.writeFileSync(path.join(publicDirectory, "two.png"), image);
        const migration = loader()("src/modules/cms/media-migration.ts");
        const items = [{ resource: "produtos", data: { cardImage: "/one.png", gallery: [{ id: "a", src: "/two.png" }] } }, { resource: "configuracoes", data: { logo: "/logo.png" } }];
        assert.deepEqual(migration.productImagePaths(items), ["/one.png", "/two.png"]);
        const assets = await migration.inventoryImages(publicDirectory, migration.productImagePaths(items));
        assert.equal(assets[0].filename, assets[1].filename);
        assert.equal(await migration.copyImages(publicDirectory, assets), 1);
        assert.equal(await migration.copyImages(publicDirectory, assets), 0);
        assert.deepEqual(fs.readFileSync(path.join(destination, assets[0].filename)), image);
        const map = new Map(assets.map(a => [a.source, "/media/products/" + a.filename]));
        const changed = migration.replaceImageReferences(items, map);
        assert.equal(changed[0].data.gallery[0].id, "a");
        assert.equal(changed[1].data.logo, "/logo.png");
        assert.deepEqual(migration.replaceImageReferences({ text: "Veja /one.png aqui" }, map), { text: "Veja /one.png aqui" });
        const route = loader()("src/app/media/products/[filename]/route.ts");
        const response = await route.GET(new Request("https://example.test"), { params: Promise.resolve({ filename: assets[0].filename }) });
        assert.equal(response.headers.get("content-type"), "image/png");
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), image);
        fs.writeFileSync(path.join(destination, assets[0].filename), "corrupt");
        await assert.rejects(migration.copyImages(publicDirectory, assets));
        assert.deepEqual(fs.readFileSync(path.join(publicDirectory, "one.png")), image);
        await assert.rejects(migration.inventoryImages(publicDirectory, ["/../outside.png"]));
    } finally {
        if (original === undefined) delete process.env.CMS_STORAGE_PATH; else process.env.CMS_STORAGE_PATH = original;
        fs.rmSync(temporary, { recursive: true, force: true });
    }
});
