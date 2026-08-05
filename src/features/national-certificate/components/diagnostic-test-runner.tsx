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
    calculateDiagnosticTestScore,
} from "@/features/national-certificate/model/diagnostic-test-scoring";

import {
    createDiagnosticCertificateRecord,
    readDiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";

import {
    readUserProfile,
} from "@/features/profile/model/profile-storage";

import {
    DiagnosticCertificatePreview,
} from "@/features/national-certificate/components/diagnostic-certificate-preview";

import type {
    DiagnosticAnswers,
    DiagnosticMatchingAnswers,
    DiagnosticMultipartAnswers,
    DiagnosticMultipleChoiceQuestion,
    DiagnosticPassageBlock,
    DiagnosticQuestion,
    DiagnosticTestDefinition,
    DiagnosticTestScoreResult,
} from "@/features/national-certificate/model/diagnostic-test-types";

import {
    getNationalCollectionHref,
} from "@/features/tests/model/test-navigation";

import {
    calculateRestoredTime,
    readCompletedTest,
    readTestProgress,
    removeCompletedTest,
    removeTestProgress,
    saveCompletedTest,
    saveTestProgress,
} from "@/features/tests/model/test-progress-storage";

import type {
    StoredTestAnswers,
    StoredTestMetadata,
} from "@/features/tests/model/test-progress-storage";

import {
    TestExitDialog,
} from "@/features/tests/components/test-exit-dialog";

import {
    QuestionAudioExplanation,
} from "@/features/tests/components/question-audio-explanation";

import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

import styles from "./diagnostic-test-runner.module.css";

type DiagnosticTestRunnerProps = {
    readonly test:
        DiagnosticTestDefinition;
};

type RunnerView =
    | "test"
    | "result";

type DiagnosticPage =
    | {
    readonly type:
        "choice";
    readonly question:
        DiagnosticMultipleChoiceQuestion;
    readonly passage?:
        readonly DiagnosticPassageBlock[];
    readonly passageTitle?:
        string;
}
    | {
    readonly type:
        "matching";
    readonly question:
        Extract<
            DiagnosticQuestion,
            {
                readonly type:
                    "matching-group";
            }
        >;
}
    | {
    readonly type:
        "short-answer";
    readonly question:
        Extract<
            DiagnosticQuestion,
            {
                readonly type:
                    "short-answer";
            }
        >;
}
    | {
    readonly type:
        "multipart";
    readonly question:
        Extract<
            DiagnosticQuestion,
            {
                readonly type:
                    "multipart";
            }
        >;
}
    | {
    readonly type:
        "essay";
    readonly question:
        Extract<
            DiagnosticQuestion,
            {
                readonly type:
                    "essay";
            }
        >;
};

const collectionsHref =
    getNationalCollectionHref(
        "diagnostika",
    );

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

    const hours =
        Math.floor(
            safeSeconds / 3600,
        );

    const minutes =
        Math.floor(
            (
                safeSeconds %
                3600
            ) / 60,
        );

    const seconds =
        safeSeconds % 60;

    return [
        hours,
        minutes,
        seconds,
    ]
        .map(
            (
                value,
            ) =>
                String(
                    value,
                ).padStart(
                    2,
                    "0",
                ),
        )
        .join(":");
}

function toUppercaseAnswer(
    value: string,
): string {
    return value.toLocaleUpperCase(
        "uz",
    );
}

function createPages(
    test:
    DiagnosticTestDefinition,
): readonly DiagnosticPage[] {
    return test.questions.flatMap(
        (
            question,
        ): readonly DiagnosticPage[] => {
            if (
                question.type ===
                "passage-group"
            ) {
                return question.questions.map(
                    (
                        item,
                    ) => ({
                        type:
                            "choice" as const,
                        question:
                        item,
                        passage:
                        question.passage,
                        passageTitle:
                        question.title,
                    }),
                );
            }

            if (
                question.type ===
                "multiple-choice"
            ) {
                return [
                    {
                        type:
                            "choice",
                        question,
                    },
                ];
            }

            if (
                question.type ===
                "matching-group"
            ) {
                return [
                    {
                        type:
                            "matching",
                        question,
                    },
                ];
            }

            return [
                {
                    type:
                    question.type,
                    question,
                } as DiagnosticPage,
            ];
        },
    );
}

function getPageLabel(
    page:
    DiagnosticPage,
): string {
    if (
        page.type ===
        "matching"
    ) {
        const first =
            page.question.items[0]
                ?.order;

        const last =
            page.question.items[
            page.question.items.length -
            1
                ]?.order;

        return `${first}–${last}`;
    }

    return String(
        page.question.order,
    );
}

function isPageAnswered(
    page:
    DiagnosticPage,
    answers:
    DiagnosticAnswers,
): boolean {
    if (
        page.type ===
        "matching"
    ) {
        const answer =
            answers[
                page.question.id
                ];

        if (
            typeof answer !==
            "object" ||
            answer === null
        ) {
            return false;
        }

        const values =
            answer as
                DiagnosticMatchingAnswers;

        return page.question.items.every(
            (
                item,
            ) =>
                Boolean(
                    values[
                        item.id
                        ],
                ),
        );
    }

    if (
        page.type ===
        "multipart"
    ) {
        const answer =
            answers[
                page.question.id
                ];

        if (
            typeof answer !==
            "object" ||
            answer === null
        ) {
            return false;
        }

        const values =
            answer as
                DiagnosticMultipartAnswers;

        return page.question.parts.every(
            (
                part,
            ) =>
                Boolean(
                    values[
                        part.id
                        ]?.trim(),
                ),
        );
    }

    const answer =
        answers[
            page.question.id
            ];

    return (
        typeof answer ===
        "string" &&
        answer.trim().length >
        0
    );
}

function countAnsweredUnits(
    pages:
    readonly DiagnosticPage[],
    answers:
    DiagnosticAnswers,
): number {
    return pages.reduce(
        (
            total,
            page,
        ) => {
            if (
                page.type ===
                "matching"
            ) {
                const answer =
                    answers[
                        page.question.id
                        ];

                if (
                    typeof answer !==
                    "object" ||
                    answer === null
                ) {
                    return total;
                }

                const values =
                    answer as
                        DiagnosticMatchingAnswers;

                return (
                    total +
                    page.question.items.filter(
                        (
                            item,
                        ) =>
                            Boolean(
                                values[
                                    item.id
                                    ],
                            ),
                    ).length
                );
            }

            return (
                total +
                (
                    isPageAnswered(
                        page,
                        answers,
                    )
                        ? 1
                        : 0
                )
            );
        },
        0,
    );
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

function Passage({
                     title,
                     blocks,
                 }: {
    readonly title?:
        string;
    readonly blocks:
        readonly DiagnosticPassageBlock[];
}) {
    return (
        <section
            className={
                styles.passage
            }
        >
            {title ? (
                <h3>
                    {title}
                </h3>
            ) : null}

            {blocks.map(
                (
                    block,
                ) => (
                    <div
                        key={
                            block.id
                        }
                        className={
                            styles[
                                block.type
                                ]
                        }
                    >
                        {block.marker ? (
                            <strong>
                                [
                                {
                                    block.marker
                                }
                                ]
                            </strong>
                        ) : null}

                        <p>
                            {block.text}
                        </p>
                    </div>
                ),
            )}
        </section>
    );
}


function QuestionImage({
                           image,
                       }: {
    readonly image?: {
        readonly src: string;
        readonly alt: string;
        readonly caption?: string;
        readonly width?: number;
        readonly height?: number;
    };
}) {
    if (!image) {
        return null;
    }

    return (
        <figure
            className={
                styles.questionImage
            }
        >
            <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="eager"
            />

            {image.caption ? (
                <figcaption>
                    {
                        image.caption
                    }
                </figcaption>
            ) : null}
        </figure>
    );
}

function ChoiceQuestion({
                            page,
                            value,
                            onChange,
                        }: {
    readonly page:
        Extract<
            DiagnosticPage,
            {
                readonly type:
                    "choice";
            }
        >;
    readonly value?:
        string;
    readonly onChange:
        (
            value: string,
        ) => void;
}) {
    return (
        <>
            {page.passage ? (
                <Passage
                    title={
                        page.passageTitle
                    }
                    blocks={
                        page.passage
                    }
                />
            ) : null}

            {page.question.context ? (
                <div
                    className={
                        styles.context
                    }
                >
                    {
                        page.question
                            .context
                    }
                </div>
            ) : null}

            <QuestionImage
                image={
                    page.question
                        .image
                }
            />

            <h2>
                {
                    page.question
                        .question
                }
            </h2>

            <div
                className={
                    styles.options
                }
            >
                {page.question.options.map(
                    (
                        option,
                    ) => {
                        const selected =
                            value ===
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
                                onClick={() =>
                                    onChange(
                                        option.id,
                                    )
                                }
                            >
                                <strong>
                                    {
                                        option.id
                                    }
                                </strong>

                                <span>
                                    {
                                        option.text
                                    }
                                </span>

                                <i
                                    aria-hidden="true"
                                />
                            </button>
                        );
                    },
                )}
            </div>
        </>
    );
}

function MatchingQuestion({
                              page,
                              value,
                              onChange,
                          }: {
    readonly page:
        Extract<
            DiagnosticPage,
            {
                readonly type:
                    "matching";
            }
        >;
    readonly value:
        DiagnosticMatchingAnswers;
    readonly onChange:
        (
            itemId: string,
            choiceId: string,
        ) => void;
}) {
    return (
        <>
            <h2>
                {
                    page.question
                        .title ??
                    "Moslashtirish"
                }
            </h2>

            <p
                className={
                    styles.instruction
                }
            >
                {
                    page.question
                        .instruction
                }
            </p>

            <QuestionImage
                image={
                    page.question
                        .image
                }
            />

            <div
                className={
                    styles.matchingChoices
                }
            >
                {page.question.choices.map(
                    (
                        choice,
                    ) => (
                        <div
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
                        </div>
                    ),
                )}
            </div>

            <div
                className={
                    styles.matchingItems
                }
            >
                {page.question.items.map(
                    (
                        item,
                    ) => (
                        <article
                            key={
                                item.id
                            }
                        >
                            <header>
                                <strong>
                                    {
                                        item.order
                                    }
                                </strong>
                                <span>
                                    {
                                        item.prompt
                                    }
                                </span>
                            </header>

                            <div>
                                {page.question.choices.map(
                                    (
                                        choice,
                                    ) => (
                                        <button
                                            key={
                                                choice.id
                                            }
                                            type="button"
                                            className={
                                                value[
                                                    item.id
                                                    ] ===
                                                choice.id
                                                    ? styles.selectedChoice
                                                    : undefined
                                            }
                                            onClick={() =>
                                                onChange(
                                                    item.id,
                                                    choice.id,
                                                )
                                            }
                                        >
                                            {
                                                choice.id
                                            }
                                        </button>
                                    ),
                                )}
                            </div>
                        </article>
                    ),
                )}
            </div>
        </>
    );
}

function ShortAnswerQuestion({
                                 page,
                                 value,
                                 onChange,
                             }: {
    readonly page:
        Extract<
            DiagnosticPage,
            {
                readonly type:
                    "short-answer";
            }
        >;
    readonly value:
        string;
    readonly onChange:
        (
            value: string,
        ) => void;
}) {
    return (
        <>
            <h2>
                {
                    page.question
                        .question
                }
            </h2>

            {page.question.context ? (
                <div
                    className={
                        styles.context
                    }
                >
                    {
                        page.question
                            .context
                    }
                </div>
            ) : null}

            <QuestionImage
                image={
                    page.question
                        .image
                }
            />

            {page.question.examples ? (
                <div
                    className={
                        styles.examples
                    }
                >
                    {page.question.examples.map(
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

            <textarea
                className={
                    styles.answerArea
                }
                value={value}
                rows={5}
                placeholder="JAVOBNI SHU YERGA YOZING..."
                onChange={(
                    event,
                ) =>
                    onChange(
                        toUppercaseAnswer(
                            event.target
                                .value,
                        ),
                    )
                }
            />
        </>
    );
}

function MultipartQuestion({
                               page,
                               value,
                               onChange,
                           }: {
    readonly page:
        Extract<
            DiagnosticPage,
            {
                readonly type:
                    "multipart";
            }
        >;
    readonly value:
        DiagnosticMultipartAnswers;
    readonly onChange:
        (
            partId: string,
            value: string,
        ) => void;
}) {
    return (
        <>
            <h2>
                {
                    page.question
                        .question
                }
            </h2>

            {page.question.context ? (
                <div
                    className={
                        styles.context
                    }
                >
                    {
                        page.question
                            .context
                    }
                </div>
            ) : null}

            <QuestionImage
                image={
                    page.question
                        .image
                }
            />

            <div
                className={
                    styles.multipart
                }
            >
                {page.question.parts.map(
                    (
                        part,
                    ) => (
                        <article
                            key={
                                part.id
                            }
                        >
                            <header>
                                <strong>
                                    {
                                        part.label
                                            .toUpperCase()
                                    }
                                </strong>
                                <span>
                                    {
                                        part.score
                                    }{" "}
                                    ball
                                </span>
                            </header>

                            <p>
                                {
                                    part.question
                                }
                            </p>

                            <textarea
                                value={
                                    value[
                                        part.id
                                        ] ?? ""
                                }
                                rows={4}
                                placeholder={`${part.label.toUpperCase()}) JAVOBNI YOZING...`}
                                onChange={(
                                    event,
                                ) =>
                                    onChange(
                                        part.id,
                                        toUppercaseAnswer(
                                            event.target
                                                .value,
                                        ),
                                    )
                                }
                            />
                        </article>
                    ),
                )}
            </div>
        </>
    );
}

function EssayQuestion({
                           page,
                           value,
                           onChange,
                       }: {
    readonly page:
        Extract<
            DiagnosticPage,
            {
                readonly type:
                    "essay";
            }
        >;
    readonly value:
        string;
    readonly onChange:
        (
            value: string,
        ) => void;
}) {
    const wordCount =
        value
            .trim()
            .split(
                /\s+/,
            )
            .filter(Boolean)
            .length;

    const requirements = [
        ...page.question
            .requirements
            .introduction,
        ...page.question
            .requirements.body,
        ...page.question
            .requirements
            .conclusion,
        ...(
            page.question
                .requirements
                .warnings ??
            []
        ),
    ];

    return (
        <>
            <h2>
                {
                    page.question
                        .title
                }
            </h2>

            <p
                className={
                    styles.instruction
                }
            >
                {
                    page.question
                        .prompt
                }
            </p>

            {page.question.situation ? (
                <div
                    className={
                        styles.essaySituation
                    }
                >
                    {
                        page.question
                            .situation
                    }
                </div>
            ) : null}

            <details
                className={
                    styles.requirements
                }
            >
                <summary>
                    Esse talablari
                </summary>

                <ul>
                    {requirements.map(
                        (
                            requirement,
                        ) => (
                            <li
                                key={
                                    requirement
                                }
                            >
                                {
                                    requirement
                                }
                            </li>
                        ),
                    )}
                </ul>
            </details>

            <div
                className={
                    styles.essayMeta
                }
            >
                <span>
                    Kamida{" "}
                    {
                        page.question
                            .requirements
                            .minimumWords
                    }{" "}
                    so‘z
                </span>

                <strong>
                    {wordCount} so‘z
                </strong>
            </div>

            <textarea
                className={
                    styles.essayArea
                }
                value={value}
                rows={18}
                placeholder="ESSENI SHU YERGA YOZING..."
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target
                            .value,
                    )
                }
            />
        </>
    );
}


function getVerdictLabel(
    verdict:
        "correct" |
        "incorrect" |
        "unanswered" |
        "pending",
): string {
    if (
        verdict ===
        "correct"
    ) {
        return "To‘g‘ri";
    }

    if (
        verdict ===
        "incorrect"
    ) {
        return "Noto‘g‘ri";
    }

    if (
        verdict ===
        "pending"
    ) {
        return "Tekshirilmoqda";
    }

    return "Javobsiz";
}

function DiagnosticAnswerReview({
    test,
    result,
    answers,
}: {
    readonly test:
        DiagnosticTestDefinition;
    readonly result:
        DiagnosticTestScoreResult;
    readonly answers:
        DiagnosticAnswers;
}) {
    const pages =
        createPages(
            test,
        );

    return (
        <section
            className={
                styles.answerReview
            }
        >
            <header
                className={
                    styles.answerReviewHeader
                }
            >
                <div>
                    <span>
                        JAVOBLAR TAHLILI
                    </span>

                    <h2>
                        Har bir topshiriq
                        bo‘yicha natija
                    </h2>
                </div>

                <small>
                    Ovozli izoh faqat
                    noto‘g‘ri yoki javobsiz
                    topshiriqlarda ko‘rsatiladi.
                </small>
            </header>

            <div
                className={
                    styles.answerReviewList
                }
            >
                {pages.map(
                    (
                        page,
                    ) => {
                        if (
                            page.type ===
                            "matching"
                        ) {
                            const values =
                                (
                                    answers[
                                        page.question.id
                                    ] as
                                        DiagnosticMatchingAnswers
                                ) ??
                                {};

                            return (
                                <article
                                    key={
                                        page.question.id
                                    }
                                    className={
                                        styles.reviewCard
                                    }
                                >
                                    <header>
                                        <div>
                                            <span>
                                                {
                                                    getPageLabel(
                                                        page,
                                                    )
                                                }
                                                -savollar
                                            </span>

                                            <h3>
                                                {
                                                    page.question
                                                        .instruction
                                                }
                                            </h3>
                                        </div>
                                    </header>

                                    <div
                                        className={
                                            styles.reviewParts
                                        }
                                    >
                                        {page.question.items.map(
                                            (
                                                item,
                                            ) => {
                                                const itemResult =
                                                    result.questionResults.find(
                                                        (
                                                            entry,
                                                        ) =>
                                                            entry.questionId ===
                                                            item.id,
                                                    );

                                                if (
                                                    !itemResult
                                                ) {
                                                    return null;
                                                }

                                                const selectedId =
                                                    values[
                                                        item.id
                                                    ];

                                                const selectedText =
                                                    page.question.choices.find(
                                                        (
                                                            choice,
                                                        ) =>
                                                            choice.id ===
                                                            selectedId,
                                                    )?.text;

                                                const correctText =
                                                    page.question.choices.find(
                                                        (
                                                            choice,
                                                        ) =>
                                                            choice.id ===
                                                            item.correctChoiceId,
                                                    )?.text;

                                                return (
                                                    <section
                                                        key={
                                                            item.id
                                                        }
                                                        className={
                                                            styles.reviewPart
                                                        }
                                                    >
                                                        <header>
                                                            <strong>
                                                                {
                                                                    item.order
                                                                }
                                                                -savol
                                                            </strong>

                                                            <span
                                                                className={
                                                                    styles[
                                                                        itemResult.verdict
                                                                    ]
                                                                }
                                                            >
                                                                {
                                                                    getVerdictLabel(
                                                                        itemResult.verdict,
                                                                    )
                                                                }
                                                            </span>
                                                        </header>

                                                        <p>
                                                            {
                                                                item.prompt
                                                            }
                                                        </p>

                                                        <dl>
                                                            <div>
                                                                <dt>
                                                                    Sizning
                                                                    javobingiz
                                                                </dt>
                                                                <dd>
                                                                    {
                                                                        selectedId
                                                                            ? `${selectedId}) ${selectedText ?? ""}`
                                                                            : "Javob berilmagan"
                                                                    }
                                                                </dd>
                                                            </div>

                                                            <div>
                                                                <dt>
                                                                    To‘g‘ri
                                                                    javob
                                                                </dt>
                                                                <dd>
                                                                    {
                                                                        item.correctChoiceId
                                                                    }
                                                                    ){" "}
                                                                    {
                                                                        correctText
                                                                    }
                                                                </dd>
                                                            </div>
                                                        </dl>

                                                        <QuestionAudioExplanation
                                                            explanation={
                                                                item.explanation
                                                            }
                                                            visible={
                                                                itemResult.verdict !==
                                                                "correct"
                                                            }
                                                        />
                                                    </section>
                                                );
                                            },
                                        )}
                                    </div>
                                </article>
                            );
                        }

                        const questionResult =
                            result.questionResults.find(
                                (
                                    entry,
                                ) =>
                                    entry.questionId ===
                                    page.question.id,
                            );

                        if (
                            !questionResult
                        ) {
                            return null;
                        }

                        if (
                            page.type ===
                            "multipart"
                        ) {
                            const values =
                                (
                                    answers[
                                        page.question.id
                                    ] as
                                        DiagnosticMultipartAnswers
                                ) ??
                                {};

                            return (
                                <article
                                    key={
                                        page.question.id
                                    }
                                    className={
                                        styles.reviewCard
                                    }
                                >
                                    <header>
                                        <div>
                                            <span>
                                                {
                                                    page.question.order
                                                }
                                                -savol
                                            </span>

                                            <h3>
                                                {
                                                    page.question.question
                                                }
                                            </h3>
                                        </div>

                                        <strong>
                                            {
                                                questionResult.awardedScore
                                            }
                                            /
                                            {
                                                questionResult.maximumScore
                                            }
                                        </strong>
                                    </header>

                                    <div
                                        className={
                                            styles.reviewParts
                                        }
                                    >
                                        {page.question.parts.map(
                                            (
                                                part,
                                            ) => {
                                                const partResult =
                                                    questionResult.parts?.find(
                                                        (
                                                            entry,
                                                        ) =>
                                                            entry.partId ===
                                                            part.id,
                                                    );

                                                if (
                                                    !partResult
                                                ) {
                                                    return null;
                                                }

                                                return (
                                                    <section
                                                        key={
                                                            part.id
                                                        }
                                                        className={
                                                            styles.reviewPart
                                                        }
                                                    >
                                                        <header>
                                                            <strong>
                                                                {
                                                                    part.label
                                                                }
                                                                )
                                                            </strong>

                                                            <span
                                                                className={
                                                                    styles[
                                                                        partResult.verdict
                                                                    ]
                                                                }
                                                            >
                                                                {
                                                                    getVerdictLabel(
                                                                        partResult.verdict,
                                                                    )
                                                                }
                                                            </span>
                                                        </header>

                                                        <p>
                                                            {
                                                                part.question
                                                            }
                                                        </p>

                                                        <dl>
                                                            <div>
                                                                <dt>
                                                                    Sizning
                                                                    javobingiz
                                                                </dt>
                                                                <dd>
                                                                    {
                                                                        values[
                                                                            part.id
                                                                        ]?.trim() ||
                                                                        "Javob berilmagan"
                                                                    }
                                                                </dd>
                                                            </div>

                                                            <div>
                                                                <dt>
                                                                    Qabul
                                                                    qilinadigan
                                                                    javob
                                                                </dt>
                                                                <dd>
                                                                    {
                                                                        part.acceptedAnswers.join(
                                                                            " / ",
                                                                        )
                                                                    }
                                                                </dd>
                                                            </div>
                                                        </dl>

                                                        <QuestionAudioExplanation
                                                            explanation={
                                                                part.explanation
                                                            }
                                                            visible={
                                                                partResult.verdict !==
                                                                "correct"
                                                            }
                                                        />
                                                    </section>
                                                );
                                            },
                                        )}
                                    </div>
                                </article>
                            );
                        }

                        const answer =
                            answers[
                                page.question.id
                            ];

                        const questionText =
                            page.type ===
                            "essay"
                                ? page.question.title
                                : page.question.question;

                        let userAnswer =
                            "Javob berilmagan";

                        let correctAnswer:
                            string | undefined;

                        let explanation:
                            QuestionExplanation | undefined;

                        if (
                            page.type ===
                            "choice"
                        ) {
                            const selectedId =
                                typeof answer ===
                                "string"
                                    ? answer
                                    : undefined;

                            const selectedOption =
                                page.question.options.find(
                                    (
                                        option,
                                    ) =>
                                        option.id ===
                                        selectedId,
                                );

                            const correctOption =
                                page.question.options.find(
                                    (
                                        option,
                                    ) =>
                                        option.id ===
                                        page.question.correctOptionId,
                                );

                            userAnswer =
                                selectedId
                                    ? `${selectedId}) ${selectedOption?.text ?? ""}`
                                    : "Javob berilmagan";

                            correctAnswer =
                                `${page.question.correctOptionId}) ${correctOption?.text ?? ""}`;

                            explanation =
                                page.question.explanation;
                        } else if (
                            page.type ===
                            "short-answer"
                        ) {
                            userAnswer =
                                typeof answer ===
                                    "string" &&
                                answer.trim()
                                    ? answer
                                    : "Javob berilmagan";

                            correctAnswer =
                                page.question.acceptedAnswers.join(
                                    " / ",
                                );

                            explanation =
                                page.question.explanation;
                        } else {
                            userAnswer =
                                typeof answer ===
                                    "string" &&
                                answer.trim()
                                    ? answer
                                    : "Esse yozilmagan";
                        }

                        return (
                            <article
                                key={
                                    page.question.id
                                }
                                className={
                                    styles.reviewCard
                                }
                            >
                                <header>
                                    <div>
                                        <span>
                                            {
                                                page.question.order
                                            }
                                            -savol
                                        </span>

                                        <h3>
                                            {
                                                questionText
                                            }
                                        </h3>
                                    </div>

                                    <span
                                        className={
                                            styles[
                                                questionResult.verdict
                                            ]
                                        }
                                    >
                                        {
                                            getVerdictLabel(
                                                questionResult.verdict,
                                            )
                                        }
                                    </span>
                                </header>

                                <div
                                    className={
                                        styles.reviewScore
                                    }
                                >
                                    {
                                        questionResult.awardedScore
                                    }
                                    /
                                    {
                                        questionResult.maximumScore
                                    }{" "}
                                    ball
                                </div>

                                <dl
                                    className={
                                        styles.reviewAnswers
                                    }
                                >
                                    <div>
                                        <dt>
                                            Sizning
                                            javobingiz
                                        </dt>
                                        <dd>
                                            {
                                                userAnswer
                                            }
                                        </dd>
                                    </div>

                                    {correctAnswer ? (
                                        <div>
                                            <dt>
                                                To‘g‘ri
                                                javob
                                            </dt>
                                            <dd>
                                                {
                                                    correctAnswer
                                                }
                                            </dd>
                                        </div>
                                    ) : null}
                                </dl>

                                <QuestionAudioExplanation
                                    explanation={
                                        explanation
                                    }
                                    visible={
                                        questionResult.verdict ===
                                            "incorrect" ||
                                        questionResult.verdict ===
                                            "unanswered"
                                    }
                                />
                            </article>
                        );
                    },
                )}
            </div>
        </section>
    );
}

function ResultView({
                        test,
                        result,
                        answers,
                        certificateRecord,
                        openCertificateInitially,
                        onInitialCertificateClose,
                        onRestart,
                    }: {
    readonly test:
        DiagnosticTestDefinition;
    readonly result:
        DiagnosticTestScoreResult;
    readonly answers:
        DiagnosticAnswers;
    readonly certificateRecord:
        DiagnosticCertificateRecord | null;
    readonly openCertificateInitially:
        boolean;
    readonly onInitialCertificateClose:
        () => void;
    readonly onRestart:
        () => void;
}) {
    const router =
        useRouter();

    const [
        isCertificateOpen,
        setIsCertificateOpen,
    ] = useState(
        openCertificateInitially &&
        Boolean(certificateRecord),
    );

    const closeCertificate = () => {
        setIsCertificateOpen(false);
        onInitialCertificateClose();
    };

    const sectionLabels:
        Readonly<
            Record<
                string,
                string
            >
        > = {
        grammar:
            "Grammatika",
        literature:
            "Badiiy asarlar",
        "scientific-text":
            "Ilmiy matn",
        "literary-text":
            "Badiiy matn",
        ghazal:
            "G‘azal",
        syntax:
            "Sintaksis",
        written:
            "Yozma topshiriqlar",
        essay:
            "Esse",
    };

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
                <section
                    className={
                        styles.resultHero
                    }
                >
                    <span>
                        DIAGNOSTIKA YAKUNLANDI
                    </span>

                    <h1>
                        {test.title}
                    </h1>

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
                        <small>
                            /{" "}
                            {
                                result.maximumScore
                            }
                        </small>
                    </div>

                    {result.pendingCount >
                    0 ? (
                        <p>
                            Esse tekshirilmoqda.
                            Hozirgi ball esse
                            balisiz ko‘rsatildi.
                        </p>
                    ) : null}
                </section>

                <section
                    className={
                        styles.resultStats
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
                                result.pendingCount
                            }
                        </strong>
                        <span>
                            Tekshirilmoqda
                        </span>
                    </article>
                </section>

                <section
                    className={
                        styles.sectionResults
                    }
                >
                    <h2>
                        Bo‘limlar bo‘yicha
                        natija
                    </h2>

                    {result.sectionResults.map(
                        (
                            section,
                        ) => (
                            <article
                                key={
                                    section.section
                                }
                            >
                                <header>
                                    <strong>
                                        {
                                            sectionLabels[
                                                section.section
                                                ]
                                        }
                                    </strong>
                                    <span>
                                        {
                                            section.score
                                        }
                                        /
                                        {
                                            section.maximumScore
                                        }
                                    </span>
                                </header>

                                <div>
                                    <span
                                        style={{
                                            width:
                                                `${section.percentage}%`,
                                        }}
                                    />
                                </div>

                                <small>
                                    {
                                        section.percentage
                                    }
                                    %
                                </small>
                            </article>
                        ),
                    )}
                </section>


                <section className={styles.certificateCallout}>
                    <div>
                        <span>TA’LIMOT SERTIFIKATI</span>
                        <h2>
                            Diagnostika natijangizni
                            sertifikat ko‘rinishida saqlang
                        </h2>
                        <p>
                            Sertifikat profil ma’lumotlaringiz va
                            yakunlangan natijangiz asosida yaratiladi.
                        </p>
                    </div>

                    {certificateRecord ? (
                        <button
                            type="button"
                            onClick={() =>
                                setIsCertificateOpen(true)
                            }
                        >
                            Sertifikatni ko‘rish
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/profil")
                            }
                        >
                            Profilni to‘ldirish
                        </button>
                    )}
                </section>

                <DiagnosticAnswerReview
                    test={test}
                    result={result}
                    answers={answers}
                />

                <div
                    className={
                        styles.resultActions
                    }
                >
                    <button
                        type="button"
                        onClick={
                            onRestart
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
                        Diagnostika
                        testlariga qaytish
                    </button>
                </div>
            </div>

            {isCertificateOpen &&
            certificateRecord ? (
                <DiagnosticCertificatePreview
                    testTitle={test.title}
                    result={result}
                    record={certificateRecord}
                    onClose={
                        closeCertificate
                    }
                />
            ) : null}
        </main>
    );
}

export function DiagnosticTestRunner({
                                         test,
                                     }: DiagnosticTestRunnerProps) {
    const router =
        useRouter();

    const searchParams =
        useSearchParams();

    const attemptId =
        searchParams.get(
            "attempt",
        );

    const pages =
        useMemo(
            () =>
                createPages(
                    test,
                ),
            [
                test,
            ],
        );

    const metadata =
        useMemo<
            StoredTestMetadata
        >(
            () => ({
                title:
                test.title,
                category:
                    "To‘liq diagnostika imtihonlar to‘plami",
                href:
                    `/tests/milliy-sertifikat/diagnostika/${test.slug}`,
                totalQuestions:
                test.questionCount,
                estimatedMinutes:
                test.estimatedMinutes,
                isPremium:
                    test.access ===
                    "premium",
                format:
                    "diagnostic",
            }),
            [
                test,
            ],
        );

    const [
        answers,
        setAnswers,
    ] =
        useState<
            DiagnosticAnswers
        >({});

    const [
        currentIndex,
        setCurrentIndex,
    ] =
        useState(
            0,
        );

    const [
        remainingSeconds,
        setRemainingSeconds,
    ] =
        useState(
            test.estimatedMinutes *
            60,
        );

    const [
        view,
        setView,
    ] =
        useState<
            RunnerView
        >(
            "test",
        );

    const [
        result,
        setResult,
    ] =
        useState<
            DiagnosticTestScoreResult | null
        >(
            null,
        );

    const [
        certificateRecord,
        setCertificateRecord,
    ] =
        useState<
            DiagnosticCertificateRecord | null
        >(null);

    const [
        openCertificateOnResult,
        setOpenCertificateOnResult,
    ] =
        useState(false);

    const [
        isLoaded,
        setIsLoaded,
    ] =
        useState(
            false,
        );

    const [
        isExitDialogOpen,
        setIsExitDialogOpen,
    ] = useState(false);

    const [
        isFinishOpen,
        setIsFinishOpen,
    ] =
        useState(
            false,
        );

    const completedRef =
        useRef(
            false,
        );

    const currentPage =
        pages[
            currentIndex
            ];

    const answeredCount =
        countAnsweredUnits(
            pages,
            answers,
        );

    useEffect(() => {
        if (attemptId) {
            const completed =
                readCompletedTest(
                    attemptId,
                );

            if (
                completed &&
                completed.testId ===
                test.id
            ) {
                const restoredAnswers =
                    completed.answers as
                        DiagnosticAnswers;

                const restoredResult =
                    calculateDiagnosticTestScore(
                        test,
                        restoredAnswers,
                    );

                setAnswers(
                    restoredAnswers,
                );

                setResult(
                    restoredResult,
                );

                setCertificateRecord(
                    readDiagnosticCertificateRecord(
                        attemptId,
                    ),
                );

                setOpenCertificateOnResult(
                    false,
                );

                setView(
                    "result",
                );

                completedRef.current =
                    true;

                setIsLoaded(
                    true,
                );

                return;
            }

            router.replace(
                `/tests/milliy-sertifikat/diagnostika/${test.slug}`,
            );

            setIsLoaded(
                true,
            );

            return;
        }

        const progress =
            readTestProgress(
                test.id,
            );

        if (progress) {
            setAnswers(
                progress.answers as
                    DiagnosticAnswers,
            );

            setCurrentIndex(
                Math.min(
                    pages.length -
                    1,
                    Math.max(
                        0,
                        progress.currentIndex,
                    ),
                ),
            );

            setRemainingSeconds(
                calculateRestoredTime(
                    progress,
                ),
            );
        }

        setIsLoaded(
            true,
        );
    }, [
        attemptId,
        pages.length,
        router,
        test,
    ]);

    useEffect(() => {
        if (
            !isLoaded ||
            view !==
            "test" ||
            completedRef.current
        ) {
            return;
        }

        const timer =
            window.setTimeout(
                () => {
                    saveTestProgress({
                        testId:
                        test.id,
                        metadata,
                        currentIndex,
                        answers:
                            answers as
                                StoredTestAnswers,
                        markedQuestionIds:
                            [],
                        remainingSeconds,
                    });
                },
                180,
            );

        return () =>
            window.clearTimeout(
                timer,
            );
    }, [
        answers,
        currentIndex,
        isLoaded,
        metadata,
        remainingSeconds,
        test.id,
        view,
    ]);

    useEffect(() => {
        if (
            !isLoaded ||
            view !==
            "test" ||
            isFinishOpen
        ) {
            return;
        }

        const interval =
            window.setInterval(
                () =>
                    setRemainingSeconds(
                        (
                            value,
                        ) =>
                            Math.max(
                                0,
                                value -
                                1,
                            ),
                    ),
                1000,
            );

        return () =>
            window.clearInterval(
                interval,
            );
    }, [
        isFinishOpen,
        isLoaded,
        view,
    ]);

    const finish =
        useCallback(() => {
            if (
                completedRef.current
            ) {
                return;
            }

            completedRef.current =
                true;

            const finalResult =
                calculateDiagnosticTestScore(
                    test,
                    answers,
                );

            setResult(
                finalResult,
            );

            setIsFinishOpen(
                false,
            );

            const completed =
                saveCompletedTest({
                    testId:
                    test.id,
                    metadata,
                    answers:
                        answers as
                            StoredTestAnswers,
                    correctCount:
                    finalResult.correctCount,
                    incorrectCount:
                    finalResult.incorrectCount,
                    unansweredCount:
                    finalResult.unansweredCount,
                    needsReviewCount:
                    finalResult.pendingCount,
                    percentage:
                    finalResult.percentage,
                    durationSeconds:
                        test.estimatedMinutes *
                        60 -
                        remainingSeconds,
                    score:
                    finalResult.score,
                    maximumScore:
                    finalResult.maximumScore,
                });

            if (completed) {
                const nextCertificateRecord =
                    createDiagnosticCertificateRecord({
                        attemptId:
                            completed.attemptId,
                        profile:
                            readUserProfile(),
                    });

                setCertificateRecord(
                    nextCertificateRecord,
                );

                setOpenCertificateOnResult(
                    Boolean(
                        nextCertificateRecord,
                    ),
                );

                setView(
                    "result",
                );

                router.replace(
                    `/tests/milliy-sertifikat/diagnostika/${test.slug}?attempt=${completed.attemptId}`,
                );

                return;
            }

            setOpenCertificateOnResult(
                false,
            );

            setView(
                "result",
            );
        }, [
            answers,
            metadata,
            remainingSeconds,
            test,
        ]);

    useEffect(() => {
        if (
            isLoaded &&
            view ===
            "test" &&
            remainingSeconds ===
            0
        ) {
            finish();
        }
    }, [
        finish,
        isLoaded,
        remainingSeconds,
        view,
    ]);

    function updateAnswer(
        questionId:
        string,
        value:
        DiagnosticAnswers[
            string
            ],
    ) {
        setAnswers(
            (
                current,
            ) => ({
                ...current,
                [
                    questionId
                    ]: value,
            }),
        );
    }

    function restart() {
        removeTestProgress(
            test.id,
        );

        if (attemptId) {
            removeCompletedTest(
                attemptId,
            );
        }

        completedRef.current =
            false;

        setAnswers(
            {},
        );

        setCurrentIndex(
            0,
        );

        setRemainingSeconds(
            test.estimatedMinutes *
            60,
        );

        setResult(
            null,
        );

        setCertificateRecord(
            null,
        );

        setOpenCertificateOnResult(
            false,
        );

        setView(
            "test",
        );

        router.replace(
            `/tests/milliy-sertifikat/diagnostika/${test.slug}`,
        );
    }

    if (
        view ===
        "result" &&
        result
    ) {
        return (
            <ResultView
                test={test}
                result={
                    result
                }
                answers={
                    answers
                }
                certificateRecord={
                    certificateRecord
                }
                openCertificateInitially={
                    openCertificateOnResult
                }
                onInitialCertificateClose={() =>
                    setOpenCertificateOnResult(
                        false,
                    )
                }
                onRestart={
                    restart
                }
            />
        );
    }

    if (
        !currentPage
    ) {
        return null;
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
                        aria-label="Diagnostikaga qaytish"
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
                            To‘liq diagnostika
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
                        <small>
                            Qolgan vaqt
                        </small>

                        <strong
                            className={
                                remainingSeconds <=
                                600
                                    ? styles.dangerTime
                                    : undefined
                            }
                        >
                            {
                                formatTime(
                                    remainingSeconds,
                                )
                            }
                        </strong>
                    </article>

                    <article>
                        <small>
                            Bajarildi
                        </small>

                        <strong>
                            {answeredCount}/
                            {
                                test.questionCount
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
                            Umumiy jarayon
                        </span>

                        <strong>
                            {Math.round(
                                (
                                    answeredCount /
                                    test.questionCount
                                ) *
                                100,
                            )}
                            %
                        </strong>
                    </header>

                    <div
                        className={
                            styles.progressTrack
                        }
                    >
                        <span
                            style={{
                                width:
                                    `${Math.round(
                                        (
                                            answeredCount /
                                            test.questionCount
                                        ) *
                                        100,
                                    )}%`,
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
                    {pages.map(
                        (
                            page,
                            index,
                        ) => (
                            <button
                                key={`${getPageLabel(
                                    page,
                                )}-${index}`}
                                type="button"
                                className={[
                                    isPageAnswered(
                                        page,
                                        answers,
                                    )
                                        ? styles.answeredQuestion
                                        : "",
                                    index ===
                                    currentIndex
                                        ? styles.currentQuestion
                                        : "",
                                ]
                                    .filter(
                                        Boolean,
                                    )
                                    .join(
                                        " ",
                                    )}
                                onClick={() =>
                                    setCurrentIndex(
                                        index,
                                    )
                                }
                            >
                                {
                                    getPageLabel(
                                        page,
                                    )
                                }
                            </button>
                        ),
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
                                    getPageLabel(
                                        currentPage,
                                    )
                                }
                                -savol
                            </span>

                            <small>
                                Milliy sertifikat
                                diagnostikasi
                            </small>
                        </div>

                        <strong>
                            {currentPage.type ===
                            "matching"
                                ? currentPage.question.items
                                    .reduce(
                                        (
                                            total,
                                            item,
                                        ) =>
                                            total +
                                            item.maximumScore,
                                        0,
                                    )
                                    .toFixed(
                                        1,
                                    )
                                : currentPage.question
                                    .maximumScore}{" "}
                            ball
                        </strong>
                    </header>

                    {currentPage.type ===
                    "choice" ? (
                        <ChoiceQuestion
                            page={
                                currentPage
                            }
                            value={
                                answers[
                                    currentPage
                                        .question
                                        .id
                                    ] as
                                    | string
                                    | undefined
                            }
                            onChange={(
                                value,
                            ) =>
                                updateAnswer(
                                    currentPage
                                        .question
                                        .id,
                                    value,
                                )
                            }
                        />
                    ) : null}

                    {currentPage.type ===
                    "matching" ? (
                        <MatchingQuestion
                            page={
                                currentPage
                            }
                            value={
                                (
                                    answers[
                                        currentPage
                                            .question
                                            .id
                                        ] as
                                        DiagnosticMatchingAnswers
                                ) ??
                                {}
                            }
                            onChange={(
                                itemId,
                                choiceId,
                            ) => {
                                const current =
                                    (
                                        answers[
                                            currentPage
                                                .question
                                                .id
                                            ] as
                                            DiagnosticMatchingAnswers
                                    ) ??
                                    {};

                                updateAnswer(
                                    currentPage
                                        .question
                                        .id,
                                    {
                                        ...current,
                                        [
                                            itemId
                                            ]:
                                            choiceId as
                                                "A" |
                                                "B" |
                                                "C" |
                                                "D" |
                                                "E" |
                                                "F",
                                    },
                                );
                            }}
                        />
                    ) : null}

                    {currentPage.type ===
                    "short-answer" ? (
                        <ShortAnswerQuestion
                            page={
                                currentPage
                            }
                            value={
                                (
                                    answers[
                                        currentPage
                                            .question
                                            .id
                                        ] as
                                        string
                                ) ??
                                ""
                            }
                            onChange={(
                                value,
                            ) =>
                                updateAnswer(
                                    currentPage
                                        .question
                                        .id,
                                    value,
                                )
                            }
                        />
                    ) : null}

                    {currentPage.type ===
                    "multipart" ? (
                        <MultipartQuestion
                            page={
                                currentPage
                            }
                            value={
                                (
                                    answers[
                                        currentPage
                                            .question
                                            .id
                                        ] as
                                        DiagnosticMultipartAnswers
                                ) ??
                                {}
                            }
                            onChange={(
                                partId,
                                value,
                            ) => {
                                const current =
                                    (
                                        answers[
                                            currentPage
                                                .question
                                                .id
                                            ] as
                                            DiagnosticMultipartAnswers
                                    ) ??
                                    {};

                                updateAnswer(
                                    currentPage
                                        .question
                                        .id,
                                    {
                                        ...current,
                                        [
                                            partId
                                            ]:
                                        value,
                                    },
                                );
                            }}
                        />
                    ) : null}

                    {currentPage.type ===
                    "essay" ? (
                        <EssayQuestion
                            page={
                                currentPage
                            }
                            value={
                                (
                                    answers[
                                        currentPage
                                            .question
                                            .id
                                        ] as
                                        string
                                ) ??
                                ""
                            }
                            onChange={(
                                value,
                            ) =>
                                updateAnswer(
                                    currentPage
                                        .question
                                        .id,
                                    value,
                                )
                            }
                        />
                    ) : null}
                </section>

                <footer
                    className={
                        styles.actions
                    }
                >
                    <button
                        type="button"
                        disabled={
                            currentIndex ===
                            0
                        }
                        onClick={() =>
                            setCurrentIndex(
                                (
                                    index,
                                ) =>
                                    Math.max(
                                        0,
                                        index -
                                        1,
                                    ),
                            )
                        }
                    >
                        <ArrowLeftIcon />
                        Oldingi
                    </button>

                    {currentIndex ===
                    pages.length -
                    1 ? (
                        <button
                            type="button"
                            className={
                                styles.finishButton
                            }
                            onClick={() =>
                                setIsFinishOpen(
                                    true,
                                )
                            }
                        >
                            Yakunlash
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={
                                styles.nextButton
                            }
                            onClick={() =>
                                setCurrentIndex(
                                    (
                                        index,
                                    ) =>
                                        Math.min(
                                            pages.length -
                                            1,
                                            index +
                                            1,
                                        ),
                                )
                            }
                        >
                            Keyingi
                            <ArrowRightIcon />
                        </button>
                    )}
                </footer>
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
                        currentIndex,
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

            {isFinishOpen ? (
                <div
                    className={
                        styles.dialogBackdrop
                    }
                    role="presentation"
                >
                    <section
                        className={
                            styles.dialog
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="finish-title"
                    >
                        <h2
                            id="finish-title"
                        >
                            Imtihonni
                            yakunlaysizmi?
                        </h2>

                        <p>
                            {
                                test.questionCount -
                                answeredCount
                            }{" "}
                            ta topshiriq
                            javobsiz qolgan.
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    setIsFinishOpen(
                                        false,
                                    )
                                }
                            >
                                Davom etish
                            </button>

                            <button
                                type="button"
                                onClick={
                                    finish
                                }
                            >
                                Yakunlash
                            </button>
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}