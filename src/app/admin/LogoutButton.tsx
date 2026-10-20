"use client";
import { useState } from "react";
import s from "./admin.module.css";
export function LogoutButton() {
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    return <div><button className={s.logout} type="button" disabled={busy} onClick={async () => {
        setBusy(true); setFailed(false);
        try {
            const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", credentials: "same-origin", signal: AbortSignal.timeout(15000) });
            if (!response.ok) { setFailed(true); return; }
            window.location.assign(new URL("/admin/login", window.location.origin).href);
        } catch { setFailed(true); }
        finally { setBusy(false); }
    }}>{busy ? "Saindo…" : "Sair"}</button>{failed && <p className={s.error} role="alert">Não foi possível encerrar. Tente novamente.</p>}</div>;
}
