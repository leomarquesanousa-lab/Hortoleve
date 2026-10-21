import type { MetadataRoute } from "next";
import { getPublicSnapshot } from "@/modules/cms/public";
export default async function robots(): Promise<MetadataRoute.Robots> { const { settings: site } = await getPublicSnapshot(); return { rules: site.indexingEnabled ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] } : { userAgent: "*", disallow: "/" }, sitemap: site.url + "/sitemap.xml" }; }
