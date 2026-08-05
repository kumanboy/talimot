import {
    BooksPage,
} from "@/features/books/components/books-page";
import {
    getPublishedBooks,
} from "@/features/books/model/book-catalog";

export default function BooksRoute() {
    return <BooksPage books={getPublishedBooks()} />;
}
