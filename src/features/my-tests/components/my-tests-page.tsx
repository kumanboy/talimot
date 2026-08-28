"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { RoadmapLegacyAttemptSync } from "@/features/roadmap/components/roadmap-legacy-attempt-sync";
import type {
    MyTestAttempt,
    MyTestLibraryItem,
    MyTestsLibraryData,
} from "@/features/my-tests/model/types";

import styles from "./my-tests-page.module.css";

type LibraryFilter = "all" | "purchased" | "completed";

const filterLabels: Readonly<Record<LibraryFilter, string>> = {
    all: "Barchasi",
    purchased: "Sotib olingan",
    completed: "Ishlangan",
};

const filters = ["all", "purchased", "completed"] as const satisfies readonly LibraryFilter[];

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

    if (hours > 0) {
        return `${hours} soat ${minutes} daq`;
    }

    if (minutes > 0) {
        return `${minutes} daq ${secs} son`;
    }

    return `${secs} son`;
}

function attemptScore(attempt: MyTestAttempt): string {
    if (attempt.score !== null && attempt.maximumScore !== null) {
        return `${attempt.score.toFixed(2).replace(/\.00$/, "")} / ${attempt.maximumScore.toFixed(2).replace(/\.00$/, "")}`;
    }

    const total = attempt.correctCount + attempt.incorrectCount + attempt.unansweredCount;
    if (total > 0) {
        return `${attempt.correctCount}/${total}`;
    }

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

function AttemptHistory({ item }: { readonly item: MyTestLibraryItem }) {
    if (item.attempts.length === 0) return null;

    return (
        <details className={styles.historyDetails}>
            <summary>
                <span className={styles.historySummaryIcon}><HistoryIcon /></span>
                <span>
                    <strong>Urinishlar tarixi</strong>
                    <small>{item.attemptCount} ta urinish</small>
                </span>
                <span className={styles.historyChevron}><ChevronIcon /></span>
            </summary>

            <div className={styles.historyList}>
                {item.attempts.map((attempt, index) => (
                    <article className={styles.historyItem} key={attempt.id}>
                        <div className={styles.historyIndex}>{item.attempts.length - index}</div>
                        <div className={styles.historyCopy}>
                            <strong>{attemptScore(attempt)}</strong>
                            <span>
                                {attempt.grade ? `Daraja ${attempt.grade} · ` : ""}
                                {attempt.percentage}%
                            </span>
                            <small>{formatDate(attempt.completedAt)} · {formatDuration(attempt.durationSeconds)}</small>
                        </div>
                        <Link href={`/mening-testlarim/urinish/${encodeURIComponent(attempt.id)}`}>
                            Ko‘rish
                        </Link>
                    </article>
                ))}
            </div>
        </details>
    );
}

function TestCard({ item }: { readonly item: MyTestLibraryItem }) {
    const latest = item.latestAttempt;
    const best = item.bestAttempt;
    const first = item.firstAttempt;

    return (
        <article className={styles.testCard}>
            <div className={styles.cardTopline}>
                <div className={styles.cardLabels}>
                    <span className={styles.categoryLabel}>{item.category}</span>
                    {item.purchased ? (
                        <span className={styles.purchasedBadge}><CheckIcon /> Sotib olingan</span>
                    ) : (
                        <span className={styles.freeBadge}>Bepul / ishlangan</span>
                    )}
                </div>
                {item.purchased && item.tangaPrice > 0 ? (
                    <span className={styles.priceBadge}>{item.tangaPrice} Tanga</span>
                ) : null}
            </div>

            <div className={styles.cardTitleRow}>
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
                <span className={styles.attemptPill}>{item.attemptCount} urinish</span>
            </div>

            {item.attemptCount > 0 ? (
                <div className={styles.scoreGrid}>
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
                <div className={styles.notStarted}>
                    <span className={styles.notStartedIcon}><PlayIcon /></span>
                    <div>
                        <strong>Test hali ishlanmagan</strong>
                        <p>Sotib olingan test sizning hisobingizda doimiy ochiq.</p>
                    </div>
                </div>
            )}

            <div className={styles.cardActions}>
                {item.available ? (
                    <Link className={styles.primaryAction} href={item.href}>
                        <PlayIcon />
                        {item.attemptCount > 0 ? "Yana ishlash" : "Testni boshlash"}
                    </Link>
                ) : (
                    <span className={styles.disabledAction}>Vaqtincha yopiq</span>
                )}

                {latest ? (
                    <Link className={styles.secondaryAction} href={`/mening-testlarim/urinish/${encodeURIComponent(latest.id)}`}>
                        So‘nggi natija
                    </Link>
                ) : null}
            </div>

            <AttemptHistory item={item} />
        </article>
    );
}

export function MyTestsPage({ data }: { readonly data: MyTestsLibraryData }) {
    const router = useRouter();
    const [filter, setFilter] = useState<LibraryFilter>("all");

    const filteredItems = useMemo(() => {
        if (filter === "purchased") return data.items.filter((item) => item.purchased);
        if (filter === "completed") return data.items.filter((item) => item.attemptCount > 0);
        return data.items;
    }, [data.items, filter]);

    return (
        <main className={styles.page}>
            <RoadmapLegacyAttemptSync />
            <div className={styles.content}>
                <header className={styles.header}>
                    <button type="button" aria-label="Orqaga" onClick={() => router.back()}>
                        <BackIcon />
                    </button>
                    <div>
                        <span>TA’LIMOT HISOBI</span>
                        <h1>Mening testlarim</h1>
                        <p>Sotib olingan testlar va barcha urinishlaringiz bir joyda.</p>
                    </div>
                </header>

                <section className={styles.summaryGrid}>
                    <article>
                        <span>Sotib olingan</span>
                        <strong>{data.purchasedCount}</strong>
                    </article>
                    <article>
                        <span>Ishlangan test</span>
                        <strong>{data.completedTestCount}</strong>
                    </article>
                    <article>
                        <span>Jami urinish</span>
                        <strong>{data.totalAttempts}</strong>
                    </article>
                    <article>
                        <span>Eng yaxshi</span>
                        <strong>{data.bestPercentage === null ? "—" : `${data.bestPercentage}%`}</strong>
                    </article>
                </section>

                <section className={styles.librarySection}>
                    <div className={styles.sectionHeading}>
                        <span>TEST KUTUBXONASI</span>
                        <h2>Testlaringiz</h2>
                    </div>

                    <div className={styles.filters} role="tablist" aria-label="Testlarni filtrlash">
                        {filters.map((item) => (
                            <button
                                key={item}
                                type="button"
                                role="tab"
                                aria-selected={filter === item}
                                className={filter === item ? styles.activeFilter : undefined}
                                onClick={() => setFilter(item)}
                            >
                                {filterLabels[item]}
                            </button>
                        ))}
                    </div>

                    {filteredItems.length > 0 ? (
                        <div className={styles.testList}>
                            {filteredItems.map((item) => <TestCard key={item.testId} item={item} />)}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span><HistoryIcon /></span>
                            <strong>Bu bo‘limda test yo‘q</strong>
                            <p>Testlarni ishlaganingiz yoki premium test sotib olganingizdan keyin ular shu yerda ko‘rinadi.</p>
                            <Link href="/tests">Testlarni ko‘rish</Link>
                        </div>
                    )}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}
