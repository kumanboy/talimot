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
    AdminDraftPassageBlock,
    AdminDraftPassageGroupQuestion,
    AdminDraftQuestion,
    AdminDraftQuestionSection,
} from "../model/admin-question-types";
import type {
    AdminTestDraft,
} from "../model/admin-test-draft-types";
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


function isPassageGroup(
    question:
        AdminDraftQuestion,
): question is
    AdminDraftPassageGroupQuestion {
    return question.type ===
        "passage-group";
}

function createClientId(
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
        .slice(2, 10)}`;
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
        toast,
        setToast,
    ] = useState<{
        readonly type:
            | "success"
            | "error";
        readonly message:
            string;
    } | null>(
        null,
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

            setToast({
                type:
                    "success",
                message:
                    actionState.message ??
                    "Draft muvaffaqiyatli saqlandi.",
            });

            return;
        }

        if (
            actionState.status ===
                "error" ||
            actionState.status ===
                "conflict"
        ) {
            setToast({
                type:
                    "error",
                message:
                    actionState.message ??
                    "Draftni saqlashda xatolik yuz berdi.",
            });
        }
    }, [
        actionState,
    ]);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId =
            window.setTimeout(
                () => {
                    setToast(
                        null,
                    );
                },
                3800,
            );

        return () => {
            window.clearTimeout(
                timeoutId,
            );
        };
    }, [
        toast,
    ]);

    const unsupportedQuestions =
        useMemo(
            () =>
                draft.questions.filter(
                    (question) =>
                        !isMultipleChoice(
                            question,
                        ) &&
                        !isPassageGroup(
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


    const passageGroups =
        useMemo(
            () =>
                draft.questions.filter(
                    isPassageGroup,
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
                    ...passageGroups,
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


    function importParsedQuestions(
        parsedQuestions:
            readonly AdminParsedMcqQuestion[],
    ) {
        const importedQuestions =
            parsedQuestions
                .filter(
                    (question) =>
                        question.confidence !==
                            "invalid" &&
                        question.options.length ===
                            4,
                )
                .map(
                    (
                        parsedQuestion,
                        index,
                    ) => {
                        const emptyQuestion =
                            createEmptyMultipleChoiceQuestion({
                                order:
                                    questions.length +
                                    index +
                                    1,
                                section:
                                    "grammar",
                            });

                        return {
                            ...emptyQuestion,
                            sourceOrder:
                                parsedQuestion.sourceNumber,
                            question:
                                parsedQuestion.question,
                            options:
                                parsedQuestion.options.map(
                                    (option) => ({
                                        id:
                                            option.id,
                                        text:
                                            option.text,
                                    }),
                                ),
                            correctOptionId:
                                parsedQuestion.correctOptionId,
                            explanation: {
                                ...emptyQuestion.explanation,
                                text:
                                    parsedQuestion.correctOptionId
                                        ? "DOCX import orqali qo‘shildi. Izohni tekshiring."
                                        : "DOCX import orqali qo‘shildi. To‘g‘ri javob va izohni tekshiring.",
                            },
                        } satisfies
                            AdminDraftMultipleChoiceQuestion;
                    },
                );

        if (
            importedQuestions.length ===
            0
        ) {
            return;
        }

        replaceQuestions([
            ...questions,
            ...importedQuestions,
        ]);

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-draft-question-list",
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            },
            0,
        );
    }


    function importParsedLiteraryWorks(
        parsedLiteraryWorks:
            AdminLiteraryWorksDocxParseResult,
    ) {
        const importedQuestions =
            parsedLiteraryWorks.questions
                .filter(
                    (question) =>
                        question.confidence !==
                            "invalid" &&
                        question.options.length ===
                            4,
                )
                .map(
                    (
                        parsedQuestion,
                        index,
                    ) => {
                        const emptyQuestion =
                            createEmptyMultipleChoiceQuestion({
                                order:
                                    questions.length +
                                    index +
                                    1,
                                section:
                                    "literature",
                            });

                        return {
                            ...emptyQuestion,
                            sourceOrder:
                                parsedQuestion.sourceNumber,
                            question:
                                parsedQuestion.question,
                            instruction:
                                parsedQuestion.prompt ??
                                parsedLiteraryWorks.metadata
                                    .instruction,
                            context:
                                parsedQuestion.excerpt.length >
                                0
                                    ? parsedQuestion.excerpt.join(
                                        "\n",
                                    )
                                    : null,
                            maximumScore:
                                1.7,
                            options:
                                parsedQuestion.options.map(
                                    (option) => ({
                                        id:
                                            option.id,
                                        text:
                                            option.text,
                                    }),
                                ),
                            correctOptionId:
                                parsedQuestion.correctOptionId,
                            explanation: {
                                ...emptyQuestion.explanation,
                                text:
                                    parsedQuestion.correctOptionId
                                        ? "DOCX standard-five import orqali qo‘shildi. Izohni tekshiring."
                                        : "DOCX standard-five import orqali qo‘shildi. To‘g‘ri javob va izohni tekshiring.",
                            },
                        } satisfies
                            AdminDraftMultipleChoiceQuestion;
                    },
                );

        if (
            importedQuestions.length ===
            0
        ) {
            setToast({
                type:
                    "error",
                message:
                    "Import uchun yaroqli badiiy asarlar savoli topilmadi.",
            });
            return;
        }

        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                source:
                    "docx-import",
                metadata: {
                    ...currentDraft.metadata,
                    title:
                        parsedLiteraryWorks.metadata
                            .title ??
                        currentDraft.metadata.title,
                    description:
                        parsedLiteraryWorks.metadata
                            .description ??
                        currentDraft.metadata.description,
                    format:
                        "standard-five",
                    group:
                        "national-certificate",
                    category:
                        "Badiiy asarlar",
                    topicSlug:
                        "badiiy-asarlar",
                },
                questions: [
                    ...currentDraft.questions,
                    ...importedQuestions,
                ],
            }),
        );

        setToast({
            type:
                "success",
            message:
                `${importedQuestions.length} ta badiiy asarlar savoli draftga qo‘shildi.`,
        });

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-draft-question-list",
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            },
            0,
        );
    }


    function importParsedGhazal(
        parsedGhazal:
            AdminGhazalDocxParseResult,
    ) {
        const nestedQuestions =
            parsedGhazal.questions.map(
                (
                    parsedQuestion,
                    index,
                ) => {
                    const emptyQuestion =
                        createEmptyMultipleChoiceQuestion({
                            order:
                                index + 1,
                            section:
                                "ghazal",
                        });

                    return {
                        ...emptyQuestion,
                        sourceOrder:
                            parsedQuestion.sourceNumber,
                        question:
                            parsedQuestion.question,
                        instruction:
                            parsedGhazal.metadata
                                .instruction,
                        maximumScore:
                            2.5,
                        options:
                            parsedQuestion.options.map(
                                (option) => ({
                                    id:
                                        option.id,
                                    text:
                                        option.text,
                                }),
                            ),
                        correctOptionId:
                            parsedQuestion.correctOptionId,
                        explanation: {
                            ...emptyQuestion.explanation,
                            text:
                                parsedQuestion.correctOptionId
                                    ? "DOCX g‘azal import orqali qo‘shildi. Javob izohini tekshiring."
                                    : "DOCX g‘azal import orqali qo‘shildi. To‘g‘ri javob va izohni belgilang.",
                        },
                    } satisfies
                        AdminDraftMultipleChoiceQuestion;
                },
            );

        const passageBlocks:
            AdminDraftPassageBlock[] = [
                ...(parsedGhazal.metadata.author
                    ? [
                        {
                            id:
                                createClientId(
                                    "ghazal-author",
                                ),
                            order:
                                1,
                            type:
                                "heading" as const,
                            marker:
                                null,
                            speaker:
                                null,
                            text:
                                parsedGhazal.metadata.author,
                        },
                    ]
                    : []),
                ...parsedGhazal.couplets.map(
                    (
                        couplet,
                        index,
                    ) => ({
                        id:
                            createClientId(
                                "ghazal-couplet",
                            ),
                        order:
                            index +
                            2,
                        type:
                            "poetry" as const,
                        marker:
                            String(
                                couplet.order,
                            ),
                        speaker:
                            null,
                        text:
                            `${couplet.firstLine}\n${couplet.secondLine}`,
                    }),
                ),
                ...(parsedGhazal.vocabulary.length >
                0
                    ? [
                        {
                            id:
                                createClientId(
                                    "ghazal-vocabulary-heading",
                                ),
                            order:
                                parsedGhazal.couplets.length +
                                2,
                            type:
                                "heading" as const,
                            marker:
                                null,
                            speaker:
                                null,
                            text:
                                "LUG‘AT",
                        },
                        ...parsedGhazal.vocabulary.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    createClientId(
                                        "ghazal-vocabulary",
                                    ),
                                order:
                                    parsedGhazal.couplets.length +
                                    index +
                                    3,
                                type:
                                    "paragraph" as const,
                                marker:
                                    item.marker,
                                speaker:
                                    null,
                                text:
                                    `${item.term} — ${item.meaning}`,
                            }),
                        ),
                    ]
                    : []),
            ];

        const passageGroup:
            AdminDraftPassageGroupQuestion = {
            type:
                "passage-group",
            id:
                createClientId(
                    "ghazal-group",
                ),
            order:
                draft.questions.length +
                1,
            sourceOrder:
                null,
            section:
                "ghazal",
            instruction:
                parsedGhazal.metadata
                    .instruction,
            context:
                parsedGhazal.metadata
                    .source,
            image:
                null,
            explanation: {
                text:
                    "",
                audio:
                    null,
            },
            title:
                parsedGhazal.metadata
                    .title,
            passage:
                passageBlocks,
            questions:
                nestedQuestions,
        };

        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                source:
                    "docx-import",
                metadata: {
                    ...currentDraft.metadata,
                    format:
                        "passage-five",
                    group:
                        "national-certificate",
                    category:
                        "G‘azal",
                    topicSlug:
                        "gazal",
                },
                questions: [
                    ...currentDraft.questions,
                    passageGroup,
                ],
            }),
        );

        setToast({
            type:
                "success",
            message:
                "G‘azal, baytlar, lug‘at va 5 ta savol draftga qo‘shildi.",
        });

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-passage-group-list",
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            },
            0,
        );
    }


    function importParsedPassage(
        parsedPassage:
            AdminPassageDocxParseResult,
    ) {
        const section:
            AdminDraftQuestionSection =
            parsedPassage.metadata.topic;

        const nestedQuestions =
            parsedPassage.questions.map(
                (
                    parsedQuestion,
                    index,
                ) => {
                    const emptyQuestion =
                        createEmptyMultipleChoiceQuestion({
                            order:
                                index + 1,
                            section,
                        });

                    return {
                        ...emptyQuestion,
                        sourceOrder:
                            parsedQuestion.sourceNumber,
                        question:
                            parsedQuestion.question,
                        instruction:
                            parsedPassage.metadata
                                .instruction,
                        maximumScore:
                            section ===
                            "scientific-text"
                                ? 1.7
                                : 1.1,
                        options:
                            parsedQuestion.options.map(
                                (option) => ({
                                    id:
                                        option.id,
                                    text:
                                        option.text,
                                }),
                            ),
                        correctOptionId:
                            parsedQuestion.correctOptionId,
                        explanation: {
                            ...emptyQuestion.explanation,
                            text:
                                parsedQuestion.correctOptionId
                                    ? "DOCX passage import orqali qo‘shildi. Javob izohini tekshiring."
                                    : "DOCX passage import orqali qo‘shildi. To‘g‘ri javob va izohni belgilang.",
                        },
                    } satisfies
                        AdminDraftMultipleChoiceQuestion;
                },
            );

        const passageGroup:
            AdminDraftPassageGroupQuestion = {
            type:
                "passage-group",
            id:
                createClientId(
                    "passage-group",
                ),
            order:
                draft.questions.length +
                1,
            sourceOrder:
                null,
            section,
            instruction:
                parsedPassage.metadata
                    .instruction,
            context:
                [
                    parsedPassage.metadata
                        .subtitle,
                    parsedPassage.metadata
                        .author,
                    parsedPassage.metadata
                        .source,
                ]
                    .filter(
                        Boolean,
                    )
                    .join(
                        " · ",
                    ) ||
                null,
            image:
                null,
            explanation: {
                text:
                    "",
                audio:
                    null,
            },
            title:
                parsedPassage.metadata
                    .title,
            passage:
                parsedPassage.passage.map(
                    (block) => ({
                        id:
                            createClientId(
                                "passage-block",
                            ),
                        order:
                            block.order,
                        type:
                            block.type,
                        marker:
                            block.marker,
                        speaker:
                            block.speaker,
                        text:
                            block.text,
                    }),
                ),
            questions:
                nestedQuestions,
        };

        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                source:
                    "docx-import",
                metadata: {
                    ...currentDraft.metadata,
                    format:
                        "passage-five",
                    group:
                        "national-certificate",
                    category:
                        section ===
                        "scientific-text"
                            ? "Ilmiy matn"
                            : "Badiiy matn",
                    topicSlug:
                        section ===
                        "scientific-text"
                            ? "ilmiy-matn"
                            : "badiiy-matn",
                },
                questions: [
                    ...currentDraft.questions,
                    passageGroup,
                ],
            }),
        );

        setToast({
            type:
                "success",
            message:
                "Passage-group draftga qo‘shildi. Matn va 5 ta savolni tekshiring.",
        });

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-passage-group-list",
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            },
            0,
        );
    }

    function updatePassageGroup(
        passageGroupId:
            string,
        update:
            Partial<
                AdminDraftPassageGroupQuestion
            >,
    ) {
        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                questions:
                    currentDraft.questions.map(
                        (question) =>
                            question.id ===
                                passageGroupId &&
                            isPassageGroup(
                                question,
                            )
                                ? {
                                    ...question,
                                    ...update,
                                }
                                : question,
                    ),
            }),
        );
    }

    function deletePassageGroup(
        passageGroupId:
            string,
    ) {
        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                questions:
                    currentDraft.questions.filter(
                        (question) =>
                            question.id !==
                            passageGroupId,
                    ),
            }),
        );
    }

    function updatePassageBlock(
        passageGroupId:
            string,
        blockId:
            string,
        update:
            Partial<
                AdminDraftPassageBlock
            >,
    ) {
        const passageGroup =
            passageGroups.find(
                (question) =>
                    question.id ===
                    passageGroupId,
            );

        if (!passageGroup) {
            return;
        }

        updatePassageGroup(
            passageGroupId,
            {
                passage:
                    passageGroup.passage.map(
                        (block) =>
                            block.id ===
                            blockId
                                ? {
                                    ...block,
                                    ...update,
                                }
                                : block,
                    ),
            },
        );
    }

    function updatePassageQuestion(
        passageGroupId:
            string,
        questionId:
            string,
        update:
            Partial<
                AdminDraftMultipleChoiceQuestion
            >,
    ) {
        const passageGroup =
            passageGroups.find(
                (question) =>
                    question.id ===
                    passageGroupId,
            );

        if (!passageGroup) {
            return;
        }

        updatePassageGroup(
            passageGroupId,
            {
                questions:
                    passageGroup.questions.map(
                        (question) =>
                            question.id ===
                            questionId
                                ? {
                                    ...question,
                                    ...update,
                                }
                                : question,
                    ),
            },
        );
    }

    function updatePassageQuestionOption(
        passageGroupId:
            string,
        questionId:
            string,
        optionId:
            AdminDraftOptionId,
        text:
            string,
    ) {
        const passageGroup =
            passageGroups.find(
                (question) =>
                    question.id ===
                    passageGroupId,
            );

        const nestedQuestion =
            passageGroup?.questions.find(
                (question) =>
                    question.id ===
                    questionId,
            );

        if (
            !passageGroup ||
            !nestedQuestion
        ) {
            return;
        }

        updatePassageQuestion(
            passageGroupId,
            questionId,
            {
                options:
                    nestedQuestion.options.map(
                        (option) =>
                            option.id ===
                            optionId
                                ? {
                                    ...option,
                                    text,
                                }
                                : option,
                    ),
            },
        );
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
        ) +
        passageGroups.reduce(
            (
                total,
                passageGroup,
            ) =>
                total +
                passageGroup.questions.reduce(
                    (
                        groupTotal,
                        question,
                    ) =>
                        groupTotal +
                        question.maximumScore,
                    0,
                ),
            0,
        );

    return (
        <>
            {toast && (
                <div
                    className={`${styles.toast} ${
                        toast.type ===
                        "success"
                            ? styles.toastSuccess
                            : styles.toastError
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className={
                            styles.toastIcon
                        }
                        aria-hidden="true"
                    >
                        {toast.type ===
                        "success"
                            ? "✓"
                            : "!"}
                    </div>

                    <div
                        className={
                            styles.toastContent
                        }
                    >
                        <strong>
                            {toast.type ===
                            "success"
                                ? "Saqlandi"
                                : "Saqlanmadi"}
                        </strong>

                        <span>
                            {toast.message}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setToast(
                                null,
                            )
                        }
                        aria-label="Bildirishnomani yopish"
                    >
                        ×
                    </button>
                </div>
            )}

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
                            {questions.length +
                            passageGroups.reduce(
                                (
                                    total,
                                    group,
                                ) =>
                                    total +
                                    group.questions.length,
                                0,
                            )}
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

            <AdminDocxImportPreview
                onImportQuestions={
                    importParsedQuestions
                }
                onImportPassage={
                    importParsedPassage
                }
                onImportGhazal={
                    importParsedGhazal
                }
                onImportLiteraryWorks={
                    importParsedLiteraryWorks
                }
            />

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

            {passageGroups.length >
                0 && (
                <section
                    id="admin-passage-group-list"
                    className={
                        styles.passageEditorSection
                    }
                >
                    <div
                        className={
                            styles.passageEditorHeading
                        }
                    >
                        <div>
                            <span>
                                PASSAGE-GROUP MUHARRIRI
                            </span>
                            <h2>
                                Matn va ichki savollar
                            </h2>
                            <p>
                                DOCX’dan import qilingan matn bloklari,
                                sarlavha va 5 ta savolni tekshiring.
                            </p>
                        </div>

                        <strong>
                            {passageGroups.length} ta guruh
                        </strong>
                    </div>

                    <div
                        className={
                            styles.passageGroupList
                        }
                    >
                        {passageGroups.map(
                            (
                                passageGroup,
                                passageIndex,
                            ) => (
                            <article
                                key={
                                    passageGroup.id
                                }
                                className={
                                    styles.passageGroupCard
                                }
                            >
                                <div
                                    className={
                                        styles.passageGroupTop
                                    }
                                >
                                    <div>
                                        <span>
                                            {passageIndex +
                                            1}
                                        </span>
                                        <div>
                                            <strong>
                                                {passageGroup.section ===
                                                "scientific-text"
                                                    ? "Ilmiy matn"
                                                    : passageGroup.section ===
                                                        "ghazal"
                                                        ? "G‘azal"
                                                        : "Badiiy matn"}
                                            </strong>
                                            <small>
                                                {passageGroup.id}
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deletePassageGroup(
                                                passageGroup.id,
                                            )
                                        }
                                    >
                                        Guruhni o‘chirish
                                    </button>
                                </div>

                                <div
                                    className={
                                        styles.passageMetadataGrid
                                    }
                                >
                                    <label>
                                        <span>
                                            Sarlavha
                                        </span>
                                        <input
                                            value={
                                                passageGroup.title ??
                                                ""
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updatePassageGroup(
                                                    passageGroup.id,
                                                    {
                                                        title:
                                                            event.target
                                                                .value ||
                                                            null,
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
                                                passageGroup.section
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updatePassageGroup(
                                                    passageGroup.id,
                                                    {
                                                        section:
                                                            event.target
                                                                .value as
                                                                | "scientific-text"
                                                                | "literary-text"
                                                                | "ghazal",
                                                    },
                                                )
                                            }
                                        >
                                            <option value="scientific-text">
                                                Ilmiy matn
                                            </option>
                                            <option value="literary-text">
                                                Badiiy matn
                                            </option>
                                            <option value="ghazal">
                                                G‘azal
                                            </option>
                                        </select>
                                    </label>

                                    <label
                                        className={
                                            styles.passageFullWidth
                                        }
                                    >
                                        <span>
                                            Ko‘rsatma
                                        </span>
                                        <input
                                            value={
                                                passageGroup.instruction ??
                                                ""
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updatePassageGroup(
                                                    passageGroup.id,
                                                    {
                                                        instruction:
                                                            event.target
                                                                .value ||
                                                            null,
                                                    },
                                                )
                                            }
                                        />
                                    </label>

                                    <label
                                        className={
                                            styles.passageFullWidth
                                        }
                                    >
                                        <span>
                                            Subtitle / muallif / manba
                                        </span>
                                        <input
                                            value={
                                                passageGroup.context ??
                                                ""
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updatePassageGroup(
                                                    passageGroup.id,
                                                    {
                                                        context:
                                                            event.target
                                                                .value ||
                                                            null,
                                                    },
                                                )
                                            }
                                        />
                                    </label>
                                </div>

                                <div
                                    className={
                                        styles.passageColumns
                                    }
                                >
                                    <div
                                        className={
                                            styles.passageBlocksEditor
                                        }
                                    >
                                        <h3>
                                            Matn bloklari ({passageGroup.passage.length})
                                        </h3>

                                        {passageGroup.passage.map(
                                            (
                                                block,
                                                blockIndex,
                                            ) => (
                                            <div
                                                key={
                                                    block.id
                                                }
                                                className={
                                                    styles.passageBlockEditor
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.passageBlockFields
                                                    }
                                                >
                                                    <strong>
                                                        {blockIndex +
                                                        1}
                                                    </strong>

                                                    <select
                                                        value={
                                                            block.type
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updatePassageBlock(
                                                                passageGroup.id,
                                                                block.id,
                                                                {
                                                                    type:
                                                                        event.target
                                                                            .value as
                                                                            AdminDraftPassageBlock["type"],
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <option value="heading">
                                                            heading
                                                        </option>
                                                        <option value="paragraph">
                                                            paragraph
                                                        </option>
                                                        <option value="numbered-paragraph">
                                                            numbered-paragraph
                                                        </option>
                                                        <option value="dialogue">
                                                            dialogue
                                                        </option>
                                                        <option value="poetry">
                                                            poetry
                                                        </option>
                                                    </select>

                                                    <input
                                                        value={
                                                            block.marker ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updatePassageBlock(
                                                                passageGroup.id,
                                                                block.id,
                                                                {
                                                                    marker:
                                                                        event.target
                                                                            .value ||
                                                                        null,
                                                                },
                                                            )
                                                        }
                                                        placeholder="Marker"
                                                    />

                                                    <input
                                                        value={
                                                            block.speaker ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updatePassageBlock(
                                                                passageGroup.id,
                                                                block.id,
                                                                {
                                                                    speaker:
                                                                        event.target
                                                                            .value ||
                                                                        null,
                                                                },
                                                            )
                                                        }
                                                        placeholder="Speaker"
                                                    />
                                                </div>

                                                <textarea
                                                    value={
                                                        block.text
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updatePassageBlock(
                                                            passageGroup.id,
                                                            block.id,
                                                            {
                                                                text:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    rows={4}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div
                                        className={
                                            styles.passageQuestionsEditor
                                        }
                                    >
                                        <h3>
                                            Savollar ({passageGroup.questions.length})
                                        </h3>

                                        {passageGroup.questions.map(
                                            (
                                                question,
                                                questionIndex,
                                            ) => (
                                            <div
                                                key={
                                                    question.id
                                                }
                                                className={
                                                    styles.passageNestedQuestion
                                                }
                                            >
                                                <strong>
                                                    {questionIndex +
                                                    1}-savol
                                                </strong>

                                                <textarea
                                                    value={
                                                        question.question
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updatePassageQuestion(
                                                            passageGroup.id,
                                                            question.id,
                                                            {
                                                                question:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    rows={3}
                                                />

                                                <div
                                                    className={
                                                        styles.passageNestedOptions
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
                                                                    ? styles.passageCorrectOption
                                                                    : undefined
                                                            }
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`passage-correct-${question.id}`}
                                                                checked={
                                                                    question.correctOptionId ===
                                                                    option.id
                                                                }
                                                                onChange={() =>
                                                                    updatePassageQuestion(
                                                                        passageGroup.id,
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
                                                                    updatePassageQuestionOption(
                                                                        passageGroup.id,
                                                                        question.id,
                                                                        option.id,
                                                                        event.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
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
                    id="admin-draft-question-list"
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
