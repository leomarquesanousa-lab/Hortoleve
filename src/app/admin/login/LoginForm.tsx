"use client";
import { useState, type FormEvent } from "react";
import s from "../admin.module.css";
export function LoginForm({ enabled }: { enabled: boolean }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!enabled || busy) return;
        const values = new FormData(event.currentTarget);
        setBusy(true); setError("");
        try {
            const response = await fetch("/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ email: values.get("email"), password: values.get("password") }), signal: AbortSignal.timeout(15000) });
            if (!response.ok) { setError(response.status === 429 ? "Muitas tentativas. Aguarde antes de tentar novamente." : "Não foi possível entrar. Confira as credenciais ou tente mais tarde."); return; }
            window.location.assign(new URL("/admin", window.location.origin).href);
        } catch { setError("Não foi possível confirmar o acesso. Tente novamente mais tarde."); }
        finally { setBusy(false); }
    }
    return <form onSubmit={submit} className={s.form} aria-busy={busy}>
        {!enabled && <p className={s.notice}>Acesso indisponível até a configuração do banco Neon, da autenticação e do primeiro OWNER. Nenhuma conta padrão foi criada.</p>}
        <label>E-mail<input name="email" type="email" autoComplete="username" required maxLength={254} disabled={!enabled || busy} /></label>
        <label>Senha<input name="password" type="password" autoComplete="current-password" required minLength={14} maxLength={128} disabled={!enabled || busy} /></label>
        {error && <p role="alert" className={s.error}>{error}</p>}
        <button className={s.button} type="submit" disabled={!enabled || busy}>{busy ? "Entrando…" : "Entrar na administração"}</button>
    </form>;
}
