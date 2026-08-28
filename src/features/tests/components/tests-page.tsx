"use client";

import {
    useMemo,
    useState,
} from "react";

import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import { useTestDashboardStorage } from "@/features/tests/hooks/use-test-dashboard-storage";

import {
    testDashboardTabLabels,
} from "@/features/tests/model/test-dashboard";

import type {
    TestDashboardTab,
} from "@/features/tests/model/test-dashboard";

import {
    calculateRestoredTime,
} from "@/features/tests/model/test-progress-storage";

import type {
    StoredCompletedTest,
    StoredTestProgress,
} from "@/features/tests/model/test-progress-storage";

import type {
    TestCategory,
    TestCategoryIcon,
} from "@/features/tests/model/types";

import styles from "./tests-page.module.css";

const dashboardTabs = [
    "all",
    "ongoing",
    "completed",
] as const satisfies readonly TestDashboardTab[];


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

function TestIcon() {
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

            <path
                d="m6.8 8 .7.7 1.4-1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CategoryIcon({
                          type,
                      }: {
    type: TestCategoryIcon;
}) {
    if (type === "spelling") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M5 19 9.5 17.8 18.7 8.6a2 2 0 0 0-2.8-2.8L6.7 15 5 19Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="m14.8 6.8 2.8 2.8M4 21h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "morphemics") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <rect
                    x="3"
                    y="8"
                    width="6"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="9"
                    y="5"
                    width="6"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <rect
                    x="15"
                    y="8"
                    width="6"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    if (type === "morphology") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="6"
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
                    d="M12 8.5v4M12 12.5 7.5 16M12 12.5l4.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (
        type === "syntax" ||
        type === "stylistics"
    ) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M4 7h16M7 12h10M5 17h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (
        type === "ghazal" ||
        type === "literature"
    ) {
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

    return <TestIcon />;
}

function matchesSearch(
    title: string,
    category: string,
    normalizedQuery: string,
) {
    if (!normalizedQuery) {
        return true;
    }

    return `${title} ${category}`
        .toLocaleLowerCase("uz")
        .includes(normalizedQuery);
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

    const paddedHours =
        String(hours).padStart(
            2,
            "0",
        );

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
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${paddedMinutes}:${paddedSeconds}`;
}

function formatCompletedDate(
    timestamp: number,
) {
    return new Intl.DateTimeFormat(
        "uz-UZ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(timestamp),
    );
}

function CategoryCard({
                          category,
                      }: {
    category: TestCategory;
}) {
    return (
        <PendingNavigationButton
            mode="push"
            href={category.href}
            pendingText="Ochilmoqda..."
            className={[
                styles.categoryCard,
                category.featured
                    ? styles.featuredCategory
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
      <span
          className={
              styles.categoryIcon
          }
      >
        <CategoryIcon
            type={category.icon}
        />
      </span>

            <span
                className={
                    styles.categoryContent
                }
            >
        <span
            className={
                styles.categoryTitleRow
            }
        >
          <strong>
            {category.title}
          </strong>

            {category.featured ? (
                <span
                    className={
                        styles.featuredBadge
                    }
                >
              Tavsiya
            </span>
            ) : null}
        </span>

        <span
            className={
                styles.categoryDescription
            }
        >
          {category.description}
        </span>

        <span
            className={
                styles.categoryMeta
            }
        >
          {category.itemCountLabel}
        </span>
      </span>

            <span
                className={
                    styles.categoryArrow
                }
                aria-hidden="true"
            >
        <ArrowIcon />
      </span>
        </PendingNavigationButton>
    );
}

function OngoingTestCard({
                             test,
                         }: {
    test: StoredTestProgress;
}) {
    const answeredCount =
        Object.keys(
            test.answers,
        ).length;

    const totalQuestions =
        test.metadata.totalQuestions;

    const progressPercentage =
        totalQuestions > 0
            ? Math.round(
                (answeredCount /
                    totalQuestions) *
                100,
            )
            : 0;

    const remainingSeconds =
        calculateRestoredTime(test);

    const totalDurationSeconds =
        test.metadata
            .estimatedMinutes * 60;

    const spentSeconds =
        Math.max(
            0,
            totalDurationSeconds -
            remainingSeconds,
        );

    return (
        <article
            className={
                styles.progressCard
            }
        >
            <div
                className={
                    styles.dashboardCardTop
                }
            >
        <span
            className={
                styles.dashboardCardType
            }
        >
          DAVOM ETMOQDA
        </span>

                <strong>
                    {progressPercentage}%
                </strong>
            </div>

            <h3>
                {test.metadata.title}
            </h3>

            <p>
                {test.metadata.category}
            </p>

            <div
                className={
                    styles.cardProgressTrack
                }
                role="progressbar"
                aria-label={`${test.metadata.title} jarayoni`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                    progressPercentage
                }
            >
        <span
            style={{
                width:
                    `${progressPercentage}%`,
            }}
        />
            </div>

            <div
                className={
                    styles.progressDetails
                }
            >
        <span>
          {answeredCount}/
            {totalQuestions} ta
          bajarildi
        </span>

                <span>
          {formatDuration(
              remainingSeconds,
          )} qoldi
        </span>
            </div>

            <small>
                {formatDuration(
                    spentSeconds,
                )} vaqt sarflandi
            </small>

            <PendingNavigationButton
                mode="push"
                href={test.metadata.href}
                pendingText="Test ochilmoqda..."
            >
                Davom ettirish
                <ArrowIcon />
            </PendingNavigationButton>
        </article>
    );
}

function CompletedTestCard({
                               test,
                           }: {
    test: StoredCompletedTest;
}) {
    return (
        <article
            className={
                styles.completedCard
            }
        >
            <div
                className={
                    styles.dashboardCardTop
                }
            >
        <span
            className={
                styles.dashboardCardType
            }
        >
          YAKUNLANGAN
        </span>

                <strong>
                    {test.percentage}%
                </strong>
            </div>

            <h3>
                {test.metadata.title}
            </h3>

            <p>
                {test.metadata.category}
            </p>

            <div
                className={
                    styles.completedStats
                }
            >
                <div>
                    <strong>
                        {test.correctCount}
                    </strong>

                    <span>
            To‘g‘ri
          </span>
                </div>

                <div>
                    <strong>
                        {test.incorrectCount}
                    </strong>

                    <span>
            Noto‘g‘ri
          </span>
                </div>

                <div>
                    <strong>
                        {test.unansweredCount}
                    </strong>

                    <span>
            Javobsiz
          </span>
                </div>
            </div>

            <small>
                {formatCompletedDate(
                    test.completedAt,
                )}
                {" · "}
                {formatDuration(
                    test.durationSeconds,
                )}
            </small>

            <div
                className={
                    styles.completedActions
                }
            >
                <PendingNavigationButton
                    mode="push"
                    href={`${test.metadata.href}?attempt=${encodeURIComponent(test.attemptId)}`}
                    pendingText="Natija ochilmoqda..."
                >
                    Natijani ko‘rish
                </PendingNavigationButton>

                <PendingNavigationButton
                    mode="push"
                    href={test.metadata.href}
                    pendingText="Test ochilmoqda..."
                >
                    Qayta ishlash
                </PendingNavigationButton>
            </div>
        </article>
    );
}

function DashboardEmptyState({
                                 title,
                                 description,
                             }: {
    title: string;
    description: string;
}) {
    return (
        <section
            className={
                styles.emptyState
            }
        >
      <span aria-hidden="true">
        <TestIcon />
      </span>

            <h2>{title}</h2>

            <p>{description}</p>
        </section>
    );
}

function DashboardLoadingState() {
    return (
        <div
            className={
                styles.loadingState
            }
            role="status"
            aria-live="polite"
        >
            Testlar yuklanmoqda...
        </div>
    );
}

interface TestsPageProps {
    readonly grammarCategories:
        readonly TestCategory[];
    readonly nationalCertificateCategories:
        readonly TestCategory[];
}

export function TestsPage({
    grammarCategories,
    nationalCertificateCategories,
}: TestsPageProps) {
    const {
        ongoing,
        completed,
        isLoaded,
    } = useTestDashboardStorage();

    const [
        activeTab,
        setActiveTab,
    ] =
        useState<TestDashboardTab>(
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

    const filteredGrammar =
        useMemo(() => {
            return grammarCategories.filter(
                (category) =>
                    matchesSearch(
                        category.title,
                        category.description,
                        normalizedQuery,
                    ),
            );
        }, [
            grammarCategories,
            normalizedQuery,
        ]);

    const filteredNational =
        useMemo(() => {
            return nationalCertificateCategories.filter(
                (category) =>
                    matchesSearch(
                        category.title,
                        category.description,
                        normalizedQuery,
                    ),
            );
        }, [
            nationalCertificateCategories,
            normalizedQuery,
        ]);

    const filteredOngoing =
        useMemo(() => {
            return ongoing.filter(
                (test) =>
                    matchesSearch(
                        test.metadata.title,
                        test.metadata.category,
                        normalizedQuery,
                    ),
            );
        }, [
            normalizedQuery,
            ongoing,
        ]);

    const filteredCompleted =
        useMemo(() => {
            return completed.filter(
                (test) =>
                    matchesSearch(
                        test.metadata.title,
                        test.metadata.category,
                        normalizedQuery,
                    ),
            );
        }, [
            completed,
            normalizedQuery,
        ]);

    const showAllTab =
        activeTab === "all";

    const showOngoingTab =
        activeTab === "ongoing";

    const showCompletedTab =
        activeTab === "completed";

    const allCategoriesEmpty =
        filteredGrammar.length === 0 &&
        filteredNational.length === 0;

    return (
        <main className={styles.page}>
            <div
                className={
                    styles.backgroundGlow
                }
                aria-hidden="true"
            />

            <div className={styles.content}>
                <header
                    className={styles.header}
                >
          <span
              className={
                  styles.eyebrow
              }
          >
            TA’LIMOT TESTLARI
          </span>

                    <h1>Testlar</h1>

                    <p>
                        Mavzulashtirilgan
                        testlar va milliy
                        sertifikat savollari
                        orqali bilimingizni
                        tekshiring.
                    </p>
                </header>

                <label
                    className={
                        styles.searchField
                    }
                >
          <span
              className={
                  styles.searchIcon
              }
          >
            <SearchIcon />
          </span>

                    <input
                        type="search"
                        value={searchQuery}
                        placeholder="Testni qidiring"
                        aria-label="Testni qidiring"
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
                        styles.dashboardTabs
                    }
                    role="tablist"
                    aria-label="Test holatlari"
                >
                    {dashboardTabs.map(
                        (tab) => {
                            const active =
                                activeTab === tab;

                            return (
                                <button
                                    key={tab}
                                    className={
                                        active
                                            ? styles.activeTab
                                            : undefined
                                    }
                                    type="button"
                                    role="tab"
                                    aria-selected={
                                        active
                                    }
                                    onClick={() =>
                                        setActiveTab(tab)
                                    }
                                >
                                    {
                                        testDashboardTabLabels[
                                            tab
                                            ]
                                    }
                                </button>
                            );
                        },
                    )}
                </div>


                {showAllTab ? (
                    <>
                        {!isLoaded ? (
                            <section
                                className={
                                    styles.dashboardSection
                                }
                            >
                                <DashboardLoadingState />
                            </section>
                        ) : filteredOngoing.length >
                        0 ? (
                            <section
                                className={
                                    styles.dashboardSection
                                }
                                aria-labelledby="continue-tests-title"
                            >
                                <header
                                    className={
                                        styles.sectionHeader
                                    }
                                >
                                    <div>
                                        <span>01</span>

                                        <h2 id="continue-tests-title">
                                            Davom ettirish
                                        </h2>
                                    </div>

                                    <p>
                                        Boshlangan testlarni
                                        tugatishda davom
                                        eting.
                                    </p>
                                </header>

                                <div
                                    className={
                                        styles.dashboardList
                                    }
                                >
                                    {filteredOngoing
                                        .slice(0, 2)
                                        .map((test) => (
                                            <OngoingTestCard
                                                key={
                                                    test.testId
                                                }
                                                test={test}
                                            />
                                        ))}
                                </div>
                            </section>
                        ) : null}

                        {filteredGrammar.length >
                        0 ? (
                            <section
                                className={
                                    styles.dashboardSection
                                }
                                aria-labelledby="grammar-tests-title"
                            >
                                <header
                                    className={
                                        styles.sectionHeader
                                    }
                                >
                                    <div>
                                        <span>02</span>

                                        <h2 id="grammar-tests-title">
                                            Grammatika
                                        </h2>
                                    </div>

                                    <p>
                                        Grammatika
                                        mavzulariga doir
                                        savollar to‘plami.
                                    </p>
                                </header>

                                <div
                                    className={
                                        styles.categoryList
                                    }
                                >
                                    {filteredGrammar.map(
                                        (category) => (
                                            <CategoryCard
                                                key={
                                                    category.id
                                                }
                                                category={
                                                    category
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </section>
                        ) : null}

                        {filteredNational.length >
                        0 ? (
                            <section
                                className={
                                    styles.dashboardSection
                                }
                                aria-labelledby="national-tests-title"
                            >
                                <header
                                    className={
                                        styles.sectionHeader
                                    }
                                >
                                    <div>
                                        <span>03</span>

                                        <h2 id="national-tests-title">
                                            Milliy sertifikat
                                        </h2>
                                    </div>

                                    <p>
                                        Milliy sertifikat
                                        formatiga mos
                                        savollar to‘plami.
                                    </p>
                                </header>

                                <div
                                    className={
                                        styles.categoryList
                                    }
                                >
                                    {filteredNational.map(
                                        (category) => (
                                            <CategoryCard
                                                key={
                                                    category.id
                                                }
                                                category={
                                                    category
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </section>
                        ) : null}

                        {isLoaded &&
                        allCategoriesEmpty &&
                        filteredOngoing.length ===
                        0 ? (
                            <DashboardEmptyState
                                title="Test topilmadi"
                                description="Boshqa test yoki mavzu nomini qidirib ko‘ring."
                            />
                        ) : null}
                    </>
                ) : null}

                {showOngoingTab ? (
                    <section
                        className={
                            styles.dashboardSection
                        }
                        aria-labelledby="ongoing-tests-title"
                    >
                        <header
                            className={
                                styles.sectionHeader
                            }
                        >
                            <div>
                                <span>01</span>

                                <h2 id="ongoing-tests-title">
                                    Davom etayotgan
                                </h2>
                            </div>

                            <p>
                                Boshlangan va hali
                                yakunlanmagan testlar.
                            </p>
                        </header>

                        {!isLoaded ? (
                            <DashboardLoadingState />
                        ) : filteredOngoing.length >
                        0 ? (
                            <div
                                className={
                                    styles.dashboardList
                                }
                            >
                                {filteredOngoing.map(
                                    (test) => (
                                        <OngoingTestCard
                                            key={
                                                test.testId
                                            }
                                            test={test}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <DashboardEmptyState
                                title="Davom etayotgan test yo‘q"
                                description="Boshlagan testingiz shu yerda ko‘rinadi."
                            />
                        )}
                    </section>
                ) : null}

                {showCompletedTab ? (
                    <section
                        className={
                            styles.dashboardSection
                        }
                        aria-labelledby="completed-tests-title"
                    >
                        <header
                            className={
                                styles.sectionHeader
                            }
                        >
                            <div>
                                <span>01</span>

                                <h2 id="completed-tests-title">
                                    Yakunlangan
                                </h2>
                            </div>

                            <p>
                                Tugallangan testlar
                                va oxirgi
                                natijalaringiz.
                            </p>
                        </header>

                        {!isLoaded ? (
                            <DashboardLoadingState />
                        ) : filteredCompleted.length >
                        0 ? (
                            <div
                                className={
                                    styles.dashboardList
                                }
                            >
                                {filteredCompleted.map(
                                    (test) => (
                                        <CompletedTestCard
                                            key={
                                                test.attemptId
                                            }
                                            test={test}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <DashboardEmptyState
                                title="Yakunlangan test yo‘q"
                                description="Testni yakunlaganingizdan so‘ng natija shu yerda ko‘rinadi."
                            />
                        )}
                    </section>
                ) : null}
            </div>

            <MobileNavigation />
        </main>
    );
}