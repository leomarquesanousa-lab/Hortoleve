export const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
export function localNow(timeZone: string, now = new Date()) {
    const parts = new Intl.DateTimeFormat("sv-SE", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    const p = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
export function validSlot(date: string, time: string, zone: string, now = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !TIMES.includes(time)) return false;
    const day = new Date(date + "T12:00:00Z");
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date || [0, 6].includes(day.getUTCDay())) return false;
    const current = localNow(zone, now);
    return date > current.date || (date === current.date && time > current.time);
}
export function validateVisit(input: Record<string, unknown>, zone: string, checkAvailability = true) {
    const text = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
    const data = { name: text("name"), phone: text("phone").replace(/\D/g, ""), email: text("email").toLowerCase(), city: text("city"), address: text("address"), notes: text("notes"), date: text("date"), time: text("time") };
    if (text("website") || input.consent !== true) throw new Error("Autorize o uso dos dados para o atendimento e agendamento.");
    if (data.name.length < 5 || !data.name.includes(" ") || data.name.length > 120) throw new Error("Informe seu nome completo.");
    if (!/^[1-9]{2}\d{8,9}$/.test(data.phone)) throw new Error("Informe um WhatsApp com DDD válido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) throw new Error("Informe um e-mail válido.");
    if (data.city.length < 5 || data.city.length > 200 || data.address.length < 10 || data.address.length > 500 || data.notes.length > 1000) throw new Error("Revise cidade, bairro, endereço e observações.");
    if (checkAvailability && !validSlot(data.date, data.time, zone)) throw new Error("Escolha um horário futuro de segunda a sexta-feira.");
    return data;
}
