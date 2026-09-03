"use client";

import {
    AdminQuestionImageUploader,
} from "./admin-question-image-uploader";
import {
    AdminQuestionAudioUploader,
} from "./admin-question-audio-uploader";
import type {
    AdminDraftAnswerComparison,
    AdminDraftImageAsset,
    AdminDraftMatchingQuestion,
    AdminDraftMultipartQuestion,
    AdminDraftOptionId,
    AdminDraftQuestion,
    AdminDraftQuestionSection,
    AdminDraftShortAnswerQuestion,
} from "../model/admin-question-types";

import styles from "./admin-mixed-structured-question-editor.module.css";

type StructuredQuestion =
    | AdminDraftMatchingQuestion
    | AdminDraftShortAnswerQuestion
    | AdminDraftMultipartQuestion;

interface AdminMixedStructuredQuestionEditorProps {
    readonly questions:
        readonly StructuredQuestion[];
    readonly onChange:
        (
            questions:
                readonly StructuredQuestion[],
        ) => void;
    readonly draftId?: string;
    readonly imageUploadSourceOrders?:
        readonly number[];
    readonly allowImageUploadForAll?:
        boolean;
    readonly onQuestionImageChange?: (
        questionId: string,
        image:
            AdminDraftImageAsset | null,
    ) => void;
    readonly onQueueImageStorageRemoval?: (
        questionId: string,
        storagePath: string,
    ) => void;
    readonly onQueueAudioStorageRemoval?: (
        questionId: string,
        storagePath: string,
    ) => void;
}

const optionIds:
    readonly AdminDraftOptionId[] = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
    ];

function nextAvailableOptionId(
    choices:
        readonly {
            readonly id:
                AdminDraftOptionId;
        }[],
): AdminDraftOptionId | null {
    const used =
        new Set(
            choices.map(
                (choice) =>
                    choice.id,
            ),
        );

    return (
        optionIds.find(
            (optionId) =>
                !used.has(
                    optionId,
                ),
        ) ?? null
    );
}

const sectionOptions:
    readonly {
        readonly value:
            AdminDraftQuestionSection;
        readonly label:
            string;
    }[] = [
        { value: "general", label: "Umumiy" },
        { value: "grammar", label: "Grammatika" },
        { value: "syntax", label: "Sintaksis" },
        { value: "literature", label: "Adabiyot" },
        { value: "written", label: "Yozma topshiriq" },
        { value: "ghazal", label: "G‘azal" },
    ];

const comparisonOptions:
    readonly {
        readonly value:
            AdminDraftAnswerComparison;
        readonly label:
            string;
        readonly description:
            string;
        readonly recommended?:
            boolean;
    }[] = [
        {
            value:
                "normalized",
            label:
                "Oddiy avtomatik tekshiruv",
            description:
                "Katta-kichik harf va ortiqcha bo‘shliqlar yumshatiladi. Ko‘pchilik qisqa javoblar uchun tavsiya etiladi.",
            recommended:
                true,
        },
        {
            value:
                "exact",
            label:
                "Aynan bir xil javob",
            description:
                "O‘quvchi javobi kiritilgan javob bilan aynan bir xil bo‘lishi kerak.",
        },
        {
            value:
                "keywords",
            label:
                "Kalit so‘zlar bo‘yicha",
            description:
                "Javobda belgilangan barcha kalit so‘zlar qatnashsa, javob to‘g‘ri hisoblanadi.",
        },
        {
            value:
                "manual-review",
            label:
                "Ustoz qo‘lda tekshiradi",
            description:
                "Tizim avtomatik baholamaydi. Javob natijadan keyin ustoz tomonidan tekshiriladi.",
        },
    ];

function createId(
    prefix:
        string,
): string {
    if (
        typeof crypto !==
            "undefined" &&
        "randomUUID" in crypto
    ) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

function splitList(
    value:
        string,
): readonly string[] {
    return value
        .split(";")
        .map(
            (item) =>
                item.trim(),
        )
        .filter(
            Boolean,
        );
}

function joinList(
    values:
        readonly string[] | undefined,
): string {
    return (
        values ??
        []
    ).join(
        "; ",
    );
}

interface ComparisonMethodPickerProps {
    readonly id: string;
    readonly value:
        AdminDraftAnswerComparison;
    readonly onChange:
        (
            value:
                AdminDraftAnswerComparison,
        ) => void;
}

function ComparisonMethodPicker({
    id,
    value,
    onChange,
}: ComparisonMethodPickerProps) {
    return (
        <div
            className={
                styles.comparisonPicker
            }
            role="radiogroup"
            aria-label="Javobni tekshirish usuli"
        >
            {comparisonOptions.map(
                (option) => (
                    <button
                        key={
                            option.value
                        }
                        type="button"
                        role="radio"
                        aria-checked={
                            value ===
                            option.value
                        }
                        className={
                            value ===
                            option.value
                                ? `${styles.comparisonChoice} ${styles.comparisonChoiceSelected}`
                                : styles.comparisonChoice
                        }
                        onClick={() =>
                            onChange(
                                option.value,
                            )
                        }
                        id={`${id}-${option.value}`}
                    >
                        <span
                            className={
                                styles.comparisonChoiceTop
                            }
                        >
                            <strong>
                                {option.label}
                            </strong>

                            {option.recommended && (
                                <small>
                                    Tavsiya
                                </small>
                            )}
                        </span>

                        <span
                            className={
                                styles.comparisonDescription
                            }
                        >
                            {option.description}
                        </span>
                    </button>
                ),
            )}
        </div>
    );
}

export function AdminMixedStructuredQuestionEditor({
    questions,
    onChange,
    draftId,
    imageUploadSourceOrders = [],
    allowImageUploadForAll = false,
    onQuestionImageChange,
    onQueueImageStorageRemoval,
    onQueueAudioStorageRemoval,
}: AdminMixedStructuredQuestionEditorProps) {
    const imageUploadSourceOrderSet =
        new Set(
            imageUploadSourceOrders,
        );
    function updateQuestion<T extends StructuredQuestion>(
        questionId:
            string,
        update:
            Partial<T>,
    ) {
        onChange(
            questions.map(
                (question) =>
                    question.id ===
                    questionId
                        ? {
                            ...question,
                            ...update,
                        } as StructuredQuestion
                        : question,
            ),
        );
    }

    function removeQuestion(
        questionId:
            string,
    ) {
        onChange(
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
        const index =
            questions.findIndex(
                (question) =>
                    question.id ===
                    questionId,
            );
        const target =
            index +
            direction;

        if (
            index < 0 ||
            target < 0 ||
            target >=
                questions.length
        ) {
            return;
        }

        const next = [
            ...questions,
        ];
        const [
            moved,
        ] =
            next.splice(
                index,
                1,
            );

        if (!moved) {
            return;
        }

        next.splice(
            target,
            0,
            moved,
        );

        onChange(
            next.map(
                (
                    question,
                    questionIndex,
                ) => ({
                    ...question,
                    order:
                        questionIndex +
                        1,
                }),
            ),
        );
    }

    if (
        questions.length ===
        0
    ) {
        return null;
    }

    return (
        <section
            className={
                styles.section
            }
            id="admin-mixed-structured-editor"
        >
            <div
                className={
                    styles.heading
                }
            >
                <div>
                    <span>
                        ARALASH TEST MUHARRIRI
                    </span>
                    <h2>
                        Matching, qisqa javob va multipart
                    </h2>
                    <p>
                        Import qilingan maxsus savollarni tekshiring,
                        tahrirlang va draft bilan birga saqlang.
                    </p>
                </div>

                <strong>
                    {questions.length} ta savol
                </strong>
            </div>

            <div
                className={
                    styles.list
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
                                styles.card
                            }
                        >
                            <div
                                className={
                                    styles.cardTop
                                }
                            >
                                <div>
                                    <span
                                        className={
                                            styles.number
                                        }
                                    >
                                        {question.sourceOrder ??
                                            index +
                                                1}
                                    </span>
                                    <div>
                                        <strong>
                                            {question.type ===
                                            "matching"
                                                ? "Moslashtirish"
                                                : question.type ===
                                                    "short-answer"
                                                  ? "Qisqa javob"
                                                  : "Ko‘p qismli savol"}
                                        </strong>
                                        <small>
                                            {question.id}
                                        </small>
                                    </div>
                                </div>

                                <div
                                    className={
                                        styles.actions
                                    }
                                >
                                    <button
                                        type="button"
                                        disabled={
                                            index ===
                                            0
                                        }
                                        onClick={() =>
                                            moveQuestion(
                                                question.id,
                                                -1,
                                            )
                                        }
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        disabled={
                                            index ===
                                            questions.length -
                                                1
                                        }
                                        onClick={() =>
                                            moveQuestion(
                                                question.id,
                                                1,
                                            )
                                        }
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            styles.deleteButton
                                        }
                                        onClick={() =>
                                            removeQuestion(
                                                question.id,
                                            )
                                        }
                                    >
                                        O‘chirish
                                    </button>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.grid
                                }
                            >
                                <label
                                    className={
                                        styles.full
                                    }
                                >
                                    <span>
                                        Savol matni *
                                    </span>
                                    <textarea
                                        rows={3}
                                        value={
                                            question.question
                                        }
                                        onChange={(event) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    question:
                                                        event.target.value,
                                                },
                                            )
                                        }
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
                                        onChange={(event) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    section:
                                                        event.target.value as AdminDraftQuestionSection,
                                                },
                                            )
                                        }
                                    >
                                        {sectionOptions.map(
                                            (option) => (
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
                                        Umumiy ball
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        value={
                                            question.maximumScore
                                        }
                                        onChange={(event) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    maximumScore:
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                },
                                            )
                                        }
                                    />
                                </label>

                                <label
                                    className={
                                        styles.full
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
                                        onChange={(event) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    instruction:
                                                        event.target.value ||
                                                        null,
                                                },
                                            )
                                        }
                                    />
                                </label>

                                <label
                                    className={
                                        styles.full
                                    }
                                >
                                    <span>
                                        Kontekst
                                    </span>
                                    <textarea
                                        rows={3}
                                        value={
                                            question.context ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    context:
                                                        event.target.value ||
                                                        null,
                                                },
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            {draftId &&
                                (allowImageUploadForAll ||
                                    (question.sourceOrder !==
                                        null &&
                                        imageUploadSourceOrderSet.has(
                                            question.sourceOrder,
                                        ))) &&
                                onQuestionImageChange &&
                                onQueueImageStorageRemoval && (
                                <div
                                    className={
                                        styles.subsection
                                    }
                                >
                                    <AdminQuestionImageUploader
                                        draftId={
                                            draftId
                                        }
                                        questionId={
                                            question.id
                                        }
                                        image={
                                            question.image
                                        }
                                        onChange={(image) =>
                                            onQuestionImageChange?.(
                                                question.id,
                                                image,
                                            )
                                        }
                                        onQueueStorageRemoval={(storagePath) =>
                                            onQueueImageStorageRemoval?.(
                                                question.id,
                                                storagePath,
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {question.type ===
                                "matching" && (
                                <div
                                    className={
                                        styles.subsection
                                    }
                                >
                                    <div
                                        className={
                                            styles.subsectionTitle
                                        }
                                    >
                                        <div>
                                            <strong>
                                                Tanlovlar A–F
                                            </strong>
                                            <span>
                                                Tanlov va moslashtirish bandlarini tahrirlang.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={
                                                question.choices.length >=
                                                    6 ||
                                                nextAvailableOptionId(
                                                    question.choices,
                                                ) === null
                                            }
                                            onClick={() => {
                                                const nextId =
                                                    nextAvailableOptionId(
                                                        question.choices,
                                                    );

                                                if (!nextId) {
                                                    return;
                                                }

                                                updateQuestion<AdminDraftMatchingQuestion>(
                                                    question.id,
                                                    {
                                                        choices: [
                                                            ...question.choices,
                                                            {
                                                                id:
                                                                    nextId,
                                                                text:
                                                                    "",
                                                            },
                                                        ],
                                                    },
                                                );
                                            }}
                                        >
                                            + Tanlov
                                        </button>
                                    </div>

                                    <label
                                        className={
                                            styles.blockLabel
                                        }
                                    >
                                        <span>
                                            Guruh sarlavhasi
                                        </span>
                                        <input
                                            value={
                                                question.title ??
                                                ""
                                            }
                                            onChange={(event) =>
                                                updateQuestion<AdminDraftMatchingQuestion>(
                                                    question.id,
                                                    {
                                                        title:
                                                            event.target.value ||
                                                            null,
                                                    },
                                                )
                                            }
                                        />
                                    </label>

                                    <div
                                        className={
                                            styles.choiceGrid
                                        }
                                    >
                                        {question.choices.map(
                                            (
                                                choice,
                                                choiceIndex,
                                            ) => (
                                                <div
                                                    key={
                                                        choice.id
                                                    }
                                                    className={
                                                        styles.choiceRow
                                                    }
                                                >
                                                    <strong>
                                                        {choice.id}
                                                    </strong>
                                                    <input
                                                        value={
                                                            choice.text
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    choices:
                                                                        question.choices.map(
                                                                            (
                                                                                candidate,
                                                                            ) =>
                                                                                candidate.id ===
                                                                                choice.id
                                                                                    ? {
                                                                                        ...candidate,
                                                                                        text:
                                                                                            event.target.value,
                                                                                    }
                                                                                    : candidate,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            question.choices.length <=
                                                            6
                                                        }
                                                        onClick={() =>
                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    choices:
                                                                        question.choices.filter(
                                                                            (
                                                                                candidate,
                                                                            ) =>
                                                                                candidate.id !==
                                                                                choice.id,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div
                                        className={
                                            styles.subsectionTitle
                                        }
                                    >
                                        <div>
                                            <strong>
                                                Moslashtirish bandlari
                                            </strong>
                                            <span>
                                                Har bir band uchun javob va ball belgilang.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuestion<AdminDraftMatchingQuestion>(
                                                    question.id,
                                                    {
                                                        items: [
                                                            ...question.items,
                                                            {
                                                                id:
                                                                    createId(
                                                                        "matching-item",
                                                                    ),
                                                                order:
                                                                    question.items.length +
                                                                    1,
                                                                sourceOrder:
                                                                    question.sourceOrder !==
                                                                        null
                                                                        ? question.sourceOrder +
                                                                            question.items.length
                                                                        : null,
                                                                prompt:
                                                                    "",
                                                                correctChoiceId:
                                                                    null,
                                                                maximumScore:
                                                                    1,
                                                                explanation: {
                                                                    text:
                                                                        "",
                                                                    audio:
                                                                        null,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                )
                                            }
                                        >
                                            + Band
                                        </button>
                                    </div>

                                    <div
                                        className={
                                            styles.itemList
                                        }
                                    >
                                        {question.items.map(
                                            (
                                                item,
                                                itemIndex,
                                            ) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className={
                                                        styles.itemRow
                                                    }
                                                >
                                                    <strong>
                                                        {item.sourceOrder ??
                                                            item.order}
                                                    </strong>
                                                    <textarea
                                                        rows={2}
                                                        value={
                                                            item.prompt
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    items:
                                                                        question.items.map(
                                                                            (
                                                                                candidate,
                                                                            ) =>
                                                                                candidate.id ===
                                                                                item.id
                                                                                    ? {
                                                                                        ...candidate,
                                                                                        prompt:
                                                                                            event.target.value,
                                                                                    }
                                                                                    : candidate,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <select
                                                        value={
                                                            item.correctChoiceId ??
                                                            ""
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    items:
                                                                        question.items.map(
                                                                            (
                                                                                candidate,
                                                                            ) =>
                                                                                candidate.id ===
                                                                                item.id
                                                                                    ? {
                                                                                        ...candidate,
                                                                                        correctChoiceId:
                                                                                            (event.target.value ||
                                                                                                null) as AdminDraftOptionId | null,
                                                                                    }
                                                                                    : candidate,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Javob
                                                        </option>
                                                        {question.choices.map(
                                                            (
                                                                choice,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        choice.id
                                                                    }
                                                                    value={
                                                                        choice.id
                                                                    }
                                                                >
                                                                    {choice.id}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.1}
                                                        value={
                                                            item.maximumScore
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    items:
                                                                        question.items.map(
                                                                            (
                                                                                candidate,
                                                                            ) =>
                                                                                candidate.id ===
                                                                                item.id
                                                                                    ? {
                                                                                        ...candidate,
                                                                                        maximumScore:
                                                                                            Number(
                                                                                                event.target.value,
                                                                                            ),
                                                                                    }
                                                                                    : candidate,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                item.explanation?.audio?.storagePath &&
                                                                onQueueAudioStorageRemoval
                                                            ) {
                                                                onQueueAudioStorageRemoval(
                                                                    item.id,
                                                                    item.explanation.audio.storagePath,
                                                                );
                                                            }

                                                            updateQuestion<AdminDraftMatchingQuestion>(
                                                                question.id,
                                                                {
                                                                    items:
                                                                        question.items
                                                                            .filter(
                                                                                (
                                                                                    candidate,
                                                                                ) =>
                                                                                    candidate.id !==
                                                                                    item.id,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    candidate,
                                                                                    candidateIndex,
                                                                                ) => ({
                                                                                    ...candidate,
                                                                                    order:
                                                                                        candidateIndex +
                                                                                        1,
                                                                                }),
                                                                            ),
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        ×
                                                    </button>

                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {draftId &&
                                        onQueueAudioStorageRemoval && (
                                        <div
                                            className={
                                                styles.itemAudio
                                            }
                                        >
                                            <AdminQuestionAudioUploader
                                                draftId={draftId}
                                                questionId={question.id}
                                                audio={
                                                    question.explanation.audio
                                                }
                                                onChange={(audio) =>
                                                    updateQuestion<AdminDraftMatchingQuestion>(
                                                        question.id,
                                                        {
                                                            explanation: {
                                                                ...question.explanation,
                                                                audio,
                                                            },
                                                        },
                                                    )
                                                }
                                                onQueueStorageRemoval={(storagePath) =>
                                                    onQueueAudioStorageRemoval(
                                                        question.id,
                                                        storagePath,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {question.type ===
                                "short-answer" && (
                                <div
                                    className={
                                        styles.subsection
                                    }
                                >
                                    <div
                                        className={
                                            styles.answerGrid
                                        }
                                    >
                                        <div
                                            className={
                                                styles.comparisonField
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.fieldLabel
                                                }
                                            >
                                                Javobni qanday tekshiramiz?
                                            </span>

                                            <ComparisonMethodPicker
                                                id={`short-answer-${question.id}`}
                                                value={
                                                    question.comparison
                                                }
                                                onChange={(comparison) =>
                                                    updateQuestion<AdminDraftShortAnswerQuestion>(
                                                        question.id,
                                                        {
                                                            comparison,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <label>
                                            <span>
                                                Qabul javoblar
                                            </span>
                                            <textarea
                                                rows={3}
                                                value={
                                                    joinList(
                                                        question.acceptedAnswers,
                                                    )
                                                }
                                                onChange={(event) =>
                                                    updateQuestion<AdminDraftShortAnswerQuestion>(
                                                        question.id,
                                                        {
                                                            acceptedAnswers:
                                                                splitList(
                                                                    event.target.value,
                                                                ),
                                                        },
                                                    )
                                                }
                                                placeholder="Javob 1; Javob 2"
                                            />
                                        </label>

                                        <label>
                                            <span>
                                                Kalit so‘zlar
                                            </span>
                                            <textarea
                                                rows={3}
                                                value={
                                                    joinList(
                                                        question.requiredKeywords,
                                                    )
                                                }
                                                onChange={(event) =>
                                                    updateQuestion<AdminDraftShortAnswerQuestion>(
                                                        question.id,
                                                        {
                                                            requiredKeywords:
                                                                splitList(
                                                                    event.target.value,
                                                                ),
                                                        },
                                                    )
                                                }
                                                placeholder="Kalit 1; Kalit 2"
                                            />
                                        </label>

                                        <label>
                                            <span>
                                                Misollar
                                            </span>
                                            <textarea
                                                rows={3}
                                                value={
                                                    joinList(
                                                        question.examples,
                                                    )
                                                }
                                                onChange={(event) =>
                                                    updateQuestion<AdminDraftShortAnswerQuestion>(
                                                        question.id,
                                                        {
                                                            examples:
                                                                splitList(
                                                                    event.target.value,
                                                                ),
                                                        },
                                                    )
                                                }
                                                placeholder="Misol 1; Misol 2"
                                            />
                                        </label>
                                    </div>

                                    {draftId &&
                                        onQueueAudioStorageRemoval && (
                                        <AdminQuestionAudioUploader
                                            draftId={draftId}
                                            questionId={question.id}
                                            audio={
                                                question.explanation.audio
                                            }
                                            onChange={(audio) =>
                                                updateQuestion<AdminDraftShortAnswerQuestion>(
                                                    question.id,
                                                    {
                                                        explanation: {
                                                            ...question.explanation,
                                                            audio,
                                                        },
                                                    },
                                                )
                                            }
                                            onQueueStorageRemoval={(storagePath) =>
                                                onQueueAudioStorageRemoval(
                                                    question.id,
                                                    storagePath,
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            )}

                            {question.type ===
                                "multipart" && (
                                <div
                                    className={
                                        styles.subsection
                                    }
                                >
                                    <div
                                        className={
                                            styles.subsectionTitle
                                        }
                                    >
                                        <div>
                                            <strong>
                                                Savol qismlari
                                            </strong>
                                            <span>
                                                Har bir qism uchun prompt, javob va ballni tekshiring. Audio butun savol uchun bitta.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuestion<AdminDraftMultipartQuestion>(
                                                    question.id,
                                                    {
                                                        parts: [
                                                            ...question.parts,
                                                            {
                                                                id:
                                                                    createId(
                                                                        "multipart-part",
                                                                    ),
                                                                order:
                                                                    question.parts.length +
                                                                    1,
                                                                label:
                                                                    String.fromCharCode(
                                                                        97 +
                                                                            question.parts.length,
                                                                    ),
                                                                prompt:
                                                                    "",
                                                                acceptedAnswers:
                                                                    [],
                                                                requiredKeywords:
                                                                    [],
                                                                comparison:
                                                                    "normalized",
                                                                maximumScore:
                                                                    1,
                                                                explanation: {
                                                                    text:
                                                                        "",
                                                                    audio:
                                                                        null,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                )
                                            }
                                        >
                                            + Qism
                                        </button>
                                    </div>

                                    {draftId &&
                                        onQueueAudioStorageRemoval && (
                                        <AdminQuestionAudioUploader
                                            draftId={draftId}
                                            questionId={question.id}
                                            audio={
                                                question.explanation.audio
                                            }
                                            onChange={(audio) =>
                                                updateQuestion<AdminDraftMultipartQuestion>(
                                                    question.id,
                                                    {
                                                        explanation: {
                                                            ...question.explanation,
                                                            audio,
                                                        },
                                                    },
                                                )
                                            }
                                            onQueueStorageRemoval={(storagePath) =>
                                                onQueueAudioStorageRemoval(
                                                    question.id,
                                                    storagePath,
                                                )
                                            }
                                        />
                                    )}

                                    <div
                                        className={
                                            styles.partList
                                        }
                                    >
                                        {question.parts.map(
                                            (
                                                part,
                                                partIndex,
                                            ) => (
                                                <div
                                                    key={
                                                        part.id
                                                    }
                                                    className={
                                                        styles.partCard
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.partTop
                                                        }
                                                    >
                                                        <strong>
                                                            {part.label})
                                                        </strong>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    part.explanation?.audio?.storagePath &&
                                                                    onQueueAudioStorageRemoval
                                                                ) {
                                                                    onQueueAudioStorageRemoval(
                                                                        part.id,
                                                                        part.explanation.audio.storagePath,
                                                                    );
                                                                }

                                                                updateQuestion<AdminDraftMultipartQuestion>(
                                                                    question.id,
                                                                    {
                                                                        parts:
                                                                            question.parts
                                                                                .filter(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id !==
                                                                                        part.id,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        candidate,
                                                                                        candidateIndex,
                                                                                    ) => ({
                                                                                        ...candidate,
                                                                                        order:
                                                                                            candidateIndex +
                                                                                            1,
                                                                                    }),
                                                                                ),
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Qismni o‘chirish
                                                        </button>
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.partGrid
                                                        }
                                                    >
                                                        <label
                                                            className={
                                                                styles.full
                                                            }
                                                        >
                                                            <span>
                                                                Qism savoli
                                                            </span>
                                                            <textarea
                                                                rows={2}
                                                                value={
                                                                    part.prompt
                                                                }
                                                                onChange={(event) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                prompt:
                                                                                                    event.target.value,
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>

                                                        <label>
                                                            <span>
                                                                Belgi
                                                            </span>
                                                            <input
                                                                value={
                                                                    part.label
                                                                }
                                                                onChange={(event) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                label:
                                                                                                    event.target.value,
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>

                                                        <label>
                                                            <span>
                                                                Ball
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step={0.1}
                                                                value={
                                                                    part.maximumScore
                                                                }
                                                                onChange={(event) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                maximumScore:
                                                                                                    Number(
                                                                                                        event.target.value,
                                                                                                    ),
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>

                                                        <div
                                                            className={`${styles.comparisonField} ${styles.full}`}
                                                        >
                                                            <span
                                                                className={
                                                                    styles.fieldLabel
                                                                }
                                                            >
                                                                Bu qism javobini qanday tekshiramiz?
                                                            </span>

                                                            <ComparisonMethodPicker
                                                                id={`multipart-${question.id}-${part.id}`}
                                                                value={
                                                                    part.comparison
                                                                }
                                                                onChange={(comparison) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                comparison,
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <label>
                                                            <span>
                                                                Qabul javoblar
                                                            </span>
                                                            <textarea
                                                                rows={2}
                                                                value={
                                                                    joinList(
                                                                        part.acceptedAnswers,
                                                                    )
                                                                }
                                                                onChange={(event) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                acceptedAnswers:
                                                                                                    splitList(
                                                                                                        event.target.value,
                                                                                                    ),
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>

                                                        <label>
                                                            <span>
                                                                Kalit so‘zlar
                                                            </span>
                                                            <textarea
                                                                rows={2}
                                                                value={
                                                                    joinList(
                                                                        part.requiredKeywords,
                                                                    )
                                                                }
                                                                onChange={(event) =>
                                                                    updateQuestion<AdminDraftMultipartQuestion>(
                                                                        question.id,
                                                                        {
                                                                            parts:
                                                                                question.parts.map(
                                                                                    (
                                                                                        candidate,
                                                                                    ) =>
                                                                                        candidate.id ===
                                                                                        part.id
                                                                                            ? {
                                                                                                ...candidate,
                                                                                                requiredKeywords:
                                                                                                    splitList(
                                                                                                        event.target.value,
                                                                                                    ),
                                                                                            }
                                                                                            : candidate,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    </div>


                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </article>
                    ),
                )}
            </div>
        </section>
    );
}
