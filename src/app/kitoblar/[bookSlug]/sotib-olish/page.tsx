import { notFound } from "next/navigation";

import {
    BookPurchasePage,
} from "@/features/books/components/book-purchase-page";
import {
    getBookBySlug,
} from "@/features/books/model/book-catalog";

type BookPurchaseRouteProps = {
    readonly params: Promise<{
        bookSlug: string;
    }>;
};

export default async function BookPurchaseRoute({
    params,
}: BookPurchaseRouteProps) {
    const { bookSlug } = await params;
    const book = getBookBySlug(bookSlug);

    if (!book) {
        notFound();
    }

    return <BookPurchasePage book={book} />;
}
