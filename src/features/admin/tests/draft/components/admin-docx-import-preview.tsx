"use client";

import {
    useActionState,
} from "react";

import {
    previewAdminDocxImportAction,
} from "../actions/preview-admin-docx-import-action";
import {
    initialAdminDocxImportPreviewActionState,
} from "../model/admin-docx-import-preview-action-state";

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

export function AdminDocxImportPreview() {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        previewAdminDocxImportAction,
        initialAdminDocxImportPreviewActionState,
    );

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


                    {state.parsedMcq && (
                        <section className={styles.parserSection}>
                            <div className={styles.parserHeader}>
                                <div>
                                    <span>STANDARD MCQ PARSER</span>
                                    <h3>Avtomatik aniqlangan savollar</h3>
                                    <p>
                                        Hozircha faqat human-review preview.
                                        Draft savollari o‘zgarmaydi.
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
                                            <div>
                                                <strong>
                                                    {question.sourceNumber}-savol
                                                </strong>
                                                <span>
                                                    {question.confidenceScore}% confidence
                                                </span>
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

                                        <div className={styles.answerRow}>
                                            <span>To‘g‘ri javob:</span>
                                            <strong>
                                                {question.correctOptionId ?? "Topilmadi"}
                                            </strong>
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
