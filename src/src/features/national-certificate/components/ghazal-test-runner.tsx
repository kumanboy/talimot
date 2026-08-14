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

import type {
    GhazalAnswers,
    GhazalOptionId,
    GhazalScoreResult,
    GhazalTestDefinition,
} from "@/features/national-certificate/model/ghazal-test-types";

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

import styles from "./ghazal-test-runner.module.css";

type GhazalTestRunnerProps = {
    readonly test:
        GhazalTestDefinition;
};

type RunnerView =
    | "test"
    | "result";

const optionIds = [
    "A",
    "B",
    "C",
    "D",
] as const satisfies readonly GhazalOptionId[];

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

function FlagIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
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
                strokeWidth="1.9"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ArrowLeftIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
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

function formatTime(
    totalSeconds: number,
) {
    const safeSeconds =
        Math.max(
            0,
            Math.floor(totalSeconds),
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

function calculateResult(
    test: GhazalTestDefinition,
    answers: GhazalAnswers,
): GhazalScoreResult {
    let correctCount = 0;
    let incorrectCount = 0;

    for (
        const question
        of test.questions
        ) {
        const selectedAnswer =
            answers[question.id];

        if (!selectedAnswer) {
            continue;
        }

        if (
            selectedAnswer ===
            question.correctOptionId
        ) {
            correctCount += 1;
        } else {
            incorrectCount += 1;
        }
    }

    const unansweredCount =
        test.questionCount -
        correctCount -
        incorrectCount;

    const score =
        correctCount *
        test.scorePerQuestion;

    const percentage =
        Math.round(
            (
                correctCount /
                test.questionCount
            ) *
            100,
        );

    return {
        correctCount,
        incorrectCount,
        unansweredCount,
        score,
        maximumScore: 12.5,
        percentage,
    };
}

function createResultFromAttempt(
    attempt: StoredCompletedTest,
): GhazalScoreResult {
    return {
        correctCount:
        attempt.correctCount,
        incorrectCount:
        attempt.incorrectCount,
        unansweredCount:
        attempt.unansweredCount,
        score:
            attempt.score ??
            attempt.correctCount * 2.5,
        maximumScore: 12.5,
        percentage:
        attempt.percentage,
    };
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

function GhazalContent({
                           test,
                       }: {
    readonly test:
        GhazalTestDefinition;
}) {
    return (
        <div
            className={
                styles.ghazalContent
            }
        >
            <div
                className={
                    styles.passageHeader
                }
            >
                <span>
                    G‘AZAL MATNI
                </span>

                {test.author ? (
                    <strong>
                        {test.author}
                    </strong>
                ) : null}
            </div>

            <p
                className={
                    styles.instruction
                }
            >
                {test.instruction}
            </p>

            <div
                className={
                    styles.couplets
                }
            >
                {test.couplets.map(
                    (couplet) => (
                        <article
                            key={
                                couplet.order
                            }
                            className={
                                styles.couplet
                            }
                        >
                            <span>
                                {
                                    couplet.order
                                }.
                            </span>

                            <div>
                                <p>
                                    {
                                        couplet.firstLine
                                    }
                                </p>

                                <p>
                                    {
                                        couplet.secondLine
                                    }
                                </p>
                            </div>
                        </article>
                    ),
                )}
            </div>

            {test.vocabulary.length >
            0 ? (
                <section
                    className={
                        styles.vocabulary
                    }
                >
                    <header>
                        <span>
                            LUG‘AT
                        </span>

                        <small>
                            Mumtoz
                            so‘zlarning
                            izohi
                        </small>
                    </header>

                    <div>
                        {test.vocabulary.map(
                            (item) => (
                                <article
                                    key={`${item.term}-${item.marker ?? ""}`}
                                >
                                    <strong>
                                        {
                                            item.term
                                        }

                                        {item.marker ? (
                                            <sup>
                                                {
                                                    item.marker
                                                }
                                            </sup>
                                        ) : null}
                                    </strong>

                                    <span>
                                        {
                                            item.meaning
                                        }
                                    </span>
                                </article>
                            ),
                        )}
                    </div>
                </section>
            ) : null}
        </div>
    );
}

function ConfirmationDialog({
                                unansweredCount,
                                onCancel,
                                onConfirm,
                            }: {
    readonly unansweredCount:
        number;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
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
                    styles.confirmationDialog
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="finish-dialog-title"
            >
                <span
                    className={
                        styles.dialogIcon
                    }
                    aria-hidden="true"
                >
                    <FlagIcon />
                </span>

                <h2 id="finish-dialog-title">
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
                        onClick={onCancel}
                    >
                        Davom ettirish
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                    >
                        Yakunlash
                    </button>
                </div>
            </section>
        </div>
    );
}

export function GhazalTestRunner({
                                     test,
                                 }: GhazalTestRunnerProps) {
    const collectionsHref =
        getNationalCollectionHref(
            test.topic,
        );
    const router = useRouter();
    const searchParams =
        useSearchParams();

    const attemptId =
        searchParams.get(
            "attempt",
        );

    const testHref =
        `/tests/milliy-sertifikat/gazal/${test.slug}`;

    const testMetadata =
        useMemo<StoredTestMetadata>(
            () => ({
                title: test.title,
                category: "G‘azal",
                href: testHref,
                totalQuestions:
                test.questionCount,
                estimatedMinutes:
                test.estimatedMinutes,
                isPremium:
                    test.access ===
                    "premium",
                format: "ghazal",
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
    ] = useState<GhazalAnswers>(
        {},
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
        useState<GhazalScoreResult | null>(
            null,
        );

    const [
        isPassageOpen,
        setIsPassageOpen,
    ] = useState(false);

    const [
        isExitDialogOpen,
        setIsExitDialogOpen,
    ] = useState(false);

    const [
        isFinishDialogOpen,
        setIsFinishDialogOpen,
    ] = useState(false);

    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(
        test.estimatedMinutes *
        60,
    );

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
                    if (attemptId) {
                        const storedAttempt =
                            readCompletedTest(
                                attemptId,
                            );

                        if (
                            storedAttempt &&
                            storedAttempt.testId ===
                            test.id &&
                            storedAttempt.metadata
                                .format ===
                            "ghazal"
                        ) {
                            setAnswers(
                                storedAttempt.answers as
                                    GhazalAnswers,
                            );

                            setResult(
                                createResultFromAttempt(
                                    storedAttempt,
                                ),
                            );

                            setHistoricalAttempt(
                                storedAttempt,
                            );

                            setView(
                                "result",
                            );

                            setRemainingSeconds(
                                Math.max(
                                    0,
                                    test.estimatedMinutes *
                                    60 -
                                    storedAttempt.durationSeconds,
                                ),
                            );
                        }

                        setIsStorageLoaded(
                            true,
                        );

                        return;
                    }

                    const storedProgress =
                        readTestProgress(
                            test.id,
                        );

                    if (
                        storedProgress &&
                        storedProgress.metadata
                            .format ===
                        "ghazal"
                    ) {
                        setAnswers(
                            storedProgress.answers as
                                GhazalAnswers,
                        );

                        setCurrentQuestionIndex(
                            Math.min(
                                Math.max(
                                    storedProgress.currentIndex,
                                    0,
                                ),
                                test.questionCount -
                                1,
                            ),
                        );

                        setRemainingSeconds(
                            calculateRestoredTime(
                                storedProgress,
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
                120,
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
                calculateResult(
                    test,
                    answers,
                );

            const totalDuration =
                test.estimatedMinutes *
                60;

            const durationSeconds =
                Math.max(
                    0,
                    totalDuration -
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

            setIsPassageOpen(
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
            view !== "test" ||
            isFinishDialogOpen
        ) {
            return;
        }

        const timerId =
            window.setInterval(
                () => {
                    setRemainingSeconds(
                        (current) => {
                            if (
                                current <=
                                1
                            ) {
                                window.clearInterval(
                                    timerId,
                                );

                                return 0;
                            }

                            return (
                                current -
                                1
                            );
                        },
                    );
                },
                1000,
            );

        return () => {
            window.clearInterval(
                timerId,
            );
        };
    }, [
        attemptId,
        isFinishDialogOpen,
        isStorageLoaded,
        view,
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
        GhazalOptionId,
    ) => {
        setAnswers(
            (currentAnswers) => ({
                ...currentAnswers,
                [currentQuestion.id]:
                optionId,
            }),
        );
    };

    const goToQuestion = (
        questionIndex: number,
    ) => {
        setCurrentQuestionIndex(
            questionIndex,
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
                            aria-label="G‘azal testlariga qaytish"
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
                                MILLIY
                                SERTIFIKAT
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
                            G‘azal tahlili
                            bo‘yicha
                            natijangiz
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
                                    Javoblar
                                    tahlili
                                </h2>
                            </div>

                            <p>
                                Har bir savol
                                bo‘yicha
                                natijangizni
                                tekshiring.
                            </p>
                        </header>

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

                                    const isCorrect =
                                        userAnswer ===
                                        question.correctOptionId;

                                    return (
                                        <article
                                            key={
                                                question.id
                                            }
                                            className={
                                                styles.reviewCard
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.reviewCardTop
                                                }
                                            >
                                                <span>
                                                    {
                                                        question.order
                                                    }
                                                    -savol
                                                </span>

                                                <strong
                                                    className={
                                                        isCorrect
                                                            ? styles.correctScore
                                                            : styles.incorrectScore
                                                    }
                                                >
                                                    {isCorrect
                                                        ? "2.5 / 2.5"
                                                        : "0 / 2.5"}
                                                </strong>
                                            </div>

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
                                                        {
                                                            userAnswer ??
                                                            "Javobsiz"
                                                        }
                                                    </strong>
                                                </p>

                                                <p>
                                                    To‘g‘ri
                                                    javob:{" "}
                                                    <strong>
                                                        {
                                                            question.correctOptionId
                                                        }
                                                    </strong>
                                                </p>
                                            </div>

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
                            G‘azal
                            testlariga
                            qaytish
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
                            setIsExitDialogOpen(
                                true,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>
                            MILLIY
                            SERTIFIKAT
                        </span>

                        <strong>
                            {test.title}
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.testStatus
                    }
                >
                    <div>
                        <span>
                            <ClockIcon />
                        </span>

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

                    <div>
                        <small>
                            Maksimal ball
                        </small>

                        <strong>
                            {
                                test.maximumScore
                            }
                        </strong>
                    </div>
                </section>

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
                    </div>

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

                <section
                    className={
                        styles.passageCard
                    }
                >
                    <div
                        className={
                            styles.passageCardHeader
                        }
                    >
                        <span
                            className={
                                styles.passageIcon
                            }
                        >
                            <BookIcon />
                        </span>

                        <div>
                            <small>
                                TEST MANBASI
                            </small>

                            <h1>
                                G‘azal va
                                lug‘at
                            </h1>
                        </div>
                    </div>

                    <p>
                        Savollarga javob
                        berishdan oldin
                        g‘azalni diqqat
                        bilan o‘qing.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setIsPassageOpen(
                                true,
                            )
                        }
                    >
                        G‘azalni ko‘rish
                        <BookIcon />
                    </button>
                </section>

                <nav
                    className={
                        styles.questionNavigator
                    }
                    aria-label="Savollar"
                >
                    {test.questions.map(
                        (
                            question,
                            index,
                        ) => {
                            const isCurrent =
                                index ===
                                currentQuestionIndex;

                            const isAnswered =
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
                                        isCurrent
                                            ? styles.currentQuestion
                                            : "",
                                        isAnswered
                                            ? styles.answeredQuestion
                                            : "",
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                    aria-label={`${question.order}-savol`}
                                    aria-current={
                                        isCurrent
                                            ? "step"
                                            : undefined
                                    }
                                    onClick={() =>
                                        goToQuestion(
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
                    <header
                        className={
                            styles.questionHeader
                        }
                    >
                        <div>
                            <span>
                                {
                                    currentQuestion.order
                                }
                                -savol
                            </span>

                            {currentQuestion.sourceOrder ? (
                                <small>
                                    Asl
                                    raqami:{" "}
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
                            goToQuestion(
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
                                goToQuestion(
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
                        className={
                            styles.finishButton
                        }
                        type="button"
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

            {isPassageOpen ? (
                <div
                    className={
                        styles.sheetBackdrop
                    }
                    role="presentation"
                    onClick={() =>
                        setIsPassageOpen(
                            false,
                        )
                    }
                >
                    <section
                        className={
                            styles.passageSheet
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-label="G‘azal matni"
                        onClick={(
                            event,
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <header>
                            <div>
                                <span>
                                    G‘AZAL
                                </span>

                                <strong>
                                    {
                                        test.title
                                    }
                                </strong>
                            </div>

                            <button
                                type="button"
                                aria-label="G‘azalni yopish"
                                onClick={() =>
                                    setIsPassageOpen(
                                        false,
                                    )
                                }
                            >
                                <CloseIcon />
                            </button>
                        </header>

                        <div
                            className={
                                styles.sheetContent
                            }
                        >
                            <GhazalContent
                                test={
                                    test
                                }
                            />
                        </div>
                    </section>
                </div>
            ) : null}

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
                <ConfirmationDialog
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