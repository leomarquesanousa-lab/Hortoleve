"use client";
import { createContext, useContext } from "react";
import { site, whatsappUrl } from "@/config/site";
import { products, categories } from "@/modules/catalog/data";
import { presentations } from "@/modules/catalog/presentations";
import { socialChannels } from "@/config/social";
import type { Snapshot } from "@/modules/cms/public";
export type PublicConfig = Pick<Snapshot, "settings" | "products" | "categories" | "socials" | "presentations">;
const context = createContext<PublicConfig>({ settings: { ...site }, products, categories, socials: socialChannels, presentations });
export const PublicConfigProvider = context.Provider;
export const usePublicConfig = () => useContext(context);
export function publicWhatsapp(whatsapp: unknown, message: string) { return whatsappUrl(message, typeof whatsapp === "string" ? whatsapp : null); }
