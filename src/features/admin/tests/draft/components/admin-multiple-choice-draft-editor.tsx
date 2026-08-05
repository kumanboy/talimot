"use client";

import Link from "next/link";
import {
    useActionState,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    saveAdminTestDraftAction,
} from "../actions/save-admin-test-draft-action";
import {
    AdminDocxImportPreview,
} from "./admin-docx-import-preview";
import {
    createEmptyMultipleChoiceQuestion,
} from "../model/admin-test-draft-factory";
import {
    initialSaveAdminTestDraftActionState,
} from "../model/save-admin-test-draft-action-state";

import type {
    AdminDraftMultipleChoiceQuestion,
    AdminDraftOptionId,
    AdminDraftQuestion,
    AdminDraftQuestionSection,
} from "../model/admin-question-types";
import type {
    AdminTestDraft,
} from "../model/admin-test-draft-types";

import styles from "./admin-multiple-choice-draft-editor.module.css";

interface AdminMultipleChoiceDraftEditorProps {
    readonly initialDraft:
        AdminTestDraft;
}

const sectionOptions:
    readonly {
        readonly value:
            AdminDraftQuestionSection;
        readonly label:
            string;
    }[] = [
        {
            value:
                "general",
            label:
                "Umumiy",
        },
        {
            value:
                "grammar",
            label:
                "Grammatika",
        },
        {
            value:
                "syntax",
            label:
                "Sintaksis",
        },
        {
            value:
                "literature",
            label:
                "Adabiyot",
        },
        {
            value:
                "scientific-text",
            label:
                "Ilmiy matn",
        },
        {
            value:
                "literary-text",
            label:
                "Badiiy matn",
        },
        {
            value:
                "ghazal",
            label:
                "G‘azal",
        },
    ];

function isMultipleChoice(
    question:
        AdminDraftQuestion,
): question is
    AdminDraftMultipleChoiceQuestion {
    return question.type ===
        "multiple-choice";
}

function normalizeOrders(
    questions:
        readonly AdminDraftMultipleChoiceQuestion[],
): readonly AdminDraftMultipleChoiceQuestion[] {
    return questions.map(
        (
            question,
            index,
        ) => ({
            ...question,
            order:
                index + 1,
        }),
    );
}

export function AdminMultipleChoiceDraftEditor({
    initialDraft,
}: AdminMultipleChoiceDraftEditorProps) {
    const [
        draft,
        setDraft,
    ] = useState(
        initialDraft,
    );

    const [
        actionState,
        formAction,
        pending,
    ] = useActionState(
        saveAdminTestDraftAction,
        initialSaveAdminTestDraftActionState,
    );

    useEffect(() => {
        if (
            actionState.status ===
                "success" &&
            actionState.savedDraft
        ) {
            setDraft(
                actionState.savedDraft,
            );
        }
    }, [
        actionState,
    ]);

    const unsupportedQuestions =
        useMemo(
            () =>
                draft.questions.filter(
                    (question) =>
                        !isMultipleChoice(
                            question,
                        ),
                ),
            [
                draft.questions,
            ],
        );

    const questions =
        useMemo(
            () =>
                draft.questions.filter(
                    isMultipleChoice,
                ),
            [
                draft.questions,
            ],
        );

    function replaceQuestions(
        nextQuestions:
            readonly AdminDraftMultipleChoiceQuestion[],
    ) {
        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                questions: [
                    ...normalizeOrders(
                        nextQuestions,
                    ),
                    ...unsupportedQuestions,
                ],
            }),
        );
    }

    function addQuestion() {
        replaceQuestions([
            ...questions,
            createEmptyMultipleChoiceQuestion({
                order:
                    questions.length + 1,
                section:
                    "general",
            }),
        ]);
    }

    function updateQuestion(
        questionId:
            string,
        update:
            Partial<
                AdminDraftMultipleChoiceQuestion
            >,
    ) {
        replaceQuestions(
            questions.map(
                (question) =>
                    question.id ===
                    questionId
                        ? {
                            ...question,
                            ...update,
                        }
                        : question,
            ),
        );
    }

    function updateOption(
        questionId:
            string,
        optionId:
            AdminDraftOptionId,
        text:
            string,
    ) {
        replaceQuestions(
            questions.map(
                (question) =>
                    question.id ===
                    questionId
                        ? {
                            ...question,
                            options:
                                question.options.map(
                                    (option) =>
                                        option.id ===
                                        optionId
                                            ? {
                                                ...option,
                                                text,
                                            }
                                            : option,
                                ),
                        }
                        : question,
            ),
        );
    }

    function deleteQuestion(
        questionId:
            string,
    ) {
        replaceQuestions(
            questions.filter(
                (question) =>
                    question.id !==
                    questionId,
            ),
        );
    }

    function moveQuestion(
        questionId:
            string,
        direction:
            -1 | 1,
    ) {
        const currentIndex =
            questions.findIndex(
                (question) =>
                    question.id ===
                    questionId,
            );

        const targetIndex =
            currentIndex +
            direction;

        if (
            currentIndex < 0 ||
            targetIndex < 0 ||
            targetIndex >=
                questions.length
        ) {
            return;
        }

        const nextQuestions = [
            ...questions,
        ];

        const [
            movedQuestion,
        ] =
            nextQuestions.splice(
                currentIndex,
                1,
            );

        if (!movedQuestion) {
            return;
        }

        nextQuestions.splice(
            targetIndex,
            0,
            movedQuestion,
        );

        replaceQuestions(
            nextQuestions,
        );
    }

    const maximumScore =
        questions.reduce(
            (
                total,
                question,
            ) =>
                total +
                question.maximumScore,
            0,
        );

    return (
        <>
            <header className={styles.header}>
                <div>
                    <Link
                        href="/admin/tests"
                        className={
                            styles.backLink
                        }
                    >
                        ← Testlar katalogiga qaytish
                    </Link>

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        MULTIPLE-CHOICE MUHARRIRI
                    </span>

                    <h1>
                        {draft.metadata.title}
                    </h1>

                    <p>
                        Savollarni tahrirlang,
                        tartiblang va Supabase
                        bazasiga saqlang.
                    </p>
                </div>

                <div
                    className={
                        styles.headerStats
                    }
                >
                    <div>
                        <span>
                            Savollar
                        </span>
                        <strong>
                            {questions.length}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Maksimal ball
                        </span>
                        <strong>
                            {maximumScore}
                        </strong>
                    </div>
                </div>
            </header>

            {unsupportedQuestions.length >
                0 && (
                <div
                    className={
                        styles.warningBanner
                    }
                >
                    Bu draftda boshqa turdagi
                    {unsupportedQuestions.length}
                    {" "}
                    ta savol mavjud. Ular ushbu
                    muharrirda ko‘rsatilmaydi,
                    lekin saqlash vaqtida
                    o‘chirilmaydi.
                </div>
            )}

            <AdminDocxImportPreview />

            {actionState.message && (
                <div
                    className={
                        actionState.status ===
                        "success"
                            ? styles.successBanner
                            : styles.errorBanner
                    }
                    role="status"
                >
                    {actionState.message}
                </div>
            )}

            <form action={formAction}>
                <input
                    type="hidden"
                    name="draft"
                    value={
                        JSON.stringify(
                            draft,
                        )
                    }
                />

                <input
                    type="hidden"
                    name="expectedUpdatedAt"
                    value={
                        draft.audit.updatedAt
                    }
                />

                <div
                    className={
                        styles.toolbar
                    }
                >
                    <div>
                        <strong>
                            Savollar ro‘yxati
                        </strong>
                        <span>
                            Har bir savol uchun
                            A–D variantlari va
                            to‘g‘ri javobni kiriting.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={
                            addQuestion
                        }
                        className={
                            styles.addButton
                        }
                    >
                        + Savol qo‘shish
                    </button>
                </div>

                <div
                    className={
                        styles.questionList
                    }
                >
                    {questions.map(
                        (
                            question,
                            index,
                        ) => (
                            <article
                                key={
                                    question.id
                                }
                                className={
                                    styles.questionCard
                                }
                            >
                                <div
                                    className={
                                        styles.questionTop
                                    }
                                >
                                    <div>
                                        <span
                                            className={
                                                styles.questionNumber
                                            }
                                        >
                                            {index + 1}
                                        </span>

                                        <div>
                                            <strong>
                                                Variantli savol
                                            </strong>
                                            <small>
                                                {question.id}
                                            </small>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles.questionActions
                                        }
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                moveQuestion(
                                                    question.id,
                                                    -1,
                                                )
                                            }
                                            disabled={
                                                index ===
                                                0
                                            }
                                            aria-label="Yuqoriga ko‘chirish"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                moveQuestion(
                                                    question.id,
                                                    1,
                                                )
                                            }
                                            disabled={
                                                index ===
                                                questions.length -
                                                    1
                                            }
                                            aria-label="Pastga ko‘chirish"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteQuestion(
                                                    question.id,
                                                )
                                            }
                                            className={
                                                styles.deleteButton
                                            }
                                        >
                                            O‘chirish
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className={
                                        styles.fieldGrid
                                    }
                                >
                                    <label
                                        className={
                                            styles.fullWidth
                                        }
                                    >
                                        <span>
                                            Savol matni *
                                        </span>
                                        <textarea
                                            value={
                                                question.question
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateQuestion(
                                                    question.id,
                                                    {
                                                        question:
                                                            event
                                                                .target
                                                                .value,
                                                    },
                                                )
                                            }
                                            rows={3}
                                            placeholder="Savol matnini kiriting..."
                                        />
                                    </label>

                                    <label>
                                        <span>
                                            Bo‘lim
                                        </span>
                                        <select
                                            value={
                                                question.section
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateQuestion(
                                                    question.id,
                                                    {
                                                        section:
                                                            event
                                                                .target
                                                                .value as
                                                                AdminDraftQuestionSection,
                                                    },
                                                )
                                            }
                                        >
                                            {sectionOptions.map(
                                                (
                                                    option,
                                                ) => (
                                                    <option
                                                        key={
                                                            option.value
                                                        }
                                                        value={
                                                            option.value
                                                        }
                                                    >
                                                        {option.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <label>
                                        <span>
                                            Ball *
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.1}
                                            value={
                                                question.maximumScore
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateQuestion(
                                                    question.id,
                                                    {
                                                        maximumScore:
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                    },
                                                )
                                            }
                                        />
                                    </label>

                                    <label
                                        className={
                                            styles.fullWidth
                                        }
                                    >
                                        <span>
                                            Ko‘rsatma
                                        </span>
                                        <input
                                            value={
                                                question.instruction ??
                                                ""
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateQuestion(
                                                    question.id,
                                                    {
                                                        instruction:
                                                            event
                                                                .target
                                                                .value ||
                                                            null,
                                                    },
                                                )
                                            }
                                            placeholder="Ixtiyoriy ko‘rsatma..."
                                        />
                                    </label>

                                    <label
                                        className={
                                            styles.fullWidth
                                        }
                                    >
                                        <span>
                                            Kontekst
                                        </span>
                                        <textarea
                                            value={
                                                question.context ??
                                                ""
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateQuestion(
                                                    question.id,
                                                    {
                                                        context:
                                                            event
                                                                .target
                                                                .value ||
                                                            null,
                                                    },
                                                )
                                            }
                                            rows={2}
                                            placeholder="Ixtiyoriy kontekst..."
                                        />
                                    </label>
                                </div>

                                <div
                                    className={
                                        styles.optionGrid
                                    }
                                >
                                    {question.options.map(
                                        (
                                            option,
                                        ) => (
                                            <label
                                                key={
                                                    option.id
                                                }
                                                className={
                                                    question.correctOptionId ===
                                                    option.id
                                                        ? styles.correctOption
                                                        : styles.option
                                                }
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correct-${question.id}`}
                                                    checked={
                                                        question.correctOptionId ===
                                                        option.id
                                                    }
                                                    onChange={() =>
                                                        updateQuestion(
                                                            question.id,
                                                            {
                                                                correctOptionId:
                                                                    option.id,
                                                            },
                                                        )
                                                    }
                                                />

                                                <strong>
                                                    {option.id}
                                                </strong>

                                                <input
                                                    value={
                                                        option.text
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateOption(
                                                            question.id,
                                                            option.id,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    placeholder={`${option.id} varianti`}
                                                />
                                            </label>
                                        ),
                                    )}
                                </div>

                                <label
                                    className={
                                        styles.explanationField
                                    }
                                >
                                    <span>
                                        Javob izohi
                                    </span>
                                    <textarea
                                        value={
                                            question.explanation
                                                .text
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    explanation: {
                                                        ...question.explanation,
                                                        text:
                                                            event
                                                                .target
                                                                .value,
                                                    },
                                                },
                                            )
                                        }
                                        rows={3}
                                        placeholder="Nima sababdan ushbu javob to‘g‘ri?"
                                    />
                                </label>
                            </article>
                        ),
                    )}

                    {questions.length ===
                        0 && (
                        <div
                            className={
                                styles.emptyState
                            }
                        >
                            <strong>
                                Hali savol yo‘q
                            </strong>
                            <p>
                                Birinchi
                                multiple-choice
                                savolni qo‘shing.
                            </p>
                            <button
                                type="button"
                                onClick={
                                    addQuestion
                                }
                                className={
                                    styles.addButton
                                }
                            >
                                + Savol qo‘shish
                            </button>
                        </div>
                    )}
                </div>

                <div
                    className={
                        styles.saveBar
                    }
                >
                    <div>
                        <span>
                            Oxirgi database vaqti
                        </span>
                        <strong>
                            {new Date(
                                draft.audit
                                    .updatedAt,
                            ).toLocaleString(
                                "uz-UZ",
                            )}
                        </strong>
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className={
                            styles.saveButton
                        }
                    >
                        {pending
                            ? "Saqlanmoqda..."
                            : "Draftni saqlash"}
                    </button>
                </div>
            </form>
        </>
    );
}
