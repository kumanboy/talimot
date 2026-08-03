"use client";

import {
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import { MobileNavigation } from "@/features/home/components/mobile-navigation";

import { useResultsStorage } from "@/features/results/hooks/use-results-storage";

import type {
    StoredCompletedTest,
} from "@/features/tests/model/test-progress-storage";

import styles from "./results-page.module.css";

type ResultFilter =
    | "all"
    | "best"
    | "recent";

const resultFilterLabels: Readonly<
    Record<ResultFilter, string>
> = {
    all: "Barchasi",
    best: "Eng yaxshi",
    recent: "Oxirgi",
};

const resultFilters = [
    "all",
    "best",
    "recent",
] as const satisfies readonly ResultFilter[];

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

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

            <path
                d="M8 6H4.5v1.5A4.5 4.5 0 0 0 9 12M16 6h3.5v1.5A4.5 4.5 0 0 1 15 12M12 12.5V17M8.5 21h7M10 17h4v4h-4v-4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TargetIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <circle
                cx="12"
                cy="12"
                r="1.3"
                fill="currentColor"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M4 4v4.5h4.5M12 7.5V12l3 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ClipboardIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function formatDuration(
    totalSeconds: number,
) {
    const safeSeconds =
        Math.max(
            0,
            Math.floor(totalSeconds),
        );

    const hours = Math.floor(
        safeSeconds / 3600,
    );

    const minutes = Math.floor(
        (safeSeconds % 3600) / 60,
    );

    const seconds =
        safeSeconds % 60;

    const paddedMinutes =
        String(minutes).padStart(
            2,
            "0",
        );

    const paddedSeconds =
        String(seconds).padStart(
            2,
            "0",
        );

    if (hours > 0) {
        return `${String(hours).padStart(
            2,
            "0",
        )}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${paddedMinutes}:${paddedSeconds}`;
}

function formatAttemptDate(
    timestamp: number,
) {
    return new Intl.DateTimeFormat(
        "uz-UZ",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(timestamp),
    );
}

function getScoreLabel(
    percentage: number,
) {
    if (percentage >= 90) {
        return "Ajoyib";
    }

    if (percentage >= 75) {
        return "Juda yaxshi";
    }

    if (percentage >= 60) {
        return "Yaxshi";
    }

    return "Mashq kerak";
}

function getScoreLevel(
    percentage: number,
) {
    if (percentage >= 80) {
        return "high";
    }

    if (percentage >= 60) {
        return "medium";
    }

    return "low";
}

function ResultCard({
                        attempt,
                        onOpen,
                        onRetry,
                    }: {
    attempt: StoredCompletedTest;
    onOpen: (
        attempt: StoredCompletedTest,
    ) => void;
    onRetry: (
        attempt: StoredCompletedTest,
    ) => void;
}) {
    const scoreLevel =
        getScoreLevel(
            attempt.percentage,
        );

    return (
        <article
            className={
                styles.resultCard
            }
        >
            <div
                className={
                    styles.cardHeader
                }
            >
                <div>
          <span>
            {
                attempt.metadata
                    .category
            }
          </span>

                    <h3>
                        {attempt.metadata.title}
                    </h3>
                </div>

                <div
                    className={[
                        styles.scoreBadge,
                        styles[
                            `${scoreLevel}Score`
                            ],
                    ].join(" ")}
                >
                    <strong>
                        {attempt.percentage}%
                    </strong>

                    <small>
                        {getScoreLabel(
                            attempt.percentage,
                        )}
                    </small>
                </div>
            </div>

            <div
                className={
                    styles.cardStats
                }
            >
                <div>
                    <strong>
                        {attempt.correctCount}
                    </strong>

                    <span>
            To‘g‘ri
          </span>
                </div>

                <div>
                    <strong>
                        {
                            attempt.incorrectCount
                        }
                    </strong>

                    <span>
            Noto‘g‘ri
          </span>
                </div>

                <div>
                    <strong>
                        {
                            attempt.unansweredCount
                        }
                    </strong>

                    <span>
            Javobsiz
          </span>
                </div>
            </div>

            {typeof attempt.score ===
            "number" &&
            typeof attempt.maximumScore ===
            "number" ? (
                <div
                    className={
                        styles.scoredResult
                    }
                >
                    <span>
                        To‘plangan ball
                    </span>

                    <strong>
                        {attempt.score} /{" "}
                        {
                            attempt.maximumScore
                        }
                    </strong>
                </div>
            ) : null}

            <div
                className={
                    styles.cardMeta
                }
            >
        <span>
          {formatAttemptDate(
              attempt.completedAt,
          )}
        </span>

                <span>
          {formatDuration(
              attempt.durationSeconds,
          )}
        </span>
            </div>

            <div
                className={
                    styles.cardActions
                }
            >
                <button
                    type="button"
                    onClick={() =>
                        onOpen(attempt)
                    }
                >
                    Natijani ko‘rish
                    <ArrowIcon />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onRetry(attempt)
                    }
                >
                    Qayta ishlash
                </button>
            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <section
            className={
                styles.loadingState
            }
            role="status"
            aria-live="polite"
        >
      <span
          className={
              styles.loadingSpinner
          }
          aria-hidden="true"
      />

            <p>
                Natijalar yuklanmoqda...
            </p>
        </section>
    );
}

function EmptyState({
                        hasSearch,
                        onOpenTests,
                    }: {
    hasSearch: boolean;
    onOpenTests: () => void;
}) {
    return (
        <section
            className={
                styles.emptyState
            }
        >
      <span aria-hidden="true">
        <ClipboardIcon />
      </span>

            <h2>
                {hasSearch
                    ? "Natija topilmadi"
                    : "Hali natija yo‘q"}
            </h2>

            <p>
                {hasSearch
                    ? "Boshqa test yoki mavzu nomini qidirib ko‘ring."
                    : "Birinchi testni yakunlaganingizdan so‘ng natijangiz shu yerda ko‘rinadi."}
            </p>

            {!hasSearch ? (
                <button
                    type="button"
                    onClick={onOpenTests}
                >
                    Testlarni boshlash
                </button>
            ) : null}
        </section>
    );
}

export function ResultsPage() {
    const router = useRouter();

    const {
        attempts,
        isLoaded,
    } = useResultsStorage();

    const [
        activeFilter,
        setActiveFilter,
    ] =
        useState<ResultFilter>(
            "all",
        );

    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");

    const normalizedQuery =
        searchQuery
            .trim()
            .toLocaleLowerCase("uz");

    const statistics =
        useMemo(() => {
            if (
                attempts.length === 0
            ) {
                return {
                    averageScore: 0,
                    bestScore: 0,
                    correctAnswers: 0,
                    totalAttempts: 0,
                };
            }

            const totalScore =
                attempts.reduce(
                    (
                        sum,
                        attempt,
                    ) =>
                        sum +
                        attempt.percentage,
                    0,
                );

            const correctAnswers =
                attempts.reduce(
                    (
                        sum,
                        attempt,
                    ) =>
                        sum +
                        attempt.correctCount,
                    0,
                );

            const bestScore =
                Math.max(
                    ...attempts.map(
                        (attempt) =>
                            attempt.percentage,
                    ),
                );

            return {
                averageScore:
                    Math.round(
                        totalScore /
                        attempts.length,
                    ),
                bestScore,
                correctAnswers,
                totalAttempts:
                attempts.length,
            };
        }, [attempts]);

    const filteredAttempts =
        useMemo(() => {
            const searched =
                attempts.filter(
                    (attempt) => {
                        if (
                            !normalizedQuery
                        ) {
                            return true;
                        }

                        return `${attempt.metadata.title} ${attempt.metadata.category}`
                            .toLocaleLowerCase(
                                "uz",
                            )
                            .includes(
                                normalizedQuery,
                            );
                    },
                );

            if (
                activeFilter === "best"
            ) {
                return [...searched].sort(
                    (first, second) =>
                        second.percentage -
                        first.percentage ||
                        second.completedAt -
                        first.completedAt,
                );
            }

            if (
                activeFilter === "recent"
            ) {
                const sevenDaysAgo =
                    Date.now() -
                    7 *
                    24 *
                    60 *
                    60 *
                    1000;

                return searched.filter(
                    (attempt) =>
                        attempt.completedAt >=
                        sevenDaysAgo,
                );
            }

            return searched;
        }, [
            activeFilter,
            attempts,
            normalizedQuery,
        ]);

    const openAttempt = (
        attempt: StoredCompletedTest,
    ) => {
        router.push(
            `${attempt.metadata.href}?attempt=${encodeURIComponent(
                attempt.attemptId,
            )}`,
        );
    };

    const retryAttempt = (
        attempt: StoredCompletedTest,
    ) => {
        router.push(
            attempt.metadata.href,
        );
    };

    return (
        <main className={styles.page}>
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
                        type="button"
                        aria-label="Orqaga qaytish"
                        onClick={() =>
                            router.back()
                        }
                    >
                        <BackIcon />
                    </button>

                    <div>
            <span>
              TA’LIMOT
            </span>

                        <strong>
                            Natijalar
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.hero
                    }
                >
          <span>
            TESTLAR TARIXI
          </span>

                    <h1>
                        Natijalaringizni
                        kuzatib boring
                    </h1>

                    <p>
                        Har bir urinish,
                        o‘rtacha ball va eng
                        yaxshi natijangiz bir
                        joyda.
                    </p>
                </section>

                <section
                    className={
                        styles.statisticsGrid
                    }
                    aria-label="Umumiy statistika"
                >
                    <article
                        className={
                            styles.primaryStatistic
                        }
                    >
            <span>
              <TargetIcon />
            </span>

                        <small>
                            O‘rtacha natija
                        </small>

                        <strong>
                            {
                                statistics.averageScore
                            }
                            %
                        </strong>

                        <p>
                            Barcha yakunlangan
                            testlar bo‘yicha
                        </p>
                    </article>

                    <article>
            <span>
              <TrophyIcon />
            </span>

                        <small>
                            Eng yaxshi
                        </small>

                        <strong>
                            {statistics.bestScore}%
                        </strong>
                    </article>

                    <article>
            <span>
              <HistoryIcon />
            </span>

                        <small>
                            Urinishlar
                        </small>

                        <strong>
                            {
                                statistics.totalAttempts
                            }
                        </strong>
                    </article>

                    <article>
            <span>
              <CheckIcon />
            </span>

                        <small>
                            To‘g‘ri javob
                        </small>

                        <strong>
                            {
                                statistics.correctAnswers
                            }
                        </strong>
                    </article>
                </section>

                <label
                    className={
                        styles.searchField
                    }
                >
          <span>
            <SearchIcon />
          </span>

                    <input
                        type="search"
                        value={searchQuery}
                        placeholder="Natijani qidiring"
                        aria-label="Natijani qidiring"
                        onChange={(event) =>
                            setSearchQuery(
                                event.target.value,
                            )
                        }
                    />

                    {searchQuery ? (
                        <button
                            type="button"
                            aria-label="Qidiruvni tozalash"
                            onClick={() =>
                                setSearchQuery("")
                            }
                        >
                            ×
                        </button>
                    ) : null}
                </label>

                <div
                    className={
                        styles.filters
                    }
                    role="group"
                    aria-label="Natijalarni saralash"
                >
                    {resultFilters.map(
                        (filter) => {
                            const active =
                                activeFilter ===
                                filter;

                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    className={
                                        active
                                            ? styles.activeFilter
                                            : undefined
                                    }
                                    aria-pressed={
                                        active
                                    }
                                    onClick={() =>
                                        setActiveFilter(
                                            filter,
                                        )
                                    }
                                >
                                    {
                                        resultFilterLabels[
                                            filter
                                            ]
                                    }
                                </button>
                            );
                        },
                    )}
                </div>

                <section
                    className={
                        styles.historySection
                    }
                    aria-labelledby="result-history-title"
                >
                    <header
                        className={
                            styles.sectionHeader
                        }
                    >
                        <div>
                            <span>01</span>

                            <h2 id="result-history-title">
                                Testlar tarixi
                            </h2>
                        </div>

                        <p>
                            {filteredAttempts.length} ta
                            natija
                        </p>
                    </header>

                    {!isLoaded ? (
                        <LoadingState />
                    ) : filteredAttempts.length >
                    0 ? (
                        <div
                            className={
                                styles.resultsList
                            }
                        >
                            {filteredAttempts.map(
                                (attempt) => (
                                    <ResultCard
                                        key={
                                            attempt.attemptId
                                        }
                                        attempt={
                                            attempt
                                        }
                                        onOpen={
                                            openAttempt
                                        }
                                        onRetry={
                                            retryAttempt
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            hasSearch={
                                Boolean(
                                    normalizedQuery,
                                ) ||
                                activeFilter ===
                                "recent"
                            }
                            onOpenTests={() =>
                                router.push(
                                    "/tests",
                                )
                            }
                        />
                    )}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}