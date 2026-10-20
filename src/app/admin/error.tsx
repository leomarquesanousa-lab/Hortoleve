"use client";
import s from "./admin.module.css";
export default function AdminError({ reset }: { reset: () => void }) {
    return <section className={s.panel}><h1>Área temporariamente indisponível.</h1><p>Não foi possível consultar a administração. Verifique a configuração e a conexão antes de tentar novamente.</p><button className={s.button} onClick={reset}>Tentar novamente</button></section>;
}
