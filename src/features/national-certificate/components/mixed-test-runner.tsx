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
    calculateMixedTestScore,
} from "@/features/national-certificate/model/mixed-test-scoring";

import type {
    MixedAnswers,
    MixedAnswerValue,
    MixedMatchingAnswers,
    MixedMatchingChoiceId,
    MixedMultipartAnswers,
    MixedOptionId,
    MixedQuestion,
    MixedQuestionImage,
    MixedQuestionScoreResult,
    MixedTestDefinition,
    MixedTestScoreResult,
} from "@/features/national-certificate/model/mixed-test-types";

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
    StoredTestAnswers,
    StoredTestMetadata,
} from "@/features/tests/model/test-progress-storage";

import {
    TestExitDialog,
} from "@/features/tests/components/test-exit-dialog";

import {
    QuestionAudioExplanation,
} from "@/features/tests/components/question-audio-explanation";

import styles from "./mixed-test-runner.module.css";

interface MixedTestRunnerProps {
    readonly test: MixedTestDefinition;
}

type RunnerView =
    | "test"
    | "result";

const collectionsHref =
    getNationalCollectionHref(
        "aralash",
    );

const optionIds = [
    "A",
    "B",
    "C",
    "D",
] as const satisfies readonly MixedOptionId[];

const matchingChoiceIds = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
] as const satisfies readonly MixedMatchingChoiceId[];

function roundScore(
    value: number,
): number {
    return Math.round(
        value * 10,
    ) / 10;
}

function formatTime(
    totalSeconds: number,
): string {
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

    return `${String(
        minutes,
    ).padStart(
        2,
        "0",
    )}:${String(
        seconds,
    ).padStart(
        2,
        "0",
    )}`;
}

function getResultLabel(
    percentage: number,
): string {
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

function ReviewIcon() {
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
                d="M12 7v6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <circle
                cx="12"
                cy="17"
                r="1"
                fill="currentColor"
            />
        </svg>
    );
}

function isPlainObject(
    value: unknown,
): value is Record<
    string,
    unknown
> {
    return (
        typeof value ===
        "object" &&
        value !== null &&
        !Array.isArray(
            value,
        )
    );
}


function toUppercaseAnswer(
    value: string,
): string {
    return value.toLocaleUpperCase(
        "uz",
    );
}

function countAnsweredTasks(
    test: MixedTestDefinition,
    answers: MixedAnswers,
): number {
    return test.questions.reduce(
        (
            total,
            question,
        ) => {
            const answer =
                answers[
                    question.id
                    ];

            if (
                question.type ===
                "matching-group"
            ) {
                if (
                    !isPlainObject(
                        answer,
                    )
                ) {
                    return total;
                }

                return (
                    total +
                    question.items.filter(
                        (item) =>
                            typeof answer[
                                item.id
                                ] ===
                            "string" &&
                            String(
                                answer[
                                    item.id
                                    ],
                            ).trim()
                                .length >
                            0,
                    ).length
                );
            }

            if (
                question.type ===
                "multipart"
            ) {
                if (
                    !isPlainObject(
                        answer,
                    )
                ) {
                    return total;
                }

                const anyPartAnswered =
                    question.parts.some(
                        (part) =>
                            typeof answer[
                                part.id
                                ] ===
                            "string" &&
                            String(
                                answer[
                                    part.id
                                    ],
                            ).trim()
                                .length >
                            0,
                    );

                return (
                    total +
                    (
                        anyPartAnswered
                            ? 1
                            : 0
                    )
                );
            }

            if (
                typeof answer ===
                "string" &&
                answer.trim()
                    .length > 0
            ) {
                return total + 1;
            }

            return total;
        },
        0,
    );
}

function getQuestionTaskCount(
    question: MixedQuestion,
): number {
    if (
        question.type ===
        "matching-group"
    ) {
        return question.items.length;
    }

    return 1;
}

function getQuestionDisplayLabel(
    question: MixedQuestion,
): string {
    if (
        question.type ===
        "matching-group"
    ) {
        const first =
            question.items[0]
                ?.sourceOrder;

        const last =
            question.items[
            question.items.length -
            1
                ]?.sourceOrder;

        if (
            first !== undefined &&
            last !== undefined
        ) {
            return `${first}–${last}`;
        }

        return String(
            question.order,
        );
    }

    return String(
        question.sourceOrder ??
        question.order,
    );
}

function getQuestionTitle(
    question: MixedQuestion,
): string {
    if (
        question.type ===
        "matching-group"
    ) {
        return (
            question.title ??
            question.instruction
        );
    }

    return question.question;
}

function createResultFromAttempt(
    attempt:
    StoredCompletedTest,
    test:
    MixedTestDefinition,
): MixedTestScoreResult {
    const score =
        attempt.score ??
        roundScore(
            (
                attempt.correctCount /
                Math.max(
                    test.taskCount,
                    1,
                )
            ) *
            test.maximumScore,
        );

    return {
        score,

        maximumScore:
            attempt.maximumScore ??
            test.maximumScore,

        percentage:
        attempt.percentage,

        correctCount:
        attempt.correctCount,

        incorrectCount:
        attempt.incorrectCount,

        needsReviewCount:
            attempt.needsReviewCount ??
            0,

        unansweredCount:
        attempt.unansweredCount,

        questionResults:
            calculateMixedTestScore(
                test,
                attempt.answers as MixedAnswers,
            ).questionResults,
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
                aria-labelledby="mixed-finish-title"
            >
                <span
                    className={
                        styles.dialogIcon
                    }
                    aria-hidden="true"
                >
                    <FlagIcon />
                </span>

                <h2 id="mixed-finish-title">
                    Testni yakunlaysizmi?
                </h2>

                <p>
                    {unansweredCount >
                    0
                        ? `${unansweredCount} ta topshiriq javobsiz qolgan.`
                        : "Barcha topshiriqlarga javob berdingiz."}
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

function QuestionImage({
    image,
    compact = false,
}: {
    readonly image:
        MixedQuestionImage | undefined;
    readonly compact?: boolean;
}) {
    if (!image) {
        return null;
    }

    const width =
        image.width && image.width > 0
            ? image.width
            : undefined;

    const height =
        image.height && image.height > 0
            ? image.height
            : undefined;

    return (
        <figure
            className={[
                styles.questionImage,
                compact
                    ? styles.questionImageCompact
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <img
                src={image.src}
                alt={image.alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
            />

            {image.caption ? (
                <figcaption>
                    {image.caption}
                </figcaption>
            ) : null}
        </figure>
    );
}

function WordDiagram({
                         question,
                     }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "multiple-choice";
            }
        >;
}) {
    if (
        question.visual?.type !==
        "word-diagram"
    ) {
        return null;
    }

    const rootNodes =
        question.visual.nodes.filter(
            (node) =>
                node.role ===
                "root",
        );

    return (
        <div
            className={
                styles.wordDiagram
            }
        >
            {rootNodes.map(
                (root) => {
                    const childIds =
                        question.visual
                            ?.type ===
                        "word-diagram"
                            ? question.visual.connections
                                .filter(
                                    (
                                        connection,
                                    ) =>
                                        connection.from ===
                                        root.id,
                                )
                                .map(
                                    (
                                        connection,
                                    ) =>
                                        connection.to,
                                )
                            : [];

                    const children =
                        question.visual
                            ?.type ===
                        "word-diagram"
                            ? question.visual.nodes.filter(
                                (
                                    node,
                                ) =>
                                    childIds.includes(
                                        node.id,
                                    ),
                            )
                            : [];

                    return (
                        <article
                            key={
                                root.id
                            }
                            className={
                                styles.diagramGroup
                            }
                        >
                            <strong>
                                {
                                    root.text
                                }
                            </strong>

                            <div>
                                {children.map(
                                    (
                                        child,
                                    ) => (
                                        <span
                                            key={
                                                child.id
                                            }
                                        >
                                            {
                                                child.text
                                            }
                                        </span>
                                    ),
                                )}
                            </div>
                        </article>
                    );
                },
            )}
        </div>
    );
}

function NumberedStatements({
                                question,
                            }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "multiple-choice";
            }
        >;
}) {
    if (
        question.visual?.type !==
        "numbered-statements"
    ) {
        return null;
    }

    return (
        <ol
            className={
                styles.statementList
            }
        >
            {question.visual.statements.map(
                (
                    statement,
                ) => (
                    <li
                        key={
                            statement.number
                        }
                    >
                        <span>
                            {
                                statement.number
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
    );
}

function MultipleChoiceBody({
                                question,
                                answer,
                                onChange,
                            }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "multiple-choice";
            }
        >;

    readonly answer:
        MixedAnswerValue | undefined;

    readonly onChange:
        (
            optionId:
            MixedOptionId,
        ) => void;
}) {
    const selected =
        typeof answer ===
        "string"
            ? answer
            : undefined;

    return (
        <>
            <WordDiagram
                question={
                    question
                }
            />

            <NumberedStatements
                question={
                    question
                }
            />

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
                            question.options.find(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    optionId,
                            );

                        if (!option) {
                            return null;
                        }

                        const isSelected =
                            selected ===
                            option.id;

                        return (
                            <button
                                key={
                                    option.id
                                }
                                type="button"
                                className={
                                    isSelected
                                        ? styles.selectedOption
                                        : undefined
                                }
                                aria-pressed={
                                    isSelected
                                }
                                onClick={() =>
                                    onChange(
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
                                    {isSelected ? (
                                        <CheckIcon />
                                    ) : null}
                                </i>
                            </button>
                        );
                    },
                )}
            </div>
        </>
    );
}

function MatchingGroupBody({
                               question,
                               answer,
                               onChange,
                           }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "matching-group";
            }
        >;

    readonly answer:
        MixedAnswerValue | undefined;

    readonly onChange:
        (
            itemId: string,
            choiceId:
            MixedMatchingChoiceId,
        ) => void;
}) {
    const matchingAnswers:
        MixedMatchingAnswers =
        isPlainObject(
            answer,
        )
            ? (
                answer as
                    MixedMatchingAnswers
            )
            : {};

    return (
        <div
            className={
                styles.matchingLayout
            }
        >
            <div
                className={
                    styles.matchingItems
                }
            >
                {question.items.map(
                    (
                        item,
                    ) => (
                        <article
                            key={
                                item.id
                            }
                            className={
                                styles.matchingItem
                            }
                        >
                            <header>
                                <span>
                                    {
                                        item.sourceOrder ??
                                        item.order
                                    }
                                    -savol
                                </span>

                                <strong>
                                    {
                                        item.maximumScore
                                    }{" "}
                                    ball
                                </strong>
                            </header>

                            <p>
                                {
                                    item.prompt
                                }
                            </p>

                            <div
                                className={
                                    styles.matchingButtons
                                }
                            >
                                {matchingChoiceIds.map(
                                    (
                                        choiceId,
                                    ) => {
                                        const selected =
                                            matchingAnswers[
                                                item.id
                                                ] ===
                                            choiceId;

                                        return (
                                            <button
                                                key={
                                                    choiceId
                                                }
                                                type="button"
                                                className={
                                                    selected
                                                        ? styles.selectedMatchingChoice
                                                        : undefined
                                                }
                                                aria-pressed={
                                                    selected
                                                }
                                                onClick={() =>
                                                    onChange(
                                                        item.id,
                                                        choiceId,
                                                    )
                                                }
                                            >
                                                {
                                                    choiceId
                                                }
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </article>
                    ),
                )}
            </div>

            <aside
                className={
                    styles.matchingChoices
                }
            >
                <h3>
                    Variantlar
                </h3>

                {question.choices.map(
                    (
                        choice,
                    ) => (
                        <p
                            key={
                                choice.id
                            }
                        >
                            <strong>
                                {
                                    choice.id
                                }
                            </strong>

                            <span>
                                {
                                    choice.text
                                }
                            </span>
                        </p>
                    ),
                )}
            </aside>
        </div>
    );
}

function ShortAnswerBody({
                             question,
                             answer,
                             onChange,
                         }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "short-answer";
            }
        >;

    readonly answer:
        MixedAnswerValue | undefined;

    readonly onChange:
        (
            value: string,
        ) => void;
}) {
    const value =
        typeof answer ===
        "string"
            ? answer
            : "";

    return (
        <>
            {question.context ? (
                <blockquote
                    className={
                        styles.contextBlock
                    }
                >
                    {
                        question.context
                    }
                </blockquote>
            ) : null}

            {question.examples &&
            question.examples.length >
            0 ? (
                <div
                    className={
                        styles.exampleList
                    }
                >
                    {question.examples.map(
                        (
                            example,
                        ) => (
                            <span
                                key={
                                    example
                                }
                            >
                                {
                                    example
                                }
                            </span>
                        ),
                    )}
                </div>
            ) : null}

            <label
                className={
                    styles.textAnswer
                }
            >
                <span>
                    Javobingiz
                </span>

                <textarea
                    value={
                        value
                    }
                    rows={4}
                    placeholder="JAVOBNI SHU YERGA YOZING..."
                    style={{
                        textTransform:
                            "uppercase",
                    }}
                    onChange={(
                        event,
                    ) =>
                        onChange(
                            toUppercaseAnswer(
                                event
                                    .target
                                    .value,
                            ),
                        )
                    }
                />
            </label>
        </>
    );
}

function MultipartBody({
                           question,
                           answer,
                           onChange,
                       }: {
    readonly question:
        Extract<
            MixedQuestion,
            {
                readonly type:
                    "multipart";
            }
        >;

    readonly answer:
        MixedAnswerValue | undefined;

    readonly onChange:
        (
            partId: string,
            value: string,
        ) => void;
}) {
    const multipartAnswers:
        MixedMultipartAnswers =
        isPlainObject(
            answer,
        )
            ? (
                answer as
                    MixedMultipartAnswers
            )
            : {};

    return (
        <>
            {question.context ? (
                <blockquote
                    className={
                        styles.contextBlock
                    }
                >
                    {
                        question.context
                    }
                </blockquote>
            ) : null}

            <div
                className={
                    styles.multipartList
                }
            >
                {question.parts.map(
                    (
                        part,
                    ) => (
                        <label
                            key={
                                part.id
                            }
                            className={
                                styles.multipartPart
                            }
                        >
                            <header>
                                <span>
                                    {
                                        part.label
                                    }
                                    )
                                </span>

                                <strong>
                                    {
                                        part.score
                                    }{" "}
                                    ball
                                </strong>
                            </header>

                            <p>
                                {
                                    part.question
                                }
                            </p>

                            <textarea
                                value={
                                    multipartAnswers[
                                        part.id
                                        ] ??
                                    ""
                                }
                                rows={3}
                                placeholder={`${part.label.toUpperCase()}) JAVOBNI YOZING...`}
                                style={{
                                    textTransform:
                                        "uppercase",
                                }}
                                onChange={(
                                    event,
                                ) =>
                                    onChange(
                                        part.id,
                                        toUppercaseAnswer(
                                            event
                                                .target
                                                .value,
                                        ),
                                    )
                                }
                            />
                        </label>
                    ),
                )}
            </div>
        </>
    );
}

function getResultForQuestion(
    result:
    MixedTestScoreResult,
    questionId: string,
): MixedQuestionScoreResult | undefined {
    return result.questionResults.find(
        (
            questionResult,
        ) =>
            questionResult.questionId ===
            questionId,
    );
}



function getVerdictClassName(
    verdict: MixedQuestionScoreResult["verdict"],
): string {
    if (verdict === "correct") {
        return styles.correct;
    }

    if (verdict === "needs-review") {
        return styles.needsReview;
    }

    return styles.incorrect;
}

function getVerdictLabel(
    verdict: MixedQuestionScoreResult["verdict"],
    unanswered: boolean,
): string {
    if (unanswered) {
        return "Javobsiz";
    }

    if (verdict === "correct") {
        return "To‘g‘ri";
    }

    if (verdict === "needs-review") {
        return "Tekshiriladi";
    }

    return "Noto‘g‘ri";
}

function MixedAnswerReview({
    test,
    answers,
    result,
}: {
    readonly test: MixedTestDefinition;
    readonly answers: MixedAnswers;
    readonly result: MixedTestScoreResult;
}) {
    return (
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
                    (question) => {
                        const questionResult =
                            getResultForQuestion(
                                result,
                                question.id,
                            );

                        if (!questionResult) {
                            return null;
                        }

                        const answer =
                            answers[
                                question.id
                            ];

                        if (
                            question.type ===
                            "matching-group"
                        ) {
                            const matchingAnswers =
                                isPlainObject(
                                    answer,
                                )
                                    ? answer as MixedMatchingAnswers
                                    : {};

                            return (
                                <article
                                    key={
                                        question.id
                                    }
                                    className={
                                        styles.reviewGroupCard
                                    }
                                >
                                    <header
                                        className={
                                            styles.reviewGroupHeader
                                        }
                                    >
                                        <div>
                                            <span>
                                                {getQuestionDisplayLabel(
                                                    question,
                                                )}
                                                -savollar
                                            </span>

                                            <h3>
                                                {
                                                    question.title ??
                                                    question.instruction
                                                }
                                            </h3>
                                        </div>

                                        <strong>
                                            {
                                                questionResult.awardedScore
                                            }{" "}
                                            /{" "}
                                            {
                                                questionResult.maximumScore
                                            }
                                        </strong>
                                    </header>

                                    <QuestionImage
                                        image={
                                            question.image
                                        }
                                        compact
                                    />

                                    <div
                                        className={
                                            styles.reviewSubList
                                        }
                                    >
                                        {question.items.map(
                                            (
                                                item,
                                                index,
                                            ) => {
                                                const itemResult =
                                                    questionResult.parts?.[
                                                        index
                                                    ];

                                                const userChoiceId =
                                                    matchingAnswers[
                                                        item.id
                                                    ];

                                                const userChoice =
                                                    question.choices.find(
                                                        (
                                                            choice,
                                                        ) =>
                                                            choice.id ===
                                                            userChoiceId,
                                                    );

                                                const correctChoice =
                                                    question.choices.find(
                                                        (
                                                            choice,
                                                        ) =>
                                                            choice.id ===
                                                            item.correctChoiceId,
                                                    );

                                                const unanswered =
                                                    !userChoiceId;

                                                const verdict =
                                                    itemResult?.verdict ??
                                                    "incorrect";

                                                return (
                                                    <article
                                                        key={
                                                            item.id
                                                        }
                                                        className={[
                                                            styles.reviewCard,
                                                            getVerdictClassName(
                                                                verdict,
                                                            ),
                                                        ]
                                                            .filter(
                                                                Boolean,
                                                            )
                                                            .join(
                                                                " ",
                                                            )}
                                                    >
                                                        <header>
                                                            <span>
                                                                {
                                                                    item.sourceOrder ??
                                                                    item.order
                                                                }
                                                                -savol
                                                            </span>

                                                            <strong>
                                                                {
                                                                    itemResult?.awardedScore ??
                                                                    0
                                                                }{" "}
                                                                /{" "}
                                                                {
                                                                    item.maximumScore
                                                                }
                                                            </strong>
                                                        </header>

                                                        <h3>
                                                            {
                                                                item.prompt
                                                            }
                                                        </h3>

                                                        <p
                                                            className={
                                                                styles.verdictText
                                                            }
                                                        >
                                                            {getVerdictLabel(
                                                                verdict,
                                                                unanswered,
                                                            )}
                                                        </p>

                                                        <div
                                                            className={
                                                                styles.reviewAnswers
                                                            }
                                                        >
                                                            <p>
                                                                <span>
                                                                    Sizning javobingiz
                                                                </span>

                                                                <strong>
                                                                    {userChoice
                                                                        ? `${userChoice.id}. ${userChoice.text}`
                                                                        : "Javobsiz"}
                                                                </strong>
                                                            </p>

                                                            <p>
                                                                <span>
                                                                    To‘g‘ri javob
                                                                </span>

                                                                <strong>
                                                                    {correctChoice
                                                                        ? `${correctChoice.id}. ${correctChoice.text}`
                                                                        : item.correctChoiceId}
                                                                </strong>
                                                            </p>
                                                        </div>

                                                        {verdict !==
                                                        "correct" ? (
                                                            <QuestionAudioExplanation
                                                                explanation={
                                                                    item.explanation
                                                                }
                                                            />
                                                        ) : null}
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                </article>
                            );
                        }

                        if (
                            question.type ===
                            "multipart"
                        ) {
                            const multipartAnswers =
                                isPlainObject(
                                    answer,
                                )
                                    ? answer as MixedMultipartAnswers
                                    : {};

                            return (
                                <article
                                    key={
                                        question.id
                                    }
                                    className={
                                        styles.reviewGroupCard
                                    }
                                >
                                    <header
                                        className={
                                            styles.reviewGroupHeader
                                        }
                                    >
                                        <div>
                                            <span>
                                                {
                                                    question.sourceOrder ??
                                                    question.order
                                                }
                                                -savol
                                            </span>

                                            <h3>
                                                {
                                                    question.question
                                                }
                                            </h3>
                                        </div>

                                        <strong>
                                            {
                                                questionResult.awardedScore
                                            }{" "}
                                            /{" "}
                                            {
                                                questionResult.maximumScore
                                            }
                                        </strong>
                                    </header>

                                    <QuestionImage
                                        image={
                                            question.image
                                        }
                                        compact
                                    />

                                    {question.context ? (
                                        <p
                                            className={
                                                styles.reviewContext
                                            }
                                        >
                                            {
                                                question.context
                                            }
                                        </p>
                                    ) : null}

                                    <div
                                        className={
                                            styles.reviewSubList
                                        }
                                    >
                                        {question.parts.map(
                                            (
                                                part,
                                                index,
                                            ) => {
                                                const partResult =
                                                    questionResult.parts?.[
                                                        index
                                                    ];

                                                const userAnswer =
                                                    multipartAnswers[
                                                        part.id
                                                    ]?.trim() ??
                                                    "";

                                                const verdict =
                                                    partResult?.verdict ??
                                                    "incorrect";

                                                return (
                                                    <article
                                                        key={
                                                            part.id
                                                        }
                                                        className={[
                                                            styles.reviewCard,
                                                            getVerdictClassName(
                                                                verdict,
                                                            ),
                                                        ]
                                                            .filter(
                                                                Boolean,
                                                            )
                                                            .join(
                                                                " ",
                                                            )}
                                                    >
                                                        <header>
                                                            <span>
                                                                {
                                                                    part.label
                                                                }
                                                                ) qism
                                                            </span>

                                                            <strong>
                                                                {
                                                                    partResult?.awardedScore ??
                                                                    0
                                                                }{" "}
                                                                /{" "}
                                                                {
                                                                    part.score
                                                                }
                                                            </strong>
                                                        </header>

                                                        <h3>
                                                            {
                                                                part.question
                                                            }
                                                        </h3>

                                                        <p
                                                            className={
                                                                styles.verdictText
                                                            }
                                                        >
                                                            {getVerdictLabel(
                                                                verdict,
                                                                userAnswer.length ===
                                                                0,
                                                            )}
                                                        </p>

                                                        <div
                                                            className={
                                                                styles.reviewAnswers
                                                            }
                                                        >
                                                            <p>
                                                                <span>
                                                                    Sizning javobingiz
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        userAnswer ||
                                                                        "Javobsiz"
                                                                    }
                                                                </strong>
                                                            </p>

                                                            <p>
                                                                <span>
                                                                    Qabul qilinadigan javob
                                                                </span>

                                                                <strong>
                                                                    {part.acceptedAnswers.join(
                                                                        " / ",
                                                                    )}
                                                                </strong>
                                                            </p>
                                                        </div>

                                                        {verdict !==
                                                        "correct" ? (
                                                            <QuestionAudioExplanation
                                                                explanation={
                                                                    part.explanation
                                                                }
                                                            />
                                                        ) : null}
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                </article>
                            );
                        }

                        const userAnswer =
                            typeof answer ===
                            "string"
                                ? answer.trim()
                                : "";

                        const unanswered =
                            userAnswer.length ===
                            0;

                        if (
                            question.type ===
                            "multiple-choice"
                        ) {
                            const selectedOption =
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
                                    className={[
                                        styles.reviewCard,
                                        getVerdictClassName(
                                            questionResult.verdict,
                                        ),
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                >
                                    <header>
                                        <span>
                                            {
                                                question.sourceOrder ??
                                                question.order
                                            }
                                            -savol
                                        </span>

                                        <strong>
                                            {
                                                questionResult.awardedScore
                                            }{" "}
                                            /{" "}
                                            {
                                                questionResult.maximumScore
                                            }
                                        </strong>
                                    </header>

                                    <h3>
                                        {
                                            question.question
                                        }
                                    </h3>

                                    <QuestionImage
                                        image={
                                            question.image
                                        }
                                        compact
                                    />

                                    <p
                                        className={
                                            styles.verdictText
                                        }
                                    >
                                        {getVerdictLabel(
                                            questionResult.verdict,
                                            unanswered,
                                        )}
                                    </p>

                                    <div
                                        className={
                                            styles.reviewAnswers
                                        }
                                    >
                                        <p>
                                            <span>
                                                Sizning javobingiz
                                            </span>

                                            <strong>
                                                {selectedOption
                                                    ? `${selectedOption.id}. ${selectedOption.text}`
                                                    : "Javobsiz"}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>
                                                To‘g‘ri javob
                                            </span>

                                            <strong>
                                                {correctOption
                                                    ? `${correctOption.id}. ${correctOption.text}`
                                                    : question.correctOptionId}
                                            </strong>
                                        </p>
                                    </div>

                                    {questionResult.verdict !==
                                    "correct" ? (
                                        <QuestionAudioExplanation
                                            explanation={
                                                question.explanation
                                            }
                                        />
                                    ) : null}
                                </article>
                            );
                        }

                        return (
                            <article
                                key={
                                    question.id
                                }
                                className={[
                                    styles.reviewCard,
                                    getVerdictClassName(
                                        questionResult.verdict,
                                    ),
                                ]
                                    .filter(
                                        Boolean,
                                    )
                                    .join(
                                        " ",
                                    )}
                            >
                                <header>
                                    <span>
                                        {
                                            question.sourceOrder ??
                                            question.order
                                        }
                                        -savol
                                    </span>

                                    <strong>
                                        {
                                            questionResult.awardedScore
                                        }{" "}
                                        /{" "}
                                        {
                                            questionResult.maximumScore
                                        }
                                    </strong>
                                </header>

                                <h3>
                                    {
                                        question.question
                                    }
                                </h3>

                                <QuestionImage
                                    image={
                                        question.image
                                    }
                                    compact
                                />

                                {question.context ? (
                                    <p
                                        className={
                                            styles.reviewContext
                                        }
                                    >
                                        {
                                            question.context
                                        }
                                    </p>
                                ) : null}

                                <p
                                    className={
                                        styles.verdictText
                                    }
                                >
                                    {getVerdictLabel(
                                        questionResult.verdict,
                                        unanswered,
                                    )}
                                </p>

                                <div
                                    className={
                                        styles.reviewAnswers
                                    }
                                >
                                    <p>
                                        <span>
                                            Sizning javobingiz
                                        </span>

                                        <strong>
                                            {
                                                userAnswer ||
                                                "Javobsiz"
                                            }
                                        </strong>
                                    </p>

                                    <p>
                                        <span>
                                            Qabul qilinadigan javob
                                        </span>

                                        <strong>
                                            {question.acceptedAnswers.join(
                                                " / ",
                                            )}
                                        </strong>
                                    </p>
                                </div>

                                {questionResult.verdict !==
                                "correct" ? (
                                    <QuestionAudioExplanation
                                        explanation={
                                            question.explanation
                                        }
                                    />
                                ) : null}
                            </article>
                        );
                    },
                )}
            </div>
        </section>
    );
}

export function MixedTestRunner({
                                    test,
                                }: MixedTestRunnerProps) {
    const router =
        useRouter();

    const searchParams =
        useSearchParams();

    const attemptId =
        searchParams.get(
            "attempt",
        );

    const testHref =
        `${collectionsHref}/${test.slug}`;

    const metadata =
        useMemo<StoredTestMetadata>(
            () => ({
                title:
                test.title,

                category:
                    "Aralash testlar",

                href:
                testHref,

                totalQuestions:
                test.taskCount,

                estimatedMinutes:
                test.estimatedMinutes,

                isPremium:
                    test.access ===
                    "premium",

                format:
                    "mixed",
            }),
            [
                test.access,
                test.estimatedMinutes,
                test.taskCount,
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
        useState<MixedAnswers>(
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
        useState<MixedTestScoreResult | null>(
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

    const answeredTaskCount =
        countAnsweredTasks(
            test,
            answers,
        );

    const unansweredCount =
        Math.max(
            0,
            test.taskCount -
            answeredTaskCount,
        );

    const progressPercentage =
        Math.round(
            (
                answeredTaskCount /
                Math.max(
                    test.taskCount,
                    1,
                )
            ) *
            100,
        );

    useEffect(() => {
        const timerId =
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
                            "mixed"
                        ) {
                            setAnswers(
                                attempt.answers as MixedAnswers,
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

                            setRemainingSeconds(
                                Math.max(
                                    0,
                                    test.estimatedMinutes *
                                    60 -
                                    attempt.durationSeconds,
                                ),
                            );

                            setView(
                                "result",
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
                        "mixed"
                    ) {
                        setAnswers(
                            progress.answers as MixedAnswers,
                        );

                        setCurrentQuestionIndex(
                            Math.min(
                                Math.max(
                                    progress.currentIndex,
                                    0,
                                ),
                                test.questions.length -
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
                timerId,
            );
        };
    }, [
        attemptId,
        test,
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

        const timerId =
            window.setTimeout(
                () => {
                    saveTestProgress({
                        testId:
                        test.id,

                        metadata,

                        currentIndex:
                        currentQuestionIndex,

                        answers:
                            answers as StoredTestAnswers,

                        markedQuestionIds:
                            [],

                        remainingSeconds,
                    });
                },
                150,
            );

        return () => {
            window.clearTimeout(
                timerId,
            );
        };
    }, [
        answers,
        attemptId,
        currentQuestionIndex,
        isStorageLoaded,
        metadata,
        remainingSeconds,
        test.id,
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
                        (
                            current,
                        ) =>
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
                calculateMixedTestScore(
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

                metadata,

                answers:
                    answers as StoredTestAnswers,

                correctCount:
                finalResult.correctCount,

                incorrectCount:
                finalResult.incorrectCount,

                needsReviewCount:
                finalResult.needsReviewCount,

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

            setView(
                "result",
            );

            setIsFinishDialogOpen(
                false,
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, [
            answers,
            historicalAttempt,
            metadata,
            remainingSeconds,
            test,
        ]);

    useEffect(() => {
        if (
            !isStorageLoaded ||
            attemptId ||
            view !== "test" ||
            remainingSeconds !==
            0
        ) {
            return;
        }

        const timerId =
            window.setTimeout(
                finishTest,
                0,
            );

        return () => {
            window.clearTimeout(
                timerId,
            );
        };
    }, [
        attemptId,
        finishTest,
        isStorageLoaded,
        remainingSeconds,
        view,
    ]);

    const updateAnswer = (
        questionId: string,
        value:
        MixedAnswerValue,
    ) => {
        setAnswers(
            (
                current,
            ) => ({
                ...current,

                [questionId]:
                value,
            }),
        );
    };

    const updateMatchingAnswer = (
        questionId: string,
        itemId: string,
        choiceId:
        MixedMatchingChoiceId,
    ) => {
        setAnswers(
            (
                current,
            ) => {
                const existing =
                    current[
                        questionId
                        ];

                const nested:
                    MixedMatchingAnswers =
                    isPlainObject(
                        existing,
                    )
                        ? (
                            existing as
                                MixedMatchingAnswers
                        )
                        : {};

                return {
                    ...current,

                    [questionId]:
                        {
                            ...nested,

                            [itemId]:
                            choiceId,
                        },
                };
            },
        );
    };

    const updateMultipartAnswer = (
        questionId: string,
        partId: string,
        value: string,
    ) => {
        setAnswers(
            (
                current,
            ) => {
                const existing =
                    current[
                        questionId
                        ];

                const nested:
                    MixedMultipartAnswers =
                    isPlainObject(
                        existing,
                    )
                        ? (
                            existing as
                                MixedMultipartAnswers
                        )
                        : {};

                return {
                    ...current,

                    [questionId]:
                        {
                            ...nested,

                            [partId]:
                            value,
                        },
                };
            },
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
                            aria-label="Aralash testlarga qaytish"
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
                                Aralash
                                testlar
                            </span>

                            <strong>
                                {
                                    test.title
                                }
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
                            Aralash
                            topshiriqlar
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
                                    result.needsReviewCount
                                }
                            </strong>

                            <span>
                                Tekshiriladi
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
                    </section>

                    {result.needsReviewCount >
                    0 ? (
                        <section
                            className={
                                styles.reviewNotice
                            }
                        >
                            <ReviewIcon />

                            <div>
                                <strong>
                                    Yozma
                                    javoblar
                                    tekshiruvi
                                </strong>

                                <p>
                                    Ayrim
                                    yozma
                                    javoblar
                                    avtomatik
                                    tarzda
                                    aniq
                                    baholanmadi.
                                    Ular
                                    “Tekshiriladi”
                                    holatida
                                    saqlandi.
                                </p>
                            </div>
                        </section>
                    ) : null}

                    <MixedAnswerReview
                        test={test}
                        answers={answers}
                        result={result}
                    />

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
                            Qayta
                            ishlash
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.replace(
                                    collectionsHref,
                                )
                            }
                        >
                            Testlarga
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
                        aria-label="Aralash testlarga qaytish"
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
                            Aralash
                            testlar
                        </span>

                        <strong>
                            {
                                test.title
                            }
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
                                Qolgan
                                vaqt
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
                            Maksimal
                            ball
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
                            {
                                answeredTaskCount
                            }
                            /
                            {
                                test.taskCount
                            }{" "}
                            ta
                            bajarildi
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
                                index ===
                                currentQuestionIndex;

                            const answered =
                                countAnsweredTasks(
                                    {
                                        ...test,
                                        questions:
                                            [
                                                question,
                                            ],
                                        taskCount:
                                            getQuestionTaskCount(
                                                question,
                                            ),
                                    },
                                    answers,
                                ) >
                                0;

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
                                    {getQuestionDisplayLabel(
                                        question,
                                    )}
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
                                {getQuestionDisplayLabel(
                                    currentQuestion,
                                )}
                                -savol
                            </span>

                            {currentQuestion.type ===
                            "matching-group" ? (
                                <small>
                                    {
                                        currentQuestion.items.length
                                    }{" "}
                                    ta
                                    topshiriq
                                </small>
                            ) : null}
                        </div>

                        <strong>
                            {currentQuestion.type ===
                            "matching-group"
                                ? roundScore(
                                    currentQuestion.items.reduce(
                                        (
                                            total,
                                            item,
                                        ) =>
                                            total +
                                            item.maximumScore,
                                        0,
                                    ),
                                )
                                : currentQuestion.maximumScore}{" "}
                            ball
                        </strong>
                    </header>

                    {currentQuestion.type ===
                    "matching-group" ? (
                        <>
                            {currentQuestion.title ? (
                                <h2>
                                    {
                                        currentQuestion.title
                                    }
                                </h2>
                            ) : null}

                            <p
                                className={
                                    styles.instruction
                                }
                            >
                                {
                                    currentQuestion.instruction
                                }
                            </p>

                            <QuestionImage
                                image={
                                    currentQuestion.image
                                }
                            />

                            <MatchingGroupBody
                                question={
                                    currentQuestion
                                }
                                answer={
                                    answers[
                                        currentQuestion.id
                                        ]
                                }
                                onChange={(
                                    itemId,
                                    choiceId,
                                ) =>
                                    updateMatchingAnswer(
                                        currentQuestion.id,
                                        itemId,
                                        choiceId,
                                    )
                                }
                            />
                        </>
                    ) : (
                        <>
                            <h2>
                                {
                                    currentQuestion.question
                                }
                            </h2>

                            <QuestionImage
                                image={
                                    currentQuestion.image
                                }
                            />

                            {currentQuestion.type ===
                            "multiple-choice" ? (
                                <MultipleChoiceBody
                                    question={
                                        currentQuestion
                                    }
                                    answer={
                                        answers[
                                            currentQuestion.id
                                            ]
                                    }
                                    onChange={(
                                        optionId,
                                    ) =>
                                        updateAnswer(
                                            currentQuestion.id,
                                            optionId,
                                        )
                                    }
                                />
                            ) : null}

                            {currentQuestion.type ===
                            "short-answer" ? (
                                <ShortAnswerBody
                                    question={
                                        currentQuestion
                                    }
                                    answer={
                                        answers[
                                            currentQuestion.id
                                            ]
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        updateAnswer(
                                            currentQuestion.id,
                                            value,
                                        )
                                    }
                                />
                            ) : null}

                            {currentQuestion.type ===
                            "multipart" ? (
                                <MultipartBody
                                    question={
                                        currentQuestion
                                    }
                                    answer={
                                        answers[
                                            currentQuestion.id
                                            ]
                                    }
                                    onChange={(
                                        partId,
                                        value,
                                    ) =>
                                        updateMultipartAnswer(
                                            currentQuestion.id,
                                            partId,
                                            value,
                                        )
                                    }
                                />
                            ) : null}
                        </>
                    )}
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
                    test.questions.length -
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
                test.questions.length -
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
                        Testni
                        yakunlash
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
                        metadata,
                        currentIndex:
                            currentQuestionIndex,
                        answers:
                            answers as
                                StoredTestAnswers,
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