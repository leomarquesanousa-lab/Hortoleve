import "server-only";
import { createSign } from "node:crypto";

export async function analyticsReport() {
    const property = process.env.GA4_PROPERTY_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!property || !/^\d+$/.test(property) || !email || !key) return null;
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const unsigned = encode({ alg: "RS256", typ: "JWT" }) + "." + encode({ iss: email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
    const signature = createSign("RSA-SHA256").update(unsigned).sign(key, "base64url");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + signature }), cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!tokenResponse.ok) throw new Error("Autorização do Google indisponível. Confira a conta de serviço e suas permissões.");
    const token = await tokenResponse.json();
    const metrics = ["activeUsers", "sessions", "screenPageViews", "keyEvents"];
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, { method: "POST", headers: { Authorization: "Bearer " + token.access_token, "Content-Type": "application/json" }, body: JSON.stringify({ dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }], metrics: metrics.map(name => ({ name })) }), cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Relatório indisponível. Confira a propriedade GA4 e o acesso de leitura.");
    const result = await response.json();
    return { period: "Últimos 28 dias completos", metrics: metrics.map((name, index) => ({ name, value: result.rows?.[0]?.metricValues?.[index]?.value ?? null })) };
}
