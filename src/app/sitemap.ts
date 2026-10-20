import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { categories, products, productHref } from "@/modules/catalog/data";
export default function sitemap(): MetadataRoute.Sitemap {
    // Produtos demonstrativos ficam fora da indexação. Incluir somente os oficiais publicados.
    if (!site.indexingEnabled)
        return [];
    return ["", "/produtos", ...categories.map(category => "/produtos/" + category.slug), ...products.filter(product => product.status === "published" && !product.isDemo).map(productHref), "/tecnologias", "/sobre", "/contato"].map(route => ({ url: site.url + route }));
}
