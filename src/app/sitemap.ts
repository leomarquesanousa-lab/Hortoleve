import type { MetadataRoute } from "next";
import { productHref } from "@/modules/catalog/data";
import { getPublicSnapshot } from "@/modules/cms/public";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { settings: site, categories, products } = await getPublicSnapshot();
    // Produtos demonstrativos ficam fora da indexação. Incluir somente os oficiais publicados.
    if (!site.indexingEnabled)
        return [];
    return ["", "/produtos", ...categories.map(category => "/produtos/" + category.slug), ...products.filter(product => product.status === "published" && !product.isDemo).map(productHref), "/tecnologias", "/sobre", "/contato"].map(route => ({ url: site.url + route }));
}
