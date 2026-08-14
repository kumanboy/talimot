import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { getAdminCatalogItem } from "@/features/admin/catalog/server/get-admin-catalog-item";
import type { CatalogKind, CatalogStatus } from "@/features/catalog/model/catalog-types";
import type { BookAccent, BookDefinition, BookStockStatus } from "@/features/books/model/book-types";
import type { CourseAccent, CourseDefinition, CourseModule } from "@/features/courses/model/course-types";
import { db } from "@/lib/database/db";
import { catalogItems } from "@/lib/database/schema/catalog-items";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(form: FormData, key: string, max = 500): string {
    const value = form.get(key);
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function integer(form: FormData, key: string, fallback = 0): number {
    const value = Number.parseInt(text(form, key, 30), 10);
    return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function lines(value: string): string[] {
    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 80);
}

function normalizeSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/[‘’ʼʻ']/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
}

function parseModules(raw: string, fallback: readonly CourseModule[]): readonly CourseModule[] {
    if (!raw.trim()) return fallback;
    try {
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed) ? (parsed as CourseModule[]) : fallback;
    } catch {
        return fallback;
    }
}

export async function POST(request: Request) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.redirect(new URL("/admin/login", request.url), 303);
    }

    const form = await request.formData();
    const kindValue = text(form, "kind", 20);
    const kind: CatalogKind | null = kindValue === "book" || kindValue === "course" ? kindValue : null;
    const originalSlug = normalizeSlug(text(form, "originalSlug", 80));
    const slug = normalizeSlug(text(form, "slug", 80));
    const title = text(form, "title", 160);
    const statusValue = text(form, "status", 20);
    const status: CatalogStatus = statusValue === "published" || statusValue === "archived" ? statusValue : "draft";

    if (!kind || !slug || !title) {
        return NextResponse.redirect(new URL("/admin/products?status=invalid", request.url), 303);
    }

    const baseline = originalSlug ? await getAdminCatalogItem(kind, originalSlug) : null;
    const now = Date.now();
    const id = baseline?.id ?? randomUUID();
    const originalPrice = integer(form, "originalPrice");
    const salePrice = integer(form, "salePrice");
    const saleEndsAt = text(form, "saleEndsAt", 80) || "2099-12-31T23:59:59+05:00";
    const coverImage = text(form, "coverImage", 500);
    const badge = text(form, "badge", 100) || "TA’LIMOT";
    const shortDescription = text(form, "shortDescription", 700);
    const fullDescription = lines(text(form, "fullDescription", 6000));

    let payload: BookDefinition | CourseDefinition;

    if (kind === "book") {
        const old = baseline && "author" in baseline ? baseline : null;
        const accentValue = text(form, "accent", 30);
        const accent: BookAccent = accentValue === "essay" || accentValue === "ghazal" ? accentValue : "grammar";
        const stockValue = text(form, "stockStatus", 30);
        const stockStatus: BookStockStatus = stockValue === "low-stock" || stockValue === "out-of-stock" ? stockValue : "in-stock";

        payload = {
            id,
            slug,
            title,
            author: text(form, "author", 140) || old?.author || "Sardor Toshmuhammadov",
            shortDescription,
            fullDescription: fullDescription.length ? fullDescription : old?.fullDescription ?? [],
            badge,
            coverImage: coverImage || old?.coverImage,
            coverImageAlt: text(form, "coverImageAlt", 220) || `${title} kitobi`,
            imagePosition: text(form, "imagePosition", 80) || old?.imagePosition || "center",
            accent,
            pageCount: integer(form, "pageCount", old?.pageCount ?? 0) || undefined,
            formatLabel: text(form, "formatLabel", 80) || old?.formatLabel || "Bosma kitob",
            features: lines(text(form, "features", 4000)).length
                ? lines(text(form, "features", 4000))
                : old?.features ?? [],
            sale: {
                originalPrice,
                salePrice,
                endsAt: saleEndsAt,
            },
            delivery: {
                method: "bts",
                label: text(form, "deliveryLabel", 120) || old?.delivery.label || "BTS pochta xizmati",
                description: text(form, "deliveryDescription", 800) || old?.delivery.description || "Buyurtma BTS pochta orqali yuboriladi.",
                price: integer(form, "deliveryPrice", old?.delivery.price ?? 0),
            },
            stockStatus,
            status,
        };
    } else {
        const old = baseline && "instructor" in baseline ? baseline : null;
        const accentValue = text(form, "accent", 30);
        const accent: CourseAccent = accentValue === "violet" || accentValue === "orange" || accentValue === "teal" ? accentValue : "primary";

        payload = {
            id,
            slug,
            title,
            shortDescription,
            fullDescription: fullDescription.length ? fullDescription : old?.fullDescription ?? [],
            badge,
            coverImage: coverImage || old?.coverImage || "/images/home/course-promotion.png",
            coverImageAlt: text(form, "coverImageAlt", 220) || `${title} kursi`,
            accent,
            instructor: {
                name: text(form, "instructorName", 140) || old?.instructor.name || "Sardor Toshmuhammadov",
                role: text(form, "instructorRole", 180) || old?.instructor.role || "Ona tili va adabiyot fani o‘qituvchisi",
                biography: text(form, "instructorBiography", 1500) || old?.instructor.biography || "",
                image: old?.instructor.image,
            },
            format: text(form, "format", 300) || old?.format || "Online kurs",
            schedule: text(form, "schedule", 700) || old?.schedule || "",
            accessDescription: text(form, "accessDescription", 900) || old?.accessDescription || "To‘lov tasdiqlangach, administrator kirish ma’lumotlarini taqdim etadi.",
            accessDurationLabel: text(form, "accessDurationLabel", 120) || old?.accessDurationLabel || "Cheklanmagan foydalanish",
            benefits: lines(text(form, "benefits", 4000)).length
                ? lines(text(form, "benefits", 4000))
                : old?.benefits ?? [],
            modules: parseModules(text(form, "modulesJson", 20000), old?.modules ?? []),
            sale: {
                originalPrice,
                salePrice,
                endsAt: saleEndsAt,
            },
            status,
        };
    }

    const [existing] = await db
        .select({ id: catalogItems.id })
        .from(catalogItems)
        .where(and(eq(catalogItems.kind, kind), eq(catalogItems.slug, originalSlug || slug)))
        .limit(1);

    const values = {
        id: existing?.id ?? id,
        kind,
        slug,
        title,
        status,
        coverImage: coverImage || null,
        originalPrice,
        salePrice,
        saleEndsAt,
        sortOrder: integer(form, "sortOrder", 0),
        payload: payload as unknown as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
    };

    if (existing) {
        await db
            .update(catalogItems)
            .set({
                kind,
                slug,
                title,
                status,
                coverImage: coverImage || null,
                originalPrice,
                salePrice,
                saleEndsAt,
                sortOrder: integer(form, "sortOrder", 0),
                payload: payload as unknown as Record<string, unknown>,
                updatedAt: now,
            })
            .where(eq(catalogItems.id, existing.id));
    } else {
        await db.insert(catalogItems).values(values);
    }

    return NextResponse.redirect(
        new URL(`/admin/products/${kind}/${encodeURIComponent(slug)}?status=saved`, request.url),
        303,
    );
}
