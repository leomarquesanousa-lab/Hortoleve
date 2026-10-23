"use client";
import Image from "next/image";
import type { Data } from "@/modules/cms/contracts";
import s from "./ContentManager.module.css";

export function applyUploadedPhotos(previous: Data, files: Data[], replaceId?: string): Data {
    const gallery = (Array.isArray(previous.gallery) ? previous.gallery : []) as Data[];
    const old = gallery.find(image => image.id === replaceId);
    if (!files.length || replaceId && !old) throw new Error("Selecione uma foto existente para substituir.");
    const next = replaceId ? gallery.map(image => image.id === replaceId ? { ...files[0], id: image.id, alt: image.alt || files[0].alt } : image) : [...gallery, ...files];
    const cover = old && previous.cardImage === old.src ? next.find(image => image.id === old.id) : !previous.cardImage ? next[0] : null;
    return { ...previous, gallery: next, ...(cover ? { cardImage: cover.src, cardAlt: cover.alt, cardWidth: cover.width, cardHeight: cover.height } : {}) };
}

export function ProductImagesEditor({ data, change, upload, disabled, storageAvailable }: {
    data: Data; change: (data: Data) => void;
    upload: (files: FileList | null, replaceId?: string) => Promise<void>;
    disabled: boolean; storageAvailable: boolean;
}) {
    const gallery = (Array.isArray(data.gallery) ? data.gallery : []) as Data[];
    function update(images: Data[]) {
        const cover = images.find(image => image.src === data.cardImage) ?? images[0];
        change({ ...data, gallery: images, ...(!images.some(i => i.id === data.technicalSheetId) ? { technicalSheetId: "" } : {}), cardImage: cover?.src ?? "", cardAlt: cover?.alt ?? "", cardWidth: cover?.width ?? 0, cardHeight: cover?.height ?? 0 });
    }
    return <fieldset className={s.array} disabled={disabled}><legend>Fotos do produto</legend>
        <p>A primeira foto abre a galeria. Escolha também qual foto aparece no catálogo.</p>
        {gallery.map((image, index) => <div className={s.arrayItem} key={String(image.id)}>
            <Image src={String(image.src)} alt={String(image.alt || "Foto do produto")} width={240} height={160} unoptimized className={s.imagePreview} />
            <label className={s.field}>Descrição da imagem<input value={String(image.alt ?? "")} required onChange={event => update(gallery.map((item, n) => n === index ? { ...item, alt: event.target.value } : item))} /></label>
            <div className={s.actions}>
                <button type="button" disabled={index === 0} onClick={() => { const next = [...gallery]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update(next); }} aria-label={"Subir foto " + (index + 1)}>Subir</button>
                <button type="button" disabled={index === gallery.length - 1} onClick={() => { const next = [...gallery]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update(next); }} aria-label={"Descer foto " + (index + 1)}>Descer</button>
                <button type="button" onClick={() => change({ ...data, cardImage: image.src, cardAlt: image.alt, cardWidth: image.width, cardHeight: image.height })}>{data.cardImage === image.src ? "Capa do catálogo" : "Usar como capa"}</button>
                <button type="button" onClick={() => { if (confirm("Remover esta foto do produto? O arquivo original será preservado.")) update(gallery.filter((_, n) => n !== index)); }}>Remover foto</button>
            </div>
            {storageAvailable && <label className={s.field}>Substituir foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { void upload(event.target.files, String(image.id)); event.target.value = ""; }} /></label>}
        </div>)}
        {storageAvailable ? <label className={s.field}>Adicionar fotos do computador (até 5 por envio; 6 MB cada)<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={event => { void upload(event.target.files); event.target.value = ""; }} /></label> : <p>Envio de novas fotos indisponível até a configuração do armazenamento. As fotos atuais serão preservadas.</p>}
    </fieldset>;
}
