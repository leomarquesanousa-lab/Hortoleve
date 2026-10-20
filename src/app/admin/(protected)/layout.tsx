import Link from "next/link";
import { requireAdmin } from "@/modules/admin/session";
import { adminModules } from "@/modules/admin/modules";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "../LogoutButton";
import s from "../admin.module.css";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const user = await requireAdmin();
    const navigation = <><Link href="/admin">Dashboard</Link>{adminModules.map(module => <Link href={"/admin/" + module.slug} key={module.slug}>{module.name}</Link>)}</>;
    return <div className={s.shell}><a className="skip-link" href="#admin-content">Pular para administração</a><aside className={s.sidebar}><Link href="/admin" aria-label="Hortoleve Admin"><BrandLogo footer /></Link><p className={s.sidebarLabel}>ADMINISTRAÇÃO</p><nav aria-label="Administração">{navigation}</nav><Link className={s.publicLink} href="/">Ver site público ↗</Link></aside>
        <div className={s.workspace}><header className={s.toolbar}><div><span className={s.eyebrow}>ÁREA RESTRITA</span><p>{user.name} <small>{user.role}</small></p></div><LogoutButton /></header><details className={s.mobileMenu}><summary>Navegação administrativa</summary><nav aria-label="Administração móvel">{navigation}</nav></details><main id="admin-content" className={s.content}>{children}</main></div></div>;
}
