"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatPhone, subjects, validateLead, type LeadErrors, type LeadRequest } from "@/modules/leads/contracts";
import s from "./page.module.css";

export interface ContactLine { slug: string; name: string; src: string; alt: string; width: number; height: number }
const steps = ["Assunto", "Sua linha", "Seus dados", "Revisão"];

export function ContactJourney({ lines, initialLine, available, whatsapp }: { lines: ContactLine[]; initialLine: string | null; available: boolean; whatsapp: string | null }) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<LeadRequest>({ subject: "colchoes", line: initialLine, name: "", phone: "", email: "", message: "", consent: false, website: "" });
    const [errors, setErrors] = useState<LeadErrors>({});
    const [sending, setSending] = useState(false);
    const [failure, setFailure] = useState("");
    const [received, setReceived] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null);
    const mounted = useRef(false);
    useEffect(() => { if (mounted.current) heading.current?.focus(); else mounted.current = true; }, [step, received]);
    const update = <K extends keyof LeadRequest>(key: K, value: LeadRequest[K]) => {
        setData(previous => ({ ...previous, [key]: value }));
        setErrors(previous => ({ ...previous, [key]: undefined })); setFailure("");
    };
    const validateField = (key: keyof LeadRequest) => {
        const validation = validateLead(data, lines.map(line => line.slug));
        setErrors(previous => ({ ...previous, [key]: validation.errors[key] }));
    };
    const selectedLine = lines.find(line => line.slug === data.line);
    const summary = ["Assunto: " + subjects.find(subject => subject.id === data.subject)?.label, "Linha: " + (selectedLine?.name ?? "Ainda não sei"), "Nome: " + data.name, "Telefone: " + data.phone, data.email && "E-mail: " + data.email, data.message && "Mensagem: " + data.message].filter(Boolean).join("\n");
    const whatsappHref = whatsapp ? whatsapp + "?text=" + encodeURIComponent(summary) : null;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending) return;
        if (step === 1) { setStep(data.subject === "outros" ? 3 : 2); return; }
        if (step === 2) { setStep(3); return; }
        const validation = validateLead(data, lines.map(line => line.slug));
        setErrors(validation.errors);
        if (!validation.data) { if (step === 4) setStep(3); return; }
        if (step === 3) { setStep(4); return; }
        if (!available) { setFailure("O canal de recebimento ainda está em configuração. Nenhum dado foi enviado."); return; }
        setSending(true); setFailure("");
        try {
            const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data), signal: AbortSignal.timeout(15000) });
            const result = await response.json();
            if (!response.ok || !result.receipt?.id || !result.receipt?.receivedAt) {
                if (result.errors) { setErrors(result.errors); setStep(3); }
                setFailure(result.error || "Não foi possível confirmar o recebimento. Tente novamente mais tarde.");
                return;
            }
            setReceived(true);
        } catch { setFailure("Não foi possível confirmar o recebimento. Verifique sua conexão antes de tentar novamente."); }
        finally { setSending(false); }
    }

    return <div className={s.journey}>
        <ol className={s.progress} aria-label="Etapas do atendimento">{steps.map((name, index) => <li key={name} aria-current={step === index + 1 ? "step" : undefined} data-complete={step > index + 1}><span>{String(index + 1).padStart(2, "0")}</span><small>{name}</small></li>)}</ol>
        {received ? <div className={s.step} role="status"><h2 tabIndex={-1} ref={heading}>Solicitação recebida.</h2><p>Obrigado pelo contato. Nossa equipe recebeu sua solicitação para atendimento.</p></div> : <form onSubmit={submit} noValidate aria-busy={sending}>
            <div className={s.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={event => update("website", event.target.value)} /></label></div>
            <div className={s.step} key={step}>
                <p className={s.stepLabel}>ETAPA {step} DE 4</p>
                <h2 ref={heading} tabIndex={-1}>{step === 1 ? "Como podemos ajudar?" : step === 2 ? "Qual linha despertou seu interesse?" : step === 3 ? "Como podemos falar com você?" : "Vamos conferir os detalhes?"}</h2>
                {step === 1 && <fieldset className={s.subjects}><legend className={s.srOnly}>Assunto do atendimento</legend>{subjects.map(subject => <label key={subject.id} className={s.subject} data-selected={data.subject === subject.id}><input type="radio" name="subject" value={subject.id} checked={data.subject === subject.id} onChange={() => update("subject", subject.id)} /><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={subject.icon} /></svg><span>{subject.label}</span></label>)}</fieldset>}
                {step === 2 && <><p className={s.hint}>Esta escolha é opcional. Você pode continuar sem definir uma linha.</p><fieldset className={s.lineChoices}><legend className={s.srOnly}>Linha de interesse</legend>{lines.map(line => <label key={line.slug} className={s.line} data-selected={data.line === line.slug}><input type="radio" name="line" value={line.slug} checked={data.line === line.slug} onChange={() => update("line", line.slug)} /><Image src={line.src} alt={line.alt} width={line.width} height={line.height} sizes="(max-width: 540px) 38vw, 160px" /><span>{line.name}</span></label>)}<label className={s.lineUnknown} data-selected={data.line === null}><input type="radio" name="line" checked={data.line === null} onChange={() => update("line", null)} /><span>Ainda não sei</span></label></fieldset></>}
                {step === 3 && <div className={s.fields}>
                    <label htmlFor="contact-name">Nome<input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={data.name} onChange={event => update("name", event.target.value)} onBlur={() => validateField("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "error-name" : undefined} />{errors.name && <span id="error-name" className={s.error}>{errors.name}</span>}</label>
                    <label htmlFor="contact-phone">WhatsApp ou telefone<input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={24} placeholder="(11) 99999-9999" value={data.phone} onChange={event => update("phone", formatPhone(event.target.value))} onBlur={() => validateField("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "error-phone" : "phone-hint"} /><small id="phone-hint">Inclua o DDD; para outros países, use + e o código internacional.</small>{errors.phone && <span id="error-phone" className={s.error}>{errors.phone}</span>}</label>
                    <label htmlFor="contact-email">E-mail <span className={s.optional}>(opcional)</span><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} value={data.email} onChange={event => update("email", event.target.value)} onBlur={() => validateField("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "error-email" : undefined} />{errors.email && <span id="error-email" className={s.error}>{errors.email}</span>}</label>
                    <label htmlFor="contact-message">Mensagem ou dúvida <span className={s.optional}>(opcional)</span><textarea id="contact-message" name="message" rows={3} maxLength={2000} value={data.message} onChange={event => update("message", event.target.value)} onBlur={() => validateField("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "error-message" : "message-hint"} /><small id="message-hint">{data.message.length}/2.000 caracteres</small>{errors.message && <span id="error-message" className={s.error}>{errors.message}</span>}</label>
                    <label className={s.consent}><input type="checkbox" checked={data.consent} onChange={event => update("consent", event.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "error-consent" : undefined} /><span>Concordo com o uso dos meus dados exclusivamente para responder a esta solicitação de atendimento.</span></label>{errors.consent && <p id="error-consent" className={s.error}>{errors.consent}</p>}
                </div>}
                {step === 4 && <><dl className={s.review}><div><dt>Assunto</dt><dd>{subjects.find(subject => subject.id === data.subject)?.label}<button type="button" onClick={() => setStep(1)}>Editar assunto</button></dd></div><div><dt>Linha</dt><dd>{selectedLine?.name ?? "Ainda não sei"}{data.subject !== "outros" && <button type="button" onClick={() => setStep(2)}>Editar linha</button>}</dd></div><div><dt>Contato</dt><dd>{data.name}<br />{data.phone}{data.email && <><br />{data.email}</>}<button type="button" onClick={() => setStep(3)}>Editar contato</button></dd></div>{data.message && <div><dt>Mensagem</dt><dd className={s.message}>{data.message}</dd></div>}</dl>
                    {!available && <p className={s.notice} role="status">O canal de recebimento ainda está em configuração. O envio está indisponível e seus dados não foram enviados nem armazenados. Suas respostas ficam apenas nesta página enquanto ela estiver aberta.</p>}
                    {whatsappHref && <a className={s.whatsapp} href={whatsappHref} target="_blank" rel="noopener noreferrer">Abrir WhatsApp com este resumo ↗</a>}
                </>}
            </div>
            {failure && <p className={s.error} role="alert">{failure}</p>}
            {(errors.subject || errors.line || errors.website) && <p className={s.error} role="alert">{errors.subject || errors.line || errors.website}</p>}
            <div className={s.navigation}>{step > 1 && <button type="button" className={s.back} disabled={sending} onClick={() => { setFailure(""); setStep(step === 3 && data.subject === "outros" ? 1 : step - 1); }}>← Voltar</button>}<button className={s.next} type="submit" disabled={sending || (step === 4 && !available)}>{sending ? "Enviando…" : step === 4 ? "Enviar solicitação" : step === 3 ? "Revisar solicitação" : "Continuar"}<span aria-hidden="true">↗</span></button></div>
            <p className={s.privacy}>Seus dados são utilizados somente para o atendimento solicitado. Não informe dados sensíveis na mensagem.</p>
        </form>}
    </div>;
}
