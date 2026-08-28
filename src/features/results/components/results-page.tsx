"use client";

import { useMemo, useState } from "react";

import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { PendingLink } from "@/components/ui/pending-link";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";
import { RoadmapLegacyAttemptSync } from "@/features/roadmap/components/roadmap-legacy-attempt-sync";
import { useResultsStorage } from "@/features/results/hooks/use-results-storage";
import type {
    MyTestAttempt,
    MyTestLibraryItem,
    MyTestsLibraryData,
} from "@/features/my-tests/model/types";

import styles from "./results-page.module.css";
import libraryStyles from "@/features/my-tests/components/my-tests-page.module.css";

type ResultFilter = "all" | "purchased" | "completed" | "best" | "recent";

const resultFilterLabels: Readonly<Record<ResultFilter, string>> = {
    all: "Barchasi",
    purchased: "Sotib olingan",
    completed: "Ishlangan",
    best: "Eng yaxshi",
    recent: "Oxirgi",
};

const resultFilters = [
    "all",
    "purchased",
    "completed",
    "best",
    "recent",
] as const satisfies readonly ResultFilter[];

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8 6H4.5v1.5A4.5 4.5 0 0 0 9 12M16 6h3.5v1.5A4.5 4.5 0 0 1 15 12M12 12.5V17M8.5 21h7M10 17h4v4h-4v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TargetIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 4.5v4.2h4.2M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 7 8 5-8 5V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ClipboardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

function formatShortDate(timestamp: number): string {
    return new Intl.DateTimeFormat("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(timestamp));
}

function formatDuration(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) return `${hours} soat ${minutes} daq`;
    if (minutes > 0) return `${minutes} daq ${secs} son`;
    return `${secs} son`;
}

function attemptScore(attempt: MyTestAttempt): string {
    if (attempt.score !== null && attempt.maximumScore !== null) {
        return `${attempt.score.toFixed(2).replace(/\.00$/, "")} / ${attempt.maximumScore.toFixed(2).replace(/\.00$/, "")}`;
    }

    const total = attempt.correctCount + attempt.incorrectCount + attempt.unansweredCount;
    if (total > 0) return `${attempt.correctCount}/${total}`;
    return `${attempt.percentage}%`;
}

function isDiagnostic(item: MyTestLibraryItem): boolean {
    return item.format === "diagnostic" || item.href.includes("/diagnostika/");
}

function scoreCaption(item: MyTestLibraryItem, attempt: MyTestAttempt | null): string {
    if (!attempt) return "—";
    if (isDiagnostic(item) && attempt.grade) {
        return `${attemptScore(attempt)} · ${attempt.grade}`;
    }
    return `${attemptScore(attempt)} · ${attempt.percentage}%`;
}

function scoreRatio(attempt: MyTestAttempt | null): number {
    if (!attempt) return -1;
    if (attempt.score !== null && attempt.maximumScore !== null && attempt.maximumScore > 0) {
        return attempt.score / attempt.maximumScore;
    }
    return attempt.percentage / 100;
}

function AttemptHistory({
    item,
    localAttemptIds,
}: {
    readonly item: MyTestLibraryItem;
    readonly localAttemptIds: ReadonlySet<string>;
}) {
    if (item.attempts.length === 0) return null;

    return (
        <details className={libraryStyles.historyDetails}>
            <summary>
                <span className={libraryStyles.historySummaryIcon}><HistoryIcon /></span>
                <span>
                    <strong>Urinishlar tarixi</strong>
                    <small>{item.attemptCount} ta urinish</small>
                </span>
                <span className={libraryStyles.historyChevron}><ChevronIcon /></span>
            </summary>

            <div className={libraryStyles.historyList}>
                {item.attempts.map((attempt, index) => (
                    <article className={libraryStyles.historyItem} key={attempt.id}>
                        <div className={libraryStyles.historyIndex}>{item.attempts.length - index}</div>
                        <div className={libraryStyles.historyCopy}>
                            <strong>{attemptScore(attempt)}</strong>
                            <span>
                                {attempt.grade ? `Daraja ${attempt.grade} · ` : ""}
                                {attempt.percentage}%
                            </span>
                            <small>{formatDate(attempt.completedAt)} · {formatDuration(attempt.durationSeconds)}</small>
                            <small>
                                To‘g‘ri {attempt.correctCount} · Noto‘g‘ri {attempt.incorrectCount} · Javobsiz {attempt.unansweredCount}
                            </small>
                            {attempt.certificateCode ? <small>Sertifikat ID: {attempt.certificateCode}</small> : null}
                        </div>
                        {isDiagnostic(item) ? (
                            <PendingLink href={`${item.href}/natija?attempt=${encodeURIComponent(attempt.id)}`} pendingText="Ochilmoqda...">
                                Ko‘rish
                            </PendingLink>
                        ) : localAttemptIds.has(attempt.id) ? (
                            <PendingLink href={`${item.href}?attempt=${encodeURIComponent(attempt.id)}`} pendingText="Ochilmoqda...">
                                Ko‘rish
                            </PendingLink>
                        ) : null}
                    </article>
                ))}
            </div>
        </details>
    );
}

function TestResultCard({
    item,
    localAttemptIds,
}: {
    readonly item: MyTestLibraryItem;
    readonly localAttemptIds: ReadonlySet<string>;
}) {
    const latest = item.latestAttempt;
    const best = item.bestAttempt;
    const first = item.firstAttempt;

    return (
        <article className={libraryStyles.testCard}>
            <div className={libraryStyles.cardTopline}>
                <div className={libraryStyles.cardLabels}>
                    <span className={libraryStyles.categoryLabel}>{item.category}</span>
                    {item.purchased ? (
                        <span className={libraryStyles.purchasedBadge}><CheckIcon /> Sotib olingan</span>
                    ) : item.attemptCount > 0 ? (
                        <span className={libraryStyles.freeBadge}>Bepul / ishlangan</span>
                    ) : null}
                </div>
                {item.purchased && item.tangaPrice > 0 ? (
                    <span className={libraryStyles.priceBadge}>{item.tangaPrice} Tanga</span>
                ) : null}
            </div>

            <div className={libraryStyles.cardTitleRow}>
                <div>
                    <h2>{item.title}</h2>
                    <p>
                        {item.attemptCount > 0
                            ? `Oxirgi urinish: ${formatShortDate(latest!.completedAt)}`
                            : item.purchasedAt
                                ? `Sotib olingan: ${formatShortDate(item.purchasedAt)}`
                                : "Hali ishlanmagan"}
                    </p>
                </div>
                <span className={libraryStyles.attemptPill}>{item.attemptCount} urinish</span>
            </div>

            {item.attemptCount > 0 ? (
                <div className={libraryStyles.scoreGrid}>
                    <div>
                        <span>Birinchi</span>
                        <strong>{scoreCaption(item, first)}</strong>
                    </div>
                    <div>
                        <span>Oxirgi</span>
                        <strong>{scoreCaption(item, latest)}</strong>
                    </div>
                    <div>
                        <span>Eng yaxshi</span>
                        <strong>{scoreCaption(item, best)}</strong>
                    </div>
                </div>
            ) : (
                <div className={libraryStyles.notStarted}>
                    <span className={libraryStyles.notStartedIcon}><PlayIcon /></span>
                    <div>
                        <strong>Test hali ishlanmagan</strong>
                        <p>Sotib olingan test hisobingizda doimiy ochiq.</p>
                    </div>
                </div>
            )}

            <div className={libraryStyles.cardActions}>
                {item.available ? (
                    <PendingLink className={libraryStyles.primaryAction} href={item.href} pendingText="Ochilmoqda...">
                        <PlayIcon />
                        {item.attemptCount > 0 ? "Yana ishlash" : "Testni boshlash"}
                    </PendingLink>
                ) : (
                    <span className={libraryStyles.disabledAction}>Vaqtincha yopiq</span>
                )}

                {latest && isDiagnostic(item) ? (
                    <PendingLink
                        className={libraryStyles.secondaryAction}
                        href={`${item.href}/natija?attempt=${encodeURIComponent(latest.id)}`}
                        pendingText="Ochilmoqda..."
                    >
                        So‘nggi natija
                    </PendingLink>
                ) : latest && localAttemptIds.has(latest.id) ? (
                    <PendingLink
                        className={libraryStyles.secondaryAction}
                        href={`${item.href}?attempt=${encodeURIComponent(latest.id)}`}
                        pendingText="Ochilmoqda..."
                    >
                        So‘nggi natija
                    </PendingLink>
                ) : null}
            </div>

            <AttemptHistory item={item} localAttemptIds={localAttemptIds} />
        </article>
    );
}

function EmptyState({ hasSearch }: { readonly hasSearch: boolean }) {
    return (
        <section className={styles.emptyState}>
            <span aria-hidden="true"><ClipboardIcon /></span>
            <h2>{hasSearch ? "Natija topilmadi" : "Hali natija yoki test yo‘q"}</h2>
            <p>
                {hasSearch
                    ? "Boshqa test yoki mavzu nomini qidirib ko‘ring."
                    : "Test ishlaganingiz yoki premium test sotib olganingizdan keyin u shu yerda ko‘rinadi."}
            </p>
            {!hasSearch ? <PendingLink className={styles.emptyLink} href="/tests" pendingText="Ochilmoqda...">Testlarni ko‘rish</PendingLink> : null}
        </section>
    );
}

export function ResultsPage({ data }: { readonly data: MyTestsLibraryData }) {
    const { attempts: localAttempts } = useResultsStorage();
    const [activeFilter, setActiveFilter] = useState<ResultFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const attempts = useMemo(
        () => data.items.flatMap((item) => item.attempts),
        [data.items],
    );

    const localAttemptIds = useMemo(
        () => new Set(localAttempts.map((attempt) => attempt.attemptId)),
        [localAttempts],
    );

    const statistics = useMemo(() => {
        const averageScore = attempts.length > 0
            ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length)
            : 0;

        return {
            averageScore,
            bestScore: data.bestPercentage ?? 0,
            totalAttempts: data.totalAttempts,
            purchasedCount: data.purchasedCount,
            completedTestCount: data.completedTestCount,
        };
    }, [attempts, data.bestPercentage, data.completedTestCount, data.purchasedCount, data.totalAttempts]);

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("uz");

    const filteredItems = useMemo(() => {
        let items = data.items.filter((item) => {
            if (!normalizedQuery) return true;
            return `${item.title} ${item.category}`
                .toLocaleLowerCase("uz")
                .includes(normalizedQuery);
        });

        if (activeFilter === "purchased") {
            items = items.filter((item) => item.purchased);
        } else if (activeFilter === "completed") {
            items = items.filter((item) => item.attemptCount > 0);
        } else if (activeFilter === "best") {
            items = [...items].sort(
                (firstItem, secondItem) => scoreRatio(secondItem.bestAttempt) - scoreRatio(firstItem.bestAttempt),
            );
        } else if (activeFilter === "recent") {
            items = [...items].sort((firstItem, secondItem) => secondItem.lastActivityAt - firstItem.lastActivityAt);
        }

        return items;
    }, [activeFilter, data.items, normalizedQuery]);

    return (
        <main className={styles.page}>
            <RoadmapLegacyAttemptSync />
            <div className={styles.backgroundGlow} aria-hidden="true" />

            <div className={styles.content}>
                <header className={styles.topBar}>
                    <PendingNavigationButton mode="back" aria-label="Orqaga qaytish" pendingText="">
                        <BackIcon />
                    </PendingNavigationButton>
                    <div>
                        <span>TA’LIMOT</span>
                        <strong>Natijalar</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span>NATIJALAR VA TESTLARIM</span>
                    <h1>Barcha testlaringiz bir joyda</h1>
                    <p>
                        Sotib olingan testlar, birinchi, oxirgi va eng yaxshi natijalar hamda barcha urinishlar tarixi.
                    </p>
                </section>

                <section className={styles.statisticsGrid} aria-label="Umumiy statistika">
                    <article className={styles.primaryStatistic}>
                        <span><TargetIcon /></span>
                        <small>O‘rtacha natija</small>
                        <strong>{statistics.averageScore}%</strong>
                        <p>Barcha yakunlangan urinishlar bo‘yicha</p>
                    </article>

                    <article>
                        <span><TrophyIcon /></span>
                        <small>Eng yaxshi</small>
                        <strong>{statistics.bestScore}%</strong>
                    </article>

                    <article>
                        <span><CheckIcon /></span>
                        <small>Sotib olingan</small>
                        <strong>{statistics.purchasedCount}</strong>
                    </article>

                    <article>
                        <span><HistoryIcon /></span>
                        <small>Jami urinish</small>
                        <strong>{statistics.totalAttempts}</strong>
                    </article>
                </section>

                <div className={styles.compactMeta}>
                    <span>Ishlangan testlar: <strong>{statistics.completedTestCount}</strong></span>
                    <span>Test kutubxonasi: <strong>{data.items.length}</strong></span>
                </div>

                <label className={styles.searchField}>
                    <span><SearchIcon /></span>
                    <input
                        type="search"
                        value={searchQuery}
                        placeholder="Test yoki natijani qidiring"
                        aria-label="Test yoki natijani qidiring"
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    {searchQuery ? (
                        <button type="button" aria-label="Qidiruvni tozalash" onClick={() => setSearchQuery("")}>×</button>
                    ) : null}
                </label>

                <div className={styles.filters} role="group" aria-label="Test va natijalarni saralash">
                    {resultFilters.map((filter) => {
                        const active = activeFilter === filter;
                        return (
                            <button
                                key={filter}
                                type="button"
                                className={active ? styles.activeFilter : undefined}
                                aria-pressed={active}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {resultFilterLabels[filter]}
                            </button>
                        );
                    })}
                </div>

                <section className={styles.historySection} aria-labelledby="result-history-title">
                    <header className={styles.sectionHeader}>
                        <div>
                            <span>01</span>
                            <h2 id="result-history-title">Testlar va natijalar</h2>
                        </div>
                        <p>{filteredItems.length} ta test</p>
                    </header>

                    {filteredItems.length > 0 ? (
                        <div className={libraryStyles.testList}>
                            {filteredItems.map((item) => (
                                <TestResultCard key={item.testId} item={item} localAttemptIds={localAttemptIds} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState hasSearch={Boolean(normalizedQuery) || activeFilter !== "all"} />
                    )}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}
