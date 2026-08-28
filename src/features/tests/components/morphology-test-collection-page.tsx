"use client";

import type {
    MorphologyCategory,
} from "@/features/tests/model/morphology-categories";

import type {
    MorphologyTestCollection,
} from "@/features/tests/model/morphology-test-collections";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import {
    TestPurchaseButton,
} from "@/features/tests/components/test-purchase-button";

import {
    TEST_ROUTES,
} from "@/features/tests/model/test-navigation";

import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import styles from "./morphology-test-collection-page.module.css";

type MorphologyTestCollectionPageProps = {
    readonly category:
        MorphologyCategory;

    readonly collections:
        readonly MorphologyTestCollection[];
};

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

function BookIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M12 7A7 7 0 0 0 5 4v14a7 7 0 0 1 7 2V7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

            <path
                d="M12 7a7 7 0 0 1 7-3v14a7 7 0 0 0-7 2V7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
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

function ClockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M12 7v5l3 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function QuestionsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M9 8h6M9 12h6M9 16h3"
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

function getDifficultyLabel(
    difficulty:
    MorphologyTestCollection["difficulty"],
): string {
    if (
        difficulty ===
        "easy"
    ) {
        return "Oson";
    }

    if (
        difficulty ===
        "hard"
    ) {
        return "Murakkab";
    }

    return "O‘rta";
}

export function MorphologyTestCollectionPage({
                                                 category,
                                                 collections,
                                             }: MorphologyTestCollectionPageProps) {
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
                        href={TEST_ROUTES.morphologyHome}
                        aria-label="Morfologiya bo‘limlariga qaytish"
                        pendingText=""
                    >
                        <BackIcon />
                    </PendingNavigationButton>

                    <div>
                        <span>
                            Morfologiya
                        </span>

                        <strong>
                            {category.title}
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.hero
                    }
                >
                    <span>
                        SO‘Z TURKUMI
                    </span>

                    <h1>
                        {category.title}
                    </h1>

                    <p>
                        {category.description}
                    </p>
                </section>

                <section>
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
                                Testlar
                            </h2>
                        </div>

                        <p>
                            Tanlangan bo‘limga
                            oid test to‘plamlari.
                        </p>
                    </header>

                    {collections.length >
                    0 ? (
                        <div
                            className={
                                styles.list
                            }
                        >
                            {collections.map(
                                (
                                    collection,
                                ) => (
                                    <article
                                        key={
                                            collection.id
                                        }
                                        className={[
                                            styles.card,
                                            !collection.isAvailable
                                                ? styles.unavailableCard
                                                : "",
                                        ]
                                            .filter(
                                                Boolean,
                                            )
                                            .join(
                                                " ",
                                            )}
                                    >
                                        <div
                                            className={
                                                styles.cardTop
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.cardIcon
                                                }
                                            >
                                                {collection.isAvailable ? (
                                                    <BookIcon />
                                                ) : (
                                                    <LockIcon />
                                                )}
                                            </span>

                                            <div
                                                className={
                                                    styles.badges
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.difficultyBadge
                                                    }
                                                >
                                                    {getDifficultyLabel(
                                                        collection.difficulty,
                                                    )}
                                                </span>

                                                <span
                                                    className={
                                                        collection.access === "premium"
                                                            ? collection.isPurchased
                                                                ? styles.purchasedBadge
                                                                : styles.premiumBadge
                                                            : styles.freeBadge
                                                    }
                                                >
                                                    {collection.access === "premium"
                                                        ? collection.isPurchased
                                                            ? "Sotib olingan"
                                                            : `${collection.tangaPrice} Tanga`
                                                        : "Bepul"}
                                                </span>

                                                {!collection.isAvailable ? (
                                                    <span
                                                        className={
                                                            styles.soonBadge
                                                        }
                                                    >
                                                        Tez orada
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div
                                            className={
                                                styles.cardContent
                                            }
                                        >
                                            <h3>
                                                {
                                                    collection.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    collection.description
                                                }
                                            </p>

                                            <div
                                                className={
                                                    styles.meta
                                                }
                                            >
                                                <span>
                                                    <QuestionsIcon />

                                                    {
                                                        collection.questionCount
                                                    }{" "}
                                                    ta savol
                                                </span>

                                                <span>
                                                    <ClockIcon />

                                                    {
                                                        collection.estimatedMinutes
                                                    }{" "}
                                                    daqiqa
                                                </span>
                                            </div>
                                        </div>

                                        {!collection.isAvailable ? (
                                            <button
                                                type="button"
                                                className={styles.openButton}
                                                disabled
                                            >
                                                Tez orada
                                                <LockIcon />
                                            </button>
                                        ) : collection.access === "premium" && !collection.isPurchased ? (
                                            <TestPurchaseButton
                                                testId={collection.id}
                                                title={collection.title}
                                                href={collection.href}
                                                price={collection.tangaPrice}
                                                className={styles.openButton}
                                            >
                                                Sotib olish · {collection.tangaPrice} Tanga
                                                <LockIcon />
                                            </TestPurchaseButton>
                                        ) : (
                                            <PendingNavigationButton
                                                mode="push"
                                                href={collection.href}
                                                className={styles.openButton}
                                                pendingText="Test ochilmoqda..."
                                            >
                                                Testni boshlash
                                                <ArrowIcon />
                                            </PendingNavigationButton>
                                        )}
                                    </article>
                                ),
                            )}
                        </div>
                    ) : (
                        <section
                            className={
                                styles.emptyState
                            }
                        >
                            <span
                                aria-hidden="true"
                            >
                                <BookIcon />
                            </span>

                            <h2>
                                Testlar hali
                                qo‘shilmagan
                            </h2>

                            <p>
                                Ushbu Morfologiya
                                bo‘limiga oid
                                testlar tez orada
                                joylanadi.
                            </p>
                        </section>
                    )}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}