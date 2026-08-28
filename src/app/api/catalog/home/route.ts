import { NextResponse } from "next/server";

import {
    getPublishedBooksFromDatabase,
    getPublishedCoursesFromDatabase,
} from "@/features/catalog/server/catalog-repository";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
    try {
        const [books, courses] = await Promise.all([
            getPublishedBooksFromDatabase(),
            getPublishedCoursesFromDatabase(),
        ]);

        return NextResponse.json(
            { ok: true, books, courses },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            },
        );
    } catch (error) {
        console.error("Catalog home fetch failed", error);
        return NextResponse.json(
            { error: "Katalogni yuklab bo‘lmadi." },
            { status: 500 },
        );
    }
}
