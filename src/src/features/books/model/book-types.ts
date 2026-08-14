export type BookStatus = "draft" | "published" | "archived";

export type BookStockStatus =
    | "in-stock"
    | "low-stock"
    | "out-of-stock";

export type BookAccent =
    | "grammar"
    | "essay"
    | "ghazal";

export interface BookSale {
    readonly originalPrice: number;
    readonly salePrice: number;
    readonly startsAt?: string;
    readonly endsAt: string;
}

export interface BookDelivery {
    readonly method: "bts";
    readonly label: string;
    readonly description: string;
    readonly price: number;
}

export interface BookDefinition {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly author: string;
    readonly shortDescription: string;
    readonly fullDescription: readonly string[];
    readonly badge: string;
    readonly coverImage?: string;
    readonly coverImageAlt: string;
    readonly imagePosition?: string;
    readonly accent: BookAccent;
    readonly pageCount?: number;
    readonly formatLabel: string;
    readonly features: readonly string[];
    readonly sale: BookSale;
    readonly delivery: BookDelivery;
    readonly stockStatus: BookStockStatus;
    readonly status: BookStatus;
}
