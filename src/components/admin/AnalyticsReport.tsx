"use client";
import { useState } from "react";
export function AnalyticsReport() {
    const [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
    const [report, setReport] = useState<{period:string;metrics:{name:string;value:string|null}[]} | null>(null);
    const labels: Record<string,string> = {activeUsers:"Usuários ativos",sessions:"Sessões",screenPageViews:"Visualizações",keyEvents:"Eventos principais"};
    return <section><h2>Relatórios reais do GA4</h2><p>A consulta exige Google Analytics Data API autorizada e conta de serviço com acesso de leitor à propriedade. Nenhum número é estimado.</p><button disabled={busy} onClick={async()=>{setBusy(true);setMessage("");setReport(null);try{const r=await fetch("/api/admin-analytics",{cache:"no-store"});const b=await r.json();if(!r.ok)throw Error(b.error);setReport(b);}catch(e){setMessage(e instanceof Error?e.message:"Falha na consulta.");}finally{setBusy(false);}}}>{busy?"Consultando…":"Consultar relatório"}</button>{message&&<p role="status">{message}</p>}{report&&<><p>{report.period}</p><dl>{report.metrics.map(m=><div key={m.name}><dt>{labels[m.name]}</dt><dd>{m.value??"Sem dados retornados"}</dd></div>)}</dl></>}</section>;
}
