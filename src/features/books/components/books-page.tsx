"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";
import type {
    BookDefinition,
} from "@/features/books/model/book-types";

import {
    BookCoverPlaceholder,
} from "./book-cover-placeholder";
import styles from "./books-page.module.css";

type BooksPageProps = {
    readonly books: readonly BookDefinition[];
};

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

export function BooksPage({ books }: BooksPageProps) {
    const router = useRouter();

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <PendingNavigationButton mode="replace" href="/" aria-label="Bosh sahifaga qaytish" pendingText="">
                        ←
                    </PendingNavigationButton>
                    <div>
                        <span>TA’LIMOT KITOBLARI</span>
                        <strong>Kitoblar</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span>QO‘SHIMCHA MANBA</span>
                    <h1>Bilimingizni oshiradigan kitoblar</h1>
                    <p>
                        Milliy sertifikat uchun kerakli qo‘llanmani tanlang
                        va bilimingizni mustahkamlang.
                    </p>
                </section>

                <section className={styles.grid} aria-label="Kitoblar katalogi">
                    {books.map((book) => (
                        <article
                            key={book.id}
                            className={`${styles.card} ${styles[book.accent]}`}
                        >
                            <button
                                type="button"
                                className={styles.coverButton}
                                onClick={() =>
                                    router.push(`/kitoblar/${book.slug}`)
                                }
                                aria-label={`${book.title} kitobini ko‘rish`}
                            >
                                {book.coverImage ? (
                                    <span className={styles.coverMedia}>
                                        <Image
                                            src={book.coverImage}
                                            alt={book.coverImageAlt}
                                            fill
                                            sizes="(max-width: 599px) 100vw, 448px"
                                            style={{
                                                objectPosition:
                                                    book.imagePosition ?? "center",
                                            }}
                                        />
                                        <span
                                            className={styles.coverOverlay}
                                            aria-hidden="true"
                                        />
                                        <span className={styles.coverBadge}>
                                            {book.badge}
                                        </span>
                                    </span>
                                ) : (
                                    <BookCoverPlaceholder
                                        title={book.title}
                                        badge={book.badge}
                                    />
                                )}
                            </button>

                            <div className={styles.cardContent}>
                                <span className={styles.author}>{book.author}</span>
                                <h2>{book.title}</h2>
                                <p>{book.shortDescription}</p>

                                <div className={styles.priceRow}>
                                    <del>{formatPrice(book.sale.originalPrice)}</del>
                                    <strong>{formatPrice(book.sale.salePrice)}</strong>
                                </div>

                                <PendingNavigationButton
                                    mode="push"
                                    href={`/kitoblar/${book.slug}`}
                                    className={styles.primaryButton}
                                    pendingText="Ochilmoqda..."
                                >
                                    <span>Kitobni ko‘rish</span>
                                    <span aria-hidden="true">→</span>
                                </PendingNavigationButton>
                            </div>
                        </article>
                    ))}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}
