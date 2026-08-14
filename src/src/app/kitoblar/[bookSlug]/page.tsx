import { notFound } from "next/navigation";
import { connection } from "next/server";

import { BookDetailPage } from "@/features/books/components/book-detail-page";
import { getBookBySlugFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

type BookDetailRouteProps = { readonly params: Promise<{ bookSlug: string }> };

export default async function BookDetailRoute({ params }: BookDetailRouteProps) {
    await connection();
    const { bookSlug } = await params;
    const book = await getBookBySlugFromDatabase(bookSlug);
    if (!book) notFound();
    return <BookDetailPage book={book} />;
}
