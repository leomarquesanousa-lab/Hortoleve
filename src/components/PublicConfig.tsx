"use client";
import { createContext, useContext } from "react";
import { site } from "@/config/site";
import { products, categories } from "@/modules/catalog/data";
import { socialChannels } from "@/config/social";
import type { Snapshot } from "@/modules/cms/public";
export type PublicConfig = Pick<Snapshot, "settings" | "products" | "categories" | "socials">;
const context = createContext<PublicConfig>({ settings: { ...site }, products, categories, socials: socialChannels });
export const PublicConfigProvider = context.Provider;
export const usePublicConfig = () => useContext(context);
export function publicWhatsapp(whatsapp: unknown, message: string) { return typeof whatsapp === "string" && /^\d{10,15}$/.test(whatsapp) ? "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(message) : null; }
