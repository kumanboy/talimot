"use client";

import {
    useCallback,
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
    calculateStandardFiveScore,
} from "@/features/national-certificate/model/standard-five-test-types";

import type {
    StandardFiveAnswers,
    StandardFiveOptionId,
    StandardFiveScoreResult,
    StandardFiveTestDefinition,
} from "@/features/national-certificate/model/standard-five-test-types";

import {
    getNationalCollectionHref,
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
    StoredTestMetadata,
} from "@/features/tests/model/test-progress-storage";

import {
    TestExitDialog,
} from "@/features/tests/components/test-exit-dialog";

import {
    QuestionAudioExplanation,
} from "@/features/tests/components/question-audio-explanation";

import styles from "./standard-five-test-runner.module.css";

interface StandardFiveTestRunnerProps {
    readonly test:
        StandardFiveTestDefinition;
}

type RunnerView =
    | "test"
    | "result";

const optionIds = [
    "A",
    "B",
    "C",
    "D",
] as const satisfies readonly StandardFiveOptionId[];

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function ArrowLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M19 12H5m5-5-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function FlagIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6 21V4m0 1h10l-1.5 3L16 11H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function formatTime(
    totalSeconds: number,
) {
    const safeSeconds =
        Math.max(
            0,
            Math.floor(
                totalSeconds,
            ),
        );

    const minutes =
        Math.floor(
            safeSeconds / 60,
        );

    const seconds =
        safeSeconds % 60;

    return `${String(minutes).padStart(
        2,
        "0",
    )}:${String(seconds).padStart(
        2,
        "0",
    )}`;
}

function getResultLabel(
    percentage: number,
) {
    if (percentage === 100) {
        return "Ajoyib natija";
    }

    if (percentage >= 80) {
        return "Juda yaxshi";
    }

    if (percentage >= 60) {
        return "Yaxshi natija";
    }

    return "Yana mashq qiling";
}

function createResultFromAttempt(
    attempt:
    StoredCompletedTest,
    test:
    StandardFiveTestDefinition,
): StandardFiveScoreResult {
    const fallbackScore =
        Math.round(
            attempt.correctCount *
            test.scorePerQuestion *
            10,
        ) / 10;

    return {
        correctCount:
        attempt.correctCount,

        incorrectCount:
        attempt.incorrectCount,

        unansweredCount:
        attempt.unansweredCount,

        score:
            attempt.score ??
            fallbackScore,

        maximumScore:
            test.maximumScore,

        percentage:
        attempt.percentage,
    };
}

function FinishDialog({
                          unansweredCount,
                          onCancel,
                          onConfirm,
                      }: {
    readonly unansweredCount:
        number;

    readonly onCancel:
        () => void;

    readonly onConfirm:
        () => void;
}) {
    return (
        <div
            className={
                styles.modalBackdrop
            }
            role="presentation"
        >
            <section
                className={
                    styles.finishDialog
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="finish-title"
            >
                <span
                    className={
                        styles.dialogIcon
                    }
                    aria-hidden="true"
                >
                    <FlagIcon />
                </span>

                <h2 id="finish-title">
                    Testni yakunlaysizmi?
                </h2>

                <p>
                    {unansweredCount > 0
                        ? `${unansweredCount} ta savol javobsiz qolgan.`
                        : "Barcha savollarga javob berdingiz."}
                </p>

                <div
                    className={
                        styles.dialogActions
                    }
                >
                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                    >
                        Davom ettirish
                    </button>

                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                    >
                        Yakunlash
                    </button>
                </div>
            </section>
        </div>
    );
}

export function StandardFiveTestRunner({
                                           test,
                                       }: StandardFiveTestRunnerProps) {
    const collectionsHref =
        getNationalCollectionHref(
            test.topic,
        );
    const router =
        useRouter();

    const searchParams =
        useSearchParams();

    const attemptId =
        searchParams.get(
            "attempt",
        );

    const testHref =
        `/tests/milliy-sertifikat/${test.topic}/${test.slug}`;

    const testMetadata =
        useMemo<StoredTestMetadata>(
            () => ({
                title:
                test.title,

                category:
                    "Badiiy asarlar",

                href:
                testHref,

                totalQuestions:
                test.questionCount,

                estimatedMinutes:
                test.estimatedMinutes,

                isPremium:
                    test.access ===
                    "premium",

                format:
                    "standard-five",
            }),
            [
                test.access,
                test.estimatedMinutes,
                test.questionCount,
                test.title,
                testHref,
            ],
        );

    const [
        currentQuestionIndex,
        setCurrentQuestionIndex,
    ] = useState(0);

    const [
        answers,
        setAnswers,
    ] =
        useState<StandardFiveAnswers>(
            {},
        );

    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(
        test.estimatedMinutes *
        60,
    );

    const [
        view,
        setView,
    ] =
        useState<RunnerView>(
            "test",
        );

    const [
        result,
        setResult,
    ] =
        useState<StandardFiveScoreResult | null>(
            null,
        );

    const [
        isExitDialogOpen,
        setIsExitDialogOpen,
    ] = useState(false);

    const [
        isFinishDialogOpen,
        setIsFinishDialogOpen,
    ] = useState(false);

    const [
        isStorageLoaded,
        setIsStorageLoaded,
    ] = useState(false);

    const [
        historicalAttempt,
        setHistoricalAttempt,
    ] =
        useState<StoredCompletedTest | null>(
            null,
        );

    const hasCompletedRef =
        useRef(false);

    const currentQuestion =
        test.questions[
            currentQuestionIndex
            ];

    const answeredCount =
        Object.keys(
            answers,
        ).length;

    const unansweredCount =
        test.questionCount -
        answeredCount;

    const progressPercentage =
        Math.round(
            (
                answeredCount /
                test.questionCount
            ) *
            100,
        );

    const selectedOptionId =
        answers[
            currentQuestion.id
            ];

    useEffect(() => {
        const loadTimerId =
            window.setTimeout(
                () => {
                    if (
                        attemptId
                    ) {
                        const attempt =
                            readCompletedTest(
                                attemptId,
                            );

                        if (
                            attempt &&
                            attempt.testId ===
                            test.id &&
                            attempt.metadata
                                .format ===
                            "standard-five"
                        ) {
                            setAnswers(
                                attempt.answers as StandardFiveAnswers,
                            );

                            setResult(
                                createResultFromAttempt(
                                    attempt,
                                    test,
                                ),
                            );

                            setHistoricalAttempt(
                                attempt,
                            );

                            setView(
                                "result",
                            );

                            setRemainingSeconds(
                                Math.max(
                                    0,
                                    test.estimatedMinutes *
                                    60 -
                                    attempt.durationSeconds,
                                ),
                            );
                        }

                        setIsStorageLoaded(
                            true,
                        );

                        return;
                    }

                    const progress =
                        readTestProgress(
                            test.id,
                        );

                    if (
                        progress &&
                        progress.metadata
                            .format ===
                        "standard-five"
                    ) {
                        setAnswers(
                            progress.answers as StandardFiveAnswers,
                        );

                        setCurrentQuestionIndex(
                            Math.min(
                                Math.max(
                                    progress.currentIndex,
                                    0,
                                ),
                                test.questionCount -
                                1,
                            ),
                        );

                        setRemainingSeconds(
                            calculateRestoredTime(
                                progress,
                            ),
                        );
                    }

                    setIsStorageLoaded(
                        true,
                    );
                },
                0,
            );

        return () => {
            window.clearTimeout(
                loadTimerId,
            );
        };
    }, [
        attemptId,
        test.estimatedMinutes,
        test.id,
        test.questionCount,
    ]);

    useEffect(() => {
        if (
            !isStorageLoaded ||
            attemptId ||
            view !== "test" ||
            hasCompletedRef.current
        ) {
            return;
        }

        const saveTimerId =
            window.setTimeout(
                () => {
                    saveTestProgress({
                        testId:
                        test.id,

                        metadata:
                        testMetadata,

                        currentIndex:
                        currentQuestionIndex,

                        answers,

                        markedQuestionIds:
                            [],

                        remainingSeconds,
                    });
                },
                150,
            );

        return () => {
            window.clearTimeout(
                saveTimerId,
            );
        };
    }, [
        answers,
        attemptId,
        currentQuestionIndex,
        isStorageLoaded,
        remainingSeconds,
        test.id,
        testMetadata,
        view,
    ]);

    useEffect(() => {
        if (
            !isStorageLoaded ||
            attemptId ||
            view !== "test" ||
            isFinishDialogOpen
        ) {
            return;
        }

        const intervalId =
            window.setInterval(
                () => {
                    setRemainingSeconds(
                        (current) =>
                            Math.max(
                                0,
                                current -
                                1,
                            ),
                    );
                },
                1000,
            );

        return () => {
            window.clearInterval(
                intervalId,
            );
        };
    }, [
        attemptId,
        isFinishDialogOpen,
        isStorageLoaded,
        view,
    ]);

    const finishTest =
        useCallback(() => {
            if (
                hasCompletedRef.current ||
                historicalAttempt
            ) {
                return;
            }

            hasCompletedRef.current =
                true;

            const finalResult =
                calculateStandardFiveScore(
                    test,
                    answers,
                );

            const durationSeconds =
                Math.max(
                    0,
                    test.estimatedMinutes *
                    60 -
                    remainingSeconds,
                );

            saveCompletedTest({
                testId:
                test.id,

                metadata:
                testMetadata,

                answers,

                correctCount:
                finalResult.correctCount,

                incorrectCount:
                finalResult.incorrectCount,

                unansweredCount:
                finalResult.unansweredCount,

                percentage:
                finalResult.percentage,

                durationSeconds,

                score:
                finalResult.score,

                maximumScore:
                finalResult.maximumScore,
            });

            removeTestProgress(
                test.id,
            );

            setResult(
                finalResult,
            );

            setIsFinishDialogOpen(
                false,
            );

            setView(
                "result",
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, [
            answers,
            historicalAttempt,
            remainingSeconds,
            test,
            testMetadata,
        ]);

    useEffect(() => {
        if (
            !isStorageLoaded ||
            attemptId ||
            remainingSeconds !==
            0 ||
            view !== "test"
        ) {
            return;
        }

        const timeoutId =
            window.setTimeout(
                finishTest,
                0,
            );

        return () => {
            window.clearTimeout(
                timeoutId,
            );
        };
    }, [
        attemptId,
        finishTest,
        isStorageLoaded,
        remainingSeconds,
        view,
    ]);

    const selectAnswer = (
        optionId:
        StandardFiveOptionId,
    ) => {
        setAnswers(
            (
                currentAnswers,
            ) => ({
                ...currentAnswers,

                [currentQuestion.id]:
                optionId,
            }),
        );
    };

    const openQuestion = (
        index: number,
    ) => {
        setCurrentQuestionIndex(
            index,
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const resetTest = () => {
        removeTestProgress(
            test.id,
        );

        hasCompletedRef.current =
            false;

        setHistoricalAttempt(
            null,
        );

        setAnswers({});
        setCurrentQuestionIndex(0);

        setRemainingSeconds(
            test.estimatedMinutes *
            60,
        );

        setResult(null);
        setView("test");

        router.replace(
            testHref,
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (
        view === "result" &&
        result
    ) {
        return (
            <main
                className={
                    styles.page
                }
            >
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
                            aria-label="Badiiy asarlar testlariga qaytish"
                            onClick={() =>
                                router.replace(
                                    collectionsHref,
                                )
                            }
                        >
                            <BackIcon />
                        </button>

                        <div>
                            <span>
                                Badiiy asarlar
                            </span>

                            <strong>
                                {test.title}
                            </strong>
                        </div>
                    </header>

                    <section
                        className={
                            styles.resultHero
                        }
                    >
                        <span
                            className={
                                styles.resultIcon
                            }
                            aria-hidden="true"
                        >
                            <CheckIcon />
                        </span>

                        <small>
                            {historicalAttempt
                                ? "SAQLANGAN NATIJA"
                                : "TEST YAKUNLANDI"}
                        </small>

                        <h1>
                            {getResultLabel(
                                result.percentage,
                            )}
                        </h1>

                        <p>
                            Badiiy asarlar
                            bo‘yicha natijangiz
                        </p>

                        <div
                            className={
                                styles.scoreCircle
                            }
                        >
                            <strong>
                                {
                                    result.score
                                }
                            </strong>

                            <span>
                                /{" "}
                                {
                                    result.maximumScore
                                }{" "}
                                ball
                            </span>
                        </div>
                    </section>

                    <section
                        className={
                            styles.resultStatistics
                        }
                    >
                        <article>
                            <strong>
                                {
                                    result.correctCount
                                }
                            </strong>
                            <span>
                                To‘g‘ri
                            </span>
                        </article>

                        <article>
                            <strong>
                                {
                                    result.incorrectCount
                                }
                            </strong>
                            <span>
                                Noto‘g‘ri
                            </span>
                        </article>

                        <article>
                            <strong>
                                {
                                    result.unansweredCount
                                }
                            </strong>
                            <span>
                                Javobsiz
                            </span>
                        </article>

                        <article>
                            <strong>
                                {
                                    result.percentage
                                }
                                %
                            </strong>
                            <span>
                                Natija
                            </span>
                        </article>
                    </section>

                    <section
                        className={
                            styles.reviewSection
                        }
                    >
                        <h2>
                            Javoblar tahlili
                        </h2>

                        <div
                            className={
                                styles.reviewList
                            }
                        >
                            {test.questions.map(
                                (
                                    question,
                                ) => {
                                    const userAnswer =
                                        answers[
                                            question.id
                                            ];

                                    const correct =
                                        userAnswer ===
                                        question.correctOptionId;

                                    const userOption =
                                        question.options.find(
                                            (
                                                option,
                                            ) =>
                                                option.id ===
                                                userAnswer,
                                        );

                                    const correctOption =
                                        question.options.find(
                                            (
                                                option,
                                            ) =>
                                                option.id ===
                                                question.correctOptionId,
                                        );

                                    return (
                                        <article
                                            key={
                                                question.id
                                            }
                                            className={
                                                styles.reviewCard
                                            }
                                        >
                                            <header>
                                                <span>
                                                    {
                                                        question.order
                                                    }
                                                    -savol
                                                </span>

                                                <strong
                                                    className={
                                                        correct
                                                            ? styles.correct
                                                            : styles.incorrect
                                                    }
                                                >
                                                    {correct
                                                        ? `${question.score} / ${question.score}`
                                                        : `0 / ${question.score}`}
                                                </strong>
                                            </header>

                                            {question.excerpt &&
                                            question.excerpt.length >
                                            0 ? (
                                                <blockquote
                                                    className={
                                                        styles.reviewExcerpt
                                                    }
                                                >
                                                    {question.excerpt.map(
                                                        (
                                                            line,
                                                        ) => (
                                                            <span
                                                                key={
                                                                    line
                                                                }
                                                            >
                                                                {
                                                                    line
                                                                }
                                                            </span>
                                                        ),
                                                    )}
                                                </blockquote>
                                            ) : null}

                                            <h3>
                                                {
                                                    question.question
                                                }
                                            </h3>

                                            <div
                                                className={
                                                    styles.reviewAnswers
                                                }
                                            >
                                                <p>
                                                    Sizning
                                                    javobingiz:{" "}
                                                    <strong>
                                                        {userOption
                                                            ? `${userOption.id}) ${userOption.text}`
                                                            : "Javobsiz"}
                                                    </strong>
                                                </p>

                                                <p>
                                                    To‘g‘ri
                                                    javob:{" "}
                                                    <strong>
                                                        {correctOption
                                                            ? `${correctOption.id}) ${correctOption.text}`
                                                            : question.correctOptionId}
                                                    </strong>
                                                </p>
                                            </div>

                                            <QuestionAudioExplanation
                                                explanation={
                                                    question.explanation
                                                }
                                                visible={
                                                    !correct
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
                            onClick={
                                resetTest
                            }
                        >
                            Qayta ishlash
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.replace(
                                    collectionsHref,
                                )
                            }
                        >
                            Testlarga qaytish
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main
            className={
                styles.page
            }
        >
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
                            setIsExitDialogOpen(
                                true,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>
                            Badiiy asarlar
                        </span>

                        <strong>
                            {test.title}
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.statusGrid
                    }
                >
                    <article>
                        <span>
                            <ClockIcon />
                        </span>

                        <div>
                            <small>
                                Qolgan vaqt
                            </small>

                            <strong
                                className={
                                    remainingSeconds <=
                                    60
                                        ? styles.dangerTime
                                        : undefined
                                }
                            >
                                {formatTime(
                                    remainingSeconds,
                                )}
                            </strong>
                        </div>
                    </article>

                    <article>
                        <small>
                            Maksimal ball
                        </small>

                        <strong>
                            {
                                test.maximumScore
                            }
                        </strong>
                    </article>
                </section>

                <section
                    className={
                        styles.progressSection
                    }
                >
                    <header>
                        <span>
                            {answeredCount}/
                            {
                                test.questionCount
                            }{" "}
                            ta bajarildi
                        </span>

                        <strong>
                            {
                                progressPercentage
                            }
                            %
                        </strong>
                    </header>

                    <div
                        className={
                            styles.progressTrack
                        }
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={
                            progressPercentage
                        }
                    >
                        <span
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </section>

                <nav
                    className={
                        styles.questionNavigation
                    }
                    aria-label="Savollar"
                >
                    {test.questions.map(
                        (
                            question,
                            index,
                        ) => {
                            const current =
                                currentQuestionIndex ===
                                index;

                            const answered =
                                Boolean(
                                    answers[
                                        question.id
                                        ],
                                );

                            return (
                                <button
                                    key={
                                        question.id
                                    }
                                    type="button"
                                    className={[
                                        current
                                            ? styles.currentQuestion
                                            : "",

                                        answered
                                            ? styles.answeredQuestion
                                            : "",
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                    aria-current={
                                        current
                                            ? "step"
                                            : undefined
                                    }
                                    onClick={() =>
                                        openQuestion(
                                            index,
                                        )
                                    }
                                >
                                    {
                                        question.order
                                    }
                                </button>
                            );
                        },
                    )}
                </nav>

                <section
                    className={
                        styles.questionCard
                    }
                >
                    <header>
                        <div>
                            <span>
                                {
                                    currentQuestion.order
                                }
                                -savol
                            </span>

                            {currentQuestion.sourceOrder ? (
                                <small>
                                    Asl raqami:{" "}
                                    {
                                        currentQuestion.sourceOrder
                                    }
                                </small>
                            ) : null}
                        </div>

                        <strong>
                            {
                                currentQuestion.score
                            }{" "}
                            ball
                        </strong>
                    </header>

                    {currentQuestion.excerpt &&
                    currentQuestion.excerpt.length >
                    0 ? (
                        <blockquote
                            className={
                                styles.excerpt
                            }
                        >
                            {currentQuestion.excerpt.map(
                                (
                                    line,
                                ) => (
                                    <span
                                        key={
                                            line
                                        }
                                    >
                                        {
                                            line
                                        }
                                    </span>
                                ),
                            )}
                        </blockquote>
                    ) : null}

                    <h2>
                        {
                            currentQuestion.question
                        }
                    </h2>

                    <div
                        className={
                            styles.options
                        }
                    >
                        {optionIds.map(
                            (
                                optionId,
                            ) => {
                                const option =
                                    currentQuestion.options.find(
                                        (
                                            item,
                                        ) =>
                                            item.id ===
                                            optionId,
                                    );

                                if (!option) {
                                    return null;
                                }

                                const selected =
                                    selectedOptionId ===
                                    option.id;

                                return (
                                    <button
                                        key={
                                            option.id
                                        }
                                        type="button"
                                        className={
                                            selected
                                                ? styles.selectedOption
                                                : undefined
                                        }
                                        aria-pressed={
                                            selected
                                        }
                                        onClick={() =>
                                            selectAnswer(
                                                option.id,
                                            )
                                        }
                                    >
                                        <span>
                                            {
                                                option.id
                                            }
                                        </span>

                                        <p>
                                            {
                                                option.text
                                            }
                                        </p>

                                        <i
                                            aria-hidden="true"
                                        >
                                            {selected ? (
                                                <CheckIcon />
                                            ) : null}
                                        </i>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </section>

                <div
                    className={
                        styles.navigationActions
                    }
                >
                    <button
                        type="button"
                        disabled={
                            currentQuestionIndex ===
                            0
                        }
                        onClick={() =>
                            openQuestion(
                                currentQuestionIndex -
                                1,
                            )
                        }
                    >
                        <ArrowLeftIcon />
                        Oldingi
                    </button>

                    {currentQuestionIndex <
                    test.questionCount -
                    1 ? (
                        <button
                            type="button"
                            onClick={() =>
                                openQuestion(
                                    currentQuestionIndex +
                                    1,
                                )
                            }
                        >
                            Keyingi
                            <ArrowRightIcon />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                setIsFinishDialogOpen(
                                    true,
                                )
                            }
                        >
                            Yakunlash
                            <FlagIcon />
                        </button>
                    )}
                </div>

                {currentQuestionIndex <
                test.questionCount -
                1 ? (
                    <button
                        type="button"
                        className={
                            styles.finishButton
                        }
                        onClick={() =>
                            setIsFinishDialogOpen(
                                true,
                            )
                        }
                    >
                        Testni yakunlash
                    </button>
                ) : null}
            </div>

            <TestExitDialog
                open={isExitDialogOpen}
                onContinue={() =>
                    setIsExitDialogOpen(false)
                }
                onSaveAndExit={() => {
                    saveTestProgress({
                        testId: test.id,
                        metadata: testMetadata,
                        currentIndex:
                            currentQuestionIndex,
                        answers,
                        markedQuestionIds: [],
                        remainingSeconds,
                    });

                    setIsExitDialogOpen(false);
                    router.replace(
                        collectionsHref,
                    );
                }}
            />

            {isFinishDialogOpen ? (
                <FinishDialog
                    unansweredCount={
                        unansweredCount
                    }
                    onCancel={() =>
                        setIsFinishDialogOpen(
                            false,
                        )
                    }
                    onConfirm={
                        finishTest
                    }
                />
            ) : null}
        </main>
    );
}