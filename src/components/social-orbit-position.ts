export interface OrbitRect { top: number; bottom: number; left: number; right: number }
export function overlaps(a: OrbitRect, b: OrbitRect) {
    return a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left;
}

// Trabalha em coordenadas de viewport: a altura do rodapé nunca é presumida.
export function footerOrbitPosition(icon: OrbitRect, footer: OrbitRect, links: OrbitRect[], maxLift = 120) {
    let lift = 0;
    const moved = () => ({ ...icon, top: icon.top - lift, bottom: icon.bottom - lift });
    if (overlaps(icon, footer)) {
        for (let i = 0; i <= links.length; i++) {
            const collisions = links.filter(link => overlaps(moved(), link));
            if (!collisions.length) break;
            const next = Math.max(...collisions.map(link => icon.bottom - link.top + 8));
            if (next > maxLift) break;
            lift = next;
        }
    }
    return { lift, overFooter: overlaps(moved(), footer) };
}
