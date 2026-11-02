"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import VisitForm from "@/app/agendar/VisitForm";
import s from "./Visit.module.css";
export function VisitInvitation() {
    const path = usePathname();
    const [booking, setBooking] = useState(false);
    const [completed, setCompleted] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const manualOpen = useRef<(() => void) | null>(null);
    const automaticHandled = useRef(false);
    const automaticDeadline = useRef<number | null>(null);
    const initialPage = useRef(true);
    const titleId = useId(), descriptionId = useId();
    useEffect(() => {
        const firstEntry = initialPage.current;
        initialPage.current = false;
        if (path !== "/") { automaticDeadline.current = null; return; }
        const modal = dialog.current;
        if (!modal) return;
        let timer: ReturnType<typeof setTimeout>;
        if (automaticDeadline.current === null) {
            const enteredAt = firstEntry && typeof performance !== "undefined" && Number.isFinite(performance.timeOrigin)
                ? performance.timeOrigin : Date.now();
            automaticDeadline.current = enteredAt + 3000;
        }
        const automaticAt = automaticDeadline.current;
        let pointerDown = false;
        let scrollStyle: string | null = null;
        const restore = () => {
            if (scrollStyle !== null) document.body.style.overflow = scrollStyle;
            scrollStyle = null;
            if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
            returnFocus.current = null;
        };
        // The legacy "visit-invitation" marker also recorded manual opens, not dismissals.
        const remember = (state: "shown" | "dismissed") => {
            automaticHandled.current = true;
            try { sessionStorage.setItem("visit-invitation-status", state); } catch { /* Keep this page session working without storage. */ }
        };
        const dismissed = () => { remember("dismissed"); restore(); };
        const hasVisibleBlocker = () => Array.from(document.querySelectorAll(
            'dialog[open], [aria-modal="true"], [aria-busy="true"], header details[open], header [aria-expanded="true"]'
        )).some(element => !element.closest('[hidden], [inert]') && element.getClientRects().length > 0 && window.getComputedStyle(element).visibility !== "hidden");
        const show = (manual = false) => {
            let sessionHandled = false;
            try {
                sessionHandled = !!(sessionStorage.getItem("visit-invitation-status") || sessionStorage.getItem("visit-booked"));
            } catch { /* Storage restrictions must not disable the first invitation. */ }
            if (!manual && (automaticHandled.current || sessionHandled)) return false;
            const active = document.activeElement;
            if (modal.open) return false;
            if (!manual && (document.hidden || pointerDown ||
                active?.closest('form, input, textarea, select, [contenteditable="true"], [role="grid"], [role="dialog"]') ||
                hasVisibleBlocker())) return true;
            returnFocus.current = active instanceof HTMLElement ? active : null;
            modal.showModal();
            scrollStyle = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            remember("shown");
            return false;
        };
        manualOpen.current = () => { show(true); };
        const attempt = () => { if (show()) timer = setTimeout(attempt, 250); };
        const down = () => { pointerDown = true; };
        const up = () => { pointerDown = false; };
        const releasePointer = () => { pointerDown = false; };
        const exit = (event: MouseEvent) => {
            if (Date.now() >= automaticAt && event.relatedTarget === null && event.clientY <= 0 && window.innerWidth >= 1024 &&
                window.matchMedia("(hover: hover) and (pointer: fine)").matches) show();
        };
        timer = setTimeout(attempt, Math.max(0, automaticAt - Date.now()));
        document.addEventListener("pointerdown", down);
        document.addEventListener("pointerup", up);
        document.addEventListener("pointercancel", up);
        document.addEventListener("mouseout", exit);
        window.addEventListener("blur", releasePointer);
        modal.addEventListener("close", dismissed);
        return () => {
            manualOpen.current = null;
            clearTimeout(timer);
            document.removeEventListener("pointerdown", down);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("pointercancel", up);
            document.removeEventListener("mouseout", exit);
            window.removeEventListener("blur", releasePointer);
            modal.removeEventListener("close", dismissed);
            if (modal.open) modal.close();
            restore();
        };
    }, [path]);
    if (path.startsWith("/admin") || path === "/agendar") return null;
    return <>
        {path === "/" ? <button type="button" className={s.fixed} onClick={() => manualOpen.current?.()}>Agendar visita</button> : <a href="/agendar#calendario" className={s.fixed}>Agendar visita</a>}
        {path === "/" && <dialog ref={dialog} className={`${s.invitation} ${booking ? s.booking : ""}`} aria-labelledby={titleId} aria-describedby={booking ? undefined : descriptionId}
            onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
            <div className={s.modalLayout}>
                <div className={s.modalPhoto}>
                    <Image src="/majestic/4.png" alt="Colchão premium Hortoleve em quarto com iluminação acolhedora e acabamentos sofisticados" fill sizes="(max-width: 680px) 92vw, 440px" loading="lazy" />
                    <span className={s.photoCaption}>O seu tempo de descansar.</span>
                </div>
                <div className={s.modalContent}>
                    <div className={s.modalBrand}><BrandLogo footer /></div>
                    <p className={s.eyebrow}>EXPERIÊNCIA EXCLUSIVA</p>
                    <h2 id={titleId}>{booking ? completed ? "Solicitação registrada" : "Sua experiência começa aqui." : "E se suas noites pudessem ser muito melhores?"}</h2>
                    {booking ? <VisitForm onBack={() => setBooking(false)} onSuccess={() => setCompleted(true)} /> : <>
                        <p id={descriptionId}>Acorda cansado ou sente desconforto ao dormir? Descubra uma nova experiência de conforto, sem sair de casa.</p>
                        <button type="button" className={s.modalCta} onClick={() => setBooking(true)}>Agendar minha visita <span aria-hidden="true">↗</span></button>
                        <button type="button" className={s.modalSecondary} onClick={() => dialog.current?.close()}>Agora não, continuar navegando</button>
                    </>}
                </div>
                <button type="button" className={s.close} aria-label="Fechar convite" autoFocus onClick={() => dialog.current?.close()}>×</button>
            </div>
        </dialog>}
    </>;
}
