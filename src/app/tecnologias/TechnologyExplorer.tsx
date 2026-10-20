"use client";

import { useId, useRef, useState } from "react";
import s from "./page.module.css";

const tabs = ["Massagem", "Cromoterapia", "Controles e conectividade", "Materiais e componentes"];
const colors = [{ name: "Âmbar", color: "#b68445" }, { name: "Azul", color: "#6284a1" }, { name: "Verde", color: "#72957b" }, { name: "Violeta", color: "#927b9f" }];

export function TechnologyExplorer() {
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
            {index === 0 && <><h3>Vibração controlada, conforme o modelo.</h3><p>Determinadas linhas apresentam sistemas massageadores por vibração, acionados pelos controles compatíveis. A quantidade de motores e os modos disponíveis dependem do modelo e da versão.</p><p>Nos materiais comerciais cadastrados, Recover Mais informa 8 motores e 20 tipos de massagem; Elegance informa 6 motores e 20 massagens. Para as outras linhas, consulte os detalhes com a equipe.</p></>}
            {index === 1 && <><h3>Uma demonstração de luz e cor.</h3><p>Nos modelos com cromoterapia, a iluminação colorida é integrada ao colchão. Posição das luzes e forma de acionamento variam por linha e versão.</p>
                <div className={s.lightPreview} style={{ borderColor: colors[color].color, boxShadow: "inset 0 -5px 0 " + colors[color].color }} aria-hidden="true"><span>HORTOLEVE</span></div>
                <fieldset className={s.colors}><legend>Escolha uma cor demonstrativa</legend>{colors.map((item, choice) => <label key={item.name}><input type="radio" name={id + "-color"} checked={choice === color} onChange={() => setColor(choice)} /><span className={s.swatch} style={{ backgroundColor: item.color }} aria-hidden="true" />{item.name}</label>)}</fieldset>
                <p className={s.note} aria-live="polite">Demonstração visual em {colors[color].name.toLowerCase()}. Não controla um colchão real e não representa efeitos sobre a saúde.</p></>}
            {index === 2 && <><h3>Recursos que variam entre linhas e versões.</h3><ul><li>Controle Cromos LCD: declarado nos materiais de Majestic e Confort. Diamond apresenta Controle Cromos LCD ou Kit App.</li><li>Diamond: som Bluetooth, som embutido e carregamento por indução, conforme os materiais comerciais.</li><li>Elegance: versões Cromos ou Kit Therapy. A conexão com Alexa Echo corresponde à versão Kit Therapy.</li></ul><p>Compatibilidade, acessórios e funções devem ser conferidos para a versão escolhida; as artes não comprovam funcionalidades de aplicativos.</p></>}
            {index === 3 && <><h3>Entenda os materiais além do nome.</h3><p>Densidade indica a quantidade de material em um volume de espuma; maciez descreve a sensação ao toque, suporte diz respeito à sustentação e resiliência à recuperação após compressão. Esses conceitos não são equivalentes.</p><p>Confort declara D33 + HR, camada perfilada D40 e acabamento Confort Soft D28, com opções em Suede e Linho. HR identifica uma espuma de alta resiliência. A composição e o revestimento devem ser consultados por linha.</p><p>Infravermelho longo e componentes magnéticos são recursos declarados em materiais dos produtos. “Energia Quântica” é uma nomenclatura comercial, sem efeito científico ou benefício clínico demonstrado nesta apresentação.</p></>}
        </div>)}
    </div>;
}
