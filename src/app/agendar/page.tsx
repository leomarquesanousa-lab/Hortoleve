import VisitForm from "./VisitForm";
import s from "@/components/Visit.module.css";
export const metadata = { title: "Agende sua visita | Hortoleve", description: "Uma demonstração personalizada de colchões premium no conforto da sua casa." };
export default function Page() { return <div className={s.page}><p className={s.eyebrow}>UMA EXPERIÊNCIA HORTOLEVE</p><h1>Seu descanso merece atenção especial.</h1><p className={s.intro}>Conheça uma experiência personalizada de conforto. Agende uma demonstração em sua casa com um consultor especialista.</p><VisitForm /></div>; }
