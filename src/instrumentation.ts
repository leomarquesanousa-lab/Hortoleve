export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.VISITS_EMAIL_ENABLED !== "true") return;
    const { startVisitWorker } = await import("./modules/visits/worker");
    startVisitWorker();
}
