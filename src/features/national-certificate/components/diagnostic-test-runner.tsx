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
    parseDiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";

import {
    DiagnosticCertificatePreview,
} from "@/features/national-certificate/components/diagnostic-certificate-preview";
import { ButtonLoader } from "@/components/ui/button-loader";
import { usePendingNavigation } from "@/hooks/use-pending-navigation";

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

function stripDuplicatedInlineOptions(value: string): string {
    const normalized = value.trim();
    const match = /(?:^|\s)A\)\s/u.exec(normalized);

    if (!match || match.index < 0) {
        return normalized;
    }

    const suffix = normalized.slice(match.index);
    const hasAllOptions = ["B", "C", "D"].every((letter) =>
        new RegExp(`(?:^|\\s)${letter}\\)\\s`, "u").test(suffix),
    );

    return hasAllOptions
        ? normalized.slice(0, match.index).trim()
        : normalized;
}

function formatMatchingPrompt(value: string): string {
    return stripDuplicatedInlineOptions(value)
        .replace(/\s*\/\s*/gu, "\n")
        .trim();
}

function splitWrittenContext(value: string): {
    readonly body: string;
    readonly instruction: string;
} {
    const normalized = stripDuplicatedInlineOptions(value);
    const instructionPattern = /(?:^|\n|\s)(Xato qo[ʻ'’]llangan tinish belgisi|Qo[ʻ'’]shimcha qo[ʻ'’]yib|Ajratib yozilishi lozim bo[ʻ'’]lgan|Diqqat!|Javobingizni javoblar varaqasiga)/iu;
    const match = instructionPattern.exec(normalized);

    if (!match || match.index <= 0) {
        return { body: normalized, instruction: "" };
    }

    return {
        body: normalized.slice(0, match.index).trim(),
        instruction: normalized.slice(match.index).trim(),
    };
}

function parsePairOption(value: string): readonly [string, string] | null {
    const parts = value
        .split(/\s*(?:→|⇒|->)\s*/u)
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.length === 2
        ? [parts[0]!, parts[1]!]
        : null;
}

function parseTriangleOption(value: string): readonly [string, string, string] | null {
    const parts = value
        .split(/\s+[—–−-]\s+/u)
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.length === 3
        ? [parts[0]!, parts[1]!, parts[2]!]
        : null;
}

function DiagnosticOptionContent({
    order,
    text,
}: {
    readonly order: number;
    readonly text: string;
}) {
    if (order === 3) {
        const pair = parsePairOption(text);

        if (pair) {
            return (
                <span className={styles.definitionDiagram}>
                    <span>{pair[0]}</span>
                    <b aria-hidden="true">→</b>
                    <span>{pair[1]}</span>
                </span>
            );
        }
    }

    if (order === 4) {
        const triangle = parseTriangleOption(text);

        if (triangle) {
            return (
                <span className={styles.synonymTriangle} aria-label={text}>
                    <span className={styles.synonymTriangleTop}>{triangle[0]}</span>
                    <b className={styles.synonymArrowLeft} aria-hidden="true">↙</b>
                    <b className={styles.synonymArrowRight} aria-hidden="true">↘</b>
                    <span className={styles.synonymTriangleLeft}>{triangle[1]}</span>
                    <b className={styles.synonymArrowBottom} aria-hidden="true">↔</b>
                    <span className={styles.synonymTriangleRight}>{triangle[2]}</span>
                </span>
            );
        }
    }

    return <span>{text}</span>;
}

function ShakldoshDiagram({ context }: { readonly context?: string }) {
    const cleaned = context ? stripDuplicatedInlineOptions(context) : "";
    const pieces = cleaned
        .split(/\s*(?:→|⇒|->)\s*/u)
        .map((part) => part.trim())
        .filter(Boolean);
    const left = pieces[0] ?? "Nom-nishon, iz";
    const right = pieces.length >= 3 ? pieces[2]! : pieces[1] ?? "Ijod mahsuli";

    return (
        <div className={styles.shakldoshDiagram} aria-label={`${left}; noma’lum shakldosh so‘z; ${right}`}>
            <span>{left}</span>
            <b aria-hidden="true">←</b>
            <strong>?</strong>
            <b aria-hidden="true">→</b>
            <span>{right}</span>
        </div>
    );
}

function getOptionalEssayScore(
    test: DiagnosticTestDefinition,
    answers: DiagnosticAnswers,
): number | null {
    const essayQuestion = test.questions.find(
        (question) => question.type === "essay",
    );
    if (!essayQuestion) return null;

    const raw = answers[essayQuestion.id];
    if (typeof raw !== "string" || raw.trim() === "") return null;

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 75
        ? Math.round(parsed * 100) / 100
        : null;
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
    readonly page: Extract<DiagnosticPage, { readonly type: "choice" }>;
    readonly value?: string;
    readonly onChange: (value: string) => void;
}) {
    const cleanQuestion = stripDuplicatedInlineOptions(page.question.question);
    const cleanContext = page.question.context
        ? stripDuplicatedInlineOptions(page.question.context)
        : "";

    return (
        <>
            {page.passage ? (
                <Passage title={page.passageTitle} blocks={page.passage} />
            ) : null}

            <h2>{cleanQuestion}</h2>

            {cleanContext ? (
                <div className={styles.context}>{cleanContext}</div>
            ) : null}

            <QuestionImage image={page.question.image} />

            <div className={styles.options}>
                {page.question.options.map((option) => {
                    const selected = value === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`${selected ? styles.selectedOption : ""} ${
                                page.question.order === 3 || page.question.order === 4
                                    ? styles.visualOption
                                    : ""
                            }`}
                            onClick={() => onChange(option.id)}
                        >
                            <strong>{option.id}</strong>
                            <DiagnosticOptionContent
                                order={page.question.order}
                                text={option.text}
                            />
                            <i aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        </>
    );
}

function MatchingQuestion({
    page,
    value,
    onChange,
}: {
    readonly page: Extract<DiagnosticPage, { readonly type: "matching" }>;
    readonly value: DiagnosticMatchingAnswers;
    readonly onChange: (itemId: string, choiceId: string) => void;
}) {
    return (
        <>
            <h2>{page.question.title ?? "33–35-savollar"}</h2>

            <p className={styles.instruction}>{page.question.instruction}</p>

            <QuestionImage image={page.question.image} />

            <div className={styles.matchingPaper}>
                <section className={styles.matchingItemColumn}>
                    {page.question.items.map((item) => (
                        <article key={item.id} className={styles.matchingPaperItem}>
                            <header>
                                <strong>{item.order}</strong>
                                <span>{formatMatchingPrompt(item.prompt)}</span>
                            </header>

                            <div className={styles.matchingChoiceButtons}>
                                {page.question.choices.map((choice) => (
                                    <button
                                        key={choice.id}
                                        type="button"
                                        aria-label={`${item.order}-savol uchun ${choice.id} javob`}
                                        className={
                                            value[item.id] === choice.id
                                                ? styles.selectedChoice
                                                : undefined
                                        }
                                        onClick={() => onChange(item.id, choice.id)}
                                    >
                                        {choice.id}
                                    </button>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>

                <aside className={styles.matchingChoiceBank}>
                    <span className={styles.matchingChoiceBankTitle}>A–F izohlar</span>
                    {page.question.choices.map((choice) => (
                        <div key={choice.id}>
                            <strong>{choice.id}</strong>
                            <span>{choice.text}</span>
                        </div>
                    ))}
                </aside>
            </div>
        </>
    );
}

function ShortAnswerQuestion({
    page,
    value,
    onChange,
}: {
    readonly page: Extract<DiagnosticPage, { readonly type: "short-answer" }>;
    readonly value: string;
    readonly onChange: (value: string) => void;
}) {
    const context = page.question.context
        ? splitWrittenContext(page.question.context)
        : { body: "", instruction: "" };
    const isShakldosh = page.question.order === 36;

    return (
        <>
            <h2>{stripDuplicatedInlineOptions(page.question.question)}</h2>

            {isShakldosh ? (
                <ShakldoshDiagram context={page.question.context} />
            ) : context.body ? (
                <div className={styles.context}>{context.body}</div>
            ) : null}

            <QuestionImage image={page.question.image} />

            {context.instruction ? (
                <p className={styles.answerHint}>{context.instruction}</p>
            ) : null}

            {page.question.examples ? (
                <div className={styles.examples}>
                    {page.question.examples.map((example) => (
                        <span key={example}>{example}</span>
                    ))}
                </div>
            ) : null}

            <input
                className={styles.answerLine}
                value={value}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="JAVOBNI YOZING..."
                onChange={(event) => onChange(toUppercaseAnswer(event.target.value))}
            />
        </>
    );
}

function MultipartQuestion({
    page,
    value,
    onChange,
}: {
    readonly page: Extract<DiagnosticPage, { readonly type: "multipart" }>;
    readonly value: DiagnosticMultipartAnswers;
    readonly onChange: (partId: string, value: string) => void;
}) {
    const context = page.question.context
        ? splitWrittenContext(page.question.context)
        : { body: "", instruction: "" };

    return (
        <>
            <h2>{stripDuplicatedInlineOptions(page.question.question)}</h2>

            {context.body ? (
                <div className={styles.context}>{context.body}</div>
            ) : null}

            <QuestionImage image={page.question.image} />

            {context.instruction ? (
                <p className={styles.answerHint}>{context.instruction}</p>
            ) : null}

            <div className={styles.multipart}>
                {page.question.parts.map((part) => (
                    <article key={part.id}>
                        <header>
                            <strong>{part.label.toUpperCase()}</strong>
                            <span>{part.score} ball</span>
                        </header>

                        <p>{part.question}</p>

                        <input
                            className={styles.multipartAnswerLine}
                            value={value[part.id] ?? ""}
                            type="text"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={`${part.label.toUpperCase()}) JAVOBNI YOZING...`}
                            onChange={(event) =>
                                onChange(part.id, toUppercaseAnswer(event.target.value))
                            }
                        />
                    </article>
                ))}
            </div>
        </>
    );
}

function EssayQuestion({
    page,
    value,
    onChange,
}: {
    readonly page: Extract<DiagnosticPage, { readonly type: "essay" }>;
    readonly value: string;
    readonly onChange: (value: string) => void;
}) {
    const requirements = [
        ...page.question.requirements.introduction,
        ...page.question.requirements.body,
        ...page.question.requirements.conclusion,
        ...(page.question.requirements.warnings ?? []),
    ];

    return (
        <>
            <h2>{page.question.title}</h2>

            <p className={styles.instruction}>
                {page.question.prompt}
            </p>

            {page.question.situation ? (
                <div className={styles.essaySituation}>
                    {page.question.situation}
                </div>
            ) : null}

            <div className={styles.requirements}>
                <strong>Esse talablari</strong>
                <ul>
                    {requirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                    ))}
                </ul>
            </div>

            <section className={styles.essayScoreSection}>
                <span className={styles.essayScoreEyebrow}>OLDINGI ESSE NATIJANGIZ</span>
                <h3>Avvalgi esse natijangizni bilasizmi?</h3>
                <p>
                    Agar avval esse yozib, natijangizni aniq bilsangiz,
                    0 dan 75 gacha bo‘lgan ballni kiriting.
                </p>

                <label className={styles.essayScoreField}>
                    <span>Esse qismi</span>
                    <span className={styles.essayScoreInputWrap}>
                        <input
                            type="number"
                            min="0"
                            max="75"
                            step="0.01"
                            inputMode="decimal"
                            value={value}
                            placeholder="Masalan: 63"
                            onChange={(event) => onChange(event.target.value)}
                        />
                        <strong>/ 75 ball</strong>
                    </span>
                </label>

                <p className={styles.optionalNote}>
                    Bu qism ixtiyoriy. Esse natijangizni bilmasangiz,
                    ushbu qismni bo‘sh qoldirib “Yakunlash”ni bosing.
                </p>
            </section>
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
                                                                    Platformadagi
                                                                    to‘g‘ri javob
                                                                </dt>
                                                                <dd>
                                                                    {(
                                                                        part.comparison ===
                                                                            "manual-review" ||
                                                                        (
                                                                            page.question.order ===
                                                                                44 &&
                                                                            part.label ===
                                                                                "b"
                                                                        )
                                                                    )
                                                                        ? "Qo‘lda tekshiriladi"
                                                                        : part.acceptedAnswers.join(
                                                                            " / ",
                                                                        ) ||
                                                                        "—"}
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

                                    <QuestionAudioExplanation
                                        explanation={page.question.explanation}
                                        visible={questionResult.verdict !== "correct"}
                                    />
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
                                : stripDuplicatedInlineOptions(page.question.question);

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

export function DiagnosticResultView({
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
    const navigation = usePendingNavigation();
    const [isRestarting, setIsRestarting] = useState(false);

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

                    <div className={styles.scoreCircle}>
                        <strong>
                            {(result.finalScore ?? result.testScore).toFixed(2)}
                        </strong>
                        <small>/ 75</small>
                    </div>

                    <p>
                        Test qismi: <strong>{result.testScore.toFixed(2)} / 75</strong>
                        {result.essayScore === null
                            ? " · Esse qismi kiritilmagan"
                            : ` · Esse: ${result.essayScore.toFixed(2)} / 75`}
                        {result.finalScore !== null
                            ? ` · Yakuniy: ${result.finalScore.toFixed(2)} / 75 · Daraja: ${result.grade ?? "—"}`
                            : ""}
                    </p>
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

                    <button
                        type="button"
                        disabled={!certificateRecord && navigation.pending}
                        aria-busy={!certificateRecord && navigation.pending ? true : undefined}
                        onClick={() => {
                            if (certificateRecord) {
                                setIsCertificateOpen(true);
                                return;
                            }

                            navigation.push("/profil");
                        }}
                    >
                        {!certificateRecord && navigation.pending ? (
                            <><ButtonLoader /> Profil ochilmoqda...</>
                        ) : certificateRecord
                            ? "Sertifikatni ko‘rish"
                            : "Profilni to‘ldirish"}
                    </button>
                </section>

                {result.questionResults.length > 0 ? (
                    <DiagnosticAnswerReview
                        test={test}
                        result={result}
                        answers={answers}
                    />
                ) : (
                    <section className={styles.certificateCallout}>
                        <div>
                            <span>DATABASE NATIJASI</span>
                            <h2>Batafsil javoblar faqat imtihon topshirilgan qurilmada mavjud.</h2>
                            <p>Sertifikat va yakuniy natija hisobingizda doimiy saqlanadi.</p>
                        </div>
                    </section>
                )}

                <div
                    className={
                        styles.resultActions
                    }
                >
                    <button
                        type="button"
                        disabled={isRestarting || navigation.pending}
                        aria-busy={isRestarting || undefined}
                        onClick={() => {
                            if (isRestarting || navigation.pending) return;
                            setIsRestarting(true);
                            onRestart();
                        }}
                    >
                        {isRestarting ? (
                            <><ButtonLoader /> Qayta ochilmoqda...</>
                        ) : "Qayta ishlash"}
                    </button>

                    <button
                        type="button"
                        disabled={navigation.pending || isRestarting}
                        aria-busy={navigation.pending || undefined}
                        onClick={() => navigation.replace(collectionsHref)}
                    >
                        {navigation.pending ? (
                            <><ButtonLoader /> Qaytilmoqda...</>
                        ) : "Diagnostika testlariga qaytish"}
                    </button>
                </div>
            </div>

            {isCertificateOpen &&
            certificateRecord ? (
                <DiagnosticCertificatePreview
                    testTitle={test.title}
                    result={result}
                    record={certificateRecord}
                    onClose={closeCertificate}
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finishError, setFinishError] = useState("");

    const completedRef =
        useRef(
            false,
        );

    // Absolute deadline keeps the exam timer accurate when Telegram/iOS throttles
    // JavaScript in the background. The timer never pauses behind dialogs.
    const deadlineRef = useRef<number | null>(null);

    // Keep one stable attempt id across finish retries so a network retry cannot
    // create a second DB attempt/certificate for the same exam submission.
    const submissionAttemptIdRef = useRef<string | null>(null);

    const currentPage =
        pages[
            currentIndex
            ];

    const requiredPages = useMemo(
        () => pages.filter((page) => page.type !== "essay"),
        [pages],
    );

    const answeredCount =
        countAnsweredUnits(
            requiredPages,
            answers,
        );

    const requiredQuestionCount = Math.max(0, test.questionCount - 1);

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
                        getOptionalEssayScore(test, restoredAnswers),
                    );

                setAnswers(
                    restoredAnswers,
                );

                setResult(
                    restoredResult,
                );

                setCertificateRecord(null);

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
            const restoredSeconds = calculateRestoredTime(progress);

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

            setRemainingSeconds(restoredSeconds);
            deadlineRef.current = Date.now() + restoredSeconds * 1000;
        } else {
            const initialSeconds = test.estimatedMinutes * 60;
            setRemainingSeconds(initialSeconds);
            deadlineRef.current = Date.now() + initialSeconds * 1000;
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
                    const deadline = deadlineRef.current;
                    const remainingAtSave = deadline === null
                        ? test.estimatedMinutes * 60
                        : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

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
                        remainingSeconds: remainingAtSave,
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
        test.id,
        view,
    ]);

    useEffect(() => {
        if (!isLoaded || view !== "test" || completedRef.current) {
            return;
        }

        if (deadlineRef.current === null) {
            deadlineRef.current = Date.now() + test.estimatedMinutes * 60 * 1000;
        }

        const syncRemainingTime = () => {
            const deadline = deadlineRef.current;
            if (deadline === null) return;

            setRemainingSeconds(
                Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
            );
        };

        syncRemainingTime();
        const interval = window.setInterval(syncRemainingTime, 500);
        const onVisibilityChange = () => syncRemainingTime();
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [isLoaded, test.estimatedMinutes, view]);

    const finish =
        useCallback(async () => {
            if (completedRef.current || isSubmitting) {
                return;
            }

            const essayQuestion = test.questions.find((question) => question.type === "essay");
            const essayRaw = essayQuestion
                ? answers[essayQuestion.id]
                : undefined;
            const essayText = typeof essayRaw === "string" ? essayRaw.trim() : "";
            const essayScore = essayText === "" ? null : Number(essayText);

            if (essayScore !== null && (!Number.isFinite(essayScore) || essayScore < 0 || essayScore > 75)) {
                setFinishError("Esse natijasi 0 dan 75 gacha bo‘lishi kerak.");
                setIsFinishOpen(false);
                return;
            }

            setFinishError("");
            // Ref guard closes the same-frame double-tap window before the
            // disabled state can render. It is reset in catch on failure.
            completedRef.current = true;
            setIsSubmitting(true);

            try {
                if (!submissionAttemptIdRef.current) {
                    submissionAttemptIdRef.current = `${test.id}-${Date.now()}-${
                        typeof crypto !== "undefined" && "randomUUID" in crypto
                            ? crypto.randomUUID()
                            : Math.random().toString(36).slice(2)
                    }`;
                }

                const clientAttemptId = submissionAttemptIdRef.current!;

                const response = await fetch("/api/diagnostic-attempts/complete", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        attemptId: clientAttemptId,
                        testSlug: test.slug,
                        answers,
                        essayScore,
                        durationSeconds: test.estimatedMinutes * 60 - remainingSeconds,
                    }),
                });

                const payload = await response.json() as {
                    error?: string;
                    attemptId?: string;
                    result?: DiagnosticTestScoreResult;
                    certificate?: unknown;
                };

                if (!response.ok || !payload.attemptId || !payload.result) {
                    throw new Error(payload.error || "Diagnostikani yakunlab bo‘lmadi.");
                }

                const savedCertificate = parseDiagnosticCertificateRecord(payload.certificate);
                if (!savedCertificate) {
                    throw new Error("Sertifikat databasega saqlanmadi.");
                }

                completedRef.current = true;
                setResult(payload.result);
                setCertificateRecord(savedCertificate);
                setIsFinishOpen(false);

                saveCompletedTest({
                    attemptId: payload.attemptId,
                    skipRemotePersistence: true,
                    testId: test.id,
                    metadata,
                    answers: answers as StoredTestAnswers,
                    correctCount: payload.result.correctCount,
                    incorrectCount: payload.result.incorrectCount,
                    unansweredCount: payload.result.unansweredCount,
                    needsReviewCount: 0,
                    percentage: Math.round(payload.result.percentage),
                    durationSeconds: test.estimatedMinutes * 60 - remainingSeconds,
                    score: payload.result.finalScore ?? payload.result.testScore,
                    maximumScore: 75,
                });

                removeTestProgress(test.id);

                router.replace(
                    `/tests/milliy-sertifikat/diagnostika/${test.slug}/natija?attempt=${encodeURIComponent(payload.attemptId)}`,
                );
            } catch (error) {
                completedRef.current = false;
                setFinishError(
                    error instanceof Error
                        ? error.message
                        : "Diagnostikani yakunlab bo‘lmadi. Qayta urinib ko‘ring.",
                );
                setIsFinishOpen(false);
            } finally {
                setIsSubmitting(false);
            }
        }, [
            answers,
            isSubmitting,
            metadata,
            remainingSeconds,
            router,
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
        submissionAttemptIdRef.current =
            null;

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
            <DiagnosticResultView
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
                                requiredQuestionCount
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
                                    Math.max(1, requiredQuestionCount)
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
                                            Math.max(1, requiredQuestionCount)
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

            {finishError ? (
                <div className={styles.finishError} role="alert">{finishError}</div>
            ) : null}

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
                        "/tests",
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
                                requiredQuestionCount -
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
                                onClick={finish}
                                disabled={isSubmitting}
                                aria-busy={isSubmitting || undefined}
                            >
                                {isSubmitting ? (
                                    <><ButtonLoader /> Natija saqlanmoqda...</>
                                ) : "Yakunlash"}
                            </button>
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}