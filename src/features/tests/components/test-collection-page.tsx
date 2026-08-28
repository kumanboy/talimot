"use client";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import {
    TestPurchaseButton,
} from "@/features/tests/components/test-purchase-button";

import type {
    StandardTestDifficulty,
} from "@/features/tests/model/questions/types";

import type {
    StandardTestSummary,
} from "@/features/tests/model/test-summary";

import {
    TEST_ROUTES,
} from "@/features/tests/model/test-navigation";

import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import styles from "./test-collection-page.module.css";

type TestCollectionPageProps = {
    readonly title: string;
    readonly description: string;
    readonly categoryLabel: string;
    readonly collections:
        readonly StandardTestSummary[];
};

const difficultyLabels: Readonly<
    Record<
        StandardTestDifficulty,
        string
    >
> = {
    easy: "Oson",
    medium: "O‘rta",
    hard: "Murakkab",
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

function QuestionsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M8 8h8M8 12h6M8 16h4"
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
                d="M5 12h14M14 7l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TestCollectionCard({
                                collection,
                            }: {
    readonly collection:
        StandardTestSummary;
}) {
    const isPremium =
        collection.access ===
        "premium";

    const cardClassName = [
        styles.card,
        !collection.isAvailable
            ? styles.unavailableCard
            : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <article
            className={cardClassName}
        >
            <div
                className={
                    styles.cardTop
                }
            >
                <div
                    className={
                        styles.iconBox
                    }
                >
                    {collection.isAvailable ? (
                        <QuestionsIcon />
                    ) : (
                        <LockIcon />
                    )}
                </div>

                <div
                    className={
                        styles.badges
                    }
                >
                    <span
                        className={[
                            styles.difficultyBadge,
                            styles[
                                collection
                                    .difficulty
                                ],
                        ].join(" ")}
                    >
                        {
                            difficultyLabels[
                                collection
                                    .difficulty
                                ]
                        }
                    </span>

                    <span
                        className={
                            isPremium
                                ? collection.isPurchased
                                    ? styles.purchasedBadge
                                    : styles.premiumBadge
                                : styles.freeBadge
                        }
                    >
                        {isPremium
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
                <h2>
                    {collection.title}
                </h2>

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
                    disabled
                    aria-disabled="true"
                >
                    Hozircha mavjud emas
                    <LockIcon />
                </button>
            ) : isPremium && !collection.isPurchased ? (
                <TestPurchaseButton
                    testId={collection.id}
                    title={collection.title}
                    href={collection.href}
                    price={collection.tangaPrice}
                >
                    Sotib olish · {collection.tangaPrice} Tanga
                    <LockIcon />
                </TestPurchaseButton>
            ) : (
                <PendingNavigationButton
                    mode="push"
                    href={collection.href}
                    pendingText="Test ochilmoqda..."
                >
                    Testni boshlash
                    <ArrowIcon />
                </PendingNavigationButton>
            )}
        </article>
    );
}

export function TestCollectionPage({
                                       title,
                                       description,
                                       categoryLabel,
                                       collections,
                                   }: TestCollectionPageProps) {
    const availableTestsCount =
        collections.filter(
            (collection) =>
                collection.isAvailable,
        ).length;

    const totalQuestions =
        collections.reduce(
            (
                total,
                collection,
            ) =>
                total +
                collection.questionCount,
            0,
        );

    return (
        <main
            className={styles.page}
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
                        href={TEST_ROUTES.testsHome}
                        className={styles.backButton}
                        aria-label="Orqaga qaytish"
                        pendingText=""
                    >
                        <BackIcon />
                    </PendingNavigationButton>

                    <div>
                        <span>
                            {categoryLabel}
                        </span>

                        <strong>
                            {title}
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.hero
                    }
                >
                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        MAVZU TESTLARI
                    </span>

                    <h1>{title}</h1>

                    <p>
                        {description}
                    </p>

                    <div
                        className={
                            styles.summary
                        }
                    >
                        <span>
                            {
                                collections.length
                            }{" "}
                            ta test
                        </span>

                        <span>
                            {
                                availableTestsCount
                            }{" "}
                            ta mavjud
                        </span>

                        <span>
                            {totalQuestions}{" "}
                            ta savol
                        </span>
                    </div>
                </section>

                <section
                    className={
                        styles.collectionSection
                    }
                    aria-labelledby="test-collections-title"
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

                            <h2 id="test-collections-title">
                                Test
                                to‘plamlari
                            </h2>
                        </div>

                        <p>
                            Oson
                            testlardan
                            boshlang va
                            bosqichma-bosqich
                            murakkab
                            savollarga
                            o‘ting.
                        </p>
                    </header>

                    <div
                        className={
                            styles.collectionGrid
                        }
                    >
                        {collections.map(
                            (
                                collection,
                            ) => (
                                <TestCollectionCard
                                    key={
                                        collection.id
                                    }
                                    collection={
                                        collection
                                    }
                                />
                            ),
                        )}
                    </div>
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}