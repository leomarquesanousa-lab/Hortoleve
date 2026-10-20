import { requireAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { getDatabase } from "@/modules/admin/database";
import s from "../admin.module.css";
export const metadata = { title: "Dashboard" };
export default async function Dashboard() {
    const user = await requireAdmin();
    const db = getDatabase();
    const metrics: { label: string; value: number }[] = [];
    if (hasAdminPermission(user, "content:write")) {
        const [products, categories, banners] = await db.$transaction([db.product.count(), db.category.count(), db.banner.count()]);
        metrics.push({ label: "Produtos no banco", value: products }, { label: "Categorias no banco", value: categories }, { label: "Banners no banco", value: banners });
    }
    if (hasAdminPermission(user, "leads:read")) metrics.push({ label: "Solicitações no banco", value: await db.contactLead.count() });
    return <><p className={s.eyebrow}>VISÃO GERAL</p><h1>Dashboard</h1><p className={s.lead}>Uma base segura para administrar a Hortoleve.</p><div className={s.metrics}>{metrics.map(metric => <article key={metric.label}><span>{metric.value}</span><p>{metric.label}</p></article>)}</div><section className={s.panel}><h2>Fundação administrativa</h2><p>Os dados acima são consultados no banco conectado. O conteúdo público continua no código e não foi migrado nesta fase.</p><p>Os módulos estão em desenvolvimento. Acesso e futuras operações dependem das permissões concedidas pelo OWNER.</p>{metrics.length === 0 && <p>Nenhuma permissão de consulta de métricas foi delegada à sua conta.</p>}</section></>;
}
