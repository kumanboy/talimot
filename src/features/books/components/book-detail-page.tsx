"use client";

import Image from "next/image";
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
import {
    BookSaleCountdown,
} from "./book-sale-countdown";
import styles from "./book-detail-page.module.css";

type BookDetailPageProps = {
    readonly book: BookDefinition;
};

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

export function BookDetailPage({ book }: BookDetailPageProps) {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <PendingNavigationButton mode="replace" href="/kitoblar" aria-label="Kitoblarga qaytish" pendingText="">
                        ←
                    </PendingNavigationButton>
                    <div>
                        <span>TA’LIMOT KITOBI</span>
                        <strong>{book.title}</strong>
                    </div>
                </header>

                <section className={styles.heroCard}>
                    {book.coverImage ? (
                        <div className={styles.coverMedia}>
                            <Image
                                src={book.coverImage}
                                alt={book.coverImageAlt}
                                fill
                                priority
                                sizes="(max-width: 599px) 100vw, 448px"
                                style={{
                                    objectPosition:
                                        book.imagePosition ?? "center",
                                }}
                            />
                            <div
                                className={styles.coverOverlay}
                                aria-hidden="true"
                            />
                            <span>{book.badge}</span>
                        </div>
                    ) : (
                        <BookCoverPlaceholder
                            title={book.title}
                            badge={book.badge}
                        />
                    )}

                    <div className={styles.heroContent}>
                        <span>{book.author}</span>
                        <h1>{book.title}</h1>
                        <p>{book.shortDescription}</p>

                        <div className={styles.priceBlock}>
                            <del>{formatPrice(book.sale.originalPrice)}</del>
                            <strong>{formatPrice(book.sale.salePrice)}</strong>
                        </div>

                        <BookSaleCountdown endsAt={book.sale.endsAt} />

                        <PendingNavigationButton
                            mode="push"
                            href={`/kitoblar/${book.slug}/sotib-olish`}
                            className={styles.purchaseButton}
                            pendingText="Ochilmoqda..."
                        >
                            Sotib olish
                            <span aria-hidden="true">→</span>
                        </PendingNavigationButton>
                    </div>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>KITOB HAQIDA</span>
                    <h2>Batafsil ma’lumot</h2>
                    {book.fullDescription.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </section>

                <section className={styles.infoGrid}>
                    <article><span>MUALLIF</span><strong>{book.author}</strong></article>
                    <article><span>FORMAT</span><strong>{book.formatLabel}</strong></article>
                    <article><span>SAHIFALAR</span><strong>{book.pageCount ?? "Ko‘rsatilmagan"}</strong></article>
                    <article><span>YETKAZIB BERISH</span><strong>{book.delivery.label}</strong></article>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>KITOB MAZMUNI</span>
                    <h2>Siz nimalarga ega bo‘lasiz?</h2>
                    <ul className={styles.features}>
                        {book.features.map((feature) => (
                            <li key={feature}>
                                <span aria-hidden="true">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>YETKAZIB BERISH</span>
                    <h2>BTS orqali yetkazib beramiz</h2>
                    <p>{book.delivery.description}</p>
                    <div className={styles.deliveryPrice}>
                        <span>Yetkazib berish narxi</span>
                        <strong>{formatPrice(book.delivery.price)}</strong>
                    </div>
                </section>
            </div>

            <div className={styles.stickyPurchase}>
                <div>
                    <del>{formatPrice(book.sale.originalPrice)}</del>
                    <strong>{formatPrice(book.sale.salePrice)}</strong>
                </div>
                <PendingNavigationButton
                    mode="push"
                    href={`/kitoblar/${book.slug}/sotib-olish`}
                    pendingText="Ochilmoqda..."
                >
                    Sotib olish
                </PendingNavigationButton>
            </div>

            <MobileNavigation />
        </main>
    );
}
