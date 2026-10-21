import { requireAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { getDatabase } from "@/modules/admin/database";
import s from "../admin.module.css";
import Link from "next/link";
import { adminModules } from "@/modules/admin/modules";
import { AnalyticsReport } from "@/components/admin/AnalyticsReport";
export const metadata = { title: "Dashboard" };
export default async function Dashboard() {
    const user = await requireAdmin();
    const db = getDatabase();
    const metrics: { label: string; value: number }[] = [];
    if (hasAdminPermission(user, "content:write")) {
        const [products, active, categories] = await db.$transaction([db.siteSetting.count({ where: { key: { startsWith: "cms:produtos:" } } }), db.product.count({ where: { status: "PUBLISHED" } }), db.siteSetting.count({ where: { key: { startsWith: "cms:categorias:" } } })]);
        metrics.push({ label: "Produtos cadastrados", value: products }, { label: "Produtos publicados", value: active }, { label: "Categorias", value: categories });
    }
    if (hasAdminPermission(user, "leads:read")) { const [total, pending] = await db.$transaction([db.contactLead.count(), db.contactLead.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } })]); metrics.push({ label: "Leads recebidos", value: total }, { label: "Atendimentos pendentes", value: pending }); }
    if (hasAdminPermission(user, "users:manage")) metrics.push({ label: "Usuários ativos", value: await db.user.count({ where: { active: true } }) });
    return <><p className={s.eyebrow}>VISÃO GERAL</p><h1>Dashboard</h1><p className={s.lead}>Conteúdo e atendimento, com dados reais do banco.</p><div className={s.metrics}>{metrics.map(metric => <article key={metric.label}><span>{metric.value}</span><p>{metric.label}</p></article>)}</div><section className={s.panel}><h2>Acesso rápido</h2><nav className={s.shortcuts}>{adminModules.filter(m => hasAdminPermission(user, m.permission)).map(m => <Link href={"/admin/" + m.slug} key={m.slug}>{m.name} ↗</Link>)}</nav><p>Conteúdo estático ainda não importado não é contado como cadastro. Visitas e conversões não são apresentadas sem integração real.</p>{metrics.length === 0 && <p>Nenhuma permissão de consulta foi delegada.</p>}</section>{hasAdminPermission(user,"settings:write")&&<section className={s.panel}><AnalyticsReport /></section>}</>;
}
