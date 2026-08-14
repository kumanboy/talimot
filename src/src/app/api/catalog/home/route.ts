import { NextResponse } from "next/server";

import {
    getPublishedBooksFromDatabase,
    getPublishedCoursesFromDatabase,
} from "@/features/catalog/server/catalog-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [books, courses] = await Promise.all([
            getPublishedBooksFromDatabase(),
            getPublishedCoursesFromDatabase(),
        ]);

        return NextResponse.json({ ok: true, books, courses });
    } catch (error) {
        console.error("Catalog home fetch failed", error);
        return NextResponse.json({ error: "Katalogni yuklab bo‘lmadi." }, { status: 500 });
    }
}
