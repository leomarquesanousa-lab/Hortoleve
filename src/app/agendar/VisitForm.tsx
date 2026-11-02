"use client";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { VisitCalendar } from "@/components/VisitCalendar";
import { TIMES } from "@/modules/visits/validation";
import s from "@/components/Visit.module.css";
export default function VisitForm({ onBack, onSuccess }: { onBack?: () => void; onSuccess?: () => void } = {}) {
    const [step, setStep] = useState<"calendar" | "details">("calendar");
    const heading = useRef<HTMLHeadingElement>(null);
    const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
    const [ready, setReady] = useState(false);
    useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);
    const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [today, setToday] = useState(""); const [zone, setZone] = useState(""); const [times, setTimes] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const key = useRef(""); const [refresh, setRefresh] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/visits" + (date ? "?date=" + date : ""), { signal: controller.signal, cache: "no-store" }).then(async response => { const data = await response.json(); if (controller.signal.aborted) return; if (!response.ok) throw new Error(data.error); setToday(data.today); setZone(data.zone); setTimes(data.times); setReady(true); if (date) setUnavailableDates(previous => data.times.length ? previous.filter(day => day !== date) : [...new Set([...previous, date])]); }).catch(e => { if (e.name !== "AbortError" && !controller.signal.aborted) { setReady(false); setTimes([]); setError(e.message || "Não foi possível consultar a agenda."); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [date, refresh]);
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); if (busy || step !== "details" || !ready || !times.includes(time)) return; if (!key.current) key.current = crypto.randomUUID(); setBusy(true); setError("");
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        try { const response = await fetch("/api/visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, date, time, consent: fields.consent === "on", requestKey: key.current }) }); const result = await response.json(); if (!response.ok) { if (response.status === 409) { setStep("calendar"); setTime(""); setLoading(true); setRefresh(v => v + 1); } throw new Error(result.error); } try { sessionStorage.setItem("visit-booked", "1"); } catch { /* Booking remains saved when browser storage is unavailable. */ } setSuccess(result.message.replaceAll(` (${zone})`, "") + " Protocolo: " + result.protocol); onSuccess?.(); }
        catch (e) { setError((e as Error).message || "Falha de conexão. Tente novamente com os mesmos dados."); } finally { setBusy(false); }
    }
    if (success) return <div role="status" className={s.notice}><h2>Solicitação registrada</h2><p>{success}</p><p>Guarde seu protocolo para falar com a equipe.</p></div>;
    return <form className={s.form} onSubmit={submit} aria-busy={busy} data-step={step}>
        <h3 ref={heading} tabIndex={-1}>{step === "calendar" ? "Escolha o melhor dia" : "Seus dados para a visita"}</h3>
        <div className={s.formBody}>
        <div className={s.calendarStep} hidden={step !== "calendar"}>
            <p className={s.stepHint}>1. Data e horário · 2. Seus dados</p>
            {today ? <VisitCalendar today={today} selected={date} unavailableDates={unavailableDates} onSelect={value => { setDate(value); setTime(""); setTimes([]); setReady(false); setError(""); setLoading(true); }} /> : <p role="status">{loading ? "Consultando calendário…" : "Calendário temporariamente indisponível."}</p>}
            <fieldset id="calendario"><legend>Horários disponíveis</legend>
                {loading ? <p role="status">Consultando disponibilidade…</p> : date ? <><div className={s.times}>{TIMES.map(t => <button type="button" key={t} disabled={!ready || !times.includes(t)} aria-pressed={time === t} aria-label={t + (ready && times.includes(t) ? ", disponível" : ", indisponível")} onClick={() => setTime(t)}>{t}{(!ready || !times.includes(t)) && <small>Indisponível</small>}</button>)}</div><small>Horários ocupados ou encerrados estão bloqueados.</small>{ready && !times.length && <p>Sem horários livres nesta data. Escolha outro dia útil.</p>}</> : <p>Selecione um dia no calendário.</p>}
            </fieldset>
        </div>
        <div className={s.detailsStep} hidden={step !== "details"}>
            <p className={s.stepHint}>{date.split("-").reverse().join("/")} às {time}</p>
            <div className={s.detailsFields}><div className={s.grid}><label>Nome completo<input name="name" autoComplete="name" required minLength={5} maxLength={120} /></label><label>WhatsApp com DDD<input name="phone" type="tel" autoComplete="tel-national" required minLength={10} maxLength={20} placeholder="(71) 99999-9999" /></label><label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Cidade e bairro<input name="city" autoComplete="address-level2" required minLength={5} maxLength={200} /></label></div><label>Endereço completo da visita<input name="address" autoComplete="street-address" required minLength={10} maxLength={500} placeholder="Rua, número, complemento e CEP" /></label></div>
            <label>Observações adicionais (opcional)<textarea name="notes" maxLength={1000} rows={3} /></label>
            <label className={s.hidden} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className={s.consent}><input name="consent" type="checkbox" required /><span>Autorizo o uso do meu nome e dados de contato e endereço exclusivamente para atendimento e agendamento desta visita. O acesso é restrito à equipe responsável. Não informe diagnósticos ou condições médicas.</span></label>
            <small>O horário será reservado após o registro. A equipe entrará em contato para confirmar a apresentação.</small>
        </div>
        {error && <div role="alert" className={s.notice}><p>{error}</p>{!ready && !loading && <button type="button" className={s.modalSecondary} onClick={() => { setLoading(true); setRefresh(v => v + 1); }}>Tentar novamente</button>}</div>}
        </div>
        <footer className={s.stepActions}>
            {step === "calendar" ? <>
                {onBack && <button type="button" className={s.modalSecondary} onClick={onBack}>Voltar ao convite</button>}
                <button type="button" className={s.button} disabled={loading || !ready || !time} onClick={() => setStep("details")}>Continuar</button>
            </> : <>
                <button type="button" className={s.modalSecondary} disabled={busy} onClick={() => setStep("calendar")}>Voltar ao calendário</button>
                <button className={s.button} disabled={busy || loading || !ready || !time}>{busy ? "Registrando…" : "Confirmar solicitação"}</button>
            </>}
        </footer>
    </form>;
}
