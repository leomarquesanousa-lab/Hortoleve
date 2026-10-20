import type { MetadataRoute } from "next";
import { site } from "@/config/site";
export default function robots(): MetadataRoute.Robots { return { rules: site.indexingEnabled ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] } : { userAgent: "*", disallow: "/" }, sitemap: site.url + "/sitemap.xml" }; }
