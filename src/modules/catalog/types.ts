export interface ProductMedia {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
}
export interface Product {
    categorySlug?: string;
    id: string;
    slug: string;
    name: string;
    categoryId: string;
    summary: string;
    highlights: string[];
    description: string;
    media: ProductMedia[];
    specifications: {
        label: string;
        value: string;
    }[];
    technologyIds: string[];
    featured: boolean;
    status: "draft" | "published";
    isDemo: boolean;
}
export interface Category {
    parentId?: string;
    image?: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
}
