"use client";

import {
    useRouter,
} from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import type {
    NationalTestDifficulty,
    NationalTestSummary,
} from "@/features/national-certificate/model/national-test-types";

import {
    TEST_ROUTES,
} from "@/features/tests/model/test-navigation";

import styles from "./national-test-collection-page.module.css";

type NationalTestCollectionPageProps = {
    readonly categoryLabel: string;
    readonly title: string;
    readonly description: string;

    readonly collections:
        readonly NationalTestSummary[];
};

const difficultyLabels: Readonly<
    Record<
        NationalTestDifficulty,
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

function NationalTestCard({
                              collection,
                              onOpen,
                          }: {
    readonly collection:
        NationalTestSummary;

    readonly onOpen:
        (href: string) => void;
}) {
    const isPremium =
        collection.access ===
        "premium";

    return (
        <article
            className={[
                styles.card,
                !collection.isAvailable
                    ? styles.unavailableCard
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div
                className={
                    styles.cardTop
                }
            >
                <span
                    className={
                        styles.iconBox
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
                                ? styles.premiumBadge
                                : styles.freeBadge
                        }
                    >
                        {isPremium
                            ? "Premium"
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

                    <span>
                        <BookIcon />

                        {collection.topic ===
                        "gazal"
                            ? "1 ta g‘azal"
                            : collection.topic ===
                            "ilmiy-matn"
                                ? "1 ta ilmiy matn"
                                : collection.topic ===
                                "badiiy-matn"
                                    ? "1 ta badiiy matn"
                                    : collection.topic ===
                                    "diagnostika"
                                        ? "1 ta esse"
                                        : collection.topic ===
                                        "aralash"
                                            ? "Turli formatlar"
                                            : "5 ta mustaqil savol"}
                    </span>
                </div>
            </div>

            <button
                type="button"
                disabled={
                    !collection.isAvailable
                }
                aria-disabled={
                    !collection.isAvailable
                }
                onClick={() => {
                    if (
                        collection.isAvailable
                    ) {
                        onOpen(
                            collection.href,
                        );
                    }
                }}
            >
                {collection.isAvailable ? (
                    <>
                        {collection.topic ===
                        "diagnostika"
                            ? "Imtihonni ko‘rish"
                            : "Testni boshlash"}
                        <ArrowIcon />
                    </>
                ) : (
                    <>
                        Hozircha mavjud emas
                        <LockIcon />
                    </>
                )}
            </button>
        </article>
    );
}

export function NationalTestCollectionPage({
                                               categoryLabel,
                                               title,
                                               description,
                                               collections,
                                           }: NationalTestCollectionPageProps) {
    const router = useRouter();

    const availableCount =
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
                    <button
                        className={
                            styles.backButton
                        }
                        type="button"
                        aria-label="Orqaga qaytish"
                        onClick={() =>
                            router.replace(
                                TEST_ROUTES.testsHome,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

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
                        MILLIY SERTIFIKAT
                    </span>

                    <h1>
                        {title}
                    </h1>

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
                            {availableCount}{" "}
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
                    aria-labelledby="national-test-collections-title"
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

                            <h2 id="national-test-collections-title">
                                {title} testlari
                            </h2>
                        </div>

                        <p>
                            {collections[0]?.topic ===
                            "diagnostika"
                                ? "Har bir diagnostika to‘liq imtihon formatida tuzilgan."
                                : collections[0]?.topic ===
                                "aralash"
                                    ? "Har bir testda turli formatdagi topshiriqlar mavjud."
                                    : "Har bir testda 5 ta savol mavjud."}
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
                                <NationalTestCard
                                    key={
                                        collection.id
                                    }
                                    collection={
                                        collection
                                    }
                                    onOpen={(
                                        href,
                                    ) =>
                                        router.push(
                                            href,
                                        )
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