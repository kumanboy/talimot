"use client";

import Image from "next/image";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import styles from "./book-showcase.module.css";

type BookAccent =
    | "grammar"
    | "essay"
    | "ghazal";

type Book = {
    id: string;
    badge: string;
    title: string;
    author: string;
    description: string;
    href: string;
    image: string;
    imageAlt: string;
    accent: BookAccent;
    imagePosition: string;
};

const books: readonly Book[] = [
    {
        id: "grammar-book",
        badge: "TO‘LIQ QO‘LLANMA",
        title: "Grammatika kitobi",
        author: "Sardor Toshmuhammadov",
        description:
            "Milliy sertifikat uchun grammatika qoidalari, tushuntirishlar va mavzuli mashqlar.",
        href: "/kitoblar/grammatika",
        image:
            "/images/home/books/grammar-book.png",
        imageAlt:
            "Milliy sertifikat uchun grammatika kitobi",
        accent: "grammar",
        imagePosition: "center 62%",
    },
    {
        id: "essay-book",
        badge: "YOZMA SAVODXONLIK",
        title: "Esse bo‘yicha qo‘llanma",
        author: "Sardor Toshmuhammadov",
        description:
            "Esse tuzilishi, dalillash, misollar va baholash mezonlari bo‘yicha amaliy qo‘llanma.",
        href: "/kitoblar/esse",
        image:
            "/images/home/books/essay-book.png",
        imageAlt:
            "Milliy sertifikat uchun esse bo‘yicha qo‘llanma",
        accent: "essay",
        imagePosition: "center 66%",
    },
    {
        id: "ghazal-book",
        badge: "MUMTOZ ADABIYOT",
        title: "G‘azal bo‘yicha qo‘llanma",
        author: "Sardor Toshmuhammadov",
        description:
            "Bayt mazmuni, mumtoz so‘zlar va she’riy san’atlarni tahlil qilish qo‘llanmasi.",
        href: "/kitoblar/gazal",
        image:
            "/images/home/books/ghazal-book.png",
        imageAlt:
            "Milliy sertifikat uchun g‘azal bo‘yicha qo‘llanma",
        accent: "ghazal",
        imagePosition: "center 65%",
    },
];

export function BookShowcase() {
    const router = useRouter();
    const carouselRef =
        useRef<HTMLDivElement>(null);

    const [activeIndex, setActiveIndex] =
        useState(0);

    const [isPaused, setIsPaused] =
        useState(false);

    const openBook = (href: string) => {
        router.push(href);
    };

    const scrollToBook = (
        index: number,
        behavior: ScrollBehavior = "smooth",
    ) => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const card = carousel.children.item(index);

        if (!(card instanceof HTMLElement)) {
            return;
        }

        carousel.scrollTo({
            left:
                card.offsetLeft -
                carousel.offsetLeft -
                16,
            behavior,
        });

        setActiveIndex(index);
    };

    useEffect(() => {
        if (isPaused) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((currentIndex) => {
                const nextIndex =
                    currentIndex === books.length - 1
                        ? 0
                        : currentIndex + 1;

                const carousel = carouselRef.current;

                if (carousel) {
                    const card =
                        carousel.children.item(nextIndex);

                    if (card instanceof HTMLElement) {
                        carousel.scrollTo({
                            left:
                                card.offsetLeft -
                                carousel.offsetLeft -
                                16,
                            behavior: "smooth",
                        });
                    }
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

        const cards = Array.from(
            carousel.children,
        ).filter(
            (child): child is HTMLElement =>
                child instanceof HTMLElement,
        );

        if (cards.length === 0) {
            return;
        }

        const carouselCenter =
            carousel.scrollLeft +
            carousel.clientWidth / 2;

        let nearestIndex = 0;
        let nearestDistance =
            Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const cardCenter =
                card.offsetLeft +
                card.offsetWidth / 2;

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

    const pauseAutoplay = () => {
        setIsPaused(true);
    };

    const resumeAutoplay = () => {
        window.setTimeout(() => {
            setIsPaused(false);
        }, 1200);
    };

    return (
        <section
            className={styles.section}
            aria-labelledby="books-heading"
        >
            <header className={styles.heading}>
                <span>QO‘SHIMCHA MANBA</span>

                <h2 id="books-heading">
                    Bilimingizni oshiradigan kitoblar
                </h2>

                <p>
                    Milliy sertifikat uchun kerakli
                    qo‘llanmani tanlang va bilimlaringizni
                    mustahkamlang.
                </p>
            </header>

            <div
                ref={carouselRef}
                className={styles.carousel}
                aria-label="Tavsiya etilgan kitoblar"
                onScroll={handleScroll}
                onPointerDown={pauseAutoplay}
                onPointerUp={resumeAutoplay}
                onPointerCancel={resumeAutoplay}
                onMouseEnter={pauseAutoplay}
                onMouseLeave={() =>
                    setIsPaused(false)
                }
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
                            onClick={() =>
                                openBook(book.href)
                            }
                        >
                            <Image
                                className={styles.coverImage}
                                src={book.image}
                                alt={book.imageAlt}
                                fill
                                sizes="(max-width: 599px) 76vw, 350px"
                                style={{
                                    objectPosition:
                                    book.imagePosition,
                                }}
                            />

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

                            <p>{book.description}</p>

                            <button
                                className={styles.actionButton}
                                type="button"
                                onClick={() =>
                                    openBook(book.href)
                                }
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