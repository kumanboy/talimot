"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    getGrammarCollectionHref,
} from "@/features/tests/model/test-navigation";

import {
    calculateRestoredTime,
    readCompletedTest,
    readTestProgress,
    removeTestProgress,
    saveCompletedTest,
    saveTestProgress,
} from "@/features/tests/model/test-progress-storage";

import type {
    StoredCompletedTest,
} from "@/features/tests/model/test-progress-storage";

import type {
    StandardTestOptionId as TestOptionId,
    StandardTestQuestion as TestQuestion,
} from "@/features/tests/model/questions/types";

import { QuestionNavigator } from "./question-navigator";
import {
    QuestionAudioExplanation,
} from "@/features/tests/components/question-audio-explanation";
import styles from "./test-runner.module.css";

type TestRunnerData = {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly category: string;
    readonly topicSlug: string;
    readonly description: string;
    readonly questionCount: number;
    readonly estimatedMinutes: number;
    readonly questions:
        readonly TestQuestion[];
};

type TestRunnerProps = {
    readonly test: TestRunnerData;
    readonly collectionsHref?: string;
    readonly testHref?: string;
};

type UserAnswers = Partial<
    Record<string, TestOptionId>
>;

function isTestOptionId(
    value: unknown,
): value is TestOptionId {
    return (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D"
    );
}

function restoreStandardAnswers(
    storedAnswers:
        StoredCompletedTest["answers"],
): UserAnswers {
    const restoredAnswers:
        UserAnswers = {};

    Object.entries(
        storedAnswers,
    ).forEach(
        ([questionId, answer]) => {
            if (
                isTestOptionId(
                    answer,
                )
            ) {
                restoredAnswers[
                    questionId
                ] = answer;
            }
        },
    );

    return restoredAnswers;
}

type TestStage =
    | "questions"
    | "confirm"
    | "results";

type HistoricalAttemptStatus =
    | "idle"
    | "loading"
    | "ready"
    | "not-found";

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

function PreviousIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m15 6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function NextIcon() {
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

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function GridIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.7"
            />

            <rect
                x="14"
                y="4"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.7"
            />

            <rect
                x="4"
                y="14"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.7"
            />

            <rect
                x="14"
                y="14"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.7"
            />
        </svg>
    );
}

function BookmarkIcon({
                          filled,
                      }: {
    filled: boolean;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={
                filled
                    ? "currentColor"
                    : "none"
            }
            aria-hidden="true"
        >
            <path
                d="M7 4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V21l-5-3.6L7 21V4.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
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

type StructuredQuestionStatement = {
    readonly order: number;
    readonly text: string;
};

type StructuredQuestionPresentation = {
    readonly instruction: string;
    readonly context: string | null;
    readonly contextLabel: string;
    readonly statements:
        readonly StructuredQuestionStatement[];
};

function splitStructuredQuestionPrefix(
    prefix: string,
): Pick<
    StructuredQuestionPresentation,
    "instruction" | "context" | "contextLabel"
> {
    const normalized =
        prefix.trim();

    const labelledContextMatch =
        normalized.match(
            /^(.*?)(?:\s+)(Parcha|Matn|Gap)\s*:\s*(.+)$/iu,
        );

    if (
        labelledContextMatch &&
        labelledContextMatch[1]?.trim() &&
        labelledContextMatch[3]?.trim()
    ) {
        return {
            instruction:
                labelledContextMatch[1].trim(),
            context:
                labelledContextMatch[3].trim(),
            contextLabel:
                labelledContextMatch[2].toLocaleUpperCase(
                    "uz-UZ",
                ),
        };
    }

    const imperativeMatch =
        normalized.match(
            /^(.*?\b(?:aniqlang|toping|belgilang|yozing|hisoblang|ko[‘’ʻʼ'`]rsating)\s*[.!?])\s+(.+)$/iu,
        );

    if (
        imperativeMatch &&
        imperativeMatch[1]?.trim() &&
        imperativeMatch[2]?.trim()
    ) {
        return {
            instruction:
                imperativeMatch[1].trim(),
            context:
                imperativeMatch[2].trim(),
            contextLabel: "MATN",
        };
    }

    const sentenceMatch =
        normalized.match(
            /^(.+?[.!?])\s+([A-ZА-ЯЁOʻʼ“\"«].+)$/u,
        );

    if (
        sentenceMatch &&
        sentenceMatch[1]?.trim() &&
        sentenceMatch[2]?.trim()
    ) {
        return {
            instruction:
                sentenceMatch[1].trim(),
            context:
                sentenceMatch[2].trim(),
            contextLabel: "MATN",
        };
    }

    return {
        instruction: normalized,
        context: null,
        contextLabel: "MATN",
    };
}

function parseStructuredQuestionPresentation(
    question: string,
): StructuredQuestionPresentation | null {
    const statementPattern =
        /\((\d{1,2})\)\s*/gu;

    const matches =
        Array.from(
            question.matchAll(
                statementPattern,
            ),
        );

    if (
        matches.length < 3 ||
        matches.length > 8
    ) {
        return null;
    }

    const statementNumbers =
        matches.map(
            (match) =>
                Number(
                    match[1],
                ),
        );

    const isSequential =
        statementNumbers.every(
            (number, index) =>
                number === index + 1,
        );

    if (!isSequential) {
        return null;
    }

    const firstMatchIndex =
        matches[0]?.index;

    if (
        typeof firstMatchIndex !==
        "number"
    ) {
        return null;
    }

    const prefix =
        question
            .slice(
                0,
                firstMatchIndex,
            )
            .trim();

    if (prefix.length < 12) {
        return null;
    }

    const statements =
        matches.map(
            (match, index) => {
                const start =
                    (match.index ?? 0) +
                    match[0].length;

                const nextIndex =
                    matches[index + 1]
                        ?.index ??
                    question.length;

                return {
                    order:
                        statementNumbers[index],
                    text:
                        question
                            .slice(
                                start,
                                nextIndex,
                            )
                            .trim(),
                };
            },
        );

    if (
        statements.some(
            (statement) =>
                statement.text.length ===
                0,
        )
    ) {
        return null;
    }

    const prefixParts =
        splitStructuredQuestionPrefix(
            prefix,
        );

    return {
        ...prefixParts,
        statements,
    };
}

function StructuredQuestionBody({
    presentation,
}: {
    readonly presentation:
        StructuredQuestionPresentation;
}) {
    return (
        <div
            className={
                styles.structuredQuestion
            }
        >
            <h1
                id="current-question-title"
                className={
                    styles.structuredInstruction
                }
            >
                {
                    presentation.instruction
                }
            </h1>

            {presentation.context && (
                <section
                    className={
                        styles.questionSourceCard
                    }
                    aria-label={
                        presentation.contextLabel
                    }
                >
                    <span
                        className={
                            styles.questionSectionEyebrow
                        }
                    >
                        {
                            presentation.contextLabel
                        }
                    </span>

                    <p>
                        {
                            presentation.context
                        }
                    </p>
                </section>
            )}

            <section
                className={
                    styles.statementSection
                }
                aria-label="Hukmlar"
            >
                <header
                    className={
                        styles.statementHeader
                    }
                >
                    <span
                        className={
                            styles.questionSectionEyebrow
                        }
                    >
                        HUKMLAR
                    </span>

                    <small>
                        {
                            presentation.statements.length
                        } ta hukm
                    </small>
                </header>

                <ol
                    className={
                        styles.statementList
                    }
                >
                    {presentation.statements.map(
                        (statement) => (
                            <li
                                key={
                                    statement.order
                                }
                            >
                                <span
                                    className={
                                        styles.statementNumber
                                    }
                                    aria-hidden="true"
                                >
                                    {
                                        statement.order
                                    }
                                </span>

                                <p>
                                    {
                                        statement.text
                                    }
                                </p>
                            </li>
                        ),
                    )}
                </ol>
            </section>
        </div>
    );
}

function formatTime(
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

function formatCompletedDate(
    timestamp: number,
) {
    return new Intl.DateTimeFormat(
        "uz-UZ",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(timestamp),
    );
}

export function TestRunner({
    test,
    collectionsHref:
        collectionsHrefOverride,
    testHref:
        testHrefOverride,
}: TestRunnerProps) {
    const collectionsHref =
        collectionsHrefOverride ??
        getGrammarCollectionHref(
            test.topicSlug,
        );

    const testHref =
        testHrefOverride ??
        `${collectionsHref}/${encodeURIComponent(
            test.slug,
        )}`;
    const router = useRouter();
    const searchParams =
        useSearchParams();

    const attemptId =
        searchParams.get("attempt");

    const isHistoricalMode =
        Boolean(attemptId);

    const testMetadata = useMemo(
        () => ({
            title: test.title,
            category: test.category,
            href:
                testHref,
            totalQuestions:
            test.questionCount,
            estimatedMinutes:
            test.estimatedMinutes,
            isPremium: false,
        }),
        [
            test.category,
            test.estimatedMinutes,
            testHref,
            test.questionCount,
            test.title,
        ],
    );

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0);

    const [
        answers,
        setAnswers,
    ] = useState<UserAnswers>({});

    const [
        stage,
        setStage,
    ] =
        useState<TestStage>(
            "questions",
        );

    const [
        isNavigatorOpen,
        setIsNavigatorOpen,
    ] = useState(false);

    const [
        isExitConfirmationOpen,
        setIsExitConfirmationOpen,
    ] = useState(false);

    const [
        markedQuestionIds,
        setMarkedQuestionIds,
    ] = useState<
        ReadonlySet<string>
    >(() => new Set());

    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(
        () =>
            test.estimatedMinutes * 60,
    );

    const [
        historicalAttempt,
        setHistoricalAttempt,
    ] =
        useState<StoredCompletedTest | null>(
            null,
        );

    const [
        historicalAttemptStatus,
        setHistoricalAttemptStatus,
    ] =
        useState<HistoricalAttemptStatus>(
            attemptId
                ? "loading"
                : "idle",
        );

    const hasRestoredProgressRef =
        useRef(false);

    const currentQuestion =
        test.questions[currentIndex];

    const structuredQuestion =
        useMemo(
            () =>
                parseStructuredQuestionPresentation(
                    currentQuestion.question,
                ),
            [
                currentQuestion.question,
            ],
        );

    const displayedAnswers =
        historicalAttempt?.answers ??
        answers;

    const answeredCount =
        Object.keys(answers).length;

    const unansweredCount =
        test.questionCount -
        answeredCount;

    const progressPercentage =
        test.questionCount > 0
            ? (answeredCount /
                test.questionCount) *
            100
            : 0;

    const currentQuestionProgress =
        test.questionCount > 0
            ? ((currentIndex + 1) /
                test.questionCount) *
            100
            : 0;

    const result = useMemo(() => {
        if (
            historicalAttempt
        ) {
            return {
                correctCount:
                historicalAttempt.correctCount,

                incorrectCount:
                historicalAttempt.incorrectCount,

                unansweredCount:
                historicalAttempt.unansweredCount,

                percentage:
                historicalAttempt.percentage,

                durationSeconds:
                historicalAttempt.durationSeconds,

                completedAt:
                historicalAttempt.completedAt,
            };
        }

        if (stage !== "results") {
            return null;
        }

        const correctCount =
            test.questions.filter(
                (question) =>
                    answers[question.id] ===
                    question.correctOptionId,
            ).length;

        const incorrectCount =
            answeredCount -
            correctCount;

        const percentage =
            test.questionCount > 0
                ? Math.round(
                    (correctCount /
                        test.questionCount) *
                    100,
                )
                : 0;

        return {
            correctCount,
            incorrectCount,
            unansweredCount:
                test.questionCount -
                answeredCount,
            percentage,
            durationSeconds:
                test.estimatedMinutes *
                60 -
                remainingSeconds,
            completedAt: Date.now(),
        };
    }, [
        answers,
        answeredCount,
        historicalAttempt,
        remainingSeconds,
        stage,
        test.estimatedMinutes,
        test.questionCount,
        test.questions,
    ]);

    /*
     * Historical attempt loader.
     *
     * setTimeout keeps state updates outside
     * the synchronous effect body and avoids
     * react-hooks/set-state-in-effect warnings.
     */
    useEffect(() => {
        if (!attemptId) {
            return;
        }

        let isCancelled = false;

        const loadTimerId =
            window.setTimeout(() => {
                if (isCancelled) {
                    return;
                }

                const attempt =
                    readCompletedTest(
                        attemptId,
                    );

                if (
                    !attempt ||
                    attempt.testId !==
                    test.id
                ) {
                    setHistoricalAttempt(
                        null,
                    );

                    setHistoricalAttemptStatus(
                        "not-found",
                    );

                    return;
                }

                setHistoricalAttempt(
                    attempt,
                );

                setAnswers(
                    restoreStandardAnswers(
                        attempt.answers,
                    ),
                );

                setStage("results");

                setHistoricalAttemptStatus(
                    "ready",
                );

                hasRestoredProgressRef.current =
                    true;
            }, 0);

        return () => {
            isCancelled = true;

            window.clearTimeout(
                loadTimerId,
            );
        };
    }, [
        attemptId,
        test.id,
    ]);

    /*
     * Active progress restoration.
     * This effect never runs while viewing
     * a completed historical attempt.
     */
    useEffect(() => {
        if (isHistoricalMode) {
            return;
        }

        let isCancelled = false;

        const restoreTimerId =
            window.setTimeout(() => {
                if (isCancelled) {
                    return;
                }

                const storedProgress =
                    readTestProgress(
                        test.id,
                    );

                if (!storedProgress) {
                    hasRestoredProgressRef.current =
                        true;

                    return;
                }

                const safeCurrentIndex =
                    Math.min(
                        Math.max(
                            storedProgress.currentIndex,
                            0,
                        ),
                        test.questionCount - 1,
                    );

                const validQuestionIds =
                    new Set(
                        test.questions.map(
                            (question) =>
                                question.id,
                        ),
                    );

                const restoredAnswers =
                    Object.fromEntries(
                        Object.entries(
                            storedProgress.answers,
                        ).filter(
                            ([questionId]) =>
                                validQuestionIds.has(
                                    questionId,
                                ),
                        ),
                    ) as UserAnswers;

                const restoredMarkedIds =
                    storedProgress
                        .markedQuestionIds
                        .filter(
                            (questionId) =>
                                validQuestionIds.has(
                                    questionId,
                                ),
                        );

                const restoredSeconds =
                    calculateRestoredTime(
                        storedProgress,
                    );

                setCurrentIndex(
                    safeCurrentIndex,
                );

                setAnswers(
                    restoredAnswers,
                );

                setMarkedQuestionIds(
                    new Set(
                        restoredMarkedIds,
                    ),
                );

                setRemainingSeconds(
                    restoredSeconds,
                );

                if (
                    restoredSeconds === 0
                ) {
                    setStage("confirm");
                }

                hasRestoredProgressRef.current =
                    true;
            }, 0);

        return () => {
            isCancelled = true;

            window.clearTimeout(
                restoreTimerId,
            );
        };
    }, [
        isHistoricalMode,
        test.id,
        test.questionCount,
        test.questions,
    ]);

    /*
     * Active test autosave.
     */
    useEffect(() => {
        if (
            isHistoricalMode ||
            !hasRestoredProgressRef.current ||
            stage !== "questions"
        ) {
            return;
        }

        const saveTimerId =
            window.setTimeout(() => {
                saveTestProgress({
                    testId: test.id,
                    metadata:
                    testMetadata,
                    currentIndex,
                    answers,
                    markedQuestionIds: [
                        ...markedQuestionIds,
                    ],
                    remainingSeconds,
                });
            }, 300);

        return () => {
            window.clearTimeout(
                saveTimerId,
            );
        };
    }, [
        answers,
        currentIndex,
        isHistoricalMode,
        markedQuestionIds,
        remainingSeconds,
        stage,
        test.id,
        testMetadata,
    ]);

    /*
     * Save before refreshing or closing
     * only when taking an active test.
     */
    useEffect(() => {
        const saveBeforeUnload =
            () => {
                if (
                    isHistoricalMode ||
                    stage !== "questions" ||
                    !hasRestoredProgressRef
                        .current
                ) {
                    return;
                }

                saveTestProgress({
                    testId: test.id,
                    metadata:
                    testMetadata,
                    currentIndex,
                    answers,
                    markedQuestionIds: [
                        ...markedQuestionIds,
                    ],
                    remainingSeconds,
                });
            };

        window.addEventListener(
            "beforeunload",
            saveBeforeUnload,
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                saveBeforeUnload,
            );
        };
    }, [
        answers,
        currentIndex,
        isHistoricalMode,
        markedQuestionIds,
        remainingSeconds,
        stage,
        test.id,
        testMetadata,
    ]);

    /*
     * Countdown runs only in an active test.
     */
    useEffect(() => {
        if (
            isHistoricalMode ||
            stage !== "questions" ||
            remainingSeconds <= 0
        ) {
            return;
        }

        const timerId =
            window.setInterval(() => {
                setRemainingSeconds(
                    (previous) =>
                        Math.max(
                            0,
                            previous - 1,
                        ),
                );
            }, 1000);

        return () => {
            window.clearInterval(
                timerId,
            );
        };
    }, [
        isHistoricalMode,
        remainingSeconds,
        stage,
    ]);

    useEffect(() => {
        if (
            isHistoricalMode ||
            remainingSeconds !== 0 ||
            stage !== "questions"
        ) {
            return;
        }

        const timeoutId =
            window.setTimeout(() => {
                setStage("confirm");
            }, 0);

        return () => {
            window.clearTimeout(
                timeoutId,
            );
        };
    }, [
        isHistoricalMode,
        remainingSeconds,
        stage,
    ]);

    useEffect(() => {
        const shouldLockScroll =
            isNavigatorOpen ||
            isExitConfirmationOpen;

        if (!shouldLockScroll) {
            document.body.style.overflow =
                "";

            return;
        }

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [
        isExitConfirmationOpen,
        isNavigatorOpen,
    ]);

    const chooseAnswer = (
        optionId: TestOptionId,
    ) => {
        if (isHistoricalMode) {
            return;
        }

        setAnswers((previous) => ({
            ...previous,
            [currentQuestion.id]:
            optionId,
        }));
    };

    const goToQuestion = (
        index: number,
    ) => {
        if (
            isHistoricalMode ||
            index < 0 ||
            index >=
            test.questionCount
        ) {
            return;
        }

        setCurrentIndex(index);
        setIsNavigatorOpen(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const goNext = () => {
        if (isHistoricalMode) {
            return;
        }

        if (
            currentIndex <
            test.questionCount - 1
        ) {
            goToQuestion(
                currentIndex + 1,
            );

            return;
        }

        setStage("confirm");
    };

    const goPrevious = () => {
        if (
            !isHistoricalMode &&
            currentIndex > 0
        ) {
            goToQuestion(
                currentIndex - 1,
            );
        }
    };

    const toggleMarkedQuestion =
        () => {
            if (isHistoricalMode) {
                return;
            }

            setMarkedQuestionIds(
                (previous) => {
                    const next =
                        new Set(previous);

                    if (
                        next.has(
                            currentQuestion.id,
                        )
                    ) {
                        next.delete(
                            currentQuestion.id,
                        );
                    } else {
                        next.add(
                            currentQuestion.id,
                        );
                    }

                    return next;
                },
            );
        };

    const openFinishConfirmation =
        () => {
            if (isHistoricalMode) {
                return;
            }

            setIsNavigatorOpen(false);
            setStage("confirm");
        };

    const submitTest = () => {
        const correctCount =
            test.questions.filter(
                (question) =>
                    answers[question.id] ===
                    question.correctOptionId,
            ).length;

        const incorrectCount =
            answeredCount -
            correctCount;

        const finalUnansweredCount =
            test.questionCount -
            answeredCount;

        const percentage =
            test.questionCount > 0
                ? Math.round(
                    (correctCount /
                        test.questionCount) *
                    100,
                )
                : 0;

        const totalDurationSeconds =
            test.estimatedMinutes * 60;

        const durationSeconds =
            Math.max(
                0,
                totalDurationSeconds -
                remainingSeconds,
            );

        saveCompletedTest({
            testId: test.id,
            metadata:
            testMetadata,
            answers,
            correctCount,
            incorrectCount,
            unansweredCount:
            finalUnansweredCount,
            percentage,
            durationSeconds,
        });

        setStage("results");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const restartTest = () => {
        removeTestProgress(
            test.id,
        );

        setHistoricalAttempt(
            null,
        );

        setHistoricalAttemptStatus(
            "idle",
        );

        setAnswers({});
        setCurrentIndex(0);
        setStage("questions");

        setMarkedQuestionIds(
            new Set(),
        );

        setRemainingSeconds(
            test.estimatedMinutes *
            60,
        );

        hasRestoredProgressRef.current =
            true;

        if (isHistoricalMode) {
            router.replace(
                testMetadata.href,
            );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const confirmExit = () => {
        if (!isHistoricalMode) {
            saveTestProgress({
                testId: test.id,
                metadata:
                testMetadata,
                currentIndex,
                answers,
                markedQuestionIds: [
                    ...markedQuestionIds,
                ],
                remainingSeconds,
            });
        }

        document.body.style.overflow =
            "";

        router.replace(
            "/tests",
        );
    };

    /*
     * Historical result loading state.
     */
    if (
        attemptId &&
        historicalAttemptStatus ===
        "loading"
    ) {
        return (
            <main className={styles.page}>
                <div
                    className={
                        styles.confirmContent
                    }
                >
                    <section
                        className={
                            styles.confirmCard
                        }
                        role="status"
                        aria-live="polite"
                    >
            <span
                className={
                    styles.confirmIcon
                }
                aria-hidden="true"
            >
              <ClockIcon />
            </span>

                        <span
                            className={
                                styles.confirmEyebrow
                            }
                        >
              NATIJA YUKLANMOQDA
            </span>

                        <h1>
                            Test natijasi
                            ochilmoqda
                        </h1>

                        <p>
                            Saqlangan javoblar va
                            natija ma’lumotlari
                            yuklanmoqda.
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    /*
     * Invalid or deleted attempt.
     */
    if (
        attemptId &&
        historicalAttemptStatus ===
        "not-found"
    ) {
        return (
            <main className={styles.page}>
                <div
                    className={
                        styles.confirmContent
                    }
                >
                    <button
                        className={
                            styles.confirmBack
                        }
                        type="button"
                        onClick={() =>
                            router.replace(
                                collectionsHref,
                            )
                        }
                    >
                        <BackIcon />
                        Testlarga qaytish
                    </button>

                    <section
                        className={
                            styles.confirmCard
                        }
                    >
            <span
                className={
                    styles.confirmIcon
                }
                aria-hidden="true"
            >
              <CloseIcon />
            </span>

                        <span
                            className={
                                styles.confirmEyebrow
                            }
                        >
              NATIJA TOPILMADI
            </span>

                        <h1>
                            Ushbu urinish
                            mavjud emas
                        </h1>

                        <p>
                            Natija o‘chirilgan,
                            boshqa brauzerda
                            yaratilgan yoki
                            havola eskirgan
                            bo‘lishi mumkin.
                        </p>

                        <button
                            type="button"
                            className={
                                styles.submitButton
                            }
                            onClick={() =>
                                router.replace(
                                    collectionsHref,
                                )
                            }
                        >
                            Testlar sahifasiga
                            qaytish
                        </button>

                        <button
                            type="button"
                            className={
                                styles.continueButton
                            }
                            onClick={
                                restartTest
                            }
                        >
                            Testni qayta ishlash
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    if (
        (stage === "results" ||
            historicalAttemptStatus ===
            "ready") &&
        result
    ) {
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
                        styles.resultContent
                    }
                >
                    <header
                        className={
                            styles.resultHeader
                        }
                    >
            <span
                className={
                    styles.resultEyebrow
                }
            >
              {historicalAttempt
                  ? "SAQLANGAN NATIJA"
                  : "TEST YAKUNLANDI"}
            </span>

                        <div
                            className={
                                styles.scoreCircle
                            }
                        >
                            <strong>
                                {result.percentage}%
                            </strong>

                            <span>
                {result.correctCount}/
                                {test.questionCount}
              </span>
                        </div>

                        <h1>
                            {result.percentage >= 80
                                ? "Ajoyib natija!"
                                : result.percentage >=
                                60
                                    ? "Yaxshi natija"
                                    : "Yana mashq qilish kerak"}
                        </h1>

                        <p>
                            {test.title} bo‘yicha
                            natijangiz tayyor.
                        </p>

                        {historicalAttempt ? (
                            <p>
                                {formatCompletedDate(
                                    result.completedAt,
                                )}
                                {" · "}
                                {formatTime(
                                    result.durationSeconds,
                                )} vaqt sarflangan
                            </p>
                        ) : null}
                    </header>

                    <section
                        className={
                            styles.resultSummary
                        }
                        aria-label="Test natijasi"
                    >
                        <div>
              <span
                  className={
                      styles.correctIndicator
                  }
              >
                <CheckIcon />
              </span>

                            <strong>
                                {result.correctCount}
                            </strong>

                            <small>
                                To‘g‘ri
                            </small>
                        </div>

                        <div>
              <span
                  className={
                      styles.incorrectIndicator
                  }
              >
                <CloseIcon />
              </span>

                            <strong>
                                {result.incorrectCount}
                            </strong>

                            <small>
                                Noto‘g‘ri
                            </small>
                        </div>

                        <div>
              <span
                  className={
                      styles.unansweredIndicator
                  }
              >
                —
              </span>

                            <strong>
                                {
                                    result.unansweredCount
                                }
                            </strong>

                            <small>
                                Javobsiz
                            </small>
                        </div>
                    </section>

                    <section
                        className={
                            styles.reviewSection
                        }
                        aria-labelledby="review-title"
                    >
                        <header>
                            <span>01</span>

                            <div>
                                <h2 id="review-title">
                                    Javoblar tahlili
                                </h2>

                                <p>
                                    Tanlangan va
                                    to‘g‘ri javoblarni
                                    tekshiring.
                                </p>
                            </div>
                        </header>

                        <div
                            className={
                                styles.reviewList
                            }
                        >
                            {test.questions.map(
                                (question) => {
                                    const selectedAnswer =
                                        displayedAnswers[
                                            question.id
                                            ];

                                    const isCorrect =
                                        selectedAnswer ===
                                        question.correctOptionId;

                                    const selectedOption =
                                        question.options.find(
                                            (option) =>
                                                option.id ===
                                                selectedAnswer,
                                        );

                                    const correctOption =
                                        question.options.find(
                                            (option) =>
                                                option.id ===
                                                question.correctOptionId,
                                        );

                                    return (
                                        <article
                                            key={
                                                question.id
                                            }
                                            className={[
                                                styles.reviewCard,
                                                isCorrect
                                                    ? styles.correctReview
                                                    : styles.incorrectReview,
                                            ].join(" ")}
                                        >
                                            <div
                                                className={
                                                    styles.reviewTop
                                                }
                                            >
                                                <strong>
                                                    {
                                                        question.order
                                                    }
                                                    -savol
                                                </strong>

                                                <span>
                          {isCorrect
                              ? "To‘g‘ri"
                              : selectedAnswer
                                  ? "Noto‘g‘ri"
                                  : "Javobsiz"}
                        </span>
                                            </div>

                                            <p>
                                                {
                                                    question.question
                                                }
                                            </p>

                                            <dl>
                                                <div>
                                                    <dt>
                                                        Sizning
                                                        javobingiz
                                                    </dt>

                                                    <dd>
                                                        {selectedOption ? (
                                                            <span
                                                                className={
                                                                    styles.reviewAnswer
                                                                }
                                                            >
                                                                <strong>
                                                                    {selectedOption.id})
                                                                </strong>
                                                                {selectedOption.text.trim() && (
                                                                    <span>
                                                                        {
                                                                            selectedOption.text
                                                                        }
                                                                    </span>
                                                                )}
                                                                {selectedOption.image && (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={
                                                                            selectedOption.image.src
                                                                        }
                                                                        alt={
                                                                            selectedOption.image.alt
                                                                        }
                                                                    />
                                                                )}
                                                            </span>
                                                        ) : (
                                                            "Tanlanmagan"
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt>
                                                        To‘g‘ri javob
                                                    </dt>

                                                    <dd>
                                                        {correctOption ? (
                                                            <span
                                                                className={
                                                                    styles.reviewAnswer
                                                                }
                                                            >
                                                                <strong>
                                                                    {correctOption.id})
                                                                </strong>
                                                                {correctOption.text.trim() && (
                                                                    <span>
                                                                        {
                                                                            correctOption.text
                                                                        }
                                                                    </span>
                                                                )}
                                                                {correctOption.image && (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={
                                                                            correctOption.image.src
                                                                        }
                                                                        alt={
                                                                            correctOption.image.alt
                                                                        }
                                                                    />
                                                                )}
                                                            </span>
                                                        ) : (
                                                            question.correctOptionId
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>

                                            <QuestionAudioExplanation
                                                explanation={
                                                    question.explanation
                                                }
                                                visible={
                                                    !isCorrect
                                                }
                                            />
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    </section>

                    <div
                        className={
                            styles.resultActions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.secondaryAction
                            }
                            onClick={() =>
                                router.replace(
                                    collectionsHref,
                                )
                            }
                        >
                            Testlar ro‘yxati
                        </button>

                        <button
                            type="button"
                            className={
                                styles.primaryAction
                            }
                            onClick={
                                restartTest
                            }
                        >
                            Qayta ishlash
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (stage === "confirm") {
        return (
            <main className={styles.page}>
                <div
                    className={
                        styles.confirmContent
                    }
                >
                    <button
                        className={
                            styles.confirmBack
                        }
                        type="button"
                        onClick={() =>
                            setStage(
                                "questions",
                            )
                        }
                    >
                        <BackIcon />
                        Testga qaytish
                    </button>

                    <section
                        className={
                            styles.confirmCard
                        }
                    >
            <span
                className={
                    styles.confirmIcon
                }
                aria-hidden="true"
            >
              <CheckIcon />
            </span>

                        <span
                            className={
                                styles.confirmEyebrow
                            }
                        >
              TESTNI YAKUNLASH
            </span>

                        <h1>
                            Javoblarni yuborishga
                            tayyormisiz?
                        </h1>

                        <p>
                            Test yakunlangandan
                            keyin natija va
                            javoblar tahlili
                            ko‘rsatiladi.
                        </p>

                        <div
                            className={
                                styles.confirmStats
                            }
                        >
                            <div>
                                <strong>
                                    {answeredCount}
                                </strong>

                                <span>
                  Javob berildi
                </span>
                            </div>

                            <div>
                                <strong>
                                    {unansweredCount}
                                </strong>

                                <span>
                  Javobsiz
                </span>
                            </div>

                            <div>
                                <strong>
                                    {
                                        markedQuestionIds.size
                                    }
                                </strong>

                                <span>
                  Belgilangan
                </span>
                            </div>
                        </div>

                        {remainingSeconds ===
                        0 ? (
                            <div
                                className={
                                    styles.warningBox
                                }
                            >
                                Test vaqti tugadi.
                            </div>
                        ) : unansweredCount >
                        0 ? (
                            <div
                                className={
                                    styles.warningBox
                                }
                            >
                                {unansweredCount} ta
                                savolga hali javob
                                berilmagan.
                            </div>
                        ) : (
                            <div
                                className={
                                    styles.successBox
                                }
                            >
                                Barcha savollarga
                                javob berdingiz.
                            </div>
                        )}

                        <button
                            type="button"
                            className={
                                styles.submitButton
                            }
                            onClick={submitTest}
                        >
                            Natijani ko‘rish
                        </button>

                        {remainingSeconds >
                        0 ? (
                            <button
                                type="button"
                                className={
                                    styles.continueButton
                                }
                                onClick={() =>
                                    setStage(
                                        "questions",
                                    )
                                }
                            >
                                Testni davom
                                ettirish
                            </button>
                        ) : null}
                    </section>
                </div>
            </main>
        );
    }

    const selectedOptionId =
        answers[currentQuestion.id];

    const isCurrentMarked =
        markedQuestionIds.has(
            currentQuestion.id,
        );

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
                    className={
                        styles.topBar
                    }
                >
                    <button
                        className={
                            styles.backButton
                        }
                        type="button"
                        aria-label="Testdan chiqish"
                        onClick={() =>
                            setIsExitConfirmationOpen(
                                true,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

                    <button
                        className={
                            styles.testIdentity
                        }
                        type="button"
                        aria-label="Savollar ro‘yxatini ochish"
                        onClick={() =>
                            setIsNavigatorOpen(
                                true,
                            )
                        }
                    >
            <span>
              {currentIndex + 1}/
                {test.questionCount}
            </span>

                        <strong>
                            {test.title}
                        </strong>

                        <GridIcon />
                    </button>

                    <span
                        className={
                            styles.timerBadge
                        }
                    >
            <ClockIcon />

                        {formatTime(
                            remainingSeconds,
                        )}
          </span>
                </header>

                <section
                    className={
                        styles.progressSection
                    }
                >
                    <div
                        className={
                            styles.progressHeader
                        }
                    >
            <span>
              {answeredCount} ta
              javob berildi
            </span>

                        <span>
              {unansweredCount} ta
              javobsiz
            </span>
                    </div>

                    <div
                        className={
                            styles.progressTrack
                        }
                        role="progressbar"
                        aria-label="Javob berilgan savollar"
                        aria-valuemin={0}
                        aria-valuemax={
                            test.questionCount
                        }
                        aria-valuenow={
                            answeredCount
                        }
                    >
            <span
                style={{
                    width:
                        `${progressPercentage}%`,
                }}
            />
                    </div>
                </section>

                <section
                    className={
                        styles.contextCard
                    }
                >
                    <div>
            <span>
              {test.category}
            </span>

                        <small>
                            1–
                            {test.questionCount}
                            -savollar
                        </small>
                    </div>

                    <strong>
                        {test.title}
                    </strong>

                    <p>
                        {test.description}
                    </p>
                </section>

                <section
                    className={
                        styles.questionArea
                    }
                    aria-labelledby="current-question-title"
                >
                    <div
                        className={
                            styles.questionHeading
                        }
                    >
            <span>
              {currentQuestion.order}
                -savol
            </span>

                        <button
                            className={
                                isCurrentMarked
                                    ? styles.markedButton
                                    : undefined
                            }
                            type="button"
                            aria-pressed={
                                isCurrentMarked
                            }
                            onClick={
                                toggleMarkedQuestion
                            }
                        >
                            <BookmarkIcon
                                filled={
                                    isCurrentMarked
                                }
                            />

                            {isCurrentMarked
                                ? "Belgilangan"
                                : "Belgilash"}
                        </button>
                    </div>

                    {structuredQuestion ? (
                        <StructuredQuestionBody
                            presentation={
                                structuredQuestion
                            }
                        />
                    ) : (
                        <h1
                            id="current-question-title"
                        >
                            {
                                currentQuestion.question
                            }
                        </h1>
                    )}

                    {structuredQuestion && (
                        <div
                            className={
                                styles.answerSectionHeader
                            }
                        >
                            <span
                                className={
                                    styles.questionSectionEyebrow
                                }
                            >
                                JAVOBNI TANLANG
                            </span>
                        </div>
                    )}

                    <div
                        className={[
                            styles.options,
                            structuredQuestion
                                ? styles.structuredOptions
                                : "",
                        ].join(" ")}
                    >
                        {currentQuestion.options.map(
                            (option) => {
                                const selected =
                                    selectedOptionId ===
                                    option.id;

                                return (
                                    <button
                                        key={option.id}
                                        className={
                                            selected
                                                ? styles.selectedOption
                                                : undefined
                                        }
                                        type="button"
                                        aria-pressed={
                                            selected
                                        }
                                        onClick={() =>
                                            chooseAnswer(
                                                option.id,
                                            )
                                        }
                                    >
                    <span
                        className={
                            styles.optionLetter
                        }
                    >
                      {option.id}
                    </span>

                                        <span
                                            className={
                                                styles.optionContent
                                            }
                                        >
                                            {option.image && (
                                                <figure
                                                    className={
                                                        styles.optionImage
                                                    }
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={
                                                            option.image.src
                                                        }
                                                        alt={
                                                            option.image.alt
                                                        }
                                                        width={
                                                            option.image.width
                                                        }
                                                        height={
                                                            option.image.height
                                                        }
                                                    />
                                                    {option.image.caption && (
                                                        <figcaption>
                                                            {
                                                                option.image.caption
                                                            }
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            )}

                                            {option.text.trim() && (
                                                <span
                                                    className={
                                                        styles.optionText
                                                    }
                                                >
                                                    {option.text}
                                                </span>
                                            )}
                                        </span>

                                        <span
                                            className={
                                                styles.optionCheck
                                            }
                                            aria-hidden="true"
                                        >
                      {selected ? (
                          <CheckIcon />
                      ) : null}
                    </span>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </section>

                <div
                    className={
                        styles.questionPosition
                    }
                    aria-hidden="true"
                >
          <span
              style={{
                  width:
                      `${currentQuestionProgress}%`,
              }}
          />
                </div>
            </div>

            <footer
                className={
                    styles.navigationActions
                }
            >
                <div>
                    <button
                        className={
                            styles.previousButton
                        }
                        type="button"
                        disabled={
                            currentIndex === 0
                        }
                        onClick={goPrevious}
                    >
                        <PreviousIcon />
                        Oldingi
                    </button>

                    <button
                        className={
                            styles.nextButton
                        }
                        type="button"
                        onClick={goNext}
                    >
                        {currentIndex ===
                        test.questionCount - 1
                            ? "Yakunlash"
                            : "Keyingi"}

                        <NextIcon />
                    </button>
                </div>
            </footer>

            <QuestionNavigator
                isOpen={isNavigatorOpen}
                currentIndex={currentIndex}
                questions={test.questions}
                answers={answers}
                markedQuestionIds={
                    markedQuestionIds
                }
                onCloseAction={() =>
                    setIsNavigatorOpen(false)
                }
                onQuestionSelectAction={
                    goToQuestion
                }
                onFinishAction={
                    openFinishConfirmation
                }
            />

            {isExitConfirmationOpen ? (
                <div
                    className={
                        styles.exitLayer
                    }
                >
                    <button
                        className={
                            styles.exitOverlay
                        }
                        type="button"
                        aria-label="Chiqish oynasini yopish"
                        onClick={() =>
                            setIsExitConfirmationOpen(
                                false,
                            )
                        }
                    />

                    <section
                        className={
                            styles.exitDialog
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="exit-dialog-title"
                    >
            <span
                className={
                    styles.exitIcon
                }
            >
              <CloseIcon />
            </span>

                        <h2 id="exit-dialog-title">
                            Testdan chiqasizmi?
                        </h2>

                        <p>
                            Javoblaringiz va
                            qolgan vaqtingiz
                            saqlanadi. Testni
                            keyin davom
                            ettirishingiz mumkin.
                        </p>

                        <button
                            type="button"
                            onClick={confirmExit}
                        >
                            Saqlash va chiqish
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setIsExitConfirmationOpen(
                                    false,
                                )
                            }
                        >
                            Testni davom
                            ettirish
                        </button>
                    </section>
                </div>
            ) : null}
        </main>
    );
}