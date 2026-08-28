/**
 * Prefer lightweight WebP assets for legacy catalog records that may still
 * contain the original PNG paths in Postgres. Keeping this mapping at the UI
 * boundary avoids a database migration and makes the home screen much lighter.
 */
const optimizedImageByLegacyPath: Readonly<Record<string, string>> = {
    "/images/home/course-promotion.png": "/images/home/course-promotion.webp",
    "/images/home/books/grammar-book.png": "/images/home/books/grammar-book.webp",
    "/images/home/books/essay-book.png": "/images/home/books/essay-book.webp",
    "/images/home/books/ghazal-book.png": "/images/home/books/ghazal-book.webp",
};

export function preferOptimizedHomeImage(src: string): string {
    return optimizedImageByLegacyPath[src] ?? src;
}
