"use client";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import type {
    MorphologyCategory,
} from "@/features/tests/model/morphology-categories";

import styles from "./morphology-page.module.css";

function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MorphologyIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="5"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <circle
                cx="6"
                cy="18"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <circle
                cx="18"
                cy="18"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M12 7.5v4.5M12 12 7.5 16M12 12l4.5 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M8 10V7.5a4 4 0 0 1 8 0V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 12h14m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface MorphologyPageClientProps {
    readonly categories:
        readonly MorphologyCategory[];
}

export function MorphologyPageClient({
    categories,
}: MorphologyPageClientProps) {
    return (
        <main
            className={
                styles.page
            }
        >
            <div
                className={
                    styles.backgroundGlow
                }
                aria-hidden="true"
            />

            <div
                className={
                    styles.content
                }
            >
                <header
                    className={
                        styles.topBar
                    }
                >
                    <PendingNavigationButton
                        mode="replace"
                        href="/tests"
                        aria-label="Grammatika testlariga qaytish"
                        pendingText=""
                    >
                        <BackIcon />
                    </PendingNavigationButton>

                    <div>
                        <span>
                            Grammatika
                        </span>

                        <strong>
                            Morfologiya
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.hero
                    }
                >
                    <span>
                        SO‘Z TURKUMLARI
                    </span>

                    <h1>
                        Morfologiya
                    </h1>

                    <p>
                        Kerakli so‘z turkumini
                        tanlang va shu bo‘limga
                        oid testlar orqali
                        bilimingizni
                        mustahkamlang.
                    </p>
                </section>

                <section
                    className={
                        styles.section
                    }
                >
                    <header
                        className={
                            styles.sectionHeader
                        }
                    >
                        <div>
                            <span>
                                01
                            </span>

                            <h2>
                                Bo‘limlar
                            </h2>
                        </div>

                        <p>
                            Morfologiya mavzusining
                            ichki bo‘limlari.
                        </p>
                    </header>

                    <div
                        className={
                            styles.categoryList
                        }
                    >
                        {categories.map(
                            (
                                category,
                            ) => (
                                <PendingNavigationButton
                                    key={category.id}
                                    mode="push"
                                    href={category.href}
                                    pendingText="Bo‘lim ochilmoqda..."
                                    className={[
                                        styles.categoryCard,
                                        category.featured
                                            ? styles.featuredCard
                                            : "",
                                        !category.isAvailable
                                            ? styles.unavailableCard
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    disabled={!category.isAvailable}
                                >
                                    <span
                                        className={
                                            styles.categoryIcon
                                        }
                                    >
                                        {category.isAvailable ? (
                                            <MorphologyIcon />
                                        ) : (
                                            <LockIcon />
                                        )}
                                    </span>

                                    <span
                                        className={
                                            styles.categoryContent
                                        }
                                    >
                                        <span
                                            className={
                                                styles.titleRow
                                            }
                                        >
                                            <strong>
                                                {
                                                    category.title
                                                }
                                            </strong>

                                            {category.featured ? (
                                                <small>
                                                    Tavsiya
                                                </small>
                                            ) : null}
                                        </span>

                                        <span
                                            className={
                                                styles.description
                                            }
                                        >
                                            {
                                                category.description
                                            }
                                        </span>

                                        <span
                                            className={
                                                styles.meta
                                            }
                                        >
                                            {
                                                category.itemCountLabel
                                            }
                                        </span>
                                    </span>

                                    <span
                                        className={
                                            styles.arrow
                                        }
                                        aria-hidden="true"
                                    >
                                        {category.isAvailable ? (
                                            <ArrowIcon />
                                        ) : (
                                            <LockIcon />
                                        )}
                                    </span>
                                </PendingNavigationButton>
                            ),
                        )}
                    </div>
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}