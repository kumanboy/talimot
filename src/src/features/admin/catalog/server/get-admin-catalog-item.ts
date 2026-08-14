import "server-only";

import { and, eq } from "drizzle-orm";

import { books } from "@/features/books/model/book-catalog";
import type { BookDefinition } from "@/features/books/model/book-types";
import { courses } from "@/features/courses/model/course-catalog";
import type { CourseDefinition } from "@/features/courses/model/course-types";
import type { CatalogKind } from "@/features/catalog/model/catalog-types";
import { db } from "@/lib/database/db";
import { catalogItems } from "@/lib/database/schema/catalog-items";

export type AdminCatalogDefinition = BookDefinition | CourseDefinition;

export async function getAdminCatalogItem(kind: CatalogKind, slug: string): Promise<AdminCatalogDefinition | null> {
    const [row] = await db
        .select({ payload: catalogItems.payload })
        .from(catalogItems)
        .where(and(eq(catalogItems.kind, kind), eq(catalogItems.slug, slug)))
        .limit(1);

    if (row?.payload && typeof row.payload === "object") {
        return row.payload as unknown as AdminCatalogDefinition;
    }

    if (kind === "book") {
        return books.find((item) => item.slug === slug) ?? null;
    }

    return courses.find((item) => item.slug === slug) ?? null;
}
