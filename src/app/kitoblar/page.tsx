import { connection } from "next/server";

import { BooksPage } from "@/features/books/components/books-page";
import { getPublishedBooksFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

export default async function BooksRoute() {
    await connection();
    const books = await getPublishedBooksFromDatabase();
    return <BooksPage books={books} />;
}
