import type { Category } from "./types";

const order = ["colchoes", "poltronas", "vibro-car", "linha-a-vacuo", "camas-box", "travesseiros", "cabeceiras", "dream-pet"];
const labels: Record<string, string> = { "vibro-car": "Vibrocar", "camas-box": "Cama Box", "dream-pet": "Dream Patch" };
export interface CategoryNode { category: Category; label: string; children: CategoryNode[] }
export function categoryNavigation(categories: Category[]): CategoryNode[] {
    const branch = (category: Category, ancestors: string[]): CategoryNode => ({ category, label: labels[category.id] ?? category.name,
        children: categories.filter(c => c.parentId === category.id && !ancestors.includes(c.id)).map(c => branch(c, [...ancestors, c.id])),
    });
    return categories.filter(c => !c.parentId || !categories.some(parent => parent.id === c.parentId))
        .sort((a, b) => (order.includes(a.id) ? order.indexOf(a.id) : order.length) - (order.includes(b.id) ? order.indexOf(b.id) : order.length))
        .map(c => branch(c, [c.id]));
}
