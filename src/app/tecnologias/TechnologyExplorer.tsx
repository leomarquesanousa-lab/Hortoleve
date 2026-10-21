"use client";
import { getPageText } from "@/modules/content/page-defaults";

import { useId, useRef, useState } from "react";
import s from "./page.module.css";

const tabs = ["Massagem", "Cromoterapia", "Controles e conectividade", "Materiais e componentes"];
const colors = [{ name: "Âmbar", color: "#b68445" }, { name: "Azul", color: "#6284a1" }, { name: "Verde", color: "#72957b" }, { name: "Violeta", color: "#927b9f" }];

export function TechnologyExplorer({ content }: { content?: import("@/modules/cms/contracts").Data | null }) {
    const text = (key: string) => getPageText(content, "explorer", key);
    const [active, setActive] = useState(0);
    const [color, setColor] = useState(0);
    const id = useId();
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);
    return <div className={s.explorer}>
        <div className={s.tabs} role="tablist" aria-label="Explore as tecnologias" onKeyDown={event => {
            let next = active;
            if (event.key === "ArrowRight") next = (active + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (active + tabs.length - 1) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault(); setActive(next); buttons.current[next]?.focus();
        }}>
            {tabs.map((name, index) => <button key={name} type="button" role="tab" id={id + "-tab-" + index} aria-controls={id + "-panel-" + index}
                aria-selected={active === index} tabIndex={active === index ? 0 : -1} ref={element => { buttons.current[index] = element; }} onClick={() => setActive(index)}>{name}</button>)}
        </div>
        {tabs.map((name, index) => <div key={name} role="tabpanel" id={id + "-panel-" + index} aria-labelledby={id + "-tab-" + index} hidden={active !== index} tabIndex={0} className={s.panel}>
            {index === 0 && <><h3>{text("explorer-0")}</h3><p>{text("explorer-1")}</p><p>{text("explorer-2")}</p></>}
            {index === 1 && <><h3>{text("explorer-3")}</h3><p>{text("explorer-4")}</p>
                <div className={s.lightPreview} style={{ borderColor: colors[color].color, boxShadow: "inset 0 -5px 0 " + colors[color].color }} aria-hidden="true"><span>HORTOLEVE</span></div>
                <fieldset className={s.colors}><legend>{text("explorer-5")}</legend>{colors.map((item, choice) => <label key={item.name}><input type="radio" name={id + "-color"} checked={choice === color} onChange={() => setColor(choice)} /><span className={s.swatch} style={{ backgroundColor: item.color }} aria-hidden="true" />{item.name}</label>)}</fieldset>
                <p className={s.note} aria-live="polite">{text("explorer-6")} {colors[color].name.toLowerCase()}{text("explorer-7")}</p></>}
            {index === 2 && <><h3>{text("explorer-8")}</h3><ul><li>{text("explorer-9")}</li><li>{text("explorer-10")}</li><li>{text("explorer-11")}</li></ul><p>{text("explorer-12")}</p></>}
            {index === 3 && <><h3>{text("explorer-13")}</h3><p>{text("explorer-14")}</p><p>{text("explorer-15")}</p><p>{text("explorer-16")}</p></>}
        </div>)}
    </div>;
}
