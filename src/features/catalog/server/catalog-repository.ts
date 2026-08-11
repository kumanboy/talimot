import "server-only";

import { asc, eq } from "drizzle-orm";

import { books as codeBooks } from "@/features/books/model/book-catalog";
import type { BookDefinition } from "@/features/books/model/book-types";
import { courses as codeCourses } from "@/features/courses/model/course-catalog";
import type { CourseDefinition } from "@/features/courses/model/course-types";
import type {
    AdminCatalogRecord,
    CatalogKind,
} from "@/features/catalog/model/catalog-types";
import { db } from "@/lib/database/db";
import { catalogItems } from "@/lib/database/schema/catalog-items";

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBookDefinition(value: unknown): value is BookDefinition {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === "string" &&
        typeof value.slug === "string" &&
        typeof value.title === "string" &&
        typeof value.author === "string" &&
        typeof value.shortDescription === "string" &&
        Array.isArray(value.fullDescription) &&
        isRecord(value.sale) &&
        isRecord(value.delivery)
    );
}

function isCourseDefinition(value: unknown): value is CourseDefinition {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === "string" &&
        typeof value.slug === "string" &&
        typeof value.title === "string" &&
        typeof value.shortDescription === "string" &&
        Array.isArray(value.fullDescription) &&
        isRecord(value.sale) &&
        isRecord(value.instructor) &&
        Array.isArray(value.modules)
    );
}

async function readRows(kind: CatalogKind) {
    return db
        .select()
        .from(catalogItems)
        .where(eq(catalogItems.kind, kind))
        .orderBy(asc(catalogItems.sortOrder), asc(catalogItems.title));
}

export async function getPublishedBooksFromDatabase(): Promise<readonly BookDefinition[]> {
    const rows = await readRows("book");
    const overrides = new Map(rows.map((row) => [row.slug, row]));
    const result: BookDefinition[] = [];

    for (const book of codeBooks) {
        const override = overrides.get(book.slug);
        if (!override) {
            if (book.status === "published") result.push(book);
            continue;
        }

        overrides.delete(book.slug);
        if (override.status !== "published") continue;
        if (isBookDefinition(override.payload)) result.push(override.payload);
    }

    for (const row of overrides.values()) {
        if (row.status === "published" && isBookDefinition(row.payload)) {
            result.push(row.payload);
        }
    }

    return result;
}

export async function getPublishedCoursesFromDatabase(): Promise<readonly CourseDefinition[]> {
    const rows = await readRows("course");
    const overrides = new Map(rows.map((row) => [row.slug, row]));
    const result: CourseDefinition[] = [];

    for (const course of codeCourses) {
        const override = overrides.get(course.slug);
        if (!override) {
            if (course.status === "published") result.push(course);
            continue;
        }

        overrides.delete(course.slug);
        if (override.status !== "published") continue;
        if (isCourseDefinition(override.payload)) result.push(override.payload);
    }

    for (const row of overrides.values()) {
        if (row.status === "published" && isCourseDefinition(row.payload)) {
            result.push(row.payload);
        }
    }

    return result;
}

export async function getBookBySlugFromDatabase(slug: string): Promise<BookDefinition | null> {
    const books = await getPublishedBooksFromDatabase();
    return books.find((book) => book.slug === slug) ?? null;
}

export async function getCourseBySlugFromDatabase(slug: string): Promise<CourseDefinition | null> {
    const courses = await getPublishedCoursesFromDatabase();
    return courses.find((course) => course.slug === slug) ?? null;
}

export async function getAdminCatalogRecords(): Promise<readonly AdminCatalogRecord[]> {
    const bookRows = await readRows("book");
    const courseRows = await readRows("course");

    const rowMap = new Map(
        [...bookRows, ...courseRows].map((row) => [`${row.kind}:${row.slug}`, row]),
    );

    const result: AdminCatalogRecord[] = [];

    for (const book of codeBooks) {
        const row = rowMap.get(`book:${book.slug}`);
        if (row) rowMap.delete(`book:${book.slug}`);
        result.push({
            id: row?.id ?? book.id,
            kind: "book",
            slug: book.slug,
            title: row?.title ?? book.title,
            status: (row?.status ?? book.status) as AdminCatalogRecord["status"],
            coverImage: row?.coverImage ?? book.coverImage ?? null,
            originalPrice: row?.originalPrice ?? book.sale.originalPrice,
            salePrice: row?.salePrice ?? book.sale.salePrice,
            saleEndsAt: row?.saleEndsAt ?? book.sale.endsAt,
            sortOrder: row?.sortOrder ?? 0,
            source: row ? "database" : "code",
            updatedAt: row?.updatedAt ?? 0,
        });
    }

    for (const course of codeCourses) {
        const row = rowMap.get(`course:${course.slug}`);
        if (row) rowMap.delete(`course:${course.slug}`);
        result.push({
            id: row?.id ?? course.id,
            kind: "course",
            slug: course.slug,
            title: row?.title ?? course.title,
            status: (row?.status ?? course.status) as AdminCatalogRecord["status"],
            coverImage: row?.coverImage ?? course.coverImage,
            originalPrice: row?.originalPrice ?? course.sale.originalPrice,
            salePrice: row?.salePrice ?? course.sale.salePrice,
            saleEndsAt: row?.saleEndsAt ?? course.sale.endsAt,
            sortOrder: row?.sortOrder ?? 0,
            source: row ? "database" : "code",
            updatedAt: row?.updatedAt ?? 0,
        });
    }

    for (const row of rowMap.values()) {
        result.push({
            id: row.id,
            kind: row.kind as CatalogKind,
            slug: row.slug,
            title: row.title,
            status: row.status as AdminCatalogRecord["status"],
            coverImage: row.coverImage,
            originalPrice: row.originalPrice,
            salePrice: row.salePrice,
            saleEndsAt: row.saleEndsAt,
            sortOrder: row.sortOrder,
            source: "database",
            updatedAt: row.updatedAt,
        });
    }

    return result.sort((a, b) =>
        a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
    );
}
