import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { adminModules } from "@/modules/admin/modules";
import s from "../../admin.module.css";
import { ContentManager } from "@/components/admin/ContentManager";
import { isResource } from "@/modules/cms/contracts";
import { storageConfig } from "@/modules/cms/storage";
type Props = { params: Promise<{ module: string }> };
export async function generateMetadata({ params }: Props) {
    const { module } = await params;
    return { title: adminModules.find(item => item.slug === module)?.name ?? "Administração" };
}
export default async function ModulePage({ params }: Props) {
    const user = await requireAdmin();
    const { module: slug } = await params;
    if (slug === "banners") redirect("/admin/home");
    const entry = adminModules.find(item => item.slug === slug);
    if (!entry) notFound();
    const allowed = hasAdminPermission(user, entry.permission);
    return <><p className={s.eyebrow}>ADMINISTRAÇÃO HORTOLEVE</p><h1>{entry.name}</h1>{!allowed ? <section className={s.panel}><h2>Acesso não delegado</h2><p>Nenhum dado restrito foi carregado. Solicite a permissão ao OWNER.</p></section> : isResource(slug) ? <ContentManager key={slug} resource={slug} storageAvailable={slug === "midia" && !!storageConfig()} /> : <section className={s.panel}><h2>Analytics não configurado</h2><p>Não existe integração real de visitas ou conversões. Nenhuma métrica é estimada ou simulada. Leads reais estão disponíveis no módulo Contatos.</p></section>}</>;
}
