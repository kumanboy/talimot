"use client";

import Image from "next/image";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import {
    getPublishedBooks,
} from "@/features/books/model/book-catalog";

import styles from "./book-showcase.module.css";

const books = getPublishedBooks();

export function BookShowcase() {
    const router = useRouter();
    const carouselRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const openBook = (slug: string) => {
        router.push(`/kitoblar/${slug}`);
    };

    useEffect(() => {
        if (isPaused || books.length < 2) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((currentIndex) => {
                const nextIndex =
                    currentIndex === books.length - 1
                        ? 0
                        : currentIndex + 1;

                const carousel = carouselRef.current;
                const card = carousel?.children.item(nextIndex);

                if (carousel && card instanceof HTMLElement) {
                    carousel.scrollTo({
                        left:
                            card.offsetLeft -
                            carousel.offsetLeft -
                            16,
                        behavior: "smooth",
                    });
                }

                return nextIndex;
            });
        }, 4000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isPaused]);

    const handleScroll = () => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const cards = Array.from(carousel.children).filter(
            (child): child is HTMLElement =>
                child instanceof HTMLElement,
        );

        if (cards.length === 0) {
            return;
        }

        const carouselCenter =
            carousel.scrollLeft + carousel.clientWidth / 2;

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const cardCenter =
                card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(
                carouselCenter - cardCenter,
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        setActiveIndex(nearestIndex);
    };

    return (
        <section
            className={styles.section}
            aria-labelledby="books-heading"
        >
            <header className={styles.heading}>
                <div>
                    <span>QO‘SHIMCHA MANBA</span>
                    <h2 id="books-heading">
                        Bilimingizni oshiradigan kitoblar
                    </h2>
                    <p>
                        Milliy sertifikat uchun kerakli
                        qo‘llanmani tanlang va bilimlaringizni
                        mustahkamlang.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/kitoblar")}
                >
                    Barchasi
                    <span aria-hidden="true">→</span>
                </button>
            </header>

            <div
                ref={carouselRef}
                className={styles.carousel}
                aria-label="Tavsiya etilgan kitoblar"
                onScroll={handleScroll}
                onPointerDown={() => setIsPaused(true)}
                onPointerUp={() => setIsPaused(false)}
                onPointerCancel={() => setIsPaused(false)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {books.map((book, index) => (
                    <article
                        key={book.id}
                        className={[
                            styles.card,
                            styles[book.accent],
                            index === activeIndex
                                ? styles.activeCard
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <button
                            className={styles.coverButton}
                            type="button"
                            aria-label={`${book.title} haqida batafsil`}
                            onClick={() => openBook(book.slug)}
                        >
                            {book.coverImage ? (
                                <Image
                                    className={styles.coverImage}
                                    src={book.coverImage}
                                    alt={book.coverImageAlt}
                                    fill
                                    sizes="(max-width: 599px) 76vw, 350px"
                                    style={{
                                        objectPosition:
                                            book.imagePosition ?? "center",
                                    }}
                                />
                            ) : null}

                            <div
                                className={styles.coverOverlay}
                                aria-hidden="true"
                            />

                            <span className={styles.coverBadge}>
                                {book.badge}
                            </span>

                            <span
                                className={styles.coverArrow}
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </button>

                        <div className={styles.content}>
                            <h3>{book.title}</h3>
                            <span className={styles.author}>
                                {book.author}
                            </span>
                            <p>{book.shortDescription}</p>

                            <button
                                className={styles.actionButton}
                                type="button"
                                onClick={() => openBook(book.slug)}
                            >
                                <span>Kitobni ko‘rish</span>
                                <span
                                    className={styles.actionIcon}
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
