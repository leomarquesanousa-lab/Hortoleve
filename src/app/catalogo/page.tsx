import { permanentRedirect } from "next/navigation";
import { legacyRedirectUrl } from "@/modules/catalog/legacy-redirect";
export const instant = false;
export default async function LegacyProducts({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    permanentRedirect(legacyRedirectUrl("/produtos/colchoes", await searchParams));
}
