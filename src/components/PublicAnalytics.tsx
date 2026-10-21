"use client";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { usePublicConfig } from "./PublicConfig";
import type { Data } from "@/modules/cms/contracts";
import s from "./PublicAnalytics.module.css";
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
function subscribeConsent(callback: () => void) { window.addEventListener("storage",callback);window.addEventListener("hortoleve:consent",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("hortoleve:consent",callback);}; }
function readConsent() { try { return localStorage.getItem("hortoleve:analytics-consent"); } catch { return null; } }
export function PublicAnalytics() {
    const { settings } = usePublicConfig();
    const config = settings.analytics as Data | undefined;
    const id = String(config?.measurementId ?? "");
    const enabled = config?.enabled === true && /^G-[A-Z0-9]{5,20}$/.test(id);
    const pathname = usePathname();
    const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
    const allowed = enabled && consent === "granted";
    useEffect(()=>{
        if(!allowed)return;
        window.dataLayer ??= [];
        // O protocolo oficial gtag recebe Arguments, não um array na fila.
        // eslint-disable-next-line prefer-rest-params
        window.gtag ??= function(){window.dataLayer!.push(arguments);};
        window.gtag("js",new Date());window.gtag("config",id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
        window.gtag("event","page_view",{page_location:window.location.origin+pathname,page_path:pathname});
        if(/^\/produtos\/[^/]+\/[^/]+$/.test(pathname))window.gtag("event","view_item",{items:[{item_id:pathname.split("/").pop()}]});
        const click=(e:MouseEvent)=>{const a=(e.target as Element)?.closest?.("a");if(a&&/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)(\/|$)/.test(a.href))window.gtag?.("event","whatsapp_click",{page_path:pathname});};
        const lead=()=>window.gtag?.("event","generate_lead",{method:"contact_form"});
        const banner=(e:Event)=>{const d=(e as CustomEvent).detail;if(["home","tecnologias"].includes(d?.placement)&&Number.isInteger(d?.index))window.gtag?.("event","banner_interaction",{placement:d.placement,slide_index:d.index});};
        document.addEventListener("click",click);window.addEventListener("hortoleve:lead",lead);window.addEventListener("hortoleve:banner",banner);
        return()=>{document.removeEventListener("click",click);window.removeEventListener("hortoleve:lead",lead);window.removeEventListener("hortoleve:banner",banner);};
    },[allowed,id,pathname]);
    if(!enabled)return null;
    const choose=(value:string)=>{try{localStorage.setItem("hortoleve:analytics-consent",value);}catch{}window.dispatchEvent(new Event("hortoleve:consent"));};
    return <>{allowed&&<Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive"/>}{consent===null&&<aside className={s.consent} aria-label="Preferência de medição"><p>Permitir medição de navegação para melhorar sua experiência?</p><button onClick={()=>choose("granted")}>Permitir</button><button onClick={()=>choose("denied")}>Agora não</button></aside>}</>;
}
