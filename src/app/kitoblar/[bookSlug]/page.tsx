import { notFound } from "next/navigation";

import {
    BookDetailPage,
} from "@/features/books/components/book-detail-page";
import {
    getBookBySlug,
    getPublishedBooks,
} from "@/features/books/model/book-catalog";

type BookDetailRouteProps = {
    readonly params: Promise<{
        bookSlug: string;
    }>;
};

export function generateStaticParams() {
    return getPublishedBooks().map((book) => ({
        bookSlug: book.slug,
    }));
}

export default async function BookDetailRoute({
    params,
}: BookDetailRouteProps) {
    const { bookSlug } = await params;
    const book = getBookBySlug(bookSlug);

    if (!book) {
        notFound();
    }

    return <BookDetailPage book={book} />;
}
