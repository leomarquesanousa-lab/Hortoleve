"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ProductPlaceholder } from "./ProductPlaceholder";
import Image from "next/image";
import type { ProductMedia } from "@/modules/catalog/types";
import styles from "./site.module.css";
import g from "./ProductGallery.module.css";
export function ProductGallery({ media, interactive = false, compact = false }: {
    media: ProductMedia[];
    interactive?: boolean;
    compact?: boolean;
}) {
    const [selected, setSelected] = useState(0);
    const [open, setOpen] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const item = media[selected] ?? media[0];
    const move = (delta: number) => setSelected(index => (index + delta + media.length) % media.length);

    useEffect(() => {
        if (!open) return;
        const element = dialog.current;
        if (!element) return;
        const overflow = document.body.style.overflow;
        element.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            element.close();
            document.body.style.overflow = overflow;
        };
    }, [open]);

    if (!interactive) return <div className={styles.gallery}>{media.length === 0 && <ProductPlaceholder />}{media.map((image, index) => <figure key={image.id}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 640px) 100vw, 50vw"/><figcaption>{image.alt}</figcaption></figure>)}</div>;
    if (!item) return <ProductPlaceholder />;

    return <div className={g.gallery + (compact ? " " + g.compact : "")}>
        <figure className={g.figure}>
            <button type="button" className={g.main} data-image={item.id} onClick={() => setOpen(true)} aria-label={"Ampliar: " + item.alt} aria-haspopup="dialog">
                <Image src={item.src} alt={item.alt} width={item.width} height={item.height}
                    loading={compact ? "lazy" : "eager"} sizes={compact ? "300px" : "(max-width: 760px) 88vw, 46vw"} />
                <span className={g.zoom} aria-hidden="true">Ampliar ↗</span>
            </button>
            <figcaption className={g.caption} aria-live="polite">{item.alt}</figcaption>
        </figure>
        {media.length > 1 && <div className={g.thumbnails} role="group" aria-label="Selecionar imagem da linha">
            {media.map((image, index) => <button type="button" key={image.id} className={g.thumbnail}
                onClick={() => setSelected(index)} aria-label={"Exibir imagem " + (index + 1) + ": " + image.alt} aria-pressed={selected === index}>
                <Image src={image.src} alt="" width={image.width} height={image.height} sizes="78px" />
            </button>)}
        </div>}
        <dialog ref={dialog} className={g.modal} aria-labelledby={titleId} onClose={() => setOpen(false)}
            onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}
            onKeyDown={event => {
                if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
                if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
            }}>
            <div className={g.toolbar}><p id={titleId}>Galeria da linha · imagem {selected + 1} de {media.length}</p>
                <button type="button" className={g.control} onClick={() => setOpen(false)} aria-label="Fechar ampliação">Fechar ×</button>
            </div>
            {open && <div className={g.modalImage}><Image src={item.src} alt={item.alt} fill sizes="(max-width: 1100px) 94vw, 1066px" /></div>}
            {media.length > 1 && <div className={g.navigation}>
                <button type="button" className={g.control} onClick={() => move(-1)} aria-label="Imagem anterior">← Anterior</button>
                <span aria-live="polite">{selected + 1} / {media.length}</span>
                <button type="button" className={g.control} onClick={() => move(1)} aria-label="Próxima imagem">Próxima →</button>
            </div>}
        </dialog>
    </div>;
}
