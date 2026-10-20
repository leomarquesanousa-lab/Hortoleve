import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "./LoginForm";
import s from "../admin.module.css";
export const metadata = { title: "Entrar" };
export default async function LoginPage() {
    if (await currentAdmin()) redirect("/admin");
    return <main className={s.login}><div className={s.loginBrand}><BrandLogo footer /></div><div className={s.loginCard}><p className={s.eyebrow}>ÁREA RESTRITA · HORTOLEVE</p><h1>Bem-vindo à administração.</h1><p>Acesso exclusivo para usuários autorizados.</p><LoginForm enabled={!!adminEnvironment()} /><Link className={s.siteLink} href="/">Voltar ao site ↗</Link></div></main>;
}
