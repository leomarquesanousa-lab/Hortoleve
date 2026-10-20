import type { Metadata } from "next";
import { Suspense } from "react";
import s from "./admin.module.css";
export const metadata: Metadata = { title: { default: "Administração Hortoleve", template: "%s | Hortoleve Admin" }, robots: { index: false, follow: false, nocache: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className={s.admin}><Suspense fallback={<p className={s.loading}>Carregando área restrita…</p>}>{children}</Suspense></div>;
}
