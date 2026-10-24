import type { Category, Product } from "./types";
import { productHref } from "./data";

const order = ["colchoes", "poltronas", "vibro-car", "linha-a-vacuo", "camas-box", "travesseiros", "cabeceiras", "dream-pet"];
const labels: Record<string, string> = { "vibro-car": "Automotivo", "camas-box": "Cama Box", "dream-pet": "Pet" };
export interface CategoryNode { category: Category; label: string; children: CategoryNode[]; models: { id: string; label: string; href: string }[] }
export function categoryNavigation(categories: Category[], products: Product[] = []): CategoryNode[] {
    const branch = (category: Category, ancestors: string[]): CategoryNode => ({ category, label: labels[category.id] ?? category.name,
        children: categories.filter(c => c.parentId === category.id && !ancestors.includes(c.id)).map(c => branch(c, [...ancestors, c.id])),
        models: [category.id, ...ancestors].some(id => ["colchoes", "linha-a-vacuo", "camas-box", "vibro-car", "dream-pet", "cabeceiras"].includes(id))
            ? [...new Map(products.filter(p => p.categoryId === category.id && !p.isDemo).map(p => {
                const href = productHref({ ...p, categorySlug: p.categorySlug ?? category.slug });
                return [href, { id: p.id, label: p.name, href }] as const;
            })).values()] : [],
    });
    return categories.filter(c => !c.parentId || !categories.some(parent => parent.id === c.parentId))
        .sort((a, b) => (order.includes(a.id) ? order.indexOf(a.id) : order.length) - (order.includes(b.id) ? order.indexOf(b.id) : order.length))
        .map(c => branch(c, [c.id]));
}
