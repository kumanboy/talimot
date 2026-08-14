import { notFound } from "next/navigation";
import { connection } from "next/server";

import { BookPurchasePage } from "@/features/books/components/book-purchase-page";
import { getBookBySlugFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

type BookPurchaseRouteProps = { readonly params: Promise<{ bookSlug: string }> };

export default async function BookPurchaseRoute({ params }: BookPurchaseRouteProps) {
    await connection();
    const { bookSlug } = await params;
    const book = await getBookBySlugFromDatabase(bookSlug);
    if (!book) notFound();
    return <BookPurchasePage book={book} />;
}
