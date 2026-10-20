import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { adminModules } from "@/modules/admin/modules";
import s from "../../admin.module.css";
type Props = { params: Promise<{ module: string }> };
export async function generateMetadata({ params }: Props) {
    const { module } = await params;
    return { title: adminModules.find(item => item.slug === module)?.name ?? "Administração" };
}
export default async function ModulePage({ params }: Props) {
    const user = await requireAdmin();
    const { module: slug } = await params;
    const entry = adminModules.find(item => item.slug === slug);
    if (!entry) notFound();
    const allowed = hasAdminPermission(user, entry.permission);
    return <><p className={s.eyebrow}>ADMINISTRAÇÃO HORTOLEVE</p><h1>{entry.name}</h1><section className={s.panel}><h2>{allowed ? "Em desenvolvimento" : "Acesso não delegado"}</h2><p>{allowed ? "Este módulo será integrado em uma próxima fase. Nenhuma edição ou dado demonstrativo é apresentado como operação real." : "O OWNER precisa conceder a permissão correspondente. Nenhum dado restrito foi carregado."}</p></section></>;
}
