import type { BookDefinition } from "@/features/books/model/book-types";
import type { CourseDefinition } from "@/features/courses/model/course-types";

export type CatalogKind = "book" | "course";
export type CatalogStatus = "draft" | "published" | "archived";
export type CatalogDefinition = BookDefinition | CourseDefinition;

export type AdminCatalogRecord = {
    readonly id: string;
    readonly kind: CatalogKind;
    readonly slug: string;
    readonly title: string;
    readonly status: CatalogStatus;
    readonly coverImage: string | null;
    readonly originalPrice: number;
    readonly salePrice: number;
    readonly saleEndsAt: string | null;
    readonly sortOrder: number;
    readonly source: "code" | "database";
    readonly updatedAt: number;
};
