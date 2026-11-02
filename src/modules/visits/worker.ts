import "server-only";
import { deliverVisitNotifications } from "./notifications";
const state = globalThis as unknown as { visitWorker?: ReturnType<typeof setInterval> };
export function startVisitWorker() {
    if (state.visitWorker) return;
    let running = false;
    state.visitWorker = setInterval(async () => {
        if (running) return;
        running = true;
        try { await deliverVisitNotifications(); } catch { /* durable pending jobs are retried on the next tick */ }
        finally { running = false; }
    }, 60000);
    state.visitWorker.unref();
}
