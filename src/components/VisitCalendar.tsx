"use client";
import { useState } from "react";
import s from "./Visit.module.css";

export function calendarDays(month: string) {
    const [year, number] = month.split("-").map(Number);
    const first = new Date(Date.UTC(year, number - 1, 1));
    const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
    return { offset: (first.getUTCDay() + 6) % 7, days: Array.from({ length: count }, (_, i) => {
        const date = `${month}-${String(i + 1).padStart(2, "0")}`;
        return { date, day: i + 1, weekend: [0, 6].includes(new Date(date + "T12:00:00Z").getUTCDay()) };
    }) };
}

export function VisitCalendar({ today, selected, onSelect, unavailableDates = [] }: { today: string; selected: string; onSelect: (date: string) => void; unavailableDates?: string[] }) {
    const [month, setMonth] = useState(() => (selected || today).slice(0, 7));
    const { offset, days } = calendarDays(month);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(month + "-01T12:00:00Z"));
    function move(delta: number) { const d = new Date(month + "-01T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + delta); setMonth(d.toISOString().slice(0, 7)); }
    return <div className={s.calendar}>
        <div className={s.calendarHeader}><button type="button" aria-label="Mês anterior" disabled={month <= today.slice(0, 7)} onClick={() => move(-1)}>‹</button><span aria-live="polite">{label}</span><button type="button" aria-label="Próximo mês" onClick={() => move(1)}>›</button></div>
        <div className={s.calendarWeekdays} aria-hidden="true">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(day => <span key={day}>{day}</span>)}</div>
        <div className={s.calendarDays}>
            {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
            {days.map(({ date, day, weekend }) => {
                const status = weekend || date < today ? "unavailable" : unavailableDates.includes(date) ? "full" : "available";
                return <button type="button" key={date} className={s.calendarDay} data-status={status} disabled={status !== "available"} aria-pressed={selected === date} aria-current={date === today ? "date" : undefined} aria-label={`${day} de ${label}, ${status === "unavailable" ? "indisponível" : status === "full" ? "sem horários livres" : "consultar horários"}`} onClick={() => onSelect(date)}>{day}</button>;
            })}
            {Array.from({ length: (7 - (offset + days.length) % 7) % 7 }, (_, i) => <span key={`end-${i}`} />)}
        </div>
        <div className={s.calendarLegend}><span><i data-status="available" />Livre</span><span><i data-status="full" />Sem horários</span><span><i data-status="unavailable" />Indisponível</span></div>
    </div>;
}
