import { notFound, permanentRedirect } from "next/navigation";
import { getProduct, productHref } from "@/modules/catalog/data";
import { legacyRedirectUrl } from "@/modules/catalog/legacy-redirect";
export const instant = false;
export default async function LegacyProduct({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const product = getProduct((await params).slug);
    if (!product) notFound();
    permanentRedirect(legacyRedirectUrl(productHref(product), await searchParams));
}
