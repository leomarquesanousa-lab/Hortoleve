import { productStorageURLs } from "./storage-urls.generated.ts";

// Apenas correspondências exatas do manifesto: uploads e URLs personalizadas são preservados.
export function storageImageURL(src: string) { return productStorageURLs[src] ?? src; }
export function originalImageURLs(src: string) {
    return Object.entries(productStorageURLs).filter(([, target]) => target === src).map(([original]) => original);
}
export function withStorageImages<T>(value: T): T {
    if (typeof value === "string") return storageImageURL(value) as T;
    if (Array.isArray(value)) return value.map(item => withStorageImages(item)) as T;
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withStorageImages(item)])) as T;
    return value;
}
