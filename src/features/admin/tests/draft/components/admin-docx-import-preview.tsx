"use client";

import {
    useActionState,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    previewAdminDocxImportAction,
} from "../actions/preview-admin-docx-import-action";
import {
    initialAdminDocxImportPreviewActionState,
} from "../model/admin-docx-import-preview-action-state";
import type {
    AdminParsedMcqQuestion,
} from "../model/admin-docx-parser-types";
import type {
    AdminPassageDocxParseResult,
} from "../model/admin-passage-docx-parser-types";
import type {
    AdminGhazalDocxParseResult,
} from "../model/admin-ghazal-docx-parser-types";
import type {
    AdminLiteraryWorksDocxParseResult,
} from "../model/admin-literary-works-docx-parser-types";
import type {
    AdminMixedDocxParseResult,
    AdminParsedMixedQuestion,
} from "../model/admin-mixed-docx-parser-types";
import type {
    AdminDiagnosticDocxParseResult,
    AdminParsedDiagnosticQuestion,
} from "../model/admin-diagnostic-docx-parser-types";

import styles from "./admin-docx-import-preview.module.css";

function formatFileSize(
    bytes:
        number,
): string {
    if (
        bytes <
        1024 * 1024
    ) {
        return `${Math.max(
            1,
            Math.round(
                bytes / 1024,
            ),
        )} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(2)} MB`;
}

const blockLabels = {
    heading:
        "Sarlavha",
    paragraph:
        "Paragraf",
    "list-item":
        "Ro‘yxat",
    "table-row":
        "Jadval qatori",
} as const;

function mixedQuestionTypeLabel(
    question:
        AdminParsedMixedQuestion |
        AdminParsedDiagnosticQuestion,
): string {
    if (question.type === "multiple-choice") return "Multiple-choice";
    if (question.type === "matching") return "Matching";
    if (question.type === "short-answer") return "Short-answer";
    if (question.type === "essay") return "Esse";
    if (question.type === "passage-group") return "Passage-group";
    return "Multipart";
}

type AdminDocxParserTarget =
    | "auto"
    | "standard"
    | "literary-works"
    | "scientific-text"
    | "literary-text"
    | "ghazal"
    | "mixed"
    | "diagnostic";

interface AdminDocxImportPreviewProps {
    readonly parserTarget?:
        AdminDocxParserTarget;
    readonly onImportQuestions:
        (
            questions:
                readonly AdminParsedMcqQuestion[],
        ) => void;
    readonly onImportPassage:
        (
            passage:
                AdminPassageDocxParseResult,
        ) => void;
    readonly onImportGhazal:
        (
            ghazal:
                AdminGhazalDocxParseResult,
        ) => void;
    readonly onImportLiteraryWorks:
        (
            literaryWorks:
                AdminLiteraryWorksDocxParseResult,
        ) => void;
    readonly onImportMixed:
        (
            mixed:
                AdminMixedDocxParseResult,
        ) => void;
    readonly onImportDiagnostic:
        (
            diagnostic:
                AdminDiagnosticDocxParseResult,
        ) => void;
}

export function AdminDocxImportPreview({
    parserTarget = "auto",
    onImportQuestions,
    onImportPassage,
    onImportGhazal,
    onImportLiteraryWorks,
    onImportMixed,
    onImportDiagnostic,
}: AdminDocxImportPreviewProps) {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        previewAdminDocxImportAction,
        initialAdminDocxImportPreviewActionState,
    );


    const [
        selectedQuestionNumbers,
        setSelectedQuestionNumbers,
    ] = useState<
        ReadonlySet<number>
    >(
        () =>
            new Set(),
    );

    const [
        answerOverrides,
        setAnswerOverrides,
    ] = useState<
        Readonly<
            Partial<
                Record<
                    number,
                    "A" | "B" | "C" | "D"
                >
            >
        >
    >(
        {},
    );

    useEffect(() => {
        const nextSelected =
            new Set<number>();

        state.parsedMcq?.questions.forEach(
            (question) => {
                if (
                    question.confidence !==
                    "invalid"
                ) {
                    nextSelected.add(
                        question.sourceNumber,
                    );
                }
            },
        );

        setSelectedQuestionNumbers(
            nextSelected,
        );

        setAnswerOverrides(
            {},
        );
    }, [
        state.parsedMcq,
    ]);

    const importableQuestions =
        useMemo(
            () =>
                (
                    state.parsedMcq
                        ?.questions ??
                    []
                )
                    .filter(
                        (question) =>
                            selectedQuestionNumbers.has(
                                question.sourceNumber,
                            ) &&
                            question.confidence !==
                                "invalid",
                    )
                    .map(
                        (question) => ({
                            ...question,
                            correctOptionId:
                                answerOverrides[
                                    question.sourceNumber
                                ] ??
                                question.correctOptionId,
                        }),
                    ),
            [
                answerOverrides,
                selectedQuestionNumbers,
                state.parsedMcq,
            ],
        );

    const unresolvedSelectedCount =
        importableQuestions.filter(
            (question) =>
                !question.correctOptionId,
        ).length;

    function toggleQuestionSelection(
        sourceNumber:
            number,
    ) {
        setSelectedQuestionNumbers(
            (current) => {
                const next =
                    new Set(
                        current,
                    );

                if (
                    next.has(
                        sourceNumber,
                    )
                ) {
                    next.delete(
                        sourceNumber,
                    );
                } else {
                    next.add(
                        sourceNumber,
                    );
                }

                return next;
            },
        );
    }

    function selectAllImportable() {
        setSelectedQuestionNumbers(
            new Set(
                (
                    state.parsedMcq
                        ?.questions ??
                    []
                )
                    .filter(
                        (question) =>
                            question.confidence !==
                            "invalid",
                    )
                    .map(
                        (question) =>
                            question.sourceNumber,
                    ),
            ),
        );
    }

    function clearSelection() {
        setSelectedQuestionNumbers(
            new Set(),
        );
    }

    function importSelectedQuestions() {
        if (
            importableQuestions.length ===
            0
        ) {
            return;
        }

        onImportQuestions(
            importableQuestions,
        );
    }

    return (
        <section
            className={
                styles.section
            }
        >
            <div
                className={
                    styles.header
                }
            >
                <div>
                    <span>
                        DOCX IMPORT · 1-BOSQICH
                    </span>

                    <h2>
                        Word hujjatini tahlil qilish
                    </h2>

                    <p>
                        Hujjat hozircha draftga
                        qo‘shilmaydi. Avval matn,
                        sarlavha va jadval bloklari
                        xavfsiz preview qilinadi.
                    </p>
                </div>

                <span
                    className={
                        styles.safeBadge
                    }
                >
                    Draft o‘zgarmaydi
                </span>
            </div>

            <form
                action={formAction}
                className={
                    styles.uploadForm
                }
            >
                <input
                    type="hidden"
                    name="parserTarget"
                    value={parserTarget}
                />
                <label
                    className={
                        styles.fileField
                    }
                >
                    <span>
                        DOCX fayl
                    </span>

                    <input
                        type="file"
                        name="docxFile"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        required
                    />

                    <small>
                        Faqat .docx · maksimal
                        hajm 10 MB
                    </small>
                </label>

                <button
                    type="submit"
                    disabled={pending}
                    className={
                        styles.previewButton
                    }
                >
                    {pending
                        ? "Tahlil qilinmoqda..."
                        : "DOCX ni tahlil qilish"}
                </button>
            </form>

            {state.message && (
                <div
                    className={
                        state.status ===
                        "success"
                            ? styles.success
                            : styles.error
                    }
                    role="status"
                >
                    {state.message}
                </div>
            )}

            {state.status ===
                "success" &&
                state.summary && (
                <>
                    <div
                        className={
                            styles.fileMeta
                        }
                    >
                        <strong>
                            {state.fileName}
                        </strong>

                        {state.fileSizeBytes !==
                            null && (
                            <span>
                                {formatFileSize(
                                    state.fileSizeBytes,
                                )}
                            </span>
                        )}
                    </div>

                    <div
                        className={
                            styles.stats
                        }
                    >
                        <article>
                            <span>
                                Bloklar
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .blockCount
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Sarlavhalar
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .headingCount
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Paragraflar
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .paragraphCount
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Jadval qatori
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .tableRowCount
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Savol boshlanishi
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .detectedQuestionStarts
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Ogohlantirish
                            </span>
                            <strong>
                                {
                                    state.summary
                                        .warningCount
                                }
                            </strong>
                        </article>
                    </div>

                    {state.parsedMcq &&
                        !state.parsedMixed &&
                        !state.parsedPassage &&
                        !state.parsedGhazal &&
                        !state.parsedLiteraryWorks &&
                        !state.parsedDiagnostic && (
                        <div className={styles.importToolbar}>
                            <div>
                                <strong>
                                    {selectedQuestionNumbers.size} ta savol importga tayyor
                                </strong>
                                <span>
                                    {unresolvedSelectedCount > 0
                                        ? `${unresolvedSelectedCount} ta savolda to‘g‘ri javobni belgilang, so‘ng import qiling`
                                        : "DOCX tahlili tugadi. Endi savollarni draftga import qilishingiz mumkin."}
                                </span>
                            </div>

                            <div className={styles.importToolbarActions}>
                                <button
                                    type="button"
                                    onClick={selectAllImportable}
                                    className={styles.secondaryImportButton}
                                >
                                    Barchasini tanlash
                                </button>

                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className={styles.secondaryImportButton}
                                >
                                    Tanlovni tozalash
                                </button>

                                <button
                                    type="button"
                                    onClick={importSelectedQuestions}
                                    disabled={importableQuestions.length === 0}
                                    className={styles.importButton}
                                >
                                    DOCX ni draftga import qilish
                                </button>
                            </div>
                        </div>
                    )}

                    {state.parsedDiagnostic && (
                        <section className={styles.mixedParserSection}>
                            <div className={styles.mixedParserHeader}>
                                <div>
                                    <span>DIAGNOSTIC PARSER · STEP 6.7A</span>
                                    <h3>Diagnostika test strukturasi aniqlandi</h3>
                                    <p>
                                        Variantli, matnli, matching, qisqa javob,
                                        multipart va esse savollari draft importi
                                        uchun tekshirildi.
                                    </p>
                                </div>
                                <span className={`${styles.passageConfidence} ${styles[`passageConfidence_${state.parsedDiagnostic.confidence}`]}`}>
                                    {state.parsedDiagnostic.confidenceScore}%
                                </span>
                            </div>

                            <div className={styles.mixedMetaGrid}>
                                <article><span>Sarlavha</span><strong>{state.parsedDiagnostic.metadata.title ?? "Topilmadi"}</strong></article>
                                <article><span>Savol bloklari</span><strong>{state.parsedDiagnostic.questions.length}</strong></article>
                                <article><span>Topshiriqlar</span><strong>{state.parsedDiagnostic.taskCount}</strong></article>
                                <article><span>Yakuniy maksimal ball</span><strong>{state.parsedDiagnostic.maximumScore}</strong></article>
                                <article><span>Xom ball yig‘indisi</span><strong>{state.parsedDiagnostic.rawMaximumScore}</strong></article>
                                <article><span>Yuqori</span><strong>{state.parsedDiagnostic.highConfidenceCount}</strong></article>
                                <article><span>Tekshirish</span><strong>{state.parsedDiagnostic.reviewCount}</strong></article>
                                <article><span>Invalid</span><strong>{state.parsedDiagnostic.invalidCount}</strong></article>
                            </div>

                            <div className={styles.mixedQuestionList}>
                                {state.parsedDiagnostic.questions.map((question) => (
                                    <article key={question.id} className={`${styles.mixedQuestionCard} ${styles[`confidence_${question.confidence}`]}`}>
                                        <div className={styles.mixedQuestionTop}>
                                            <div>
                                                <strong>{question.sourceOrder}-savol</strong>
                                                <span>{mixedQuestionTypeLabel(question)} · {question.maximumScore} ball</span>
                                            </div>
                                            <span>{question.confidenceScore}%</span>
                                        </div>

                                        <p>
                                            {question.type ===
                                            "passage-group"
                                                ? question.title ??
                                                  `${question.sourceOrder}-savollar uchun matn`
                                                : question.question}
                                        </p>

                                        {"context" in question && question.context && (
                                            <blockquote>{question.context}</blockquote>
                                        )}

                                        {question.type === "essay" && question.situation && (
                                            <blockquote>{question.situation}</blockquote>
                                        )}

                                        {question.type === "passage-group" && (
                                            <div className={styles.mixedCompactList}>
                                                <span>Bo‘lim: {question.section}</span>
                                                <span>Matn bloklari: {question.passage.length}</span>
                                                <span>Ichki savollar: {question.questions.length}</span>
                                            </div>
                                        )}

                                        {question.type === "multiple-choice" && (
                                            <div className={styles.parsedOptions}>
                                                {question.options.map((option) => (
                                                    <div key={option.id}>
                                                        <strong>{option.id}</strong>
                                                        <span>{option.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === "matching" && (
                                            <div className={styles.mixedCompactList}>
                                                {question.items.map((item) => (
                                                    <span key={item.id}>
                                                        {item.sourceOrder}. {item.prompt} → {item.correctChoiceId ?? "?"}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === "short-answer" && (
                                            <div className={styles.mixedCompactList}>
                                                <span>Javoblar: {question.acceptedAnswers.join("; ") || "topilmadi"}</span>
                                                <span>Taqqoslash: {question.comparison}</span>
                                            </div>
                                        )}

                                        {question.type === "multipart" && (
                                            <div className={styles.mixedCompactList}>
                                                {question.parts.map((part) => (
                                                    <span key={part.id}>
                                                        {part.label}) {part.question} · {part.maximumScore} ball
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === "essay" && (
                                            <div className={styles.mixedCompactList}>
                                                <span>
                                                    So‘zlar: minimum {question.minimumWords ?? "—"}, tavsiya {question.recommendedWords ?? "—"}
                                                </span>
                                                <span>
                                                    Rubrika: {question.rubric.join("; ") || "topilmadi"}
                                                </span>
                                            </div>
                                        )}

                                        {question.issues.length > 0 && (
                                            <ul className={styles.issueList}>
                                                {question.issues.map((issue) => (
                                                    <li key={issue}>{issue}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {state.parsedDiagnostic.issues.length > 0 && (
                                <ul className={styles.passageIssues}>
                                    {state.parsedDiagnostic.issues.map((issue) => (
                                        <li key={issue}>{issue}</li>
                                    ))}
                                </ul>
                            )}

                            <div className={styles.passageImportBar}>
                                <div>
                                    <strong>Diagnostika draftga tayyor</strong>
                                    <span>
                                        Barcha yaroqli savollar va esse bitta
                                        diagnostika draftiga qo‘shiladi.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onImportDiagnostic(
                                            state.parsedDiagnostic!,
                                        )
                                    }
                                    disabled={
                                        state.parsedDiagnostic.confidence ===
                                        "invalid"
                                    }
                                >
                                    Diagnostika testini draftga import qilish
                                </button>
                            </div>
                        </section>
                    )}

                    {state.parsedMixed && (
                        <section className={styles.mixedParserSection}>
                            <div className={styles.mixedParserHeader}>
                                <div>
                                    <span>MIXED PARSER · STEP 6.6C</span>
                                    <h3>Aralash test strukturasi aniqlandi</h3>
                                    <p>To‘rt xil savol turi, topshiriqlar soni va ballar human review uchun tayyorlandi.</p>
                                </div>
                                <span className={`${styles.passageConfidence} ${styles[`passageConfidence_${state.parsedMixed.confidence}`]}`}>
                                    {state.parsedMixed.confidenceScore}%
                                </span>
                            </div>

                            <div className={styles.mixedMetaGrid}>
                                <article><span>Sarlavha</span><strong>{state.parsedMixed.metadata.title ?? "Topilmadi"}</strong></article>
                                <article><span>Savol bloklari</span><strong>{state.parsedMixed.questions.length}</strong></article>
                                <article><span>Topshiriqlar</span><strong>{state.parsedMixed.taskCount}</strong></article>
                                <article><span>Maksimal ball</span><strong>{state.parsedMixed.maximumScore}</strong></article>
                                <article><span>Yuqori</span><strong>{state.parsedMixed.highConfidenceCount}</strong></article>
                                <article><span>Tekshirish</span><strong>{state.parsedMixed.reviewCount}</strong></article>
                                <article><span>Invalid</span><strong>{state.parsedMixed.invalidCount}</strong></article>
                            </div>

                            <div className={styles.mixedQuestionList}>
                                {state.parsedMixed.questions.map((question) => (
                                    <article key={question.id} className={`${styles.mixedQuestionCard} ${styles[`confidence_${question.confidence}`]}`}>
                                        <div className={styles.mixedQuestionTop}>
                                            <div>
                                                <strong>{question.sourceOrder}-savol</strong>
                                                <span>{mixedQuestionTypeLabel(question)} · {question.maximumScore} ball</span>
                                            </div>
                                            <span>{question.confidenceScore}%</span>
                                        </div>
                                        <p>{question.question}</p>
                                        {question.context && <blockquote>{question.context}</blockquote>}
                                        {question.type === "multiple-choice" && (
                                            <div className={styles.parsedOptions}>
                                                {question.options.map((option) => <div key={option.id}><strong>{option.id}</strong><span>{option.text}</span></div>)}
                                            </div>
                                        )}
                                        {question.type === "matching" && (
                                            <div className={styles.mixedCompactList}>
                                                {question.items.map((item) => <span key={item.id}>{item.sourceOrder}. {item.prompt} → {item.correctChoiceId ?? "?"}</span>)}
                                            </div>
                                        )}
                                        {question.type === "short-answer" && (
                                            <div className={styles.mixedCompactList}><span>Javoblar: {question.acceptedAnswers.join("; ") || "topilmadi"}</span><span>Taqqoslash: {question.comparison}</span></div>
                                        )}
                                        {question.type === "multipart" && (
                                            <div className={styles.mixedCompactList}>
                                                {question.parts.map((part) => <span key={part.id}>{part.label}) {part.question} · {part.maximumScore} ball</span>)}
                                            </div>
                                        )}
                                        {question.issues.length > 0 && <ul className={styles.issueList}>{question.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
                                    </article>
                                ))}
                            </div>

                            {state.parsedMixed.issues.length > 0 && <ul className={styles.passageIssues}>{state.parsedMixed.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
                            <div className={styles.passageImportBar}>
                                <div>
                                    <strong>Aralash draftga tayyor</strong>
                                    <span>
                                        Barcha yaroqli multiple-choice, matching,
                                        short-answer va multipart savollar birgalikda
                                        draftga qo‘shiladi.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onImportMixed(
                                            state.parsedMixed!,
                                        )
                                    }
                                    disabled={
                                        state.parsedMixed.confidence ===
                                        "invalid"
                                    }
                                >
                                    Aralash testni draftga import qilish
                                </button>
                            </div>
                        </section>
                    )}

                    {state.parsedLiteraryWorks && (
                        <section className={styles.literaryWorksParserSection}>
                            <div className={styles.literaryWorksParserHeader}>
                                <div>
                                    <span>STANDARD-FIVE PARSER</span>
                                    <h3>
                                        Badiiy asarlar testi aniqlandi
                                    </h3>
                                    <p>
                                        Prompt, she’riy parcha, savollar,
                                        variantlar va javoblar kaliti tekshirildi.
                                    </p>
                                </div>

                                <span
                                    className={`${styles.passageConfidence} ${
                                        styles[
                                            `passageConfidence_${state.parsedLiteraryWorks.confidence}`
                                        ]
                                    }`}
                                >
                                    {state.parsedLiteraryWorks.confidenceScore}%
                                </span>
                            </div>

                            <div className={styles.literaryWorksMetaGrid}>
                                <article>
                                    <span>Sarlavha</span>
                                    <strong>
                                        {state.parsedLiteraryWorks.metadata.title ??
                                            "Topilmadi"}
                                    </strong>
                                </article>

                                <article>
                                    <span>Savollar</span>
                                    <strong>
                                        {state.parsedLiteraryWorks.questions.length}
                                    </strong>
                                </article>

                                <article>
                                    <span>Promptli</span>
                                    <strong>
                                        {
                                            state.parsedLiteraryWorks.questions.filter(
                                                (question) =>
                                                    Boolean(question.prompt),
                                            ).length
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>Parchali</span>
                                    <strong>
                                        {
                                            state.parsedLiteraryWorks.questions.filter(
                                                (question) =>
                                                    question.excerpt.length > 0,
                                            ).length
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>Javob kaliti</span>
                                    <strong>
                                        {state.parsedLiteraryWorks.answerKeyCount}
                                    </strong>
                                </article>
                            </div>

                            <div className={styles.literaryWorksQuestionList}>
                                {state.parsedLiteraryWorks.questions.map(
                                    (question) => (
                                        <article
                                            key={question.sourceNumber}
                                            className={`${styles.literaryWorksQuestionCard} ${
                                                styles[
                                                    `confidence_${question.confidence}`
                                                ]
                                            }`}
                                        >
                                            <div className={styles.literaryWorksQuestionTop}>
                                                <strong>
                                                    {question.sourceNumber}-savol
                                                </strong>
                                                <span>
                                                    {question.confidenceScore}%
                                                </span>
                                            </div>

                                            {question.prompt && (
                                                <p className={styles.literaryWorksPrompt}>
                                                    <b>Prompt:</b>{" "}
                                                    {question.prompt}
                                                </p>
                                            )}

                                            {question.excerpt.length > 0 && (
                                                <blockquote>
                                                    {question.excerpt.map(
                                                        (line, index) => (
                                                            <span
                                                                key={`${question.sourceNumber}-excerpt-${index}`}
                                                            >
                                                                {line}
                                                            </span>
                                                        ),
                                                    )}
                                                </blockquote>
                                            )}

                                            <p className={styles.literaryWorksQuestion}>
                                                {question.question}
                                            </p>

                                            <div className={styles.parsedOptions}>
                                                {question.options.map(
                                                    (option) => (
                                                        <div key={option.id}>
                                                            <strong>
                                                                {option.id}
                                                            </strong>
                                                            <span>
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className={styles.literaryWorksAnswer}>
                                                Javob:{" "}
                                                <strong>
                                                    {question.correctOptionId ??
                                                        "topilmadi"}
                                                </strong>
                                            </div>

                                            {question.issues.length > 0 && (
                                                <ul className={styles.issueList}>
                                                    {question.issues.map(
                                                        (issue) => (
                                                            <li key={issue}>
                                                                {issue}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </article>
                                    ),
                                )}
                            </div>

                            {state.parsedLiteraryWorks.issues.length > 0 && (
                                <ul className={styles.passageIssues}>
                                    {state.parsedLiteraryWorks.issues.map(
                                        (issue) => (
                                            <li key={issue}>
                                                {issue}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}

                            <div className={styles.passageImportBar}>
                                <div>
                                    <strong>
                                        Standard-five draftga tayyor
                                    </strong>
                                    <span>
                                        Prompt instruction maydoniga, she’riy
                                        parcha esa context maydoniga saqlanadi.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onImportLiteraryWorks(
                                            state.parsedLiteraryWorks!,
                                        )
                                    }
                                    disabled={
                                        state.parsedLiteraryWorks.confidence ===
                                        "invalid"
                                    }
                                >
                                    Badiiy asarlarni draftga import qilish
                                </button>
                            </div>
                        </section>
                    )}

                    {state.parsedGhazal && (
                        <section className={styles.ghazalParserSection}>
                            <div className={styles.ghazalParserHeader}>
                                <div>
                                    <span>G‘AZAL PARSER</span>
                                    <h3>
                                        G‘azal strukturasi aniqlandi
                                    </h3>
                                    <p>
                                        Muallif, baytlar, lug‘at va 5 ta savol
                                        alohida tekshirildi.
                                    </p>
                                </div>

                                <span
                                    className={`${styles.passageConfidence} ${
                                        styles[
                                            `passageConfidence_${state.parsedGhazal.confidence}`
                                        ]
                                    }`}
                                >
                                    {state.parsedGhazal.confidenceScore}%
                                </span>
                            </div>

                            <div className={styles.ghazalMetaGrid}>
                                <article>
                                    <span>Sarlavha</span>
                                    <strong>
                                        {state.parsedGhazal.metadata.title ??
                                            "Topilmadi"}
                                    </strong>
                                </article>
                                <article>
                                    <span>Muallif</span>
                                    <strong>
                                        {state.parsedGhazal.metadata.author ??
                                            "Topilmadi"}
                                    </strong>
                                </article>
                                <article>
                                    <span>Baytlar</span>
                                    <strong>
                                        {state.parsedGhazal.couplets.length}
                                    </strong>
                                </article>
                                <article>
                                    <span>Lug‘at</span>
                                    <strong>
                                        {state.parsedGhazal.vocabulary.length}
                                    </strong>
                                </article>
                                <article>
                                    <span>Savollar</span>
                                    <strong>
                                        {state.parsedGhazal.questions.length}
                                    </strong>
                                </article>
                                <article>
                                    <span>Javob kaliti</span>
                                    <strong>
                                        {state.parsedGhazal.answerKeyCount}
                                    </strong>
                                </article>
                            </div>

                            <div className={styles.ghazalPreviewGrid}>
                                <div className={styles.ghazalCoupletList}>
                                    <h4>Baytlar</h4>
                                    {state.parsedGhazal.couplets.map(
                                        (couplet) => (
                                            <article key={couplet.order}>
                                                <strong>
                                                    {couplet.order}
                                                </strong>
                                                <p>
                                                    {couplet.firstLine}
                                                    {"\n"}
                                                    {couplet.secondLine}
                                                </p>
                                            </article>
                                        ),
                                    )}
                                </div>

                                <div className={styles.ghazalVocabularyList}>
                                    <h4>Lug‘at</h4>
                                    {state.parsedGhazal.vocabulary.map(
                                        (item, index) => (
                                            <article
                                                key={`${item.term}-${index}`}
                                            >
                                                <strong>
                                                    {item.marker ?? index + 1}
                                                </strong>
                                                <p>
                                                    <b>{item.term}</b>
                                                    {" — "}
                                                    {item.meaning}
                                                </p>
                                            </article>
                                        ),
                                    )}
                                </div>

                                <div className={styles.ghazalQuestionList}>
                                    <h4>5 ta savol</h4>
                                    {state.parsedGhazal.questions.map(
                                        (question) => (
                                            <article
                                                key={question.sourceNumber}
                                            >
                                                <strong>
                                                    {question.sourceNumber}.{" "}
                                                    {question.question}
                                                </strong>
                                                <span>
                                                    Javob:{" "}
                                                    {question.correctOptionId ??
                                                        "topilmadi"}
                                                </span>
                                            </article>
                                        ),
                                    )}
                                </div>
                            </div>

                            {state.parsedGhazal.issues.length > 0 && (
                                <ul className={styles.passageIssues}>
                                    {state.parsedGhazal.issues.map(
                                        (issue) => (
                                            <li key={issue}>
                                                {issue}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}

                            <div className={styles.passageImportBar}>
                                <div>
                                    <strong>
                                        G‘azal draftga tayyor
                                    </strong>
                                    <span>
                                        Importdan keyin baytlar, lug‘at va
                                        savollarni passage-group muharririda
                                        tekshiring.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onImportGhazal(
                                            state.parsedGhazal!,
                                        )
                                    }
                                    disabled={
                                        state.parsedGhazal.confidence ===
                                        "invalid"
                                    }
                                >
                                    G‘azalni draftga import qilish
                                </button>
                            </div>
                        </section>
                    )}

                    {state.parsedPassage && (
                        <section className={styles.passageParserSection}>
                            <div className={styles.passageParserHeader}>
                                <div>
                                    <span>PASSAGE-FIVE PARSER</span>
                                    <h3>
                                        {state.parsedPassage.metadata.topic ===
                                        "scientific-text"
                                            ? "Ilmiy matn aniqlandi"
                                            : "Badiiy matn aniqlandi"}
                                    </h3>
                                    <p>
                                        Matn bloklari va 5 ta savol alohida
                                        struktura sifatida tekshirildi.
                                    </p>
                                </div>

                                <span
                                    className={`${styles.passageConfidence} ${
                                        styles[
                                            `passageConfidence_${state.parsedPassage.confidence}`
                                        ]
                                    }`}
                                >
                                    {state.parsedPassage.confidenceScore}%
                                </span>
                            </div>

                            <div className={styles.passageMetaGrid}>
                                <article>
                                    <span>Sarlavha</span>
                                    <strong>
                                        {state.parsedPassage.metadata.title ??
                                            "Topilmadi"}
                                    </strong>
                                </article>
                                <article>
                                    <span>Matn bloklari</span>
                                    <strong>
                                        {state.parsedPassage.passage.length}
                                    </strong>
                                </article>
                                <article>
                                    <span>Savollar</span>
                                    <strong>
                                        {state.parsedPassage.questions.length}
                                    </strong>
                                </article>
                                <article>
                                    <span>Javob kaliti</span>
                                    <strong>
                                        {state.parsedPassage.answerKeyCount}
                                    </strong>
                                </article>
                            </div>

                            <div className={styles.passagePreviewGrid}>
                                <div className={styles.passageBlockList}>
                                    <h4>Matn strukturasi</h4>
                                    {state.parsedPassage.passage.map((block) => (
                                        <article key={block.id}>
                                            <div>
                                                <strong>
                                                    {block.marker ?? block.order}
                                                </strong>
                                                <span>{block.type}</span>
                                            </div>
                                            <p>
                                                {block.speaker
                                                    ? `${block.speaker}: ${block.text}`
                                                    : block.text}
                                            </p>
                                        </article>
                                    ))}
                                </div>

                                <div className={styles.passageQuestionList}>
                                    <h4>5 ta savol</h4>
                                    {state.parsedPassage.questions.map(
                                        (question) => (
                                            <article key={question.sourceNumber}>
                                                <strong>
                                                    {question.sourceNumber}. {question.question}
                                                </strong>
                                                <span>
                                                    Javob: {question.correctOptionId ??
                                                        "topilmadi"}
                                                </span>
                                            </article>
                                        ),
                                    )}
                                </div>
                            </div>

                            {state.parsedPassage.issues.length > 0 && (
                                <ul className={styles.passageIssues}>
                                    {state.parsedPassage.issues.map((issue) => (
                                        <li key={issue}>{issue}</li>
                                    ))}
                                </ul>
                            )}

                            <div className={styles.passageImportBar}>
                                <div>
                                    <strong>
                                        {state.parsedPassage.metadata.topic ===
                                        "scientific-text"
                                            ? "Ilmiy matn draftga tayyor"
                                            : "Badiiy matn draftga tayyor"}
                                    </strong>
                                    <span>
                                        Matn va 5 ta savol bitta passage-group sifatida
                                        draftga import qilinadi. Importdan keyin draftni
                                        saqlang, keyin nashr qiling.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onImportPassage(
                                            state.parsedPassage!,
                                        )
                                    }
                                    disabled={
                                        state.parsedPassage.confidence ===
                                        "invalid"
                                    }
                                >
                                    {state.parsedPassage.metadata.topic ===
                                    "scientific-text"
                                        ? "Ilmiy matnni draftga import qilish"
                                        : "Badiiy matnni draftga import qilish"}
                                </button>
                            </div>
                        </section>
                    )}

                    {state.parsedMcq &&
                        !state.parsedMixed &&
                        !state.parsedPassage &&
                        !state.parsedGhazal &&
                        !state.parsedLiteraryWorks && (
                        <section className={styles.parserSection}>
                            <div className={styles.parserHeader}>
                                <div>
                                    <span>STANDARD MCQ PARSER</span>
                                    <h3>Avtomatik aniqlangan savollar</h3>
                                    <p>
                                        Savollarni tanlang, kerak bo‘lsa to‘g‘ri
                                        javobni belgilang va draftga import qiling.
                                    </p>
                                </div>

                                <div className={styles.parserStats}>
                                    <article>
                                        <strong>{state.parsedMcq.questions.length}</strong>
                                        <span>Topildi</span>
                                    </article>
                                    <article>
                                        <strong>{state.parsedMcq.highConfidenceCount}</strong>
                                        <span>Yashil</span>
                                    </article>
                                    <article>
                                        <strong>{state.parsedMcq.reviewCount}</strong>
                                        <span>Sariq</span>
                                    </article>
                                    <article>
                                        <strong>{state.parsedMcq.invalidCount}</strong>
                                        <span>Qizil</span>
                                    </article>
                                </div>
                            </div>

                            <div className={styles.parsedList}>
                                {state.parsedMcq.questions.map((question) => (
                                    <article
                                        key={question.sourceNumber}
                                        className={`${styles.parsedCard} ${
                                            styles[
                                                `confidence_${question.confidence}`
                                            ]
                                        }`}
                                    >
                                        <div className={styles.parsedCardTop}>
                                            <div className={styles.questionSelection}>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedQuestionNumbers.has(
                                                            question.sourceNumber,
                                                        )
                                                    }
                                                    disabled={
                                                        question.confidence ===
                                                        "invalid"
                                                    }
                                                    onChange={() =>
                                                        toggleQuestionSelection(
                                                            question.sourceNumber,
                                                        )
                                                    }
                                                    aria-label={`${question.sourceNumber}-savolni tanlash`}
                                                />

                                                <div>
                                                    <strong>
                                                        {question.sourceNumber}-savol
                                                    </strong>
                                                    <span>
                                                        {question.confidenceScore}% confidence
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={styles.confidenceBadge}>
                                                {question.confidence === "high"
                                                    ? "Yuqori ishonch"
                                                    : question.confidence === "review"
                                                      ? "Tekshirish kerak"
                                                      : "Xato"}
                                            </span>
                                        </div>

                                        <p className={styles.parsedQuestion}>
                                            {question.question}
                                        </p>

                                        <div className={styles.parsedOptions}>
                                            {question.options.map((option) => (
                                                <div key={option.id}>
                                                    <strong>{option.id}</strong>
                                                    <span>{option.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className={styles.answerReview}>
                                            <label>
                                                <span>To‘g‘ri javob</span>
                                                <select
                                                    value={
                                                        answerOverrides[
                                                            question.sourceNumber
                                                        ] ??
                                                        question.correctOptionId ??
                                                        ""
                                                    }
                                                    onChange={(event) =>
                                                        setAnswerOverrides(
                                                            (current) => ({
                                                                ...current,
                                                                [question.sourceNumber]:
                                                                    event.target
                                                                        .value as
                                                                        | "A"
                                                                        | "B"
                                                                        | "C"
                                                                        | "D",
                                                            }),
                                                        )
                                                    }
                                                    disabled={
                                                        question.confidence ===
                                                        "invalid"
                                                    }
                                                >
                                                    <option value="">
                                                        Tanlanmagan
                                                    </option>
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            </label>

                                            <span>
                                                {question.correctOptionId
                                                    ? "DOCX javob kalitidan topildi"
                                                    : "Human review talab qilinadi"}
                                            </span>
                                        </div>

                                        {question.issues.length > 0 && (
                                            <ul className={styles.issueList}>
                                                {question.issues.map((issue) => (
                                                    <li key={issue}>{issue}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    <details
                        className={styles.rawInspection}
                    >
                        <summary>
                            DOCX xom preview va strukturani ko‘rish
                        </summary>

                        <div
                            className={
                                styles.previewGrid
                            }
                        >
                            <div
                                className={
                                    styles.blockPreview
                                }
                            >
                                <div
                                    className={
                                        styles.previewHeading
                                    }
                                >
                                    <h3>
                                        Strukturaviy preview
                                    </h3>
                                    <span>
                                        Birinchi {
                                            state.blocks.length
                                        } ta blok
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.blockList
                                    }
                                >
                                    {state.blocks.map(
                                        (
                                            block,
                                            index,
                                        ) => (
                                            <article
                                                key={
                                                    block.id
                                                }
                                            >
                                                <div>
                                                    <span>
                                                        {index +
                                                            1}
                                                    </span>
                                                    <small>
                                                        {
                                                            blockLabels[
                                                                block.kind
                                                            ]
                                                        }
                                                    </small>
                                                </div>

                                                <p>
                                                    {
                                                        block.text
                                                    }
                                                </p>
                                            </article>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div
                                className={
                                    styles.rawPreview
                                }
                            >
                                <div
                                    className={
                                        styles.previewHeading
                                    }
                                >
                                    <h3>
                                        Raw text preview
                                    </h3>
                                    <span>
                                        Maksimal 12 000 belgi
                                    </span>
                                </div>

                                <pre>
                                    {
                                        state.rawTextPreview
                                    }
                                </pre>
                            </div>
                        </div>
                    </details>

                    {state.warnings.length >
                        0 && (
                        <details
                            className={
                                styles.warnings
                            }
                        >
                            <summary>
                                Mammoth
                                ogohlantirishlari (
                                {
                                    state.warnings
                                        .length
                                }
                                )
                            </summary>

                            <ul>
                                {state.warnings.map(
                                    (
                                        warning,
                                    ) => (
                                        <li
                                            key={
                                                warning
                                            }
                                        >
                                            {
                                                warning
                                            }
                                        </li>
                                    ),
                                )}
                            </ul>
                        </details>
                    )}
                </>
            )}
        </section>
    );
}
