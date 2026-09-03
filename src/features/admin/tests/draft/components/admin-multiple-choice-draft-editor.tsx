"use client";

import Link from "next/link";
import {
    useActionState,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    saveAdminTestDraftAction,
} from "../actions/save-admin-test-draft-action";
import {
    publishAdminTestDraftAction,
} from "../actions/publish-admin-test-draft-action";
import {
    AdminDocxImportPreview,
} from "./admin-docx-import-preview";
import {
    AdminQuestionImageUploader,
} from "./admin-question-image-uploader";
import {
    AdminQuestionAudioUploader,
} from "./admin-question-audio-uploader";
import {
    AdminMixedStructuredQuestionEditor,
} from "./admin-mixed-structured-question-editor";
import {
    AdminDiagnosticEssayEditor,
} from "./admin-diagnostic-essay-editor";
import {
    AdminDiagnosticSectionDocxImporter,
} from "./admin-diagnostic-section-docx-importer";
import {
    AdminTestZipBulkImporter,
} from "./admin-test-zip-bulk-importer";
import {
    AdminAudioZipBulkImporter,
} from "./admin-audio-zip-bulk-importer";
import {
    AdminImageZipBulkImporter,
} from "./admin-image-zip-bulk-importer";
import {
    createEmptyMatchingQuestion,
    createEmptyMultipartQuestion,
    createEmptyMultipleChoiceQuestion,
    createEmptyShortAnswerQuestion,
} from "../model/admin-test-draft-factory";
import {
    initialSaveAdminTestDraftActionState,
} from "../model/save-admin-test-draft-action-state";
import {
    initialPublishAdminTestDraftActionState,
} from "../model/publish-admin-test-draft-action-state";
import {
    createAdminDiagnosticDraftImport,
    createAdminDiagnosticQuestionImport,
} from "../model/admin-diagnostic-draft-import";
import {
    calculateAdminDraftMaximumScore,
    calculateAdminDraftTaskCount,
} from "../model/admin-test-draft-validation";

import type {
    AdminDraftEssayQuestion,
    AdminDraftMatchingQuestion,
    AdminDraftMultipartQuestion,
    AdminDraftMultipleChoiceQuestion,
    AdminDraftOption,
    AdminDraftOptionId,
    AdminDraftShortAnswerQuestion,
    AdminDraftPassageBlock,
    AdminDraftPassageGroupQuestion,
    AdminDraftQuestion,
    AdminDraftQuestionSection,
} from "../model/admin-question-types";
import type {
    AdminTestDraft,
} from "../model/admin-test-draft-types";
import {
    getAdminOptionImageOwnerId,
} from "../model/admin-option-image-owner";
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
} from "../model/admin-mixed-docx-parser-types";
import type {
    AdminDiagnosticDocxParseResult,
} from "../model/admin-diagnostic-docx-parser-types";

import styles from "./admin-multiple-choice-draft-editor.module.css";

interface AdminMultipleChoiceDraftEditorProps {
    readonly initialDraft:
        AdminTestDraft;
}

interface PendingImageRemoval {
    readonly questionId: string;
    readonly storagePath: string;
}

interface PendingAudioRemoval {
    readonly questionId: string;
    readonly storagePath: string;
}

function mergeImageRemovals(
    existing:
        readonly PendingImageRemoval[],
    incoming:
        readonly PendingImageRemoval[],
): PendingImageRemoval[] {
    const removalsByPath =
        new Map<string, PendingImageRemoval>();

    existing.forEach(
        (removal) => {
            removalsByPath.set(
                removal.storagePath,
                removal,
            );
        },
    );
    incoming.forEach(
        (removal) => {
            removalsByPath.set(
                removal.storagePath,
                removal,
            );
        },
    );

    return [
        ...removalsByPath.values(),
    ];
}

function mergeAudioRemovals(
    existing:
        readonly PendingAudioRemoval[],
    incoming:
        readonly PendingAudioRemoval[],
): PendingAudioRemoval[] {
    const removalsByPath =
        new Map<string, PendingAudioRemoval>();

    existing.forEach(
        (removal) => {
            removalsByPath.set(
                removal.storagePath,
                removal,
            );
        },
    );

    incoming.forEach(
        (removal) => {
            removalsByPath.set(
                removal.storagePath,
                removal,
            );
        },
    );

    return [
        ...removalsByPath.values(),
    ];
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

const diagnosticManualImageSourceOrders =
    new Set<number>();


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


function isStructuredMixedQuestion(
    question:
        AdminDraftQuestion,
): question is
    | AdminDraftMatchingQuestion
    | AdminDraftShortAnswerQuestion
    | AdminDraftMultipartQuestion {
    return (
        question.type ===
            "matching" ||
        question.type ===
            "short-answer" ||
        question.type ===
            "multipart"
    );
}


function isEssayQuestion(
    question:
        AdminDraftQuestion,
): question is
    AdminDraftEssayQuestion {
    return question.type ===
        "essay";
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

function createSyntaxMatchingPracticeTemplate(): readonly AdminDraftMatchingQuestion[] {
    const instruction =
        "Gaplar (33, 34, 35) va sintaktik tahlilga oid izohlar (A–F)ni o‘zaro to‘g‘ri moslashtiring.";

    return Array.from(
        { length: 20 },
        (_, index) => {
            const emptyQuestion =
                createEmptyMatchingQuestion({
                    order: index + 1,
                    section: "syntax",
                });

            return {
                ...emptyQuestion,
                sourceOrder: index + 1,
                question: instruction,
                instruction,
                title: `${index + 1}-topshiriq`,
                maximumScore: 3,
                choices: [
                    { id: "A", text: "" },
                    { id: "B", text: "" },
                    { id: "C", text: "" },
                    { id: "D", text: "" },
                    { id: "E", text: "" },
                    { id: "F", text: "" },
                ],
                items: [33, 34, 35].map(
                    (sourceOrder, itemIndex) => ({
                        id: createClientId(
                            "matching-item",
                        ),
                        order: itemIndex + 1,
                        sourceOrder,
                        prompt: "",
                        correctChoiceId: null,
                        maximumScore: 1,
                        explanation: {
                            text: "",
                            audio: null,
                        },
                    }),
                ),
            } satisfies AdminDraftMatchingQuestion;
        },
    );
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

    const lastPersistedDraftRef =
        useRef<AdminTestDraft>(
            initialDraft,
        );

    const pendingImageRemovalsRef =
        useRef<
            PendingImageRemoval[]
        >([]);
    const submittedImageRemovalsRef =
        useRef<
            PendingImageRemoval[]
        >([]);

    const pendingAudioRemovalsRef =
        useRef<
            PendingAudioRemoval[]
        >([]);
    const submittedAudioRemovalsRef =
        useRef<
            PendingAudioRemoval[]
        >([]);


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

    const [
        publishState,
        publishFormAction,
        publishing,
    ] = useActionState(
        publishAdminTestDraftAction,
        initialPublishAdminTestDraftActionState,
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
            lastPersistedDraftRef.current =
                actionState.savedDraft;

            setToast({
                type:
                    "success",
                message:
                    actionState.message ??
                    "Draft muvaffaqiyatli saqlandi.",
            });

            const savedDraftId =
                actionState.savedDraft.id;
            const pendingImageRemovals =
                submittedImageRemovalsRef
                    .current;

            submittedImageRemovalsRef.current =
                [];

            if (
                pendingImageRemovals.length >
                0
            ) {
                void (async () => {
                    const results =
                        await Promise.all(
                            pendingImageRemovals.map(
                                async (removal) => {
                                    try {
                                        const response =
                                            await fetch(
                                                "/api/admin/test-drafts/images",
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        draftId:
                                                            savedDraftId,
                                                        questionId:
                                                            removal.questionId,
                                                        storagePath:
                                                            removal.storagePath,
                                                    }),
                                                },
                                            );

                                        return response.ok
                                            ? null
                                            : removal;
                                    } catch {
                                        return removal;
                                    }
                                },
                            ),
                        );
                    const failedRemovals =
                        results.filter(
                            (
                                removal,
                            ): removal is PendingImageRemoval =>
                                removal !==
                                null,
                        );

                    if (
                        failedRemovals.length >
                        0
                    ) {
                        pendingImageRemovalsRef.current =
                            mergeImageRemovals(
                                failedRemovals,
                                pendingImageRemovalsRef.current,
                            );

                        setToast({
                            type: "error",
                            message:
                                `Draft saqlandi, lekin ${failedRemovals.length} ta eski rasmni Storage’dan o‘chirib bo‘lmadi. Keyingi saqlashda qayta uriniladi.`,
                        });
                    }
                })();
            }

            const pendingAudioRemovals =
                submittedAudioRemovalsRef
                    .current;

            submittedAudioRemovalsRef.current =
                [];

            if (
                pendingAudioRemovals.length >
                0
            ) {
                void (async () => {
                    const results =
                        await Promise.all(
                            pendingAudioRemovals.map(
                                async (removal) => {
                                    try {
                                        const response =
                                            await fetch(
                                                "/api/admin/test-drafts/audios",
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        draftId:
                                                            savedDraftId,
                                                        questionId:
                                                            removal.questionId,
                                                        storagePath:
                                                            removal.storagePath,
                                                    }),
                                                },
                                            );

                                        return response.ok
                                            ? null
                                            : removal;
                                    } catch {
                                        return removal;
                                    }
                                },
                            ),
                        );
                    const failedRemovals =
                        results.filter(
                            (
                                removal,
                            ): removal is PendingAudioRemoval =>
                                removal !==
                                null,
                        );

                    if (
                        failedRemovals.length >
                        0
                    ) {
                        pendingAudioRemovalsRef.current =
                            mergeAudioRemovals(
                                failedRemovals,
                                pendingAudioRemovalsRef.current,
                            );

                        setToast({
                            type: "error",
                            message:
                                `Draft saqlandi, lekin ${failedRemovals.length} ta eski audioni Storage’dan o‘chirib bo‘lmadi. Keyingi saqlashda qayta uriniladi.`,
                        });
                    }
                })();
            }

            return;
        }

        if (
            actionState.status ===
                "error" ||
            actionState.status ===
                "conflict"
        ) {
            pendingImageRemovalsRef.current =
                mergeImageRemovals(
                    submittedImageRemovalsRef.current,
                    pendingImageRemovalsRef.current,
                );
            submittedImageRemovalsRef.current =
                [];

            pendingAudioRemovalsRef.current =
                mergeAudioRemovals(
                    submittedAudioRemovalsRef.current,
                    pendingAudioRemovalsRef.current,
                );
            submittedAudioRemovalsRef.current =
                [];

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
        if (
            publishState.status ===
                "success" &&
            publishState.publishedDraft
        ) {
            setDraft(
                publishState.publishedDraft,
            );
            lastPersistedDraftRef.current =
                publishState.publishedDraft;
            setToast({
                type:
                    "success",
                message:
                    publishState.message ??
                    "Test muvaffaqiyatli nashr qilindi.",
            });
            return;
        }

        if (
            publishState.status ===
                "error" ||
            publishState.status ===
                "conflict"
        ) {
            setToast({
                type:
                    "error",
                message:
                    publishState.message ??
                    "Testni nashr qilishda xatolik yuz berdi.",
            });
        }
    }, [
        publishState,
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

    function queueImageStorageRemoval(
        questionId: string,
        storagePath: string,
    ) {
        pendingImageRemovalsRef.current =
            mergeImageRemovals(
                pendingImageRemovalsRef.current,
                [
                    {
                        questionId,
                        storagePath,
                    },
                ],
            );
    }

    function queueOptionImageStorageRemovals(
        question:
            AdminDraftMultipleChoiceQuestion,
    ) {
        question.options.forEach(
            (option) => {
                if (
                    option.image?.storagePath
                ) {
                    queueImageStorageRemoval(
                        getAdminOptionImageOwnerId(
                            question.id,
                            option.id,
                        ),
                        option.image.storagePath,
                    );
                }
            },
        );
    }

    function queueAudioStorageRemoval(
        questionId: string,
        storagePath: string,
    ) {
        pendingAudioRemovalsRef.current =
            mergeAudioRemovals(
                pendingAudioRemovalsRef.current,
                [
                    {
                        questionId,
                        storagePath,
                    },
                ],
            );
    }

    function queueQuestionAudioStorageRemovals(
        question:
            AdminDraftQuestion,
    ) {
        const queueExplanation = (
            ownerId: string,
            storagePath:
                string | null | undefined,
        ) => {
            if (storagePath) {
                queueAudioStorageRemoval(
                    ownerId,
                    storagePath,
                );
            }
        };

        if (
            question.type ===
            "passage-group"
        ) {
            question.questions.forEach(
                (nestedQuestion) =>
                    queueExplanation(
                        nestedQuestion.id,
                        nestedQuestion.explanation.audio?.storagePath,
                    ),
            );
            return;
        }

        queueExplanation(
            question.id,
            question.explanation.audio?.storagePath,
        );

        if (
            question.type ===
            "matching"
        ) {
            question.items.forEach(
                (item) =>
                    queueExplanation(
                        item.id,
                        item.explanation?.audio?.storagePath,
                    ),
            );
        }

        if (
            question.type ===
            "multipart"
        ) {
            question.parts.forEach(
                (part) =>
                    queueExplanation(
                        part.id,
                        part.explanation?.audio?.storagePath,
                    ),
            );
        }
    }

    function prepareAssetRemovalsForSave() {
        submittedImageRemovalsRef.current =
            mergeImageRemovals(
                submittedImageRemovalsRef.current,
                pendingImageRemovalsRef.current,
            );
        pendingImageRemovalsRef.current =
            [];

        submittedAudioRemovalsRef.current =
            mergeAudioRemovals(
                submittedAudioRemovalsRef.current,
                pendingAudioRemovalsRef.current,
            );
        pendingAudioRemovalsRef.current =
            [];
    }

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
                        ) &&
                        !isStructuredMixedQuestion(
                            question,
                        ) &&
                        !(
                            draft.metadata.format ===
                                "diagnostic" &&
                            isEssayQuestion(
                                question,
                            )
                        ),
                ),
            [
                draft.metadata.format,
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


    const supportsImageZipImport =
        draft.metadata.group ===
            "national-certificate" &&
        draft.metadata.topicSlug ===
            "aralash" &&
        draft.metadata.format ===
            "mixed";

    const imageZipTargets =
        useMemo(
            () => {
                if (!supportsImageZipImport) return [];
                return [...draft.questions]
                    .filter((question) => question.type !== "essay" && question.type !== "passage-group")
                    .sort((left, right) => left.order - right.order)
                    .map((question) => {
                        const sourceOrder = question.sourceOrder ?? question.order;
                        return {
                            questionId: question.id,
                            label: `${sourceOrder}-savol`,
                            image: question.image,
                            zipFileStem: `q${String(sourceOrder).padStart(2, "0")}`,
                            defaultAlt: `${sourceOrder}-savol diagrammasi`,
                        };
                    });
            },
            [draft.metadata.format, draft.questions, supportsImageZipImport],
        );

    function applyImageZipUpdates(
        updates: readonly { readonly questionId: string; readonly image: AdminDraftMultipleChoiceQuestion["image"] }[],
    ) {
        const imageByQuestionId = new Map(updates.map((update) => [update.questionId, update.image]));
        setDraft((currentDraft) => ({
            ...currentDraft,
            questions: currentDraft.questions.map((question) => {
                if (question.type === "essay" || question.type === "passage-group") return question;
                const image = imageByQuestionId.get(question.id);
                return image ? { ...question, image } : question;
            }),
        }));
    }

    const supportsAudioZipImport =
        draft.metadata.format === "diagnostic" ||
        draft.metadata.format === "standard" ||
        draft.metadata.format === "morphology-standard" ||
        draft.metadata.format === "standard-five" ||
        draft.metadata.format === "passage-five" ||
        draft.metadata.format === "mixed";

    const audioZipTargets =
        useMemo(
            () => {
                if (!supportsAudioZipImport) {
                    return [];
                }

                if (draft.metadata.format === "diagnostic") {
                    const targets: {
                        questionId: string;
                        label: string;
                        audio: AdminDraftMultipleChoiceQuestion["explanation"]["audio"];
                        sourceOrder: number;
                    }[] = [];

                    for (const question of draft.questions) {
                        if (question.type === "essay") {
                            continue;
                        }

                        if (question.type === "passage-group") {
                            for (const nestedQuestion of question.questions) {
                                const sourceOrder = nestedQuestion.sourceOrder ?? nestedQuestion.order;
                                targets.push({
                                    questionId: nestedQuestion.id,
                                    label: `${sourceOrder}-savol`,
                                    audio: nestedQuestion.explanation.audio,
                                    sourceOrder,
                                });
                            }
                            continue;
                        }

                        if (question.type === "matching") {
                            for (const item of question.items) {
                                const sourceOrder = item.sourceOrder ?? item.order;
                                targets.push({
                                    questionId: item.id,
                                    label: `${sourceOrder}-savol`,
                                    audio: item.explanation?.audio ?? null,
                                    sourceOrder,
                                });
                            }
                            continue;
                        }

                        const sourceOrder = question.sourceOrder ?? question.order;
                        targets.push({
                            questionId: question.id,
                            label: `${sourceOrder}-savol`,
                            audio: question.explanation.audio,
                            sourceOrder,
                        });
                    }

                    return targets
                        .filter((target) => target.sourceOrder >= 1 && target.sourceOrder <= 44)
                        .sort((left, right) => left.sourceOrder - right.sourceOrder)
                        .map(({ sourceOrder: _sourceOrder, ...target }) => target);
                }

                if (draft.metadata.format === "mixed") {
                    const targets: {
                        questionId: string;
                        label: string;
                        audio: AdminDraftMultipleChoiceQuestion["explanation"]["audio"];
                        zipFileStem: string;
                        sourceOrder: number;
                        nestedOrder: number;
                    }[] = [];

                    for (const question of [...draft.questions].sort(
                        (left, right) => left.order - right.order,
                    )) {
                        if (question.type === "essay") {
                            continue;
                        }

                        const sourceOrder =
                            question.sourceOrder ??
                            question.order;
                        const baseStem =
                            `q${String(sourceOrder).padStart(2, "0")}`;

                        if (question.type === "matching") {
                            // 33–34–35 matching is one displayed block, so it owns one
                            // shared explanation audio. The ZIP name follows the block
                            // number (q01.mp3 ... q20.mp3), not the repeated item labels
                            // 33/34/35.
                            targets.push({
                                questionId: question.id,
                                label: `${sourceOrder}-matching blok (33–35)`,
                                audio: question.explanation.audio,
                                zipFileStem: baseStem,
                                sourceOrder,
                                nestedOrder: 0,
                            });
                            continue;
                        }

                        if (question.type === "multipart") {
                            targets.push({
                                questionId: question.id,
                                label: `${sourceOrder}-savol`,
                                audio: question.explanation.audio,
                                zipFileStem: baseStem,
                                sourceOrder,
                                nestedOrder: 0,
                            });
                            continue;
                        }

                        if (question.type === "passage-group") {
                            [...question.questions]
                                .sort((left, right) => left.order - right.order)
                                .forEach((nestedQuestion, nestedIndex) => {
                                    const nestedSourceOrder =
                                        nestedQuestion.sourceOrder ??
                                        nestedQuestion.order ??
                                        nestedIndex + 1;
                                    targets.push({
                                        questionId: nestedQuestion.id,
                                        label: `${nestedSourceOrder}-savol`,
                                        audio: nestedQuestion.explanation.audio,
                                        zipFileStem: `q${String(nestedSourceOrder).padStart(2, "0")}`,
                                        sourceOrder: nestedSourceOrder,
                                        nestedOrder: 0,
                                    });
                                });
                            continue;
                        }

                        targets.push({
                            questionId: question.id,
                            label: `${sourceOrder}-savol`,
                            audio: question.explanation.audio,
                            zipFileStem: baseStem,
                            sourceOrder,
                            nestedOrder: 0,
                        });
                    }

                    return targets
                        .sort((left, right) =>
                            left.sourceOrder - right.sourceOrder ||
                            left.nestedOrder - right.nestedOrder,
                        )
                        .map(({
                            sourceOrder: _sourceOrder,
                            nestedOrder: _nestedOrder,
                            ...target
                        }) => target);
                }

                if (
                    questions.length > 0 &&
                    passageGroups.length === 0
                ) {
                    return [...questions]
                        .sort((left, right) => left.order - right.order)
                        .map((question, index) => ({
                            questionId: question.id,
                            label: `${question.sourceOrder ?? index + 1}-savol`,
                            audio: question.explanation.audio,
                        }));
                }

                if (
                    passageGroups.length > 0 &&
                    questions.length === 0
                ) {
                    return [...passageGroups]
                        .sort((left, right) => left.order - right.order)
                        .flatMap((group) =>
                            [...group.questions]
                                .sort((left, right) => left.order - right.order)
                                .map((question, index) => ({
                                    questionId: question.id,
                                    label: `${question.sourceOrder ?? index + 1}-savol`,
                                    audio: question.explanation.audio,
                                })),
                        );
                }

                return [];
            },
            [
                draft.metadata.format,
                draft.questions,
                passageGroups,
                questions,
                supportsAudioZipImport,
            ],
        );

    function applyAudioZipUpdates(
        updates: readonly {
            readonly questionId: string;
            readonly audio: AdminDraftMultipleChoiceQuestion["explanation"]["audio"];
        }[],
    ) {
        const audioByQuestionId = new Map(
            updates.map((update) => [update.questionId, update.audio]),
        );

        setDraft((currentDraft) => ({
            ...currentDraft,
            questions: currentDraft.questions.map((question) => {
                if (question.type === "passage-group") {
                    return {
                        ...question,
                        questions: question.questions.map((nestedQuestion) => {
                            const audio = audioByQuestionId.get(nestedQuestion.id);
                            return audio
                                ? {
                                    ...nestedQuestion,
                                    explanation: { ...nestedQuestion.explanation, audio },
                                }
                                : nestedQuestion;
                        }),
                    };
                }

                if (question.type === "matching") {
                    const groupAudio = audioByQuestionId.get(question.id);

                    return {
                        ...question,
                        ...(groupAudio
                            ? {
                                explanation: {
                                    ...question.explanation,
                                    audio: groupAudio,
                                },
                            }
                            : {}),
                        // Keep item-id support for existing diagnostic drafts and
                        // legacy matching audio. Mixed 33–34–35 bulk import now
                        // targets only question.id, so new uploads are group-level.
                        items: question.items.map((item) => {
                            const audio = audioByQuestionId.get(item.id);
                            return audio
                                ? {
                                    ...item,
                                    explanation: {
                                        text: item.explanation?.text ?? "",
                                        audio,
                                    },
                                }
                                : item;
                        }),
                    };
                }

                if (question.type === "multipart") {
                    const audio = audioByQuestionId.get(question.id);

                    return audio
                        ? {
                            ...question,
                            explanation: {
                                ...question.explanation,
                                audio,
                            },
                        }
                        : question;
                }

                if (question.type !== "essay") {
                    const audio = audioByQuestionId.get(question.id);
                    if (audio) {
                        return {
                            ...question,
                            explanation: { ...question.explanation, audio },
                        };
                    }
                }

                return question;
            }),
        }));
    }

    const structuredQuestions =
        useMemo(
            () =>
                draft.questions.filter(
                    isStructuredMixedQuestion,
                ),
            [
                draft.questions,
            ],
        );


    const essayQuestions =
        useMemo(
            () =>
                draft.metadata.format ===
                    "diagnostic"
                    ? draft.questions.filter(
                        isEssayQuestion,
                    )
                    : [],
            [
                draft.metadata.format,
                draft.questions,
            ],
        );

    function replaceEssayQuestion(
        nextQuestion:
            AdminDraftEssayQuestion,
    ) {
        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                questions:
                    currentDraft.questions.map(
                        (question) =>
                            question.id ===
                                nextQuestion.id
                                ? nextQuestion
                                : question,
                    ),
            }),
        );
    }

    function replaceStructuredQuestions(
        nextQuestions:
            readonly (
                | AdminDraftMatchingQuestion
                | AdminDraftShortAnswerQuestion
                | AdminDraftMultipartQuestion
            )[],
    ) {
        const nextById =
            new Map(
                nextQuestions.map(
                    (question) => [
                        question.id,
                        question,
                    ],
                ),
            );

        structuredQuestions
            .filter(
                (question) =>
                    !nextById.has(
                        question.id,
                    ),
            )
            .forEach(
                queueQuestionAudioStorageRemovals,
            );

        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                questions:
                    currentDraft.questions
                        .filter(
                            (question) =>
                                !isStructuredMixedQuestion(
                                    question,
                                ) ||
                                nextById.has(
                                    question.id,
                                ),
                        )
                        .map(
                            (question) =>
                                isStructuredMixedQuestion(
                                    question,
                                )
                                    ? nextById.get(
                                        question.id,
                                    ) ??
                                    question
                                    : question,
                        ),
            }),
        );
    }

    function updateStructuredQuestionImage(
        questionId: string,
        image:
            AdminDraftShortAnswerQuestion["image"],
    ) {
        replaceStructuredQuestions(
            structuredQuestions.map(
                (question) =>
                    question.id ===
                    questionId
                        ? {
                            ...question,
                            image,
                        }
                        : question,
            ),
        );
    }


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
                    ...structuredQuestions,
                    ...essayQuestions,
                    ...unsupportedQuestions,
                ],
            }),
        );
    }

    function addQuestion() {
        if (
            isDiagnostic
        ) {
            const usedSourceOrders =
                new Set(
                    questions.flatMap(
                        (question) =>
                            question.sourceOrder ===
                            null
                                ? []
                                : [
                                    question.sourceOrder,
                                ],
                    ),
                );

            const nextSourceOrder =
                Array.from(
                    {
                        length: 17,
                    },
                    (
                        _value,
                        index,
                    ) =>
                        index + 1,
                ).find(
                    (sourceOrder) =>
                        !usedSourceOrders.has(
                            sourceOrder,
                        ),
                ) ?? null;

            if (
                nextSourceOrder ===
                null
            ) {
                setToast({
                    type:
                        "error",
                    message:
                        "Diagnostikaning 1–17-savollari allaqachon qo‘shilgan.",
                });
                return;
            }

            const emptyQuestion =
                createEmptyMultipleChoiceQuestion({
                    order:
                        nextSourceOrder,
                    section:
                        nextSourceOrder <=
                        12
                            ? "grammar"
                            : "literature",
                });

            replaceQuestions([
                ...questions,
                {
                    ...emptyQuestion,
                    sourceOrder:
                        nextSourceOrder,
                },
            ]);
            return;
        }

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
        const isSyntaxStandardImport =
            draft.metadata.group ===
                "grammar" &&
            draft.metadata.category ===
                "Sintaksis" &&
            draft.metadata.topicSlug ===
                "sintaksis";

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

        if (
            isSyntaxStandardImport
        ) {
            setDraft(
                (currentDraft) => ({
                    ...currentDraft,
                    source:
                        "docx-import",
                    metadata: {
                        ...currentDraft.metadata,
                        format:
                            "standard",
                    },
                    questions: [
                        ...normalizeOrders([
                            ...questions,
                            ...importedQuestions,
                        ]),
                        ...passageGroups,
                        ...essayQuestions,
                        ...unsupportedQuestions,
                    ],
                }),
            );

            setToast({
                type:
                    "success",
                message:
                    "Sintaksis standart DOCX savollari draftga import qilindi. Draft formati Standartga o‘tkazildi.",
            });
        } else {
            replaceQuestions([
                ...questions,
                ...importedQuestions,
            ]);
        }

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
        const existingGroup =
            draft.questions.find(
                (question) =>
                    question.type ===
                    "passage-group",
            );
        const existingQuestionsBySourceOrder =
            new Map(
                existingGroup?.type ===
                    "passage-group"
                    ? existingGroup.questions.map(
                        (question) => [
                            question.sourceOrder,
                            question,
                        ] as const,
                    )
                    : [],
            );

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
                    const existingQuestion =
                        existingQuestionsBySourceOrder.get(
                            parsedQuestion.sourceNumber,
                        );

                    return {
                        ...emptyQuestion,
                        id:
                            existingQuestion?.id ??
                            emptyQuestion.id,
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
                        image:
                            existingQuestion?.image ??
                            null,
                        explanation:
                            existingQuestion?.explanation ?? {
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
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.id
                    : createClientId(
                        "ghazal-group",
                    ),
            order:
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
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.image
                    : null,
            explanation:
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.explanation
                    : {
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
                    passageGroup,
                ],
            }),
        );

        setToast({
            type:
                "success",
            message:
                "G‘azal, baytlar, lug‘at va 5 ta savol draftga import qilindi.",
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
        const existingGroup =
            draft.questions.find(
                (question) =>
                    question.type ===
                    "passage-group",
            );
        const existingQuestionsBySourceOrder =
            new Map(
                existingGroup?.type ===
                    "passage-group"
                    ? existingGroup.questions.map(
                        (question) => [
                            question.sourceOrder,
                            question,
                        ] as const,
                    )
                    : [],
            );

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
                    const existingQuestion =
                        existingQuestionsBySourceOrder.get(
                            parsedQuestion.sourceNumber,
                        );

                    return {
                        ...emptyQuestion,
                        id:
                            existingQuestion?.id ??
                            emptyQuestion.id,
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
                        image:
                            existingQuestion?.image ??
                            null,
                        explanation:
                            existingQuestion?.explanation ?? {
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
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.id
                    : createClientId(
                        "passage-group",
                    ),
            order:
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
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.image
                    : null,
            explanation:
                existingGroup?.type ===
                "passage-group"
                    ? existingGroup.explanation
                    : {
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
                    passageGroup,
                ],
            }),
        );

        setToast({
            type:
                "success",
            message:
                section ===
                "scientific-text"
                    ? "Ilmiy matn va 5 ta savol draftga import qilindi."
                    : "Badiiy matn va 5 ta savol draftga import qilindi.",
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


    function importParsedMixed(
        parsedMixed:
            AdminMixedDocxParseResult,
    ) {
        const isSyntaxMatchingImport =
            draft.metadata.group ===
                "grammar" &&
            draft.metadata.category ===
                "Sintaksis" &&
            draft.metadata.topicSlug ===
                "sintaksis";

        const validQuestions =
            parsedMixed.questions.filter(
                (question) =>
                    question.confidence !==
                    "invalid",
            );

        if (
            validQuestions.length ===
            0
        ) {
            setToast({
                type: "error",
                message:
                    isSyntaxMatchingImport
                        ? "Import uchun yaroqli 33–34–35 matching bloki topilmadi."
                        : "Import uchun yaroqli aralash savol topilmadi.",
            });
            return;
        }

        if (
            isSyntaxMatchingImport &&
            validQuestions.some(
                (question) =>
                    question.type !==
                    "matching",
            )
        ) {
            setToast({
                type: "error",
                message:
                    "Sintaksis 33–34–35 importida faqat MATCHING bloklari bo‘lishi kerak. Draft route o‘zgartirilmadi.",
            });
            return;
        }

        const firstOrder =
            isSyntaxMatchingImport
                ? 1
                : draft.questions.length +
                  1;

        const importedQuestions:
            AdminDraftQuestion[] =
            validQuestions.map(
                (
                    parsedQuestion,
                    index,
                ) => {
                    const order =
                        firstOrder +
                        index;

                    if (
                        parsedQuestion.type ===
                        "multiple-choice"
                    ) {
                        const emptyQuestion =
                            createEmptyMultipleChoiceQuestion({
                                order,
                                section:
                                    "grammar",
                            });

                        return {
                            ...emptyQuestion,
                            sourceOrder:
                                parsedQuestion.sourceOrder,
                            question:
                                parsedQuestion.question,
                            context:
                                parsedQuestion.context,
                            maximumScore:
                                parsedQuestion.maximumScore,
                            options:
                                parsedQuestion.options,
                            correctOptionId:
                                parsedQuestion.correctOptionId,
                            visual:
                                parsedQuestion.visual,
                            explanation: {
                                ...emptyQuestion.explanation,
                                text:
                                    "DOCX aralash import orqali qo‘shildi. Javob izohini tekshiring.",
                            },
                        } satisfies
                            AdminDraftMultipleChoiceQuestion;
                    }

                    if (
                        parsedQuestion.type ===
                        "matching"
                    ) {
                        const emptyQuestion =
                            createEmptyMatchingQuestion({
                                order,
                                section:
                                    "syntax",
                            });

                        return {
                            ...emptyQuestion,
                            sourceOrder:
                                parsedQuestion.sourceOrder,
                            question:
                                parsedQuestion.question,
                            instruction:
                                parsedQuestion.instruction,
                            context:
                                parsedQuestion.context,
                            maximumScore:
                                parsedQuestion.maximumScore,
                            title:
                                parsedQuestion.title,
                            choices:
                                parsedQuestion.choices,
                            items:
                                parsedQuestion.items.map(
                                    (item) => ({
                                        id:
                                            createClientId(
                                                "matching-item",
                                            ),
                                        order:
                                            item.order,
                                        sourceOrder:
                                            item.sourceOrder,
                                        prompt:
                                            item.prompt,
                                        correctChoiceId:
                                            item.correctChoiceId,
                                        maximumScore:
                                            item.maximumScore,
                                        explanation: {
                                            text:
                                                "DOCX aralash import orqali qo‘shildi. Ushbu matching bandi uchun audio izohni tekshiring.",
                                            audio:
                                                null,
                                        },
                                    }),
                                ),
                            explanation: {
                                ...emptyQuestion.explanation,
                                text:
                                    "DOCX aralash import orqali qo‘shildi. Mosliklarni tekshiring.",
                            },
                        } satisfies
                            AdminDraftMatchingQuestion;
                    }

                    if (
                        parsedQuestion.type ===
                        "short-answer"
                    ) {
                        const emptyQuestion =
                            createEmptyShortAnswerQuestion({
                                order,
                                section:
                                    "written",
                            });

                        return {
                            ...emptyQuestion,
                            sourceOrder:
                                parsedQuestion.sourceOrder,
                            question:
                                parsedQuestion.question,
                            context:
                                parsedQuestion.context,
                            maximumScore:
                                parsedQuestion.maximumScore,
                            acceptedAnswers:
                                parsedQuestion.acceptedAnswers,
                            requiredKeywords:
                                parsedQuestion.requiredKeywords,
                            comparison:
                                parsedQuestion.comparison,
                            examples:
                                parsedQuestion.examples,
                            explanation: {
                                ...emptyQuestion.explanation,
                                text:
                                    "DOCX aralash import orqali qo‘shildi. Qabul qilinadigan javoblarni tekshiring.",
                            },
                        } satisfies
                            AdminDraftShortAnswerQuestion;
                    }

                    const emptyQuestion =
                        createEmptyMultipartQuestion({
                            order,
                            section:
                                "written",
                        });

                    return {
                        ...emptyQuestion,
                        sourceOrder:
                            parsedQuestion.sourceOrder,
                        question:
                            parsedQuestion.question,
                        context:
                            parsedQuestion.context,
                        maximumScore:
                            parsedQuestion.sourceOrder ===
                            44
                                ? parsedQuestion.parts.reduce(
                                    (
                                        total,
                                        part,
                                    ) =>
                                        total +
                                        (
                                            part.label ===
                                            "b"
                                                ? 0
                                                : part.maximumScore
                                        ),
                                    0,
                                )
                                : parsedQuestion.maximumScore,
                        parts:
                            parsedQuestion.parts.map(
                                (
                                    part,
                                    partIndex,
                                ) => {
                                    const isManualQuestion44Part =
                                        parsedQuestion.sourceOrder ===
                                            44 &&
                                        part.label ===
                                            "b";

                                    return {
                                        id:
                                            createClientId(
                                                "multipart-part",
                                            ),
                                        order:
                                            partIndex +
                                            1,
                                        label:
                                            part.label,
                                        prompt:
                                            part.question,
                                        acceptedAnswers:
                                            isManualQuestion44Part
                                                ? []
                                                : part.acceptedAnswers,
                                        requiredKeywords:
                                            isManualQuestion44Part
                                                ? []
                                                : part.requiredKeywords,
                                        comparison:
                                            isManualQuestion44Part
                                                ? "manual-review"
                                                : part.comparison,
                                        maximumScore:
                                            isManualQuestion44Part
                                                ? 0
                                                : part.maximumScore,
                                        explanation: {
                                            text:
                                                "DOCX aralash import orqali qo‘shildi. Qism javobini tekshiring.",
                                            audio:
                                                null,
                                        },
                                    };
                                },
                            ),
                        explanation: {
                            ...emptyQuestion.explanation,
                            text:
                                "DOCX aralash import orqali qo‘shildi. Savol uchun bitta audio izoh ishlatiladi.",
                        },
                    } satisfies
                        AdminDraftMultipartQuestion;
                },
            );

        setDraft(
            (currentDraft) => {
                const preserveSyntaxMatchingRoute =
                    currentDraft.metadata.group ===
                        "grammar" &&
                    currentDraft.metadata.category ===
                        "Sintaksis" &&
                    currentDraft.metadata.topicSlug ===
                        "sintaksis";

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    metadata:
                        preserveSyntaxMatchingRoute
                            ? {
                                ...currentDraft.metadata,
                                title:
                                    parsedMixed.metadata.title ??
                                    currentDraft.metadata.title,
                                description:
                                    parsedMixed.metadata.description ??
                                    currentDraft.metadata.description,
                                format:
                                    "mixed",
                                estimatedMinutes:
                                    parsedMixed.metadata.estimatedMinutes ??
                                    currentDraft.metadata.estimatedMinutes,
                                access:
                                    parsedMixed.metadata.access ??
                                    currentDraft.metadata.access,
                            }
                            : {
                                ...currentDraft.metadata,
                                title:
                                    parsedMixed.metadata.title ??
                                    currentDraft.metadata.title,
                                description:
                                    parsedMixed.metadata.description ??
                                    currentDraft.metadata.description,
                                format:
                                    "mixed",
                                group:
                                    "national-certificate",
                                category:
                                    "Aralash",
                                topicSlug:
                                    "aralash",
                                estimatedMinutes:
                                    parsedMixed.metadata.estimatedMinutes ??
                                    currentDraft.metadata.estimatedMinutes,
                                access:
                                    parsedMixed.metadata.access ??
                                    currentDraft.metadata.access,
                            },
                    questions:
                        preserveSyntaxMatchingRoute
                            ? importedQuestions
                            : [
                                ...currentDraft.questions,
                                ...importedQuestions,
                            ],
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                isSyntaxMatchingImport
                    ? `${importedQuestions.length} ta 33–34–35 matching bloki Sintaksis draftiga import qilindi. Route: Grammatika → Sintaksis saqlandi.`
                    : `${importedQuestions.length} ta aralash savol draftga qo‘shildi. Saqlashdan oldin tekshiring.`,
        });
    }


    function importDiagnosticMultipleChoiceSection(
        parsedDiagnostic:
            AdminDiagnosticDocxParseResult,
    ) {
        if (!isDiagnostic) {
            return;
        }

        const validQuestions =
            parsedDiagnostic.questions.filter(
                (question) =>
                    question.confidence !==
                    "invalid",
            );

        const sourceOrders =
            validQuestions.flatMap(
                (question) =>
                    question.type ===
                    "multiple-choice"
                        ? [
                            question.sourceOrder,
                        ]
                        : [],
            );

        const expectedSourceOrders =
            Array.from(
                {
                    length:
                        17,
                },
                (
                    _value,
                    index,
                ) =>
                    index +
                    1,
            );

        const sourceOrderSet =
            new Set(
                sourceOrders,
            );

        const missingSourceOrders =
            expectedSourceOrders.filter(
                (sourceOrder) =>
                    !sourceOrderSet.has(
                        sourceOrder,
                    ),
            );

        const outsideSourceOrders =
            sourceOrders.filter(
                (sourceOrder) =>
                    sourceOrder < 1 ||
                    sourceOrder > 17,
            );

        if (
            validQuestions.some(
                (question) =>
                    question.type !==
                    "multiple-choice",
            ) ||
            missingSourceOrders.length >
                0 ||
            outsideSourceOrders.length >
                0 ||
            sourceOrderSet.size !==
                sourceOrders.length ||
            sourceOrders.length !==
                17
        ) {
            setToast({
                type:
                    "error",
                message:
                    missingSourceOrders.length >
                    0
                        ? `1–17 DOCX to‘liq emas. Yetishmaydi: ${missingSourceOrders.join(
                            ", ",
                        )}.`
                        : outsideSourceOrders.length >
                          0
                            ? `1–17 DOCX ichida noto‘g‘ri savol raqamlari bor: ${outsideSourceOrders.join(
                                ", ",
                            )}.`
                            : "1–17 DOCX faylida faqat 17 ta multiple-choice savol bo‘lishi kerak.",
            });
            return;
        }

        setDraft(
            (currentDraft) => {
                const existingBySourceOrder =
                    new Map<
                        number,
                        AdminDraftMultipleChoiceQuestion
                    >();

                currentDraft.questions.forEach(
                    (question) => {
                        if (
                            question.type ===
                                "multiple-choice" &&
                            question.sourceOrder !==
                                null &&
                            question.sourceOrder >=
                                1 &&
                            question.sourceOrder <=
                                17
                        ) {
                            existingBySourceOrder.set(
                                question.sourceOrder,
                                question,
                            );
                        }
                    },
                );

                const importedQuestions =
                    validQuestions.map(
                        (parsedQuestion) => {
                            if (
                                parsedQuestion.type !==
                                "multiple-choice"
                            ) {
                                throw new Error(
                                    "Diagnostika 1–17 importida kutilmagan savol turi aniqlandi.",
                                );
                            }

                            const importedQuestion =
                                createAdminDiagnosticQuestionImport(
                                    parsedQuestion,
                                );

                            if (
                                importedQuestion.type !==
                                "multiple-choice"
                            ) {
                                throw new Error(
                                    "Diagnostika 1–17 savolini multiple-choice draftga aylantirib bo‘lmadi.",
                                );
                            }

                            const previous =
                                existingBySourceOrder.get(
                                    parsedQuestion.sourceOrder,
                                );

                            return {
                                ...importedQuestion,
                                id:
                                    previous?.id ??
                                    importedQuestion.id,
                                image:
                                    previous?.image ??
                                    importedQuestion.image,
                                explanation:
                                    previous?.explanation ??
                                    importedQuestion.explanation,
                            } satisfies
                                AdminDraftMultipleChoiceQuestion;
                        },
                    );

                const nextQuestions = [
                    ...currentDraft.questions.filter(
                        (question) =>
                            !(
                                question.type ===
                                    "multiple-choice" &&
                                (
                                    (
                                        question.sourceOrder !==
                                            null &&
                                        question.sourceOrder >=
                                            1 &&
                                        question.sourceOrder <=
                                            17
                                    ) ||
                                    (
                                        question.sourceOrder ===
                                            null &&
                                        question.order >=
                                            1 &&
                                        question.order <=
                                            17 &&
                                        (
                                            question.section ===
                                                "grammar" ||
                                            question.section ===
                                                "literature"
                                        )
                                    )
                                )
                            ),
                    ),
                    ...importedQuestions,
                ].sort(
                    (
                        left,
                        right,
                    ) =>
                        left.order -
                        right.order,
                );

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    questions:
                        nextQuestions,
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                "1–17-savollar DOCX faylidan yangilandi. 4, 8 va 12-savol rasmlarini savol kartalarida alohida yuklang.",
        });
    }


    function importDiagnosticEssaySection(
        parsedDiagnostic:
            AdminDiagnosticDocxParseResult,
    ) {
        if (!isDiagnostic) {
            return;
        }

        const parsedEssays =
            parsedDiagnostic.questions.filter(
                (question) =>
                    question.type ===
                        "essay" &&
                    question.sourceOrder ===
                        45 &&
                    question.confidence !==
                        "invalid",
            );

        const parsedEssay =
            parsedEssays[0];

        if (
            parsedEssays.length !==
                1 ||
            !parsedEssay
        ) {
            setToast({
                type:
                    "error",
                message:
                    "45-savol DOCX faylida aynan bitta yaroqli esse topshirig‘i bo‘lishi kerak.",
            });
            return;
        }

        const importedEssay =
            createAdminDiagnosticQuestionImport(
                parsedEssay,
            );

        if (
            importedEssay.type !==
            "essay"
        ) {
            setToast({
                type:
                    "error",
                message:
                    "45-savolni esse draftiga aylantirib bo‘lmadi.",
            });
            return;
        }

        setDraft(
            (currentDraft) => {
                const existingEssay =
                    currentDraft.questions.find(
                        (question) =>
                            question.type ===
                                "essay" &&
                            (
                                question.sourceOrder ===
                                    45 ||
                                (
                                    question.sourceOrder ===
                                        null &&
                                    question.order ===
                                        45
                                )
                            ),
                    );

                const previousEssay =
                    existingEssay?.type ===
                    "essay"
                        ? existingEssay
                        : null;

                const nextEssay:
                    AdminDraftEssayQuestion = {
                    ...importedEssay,
                    id:
                        previousEssay?.id ??
                        importedEssay.id,
                    image:
                        previousEssay?.image ??
                        importedEssay.image,
                    explanation:
                        previousEssay?.explanation ??
                        importedEssay.explanation,
                };

                const nextQuestions = [
                    ...currentDraft.questions.filter(
                        (question) =>
                            !(
                                question.type ===
                                    "essay" &&
                                (
                                    question.sourceOrder ===
                                        45 ||
                                    (
                                        question.sourceOrder ===
                                            null &&
                                        question.order ===
                                            45
                                    )
                                )
                            ),
                    ),
                    nextEssay,
                ].sort(
                    (
                        left,
                        right,
                    ) =>
                        left.order -
                        right.order,
                );

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    questions:
                        nextQuestions,
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                "45-savol esse DOCX faylidan yangilandi.",
        });
    }


    function importDiagnosticPassageSection(
        parsedPassage:
            AdminPassageDocxParseResult,
        expectedSection:
            "scientific-text" |
            "literary-text",
    ) {
        if (!isDiagnostic) {
            return;
        }

        if (
            parsedPassage.metadata.topic !==
            expectedSection
        ) {
            setToast({
                type:
                    "error",
                message:
                    expectedSection ===
                    "scientific-text"
                        ? "Ilmiy matn bo‘limiga faqat ilmiy matn DOCX faylini yuklang."
                        : "Badiiy matn bo‘limiga faqat badiiy matn DOCX faylini yuklang.",
            });
            return;
        }

        if (
            parsedPassage.questions.length !==
            5
        ) {
            setToast({
                type:
                    "error",
                message:
                    `Bu bo‘lim uchun aynan 5 ta savol kutilgan. Parser ${parsedPassage.questions.length} ta savol topdi.`,
            });
            return;
        }

        const sourceStart =
            expectedSection ===
            "scientific-text"
                ? 18
                : 23;

        const maximumScore =
            expectedSection ===
            "scientific-text"
                ? 1.7
                : 1.1;

        setDraft(
            (currentDraft) => {
                const existingGroup =
                    currentDraft.questions.find(
                        (question) =>
                            question.type ===
                                "passage-group" &&
                            (
                                question.section ===
                                    expectedSection ||
                                question.sourceOrder ===
                                    sourceStart ||
                                question.questions.some(
                                    (nestedQuestion) =>
                                        nestedQuestion.sourceOrder !==
                                            null &&
                                        nestedQuestion.sourceOrder >=
                                            sourceStart &&
                                        nestedQuestion.sourceOrder <=
                                            sourceStart + 4,
                                )
                            ),
                    );

                const existingPassageGroup =
                    existingGroup?.type ===
                    "passage-group"
                        ? existingGroup
                        : null;

                const nestedQuestions =
                    parsedPassage.questions.map(
                        (
                            parsedQuestion,
                            index,
                        ) => {
                            const previous =
                                existingPassageGroup
                                    ?.questions[
                                        index
                                    ];

                            const emptyQuestion =
                                createEmptyMultipleChoiceQuestion({
                                    order:
                                        index +
                                        1,
                                    section:
                                        expectedSection,
                                });

                            return {
                                ...emptyQuestion,
                                id:
                                    previous?.id ??
                                    emptyQuestion.id,
                                order:
                                    index + 1,
                                sourceOrder:
                                    sourceStart +
                                    index,
                                question:
                                    parsedQuestion.question,
                                instruction:
                                    parsedPassage.metadata
                                        .instruction,
                                context:
                                    previous?.context ??
                                    null,
                                maximumScore,
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
                                image:
                                    previous?.image ??
                                    null,
                                explanation:
                                    previous?.explanation ??
                                    {
                                        text:
                                            "DOCX diagnostika bo‘lim importi orqali qo‘shildi. Javob izohini tekshiring.",
                                        audio:
                                            null,
                                    },
                            } satisfies
                                AdminDraftMultipleChoiceQuestion;
                        },
                    );

                const passageBlocks =
                    parsedPassage.passage.map(
                        (
                            block,
                            index,
                        ) => ({
                            id:
                                existingPassageGroup
                                    ?.passage[
                                        index
                                    ]?.id ??
                                createClientId(
                                    "diagnostic-passage-block",
                                ),
                            order:
                                index + 1,
                            type:
                                block.type,
                            marker:
                                block.marker,
                            speaker:
                                block.speaker,
                            text:
                                block.text,
                        }),
                    );

                const context =
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
                    null;

                const nextGroup:
                    AdminDraftPassageGroupQuestion = {
                    type:
                        "passage-group",
                    id:
                        existingPassageGroup
                            ?.id ??
                        createClientId(
                            `diagnostic-passage-group-${sourceStart}`,
                        ),
                    order:
                        existingPassageGroup
                            ?.order ??
                        sourceStart,
                    sourceOrder:
                        sourceStart,
                    section:
                        expectedSection,
                    instruction:
                        parsedPassage.metadata
                            .instruction,
                    context,
                    image:
                        existingPassageGroup
                            ?.image ??
                        null,
                    explanation:
                        existingPassageGroup
                            ?.explanation ??
                        {
                            text:
                                "",
                            audio:
                                null,
                        },
                    title:
                        expectedSection ===
                            "literary-text"
                            ? parsedPassage.metadata
                                .subtitle ??
                              parsedPassage.metadata
                                .title
                            : parsedPassage.metadata
                                .title,
                    passage:
                        passageBlocks,
                    questions:
                        nestedQuestions,
                };

                const nextQuestions =
                    existingPassageGroup
                        ? currentDraft.questions.map(
                            (question) =>
                                question.id ===
                                existingPassageGroup.id
                                    ? nextGroup
                                    : question,
                        )
                        : [
                            ...currentDraft.questions,
                            nextGroup,
                        ].sort(
                            (
                                left,
                                right,
                            ) =>
                                left.order -
                                right.order,
                        );

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    questions:
                        nextQuestions,
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                expectedSection ===
                "scientific-text"
                    ? "18–22-savollar Ilmiy matn DOCX faylidan yangilandi."
                    : "23–27-savollar Badiiy matn DOCX faylidan yangilandi.",
        });
    }


    function importDiagnosticGhazalSection(
        parsedGhazal:
            AdminGhazalDocxParseResult,
    ) {
        if (!isDiagnostic) {
            return;
        }

        if (
            parsedGhazal.questions.length !==
            5
        ) {
            setToast({
                type:
                    "error",
                message:
                    `G‘azal bo‘limi uchun aynan 5 ta savol kutilgan. Parser ${parsedGhazal.questions.length} ta savol topdi.`,
            });
            return;
        }

        const sourceStart =
            28;

        setDraft(
            (currentDraft) => {
                const existingGroup =
                    currentDraft.questions.find(
                        (question) =>
                            question.type ===
                                "passage-group" &&
                            (
                                question.section ===
                                    "ghazal" ||
                                question.sourceOrder ===
                                    sourceStart ||
                                question.questions.some(
                                    (nestedQuestion) =>
                                        nestedQuestion.sourceOrder !==
                                            null &&
                                        nestedQuestion.sourceOrder >=
                                            28 &&
                                        nestedQuestion.sourceOrder <=
                                            32,
                                )
                            ),
                    );

                const existingPassageGroup =
                    existingGroup?.type ===
                    "passage-group"
                        ? existingGroup
                        : null;

                const nestedQuestions =
                    parsedGhazal.questions.map(
                        (
                            parsedQuestion,
                            index,
                        ) => {
                            const previous =
                                existingPassageGroup
                                    ?.questions[
                                        index
                                    ];

                            const emptyQuestion =
                                createEmptyMultipleChoiceQuestion({
                                    order:
                                        index +
                                        1,
                                    section:
                                        "ghazal",
                                });

                            return {
                                ...emptyQuestion,
                                id:
                                    previous?.id ??
                                    emptyQuestion.id,
                                order:
                                    index + 1,
                                sourceOrder:
                                    sourceStart +
                                    index,
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
                                image:
                                    previous?.image ??
                                    null,
                                explanation:
                                    previous?.explanation ??
                                    {
                                        text:
                                            "DOCX diagnostika G‘azal importi orqali qo‘shildi. Javob izohini tekshiring.",
                                        audio:
                                            null,
                                    },
                            } satisfies
                                AdminDraftMultipleChoiceQuestion;
                        },
                    );

                const rawPassageBlocks:
                    Omit<
                        AdminDraftPassageBlock,
                        "id" |
                        "order"
                    >[] = [
                    ...(parsedGhazal.metadata.author
                        ? [
                            {
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
                        (couplet) => ({
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
                                (item) => ({
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

                const passage =
                    rawPassageBlocks.map(
                        (
                            block,
                            index,
                        ) => ({
                            ...block,
                            id:
                                existingPassageGroup
                                    ?.passage[
                                        index
                                    ]?.id ??
                                createClientId(
                                    "diagnostic-ghazal-block",
                                ),
                            order:
                                index + 1,
                        }),
                    );

                const nextGroup:
                    AdminDraftPassageGroupQuestion = {
                    type:
                        "passage-group",
                    id:
                        existingPassageGroup
                            ?.id ??
                        createClientId(
                            "diagnostic-passage-group-28",
                        ),
                    order:
                        existingPassageGroup
                            ?.order ??
                        28,
                    sourceOrder:
                        28,
                    section:
                        "ghazal",
                    instruction:
                        parsedGhazal.metadata
                            .instruction,
                    context:
                        [
                            parsedGhazal.metadata
                                .author,
                            parsedGhazal.metadata
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
                        existingPassageGroup
                            ?.image ??
                        null,
                    explanation:
                        existingPassageGroup
                            ?.explanation ??
                        {
                            text:
                                "",
                            audio:
                                null,
                        },
                    title:
                        parsedGhazal.metadata
                            .title,
                    passage,
                    questions:
                        nestedQuestions,
                };

                const nextQuestions =
                    existingPassageGroup
                        ? currentDraft.questions.map(
                            (question) =>
                                question.id ===
                                existingPassageGroup.id
                                    ? nextGroup
                                    : question,
                        )
                        : [
                            ...currentDraft.questions,
                            nextGroup,
                        ].sort(
                            (
                                left,
                                right,
                            ) =>
                                left.order -
                                right.order,
                        );

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    questions:
                        nextQuestions,
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                "28–32-savollar G‘azal DOCX faylidan yangilandi.",
        });
    }


    function diagnosticStructuredSourceOrders(
        question:
            AdminDraftQuestion,
    ): readonly number[] {
        if (
            question.type ===
            "matching"
        ) {
            return question.items.flatMap(
                (item) =>
                    item.sourceOrder ===
                        null ||
                    item.sourceOrder ===
                        undefined
                        ? []
                        : [
                            item.sourceOrder,
                        ],
            );
        }

        return question.sourceOrder ===
            null
            ? []
            : [
                question.sourceOrder,
            ];
    }


    function importDiagnosticStructuredSection(
        parsedMixed:
            AdminMixedDocxParseResult,
    ) {
        if (!isDiagnostic) {
            return;
        }

        const validQuestions =
            parsedMixed.questions.filter(
                (question) =>
                    question.confidence !==
                    "invalid",
            );

        const unsupportedType =
            validQuestions.find(
                (question) =>
                    question.type ===
                    "multiple-choice",
            );

        if (unsupportedType) {
            setToast({
                type:
                    "error",
                message:
                    "33–44 DOCX faylida multiple-choice savol bo‘lmasligi kerak. Matching, short-answer va multipart strukturalarini ishlating.",
            });
            return;
        }

        const parsedSourceOrders =
            validQuestions.flatMap(
                (question) => {
                    if (
                        question.type ===
                        "matching"
                    ) {
                        return question.items.map(
                            (item) =>
                                item.sourceOrder,
                        );
                    }

                    return [
                        question.sourceOrder,
                    ];
                },
            );

        const expectedSourceOrders =
            Array.from(
                {
                    length:
                        12,
                },
                (
                    _value,
                    index,
                ) =>
                    33 + index,
            );

        const parsedSourceOrderSet =
            new Set(
                parsedSourceOrders,
            );

        const missingSourceOrders =
            expectedSourceOrders.filter(
                (sourceOrder) =>
                    !parsedSourceOrderSet.has(
                        sourceOrder,
                    ),
            );

        const outsideSourceOrders =
            parsedSourceOrders.filter(
                (sourceOrder) =>
                    sourceOrder < 33 ||
                    sourceOrder > 44,
            );

        if (
            missingSourceOrders.length >
                0 ||
            outsideSourceOrders.length >
                0 ||
            parsedSourceOrderSet.size !==
                parsedSourceOrders.length
        ) {
            setToast({
                type:
                    "error",
                message:
                    missingSourceOrders.length >
                    0
                        ? `33–44 DOCX to‘liq emas. Yetishmaydi: ${missingSourceOrders.join(
                            ", ",
                        )}.`
                        : outsideSourceOrders.length >
                          0
                            ? `33–44 DOCX ichida noto‘g‘ri savol raqamlari bor: ${outsideSourceOrders.join(
                                ", ",
                            )}.`
                            : "33–44 DOCX ichida savol raqamlari takrorlangan.",
            });
            return;
        }

        setDraft(
            (currentDraft) => {
                const existingStructured =
                    currentDraft.questions.filter(
                        (question) =>
                            diagnosticStructuredSourceOrders(
                                question,
                            ).some(
                                (sourceOrder) =>
                                    sourceOrder >=
                                        33 &&
                                    sourceOrder <=
                                        44,
                            ) ||
                            (
                                question.type ===
                                    "matching" &&
                                question.section ===
                                    "syntax"
                            ),
                    );

                const existingBySourceOrder =
                    new Map<
                        number,
                        AdminDraftQuestion
                    >();

                existingStructured.forEach(
                    (question) => {
                        diagnosticStructuredSourceOrders(
                            question,
                        ).forEach(
                            (sourceOrder) => {
                                existingBySourceOrder.set(
                                    sourceOrder,
                                    question,
                                );
                            },
                        );
                    },
                );

                const importedQuestions:
                    AdminDraftQuestion[] =
                    validQuestions.map(
                        (parsedQuestion) => {
                            if (
                                parsedQuestion.type ===
                                "matching"
                            ) {
                                const existing =
                                    existingBySourceOrder.get(
                                        33,
                                    );
                                const existingMatching =
                                    existing?.type ===
                                    "matching"
                                        ? existing
                                        : null;

                                const emptyQuestion =
                                    createEmptyMatchingQuestion({
                                        order:
                                            existingMatching
                                                ?.order ??
                                            33,
                                        section:
                                            "syntax",
                                    });

                                return {
                                    ...emptyQuestion,
                                    id:
                                        existingMatching
                                            ?.id ??
                                        emptyQuestion.id,
                                    order:
                                        existingMatching
                                            ?.order ??
                                        33,
                                    sourceOrder:
                                        33,
                                    question:
                                        parsedQuestion.question,
                                    instruction:
                                        parsedQuestion.instruction,
                                    context:
                                        parsedQuestion.context,
                                    maximumScore:
                                        parsedQuestion.maximumScore,
                                    image:
                                        existingMatching
                                            ?.image ??
                                        null,
                                    title:
                                        parsedQuestion.title,
                                    choices:
                                        parsedQuestion.choices,
                                    items:
                                        parsedQuestion.items.map(
                                            (
                                                item,
                                                index,
                                            ) => {
                                                const previousItem =
                                                    existingMatching
                                                        ?.items.find(
                                                            (candidate) =>
                                                                candidate.sourceOrder ===
                                                                item.sourceOrder,
                                                        ) ??
                                                    existingMatching
                                                        ?.items[
                                                            index
                                                        ];

                                                return {
                                                    id:
                                                        previousItem
                                                            ?.id ??
                                                        createClientId(
                                                            "matching-item",
                                                        ),
                                                    order:
                                                        item.order,
                                                    sourceOrder:
                                                        item.sourceOrder,
                                                    prompt:
                                                        item.prompt,
                                                    correctChoiceId:
                                                        item.correctChoiceId,
                                                    maximumScore:
                                                        item.maximumScore,
                                                    explanation:
                                                        previousItem
                                                            ?.explanation ??
                                                        {
                                                            text:
                                                                "DOCX diagnostika 33–35 importi orqali qo‘shildi. Ushbu matching bandi uchun audio izohni tekshiring.",
                                                            audio:
                                                                null,
                                                        },
                                                };
                                            },
                                        ),
                                    explanation:
                                        existingMatching
                                            ?.explanation ??
                                        {
                                            text:
                                                "DOCX diagnostika 33–35 matching importi orqali qo‘shildi. Mosliklarni tekshiring.",
                                            audio:
                                                null,
                                        },
                                } satisfies
                                    AdminDraftMatchingQuestion;
                            }

                            if (
                                parsedQuestion.type ===
                                "short-answer"
                            ) {
                                const existing =
                                    existingBySourceOrder.get(
                                        parsedQuestion.sourceOrder,
                                    );
                                const existingShortAnswer =
                                    existing?.type ===
                                    "short-answer"
                                        ? existing
                                        : null;

                                const emptyQuestion =
                                    createEmptyShortAnswerQuestion({
                                        order:
                                            existingShortAnswer
                                                ?.order ??
                                            parsedQuestion.sourceOrder,
                                        section:
                                            "written",
                                    });

                                return {
                                    ...emptyQuestion,
                                    id:
                                        existingShortAnswer
                                            ?.id ??
                                        emptyQuestion.id,
                                    order:
                                        existingShortAnswer
                                            ?.order ??
                                        parsedQuestion.sourceOrder,
                                    sourceOrder:
                                        parsedQuestion.sourceOrder,
                                    question:
                                        parsedQuestion.question,
                                    context:
                                        parsedQuestion.context,
                                    maximumScore:
                                        parsedQuestion.maximumScore,
                                    acceptedAnswers:
                                        parsedQuestion.acceptedAnswers,
                                    requiredKeywords:
                                        parsedQuestion.requiredKeywords,
                                    comparison:
                                        parsedQuestion.comparison,
                                    examples:
                                        parsedQuestion.examples,
                                    image:
                                        existingShortAnswer
                                            ?.image ??
                                        null,
                                    explanation:
                                        existingShortAnswer
                                            ?.explanation ??
                                        {
                                            text:
                                                "DOCX diagnostika yozma importi orqali qo‘shildi. Qabul qilinadigan javoblarni tekshiring.",
                                            audio:
                                                null,
                                        },
                                } satisfies
                                    AdminDraftShortAnswerQuestion;
                            }

                            if (
                                parsedQuestion.type !==
                                "multipart"
                            ) {
                                throw new Error(
                                    "Diagnostika 33–44 importida kutilmagan savol turi aniqlandi.",
                                );
                            }

                            const existing =
                                existingBySourceOrder.get(
                                    parsedQuestion.sourceOrder,
                                );
                            const existingMultipart =
                                existing?.type ===
                                "multipart"
                                    ? existing
                                    : null;

                            const emptyQuestion =
                                createEmptyMultipartQuestion({
                                    order:
                                        existingMultipart
                                            ?.order ??
                                        parsedQuestion.sourceOrder,
                                    section:
                                        "written",
                                });

                            return {
                                ...emptyQuestion,
                                id:
                                    existingMultipart
                                        ?.id ??
                                    emptyQuestion.id,
                                order:
                                    existingMultipart
                                        ?.order ??
                                    parsedQuestion.sourceOrder,
                                sourceOrder:
                                    parsedQuestion.sourceOrder,
                                question:
                                    parsedQuestion.question,
                                context:
                                    parsedQuestion.context,
                                maximumScore:
                                    parsedQuestion.maximumScore,
                                parts:
                                    parsedQuestion.parts.map(
                                        (
                                            part,
                                            partIndex,
                                        ) => ({
                                            id:
                                                existingMultipart
                                                    ?.parts.find(
                                                        (candidate) =>
                                                            candidate.label ===
                                                            part.label,
                                                    )?.id ??
                                                existingMultipart
                                                    ?.parts[
                                                        partIndex
                                                    ]?.id ??
                                                createClientId(
                                                    "multipart-part",
                                                ),
                                            order:
                                                partIndex +
                                                1,
                                            label:
                                                part.label,
                                            prompt:
                                                part.question,
                                            acceptedAnswers:
                                                part.acceptedAnswers,
                                            requiredKeywords:
                                                part.requiredKeywords,
                                            comparison:
                                                part.comparison,
                                            maximumScore:
                                                part.maximumScore,
                                            explanation:
                                                existingMultipart
                                                    ?.parts.find(
                                                        (candidate) =>
                                                            candidate.label ===
                                                            part.label,
                                                    )?.explanation ??
                                                existingMultipart
                                                    ?.parts[
                                                        partIndex
                                                    ]?.explanation ??
                                                {
                                                    text:
                                                        "DOCX diagnostika multipart importi orqali qo‘shildi. Ushbu qism uchun audio izohni tekshiring.",
                                                    audio:
                                                        null,
                                                },
                                        }),
                                    ),
                                image:
                                    existingMultipart
                                        ?.image ??
                                    null,
                                explanation:
                                    existingMultipart
                                        ?.explanation ??
                                    {
                                        text:
                                            "DOCX diagnostika multipart importi orqali qo‘shildi. Har bir qismni tekshiring.",
                                        audio:
                                            null,
                                    },
                            } satisfies
                                AdminDraftMultipartQuestion;
                        },
                    );

                const existingIds =
                    new Set(
                        existingStructured.map(
                            (question) =>
                                question.id,
                        ),
                    );

                const nextQuestions = [
                    ...currentDraft.questions.filter(
                        (question) =>
                            !existingIds.has(
                                question.id,
                            ),
                    ),
                    ...importedQuestions,
                ].sort(
                    (
                        left,
                        right,
                    ) =>
                        left.order -
                        right.order,
                );

                return {
                    ...currentDraft,
                    source:
                        "docx-import",
                    questions:
                        nextQuestions,
                };
            },
        );

        setToast({
            type:
                "success",
            message:
                "33–44-savollar DOCX faylidan yangilandi. Matching 33–35 bitta blok bo‘lib qoldi.",
        });
    }


    function importParsedDiagnostic(
        parsedDiagnostic:
            AdminDiagnosticDocxParseResult,
    ) {
        const imported =
            createAdminDiagnosticDraftImport(
                parsedDiagnostic,
            );

        if (
            imported.questions.length ===
            0
        ) {
            setToast({
                type:
                    "error",
                message:
                    "Import uchun yaroqli diagnostika savoli topilmadi.",
            });
            return;
        }

        draft.questions.forEach(
            (question) => {
                queueQuestionAudioStorageRemovals(
                    question,
                );

                if (
                    question.image?.storagePath
                ) {
                    queueImageStorageRemoval(
                        question.id,
                        question.image.storagePath,
                    );
                }

                if (
                    question.type ===
                    "multiple-choice"
                ) {
                    queueOptionImageStorageRemovals(
                        question,
                    );
                }

                if (
                    question.type ===
                    "passage-group"
                ) {
                    question.questions.forEach(
                        (nestedQuestion) => {
                            if (
                                nestedQuestion.image
                                    ?.storagePath
                            ) {
                                queueImageStorageRemoval(
                                    nestedQuestion.id,
                                    nestedQuestion.image.storagePath,
                                );
                            }
                        },
                    );
                }
            },
        );

        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                source:
                    "docx-import",
                metadata: {
                    ...currentDraft.metadata,
                    ...imported.metadata,
                },
                questions:
                    imported.questions,
            }),
        );

        setToast({
            type:
                "success",
            message:
                `${parsedDiagnostic.taskCount} ta diagnostika topshirig‘i import qilindi. Oldingi savollar aralashmasligi uchun almashtirildi.`,
        });

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-diagnostic-summary",
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
        const passageGroup =
            passageGroups.find(
                (question) =>
                    question.id ===
                    passageGroupId,
            );

        if (passageGroup) {
            queueQuestionAudioStorageRemovals(
                passageGroup,
            );
        }

        if (passageGroup?.image?.storagePath) {
            queueImageStorageRemoval(
                passageGroup.id,
                passageGroup.image.storagePath,
            );
        }

        passageGroup?.questions.forEach(
            (question) => {
                if (question.image?.storagePath) {
                    queueImageStorageRemoval(
                        question.id,
                        question.image.storagePath,
                    );
                }
            },
        );

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
        update:
            Partial<AdminDraftOption>,
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
                                                ...update,
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
        const question =
            questions.find(
                (candidate) =>
                    candidate.id ===
                    questionId,
            );

        if (question) {
            queueQuestionAudioStorageRemovals(
                question,
            );
        }

        if (question?.image?.storagePath) {
            queueImageStorageRemoval(
                question.id,
                question.image.storagePath,
            );
        }

        if (question) {
            queueOptionImageStorageRemovals(
                question,
            );
        }

        replaceQuestions(
            questions.filter(
                (candidate) =>
                    candidate.id !==
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


    const isSyntaxRoute =
        draft.metadata.group === "grammar" &&
        draft.metadata.category === "Sintaksis" &&
        draft.metadata.topicSlug === "sintaksis";

    const isSyntaxMatchingPractice =
        isSyntaxRoute &&
        draft.metadata.format ===
            "mixed";

    const isDiagnostic =
        draft.metadata.format ===
        "diagnostic";

    const isPassageFiveNationalTest =
        draft.metadata.group ===
            "national-certificate" &&
        draft.metadata.format ===
            "passage-five" &&
        (
            draft.metadata.topicSlug ===
                "gazal" ||
            draft.metadata.topicSlug ===
                "ilmiy-matn" ||
            draft.metadata.topicSlug ===
                "badiiy-matn"
        );

    const docxParserTarget =
        isSyntaxRoute
            ? "auto"
            : draft.metadata.group ===
                  "national-certificate"
              ? draft.metadata.topicSlug ===
                "ilmiy-matn"
                ? "scientific-text"
                : draft.metadata.topicSlug ===
                    "badiiy-matn"
                  ? "literary-text"
                  : draft.metadata.topicSlug ===
                      "gazal"
                    ? "ghazal"
                    : draft.metadata.topicSlug ===
                        "badiiy-asarlar"
                      ? draft.metadata.format ===
                            "standard"
                          ? "standard"
                          : "literary-works"
                      : draft.metadata.topicSlug ===
                          "aralash"
                        ? "mixed"
                        : draft.metadata.topicSlug ===
                            "diagnostika"
                          ? "diagnostic"
                          : "auto"
            : draft.metadata.format ===
                  "standard" ||
              draft.metadata.format ===
                  "morphology-standard"
              ? "standard"
              : "auto";

    const displayedQuestionCount =
        isDiagnostic
            ? calculateAdminDraftTaskCount(
                draft,
            )
            : isSyntaxMatchingPractice
              ? structuredQuestions.length
              : questions.length +
                passageGroups.reduce(
                    (
                        total,
                        group,
                    ) =>
                        total +
                        group.questions.length,
                    0,
                );

    const displayedMaximumScore =
        isDiagnostic
            ? draft.metadata.diagnostic
                ?.finalMaximumScore ??
                maximumScore
            : isSyntaxMatchingPractice
              ? calculateAdminDraftMaximumScore(
                    draft,
                )
              : maximumScore;

    const diagnosticRawMaximumScore =
        isDiagnostic
            ? calculateAdminDraftMaximumScore(
                draft,
            )
            : maximumScore;

    const draftForSave:
        AdminTestDraft =
        isDiagnostic
            ? {
                ...draft,
                metadata: {
                    ...draft.metadata,
                    diagnostic: {
                        taskCount:
                            displayedQuestionCount,
                        finalMaximumScore:
                            75,
                        rawMaximumScore:
                            diagnosticRawMaximumScore,
                    },
                },
            }
            : draft;

    const persistedDraftForComparison:
        AdminTestDraft =
        isDiagnostic
            ? {
                ...lastPersistedDraftRef.current,
                metadata: {
                    ...lastPersistedDraftRef.current.metadata,
                    diagnostic: {
                        taskCount:
                            calculateAdminDraftTaskCount(
                                lastPersistedDraftRef.current,
                            ),
                        finalMaximumScore:
                            75,
                        rawMaximumScore:
                            calculateAdminDraftMaximumScore(
                                lastPersistedDraftRef.current,
                            ),
                    },
                },
            }
            : lastPersistedDraftRef.current;

    const hasUnsavedChanges =
        JSON.stringify(
            draftForSave,
        ) !==
        JSON.stringify(
            persistedDraftForComparison,
        );

    const isLocked =
        draft.status ===
            "published" ||
        draft.status ===
            "archived";

    const supportsImageOptionZipImport =
        draft.metadata.format ===
            "standard" ||
        draft.metadata.format ===
            "morphology-standard";

    function handleZipBulkImport(
        savedDraft:
            AdminTestDraft,
        message: string,
    ) {
        setDraft(
            savedDraft,
        );
        lastPersistedDraftRef.current =
            savedDraft;
        pendingImageRemovalsRef.current =
            [];
        submittedImageRemovalsRef.current =
            [];
        pendingAudioRemovalsRef.current =
            [];
        submittedAudioRemovalsRef.current =
            [];
        setToast({
            type: "success",
            message,
        });

        window.setTimeout(
            () => {
                document
                    .getElementById(
                        "admin-draft-question-list",
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            },
            80,
        );
    }

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
                        {isDiagnostic
                            ? "DIAGNOSTIKA MUHARRIRI"
                            : isSyntaxMatchingPractice
                              ? "33–34–35 MATCHING MUHARRIRI"
                              : "MULTIPLE-CHOICE MUHARRIRI"}
                    </span>

                    <h1>
                        {draft.metadata.title}
                    </h1>

                    <p>
                        {isDiagnostic
                            ? "45 ta topshiriq, uchta matn bloki, yozma savollar va esseni tekshiring."
                            : isSyntaxMatchingPractice
                              ? "20 ta blokning har birida 33, 34, 35 bandlarini A–F sintaktik izohlar bilan moslashtiring."
                              : "Savollarni tahrirlang, tartiblang va Supabase bazasiga saqlang."}
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
                            {displayedQuestionCount}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Maksimal ball
                        </span>
                        <strong>
                            {displayedMaximumScore}
                        </strong>
                    </div>
                </div>
            </header>

            <section
                className={styles.accessSettings}
                aria-label="Test kirish va Tanga narxi"
            >
                <div className={styles.accessSettingsHeading}>
                    <div>
                        <span>KIRISH VA NARX</span>
                        <h2>Pullik test sozlamalari</h2>
                        <p>
                            Bepul test 0 Tanga bo‘ladi. Pullik test uchun studentdan yechiladigan Tanga miqdorini belgilang.
                        </p>
                    </div>

                    <strong
                        className={
                            draft.metadata.access === "premium"
                                ? styles.paidAccessBadge
                                : styles.freeAccessBadge
                        }
                    >
                        {draft.metadata.access === "premium"
                            ? `${draft.metadata.tangaPrice} Tanga`
                            : "Bepul"}
                    </strong>
                </div>

                <div className={styles.accessSettingsGrid}>
                    <label>
                        <span>Kirish turi</span>
                        <select
                            value={draft.metadata.access}
                            disabled={isLocked}
                            onChange={(event) => {
                                const nextAccess =
                                    event.target.value === "premium"
                                        ? "premium"
                                        : "free";

                                setDraft((currentDraft) => ({
                                    ...currentDraft,
                                    metadata: {
                                        ...currentDraft.metadata,
                                        access: nextAccess,
                                        tangaPrice:
                                            nextAccess === "premium"
                                                ? Math.max(
                                                    1,
                                                    currentDraft.metadata.tangaPrice ||
                                                        (currentDraft.metadata.format === "diagnostic"
                                                            ? 2
                                                            : 1),
                                                )
                                                : 0,
                                    },
                                }));
                            }}
                        >
                            <option value="free">Bepul</option>
                            <option value="premium">Pullik</option>
                        </select>
                    </label>

                    <label>
                        <span>Tanga narxi</span>
                        <input
                            type="number"
                            min={1}
                            max={1000}
                            step={1}
                            disabled={
                                isLocked ||
                                draft.metadata.access !== "premium"
                            }
                            value={
                                draft.metadata.access === "premium"
                                    ? draft.metadata.tangaPrice
                                    : 0
                            }
                            onChange={(event) => {
                                const nextPrice =
                                    Number(event.target.value);

                                if (
                                    !Number.isInteger(nextPrice) ||
                                    nextPrice < 1 ||
                                    nextPrice > 1000
                                ) {
                                    return;
                                }

                                setDraft((currentDraft) => ({
                                    ...currentDraft,
                                    metadata: {
                                        ...currentDraft.metadata,
                                        tangaPrice: nextPrice,
                                    },
                                }));
                            }}
                        />
                    </label>
                </div>

                {isLocked && (
                    <small>
                        Published yoki arxivlangan testning narxini o‘zgartirish uchun avval uni tahrirlanadigan holatga qaytarish kerak.
                    </small>
                )}
            </section>

            {isSyntaxMatchingPractice &&
                draft.questions.length === 0 && (
                <section
                    className={styles.diagnosticSummary}
                    aria-label="33–34–35 matching shabloni"
                >
                    <div>
                        <span>
                            33–34–35 shabloni
                        </span>
                        <strong>
                            20 blok · 60 band
                        </strong>
                    </div>

                    <p>
                        Bir marta yarating: har blokda A–F tanlovlari va 33/34/35 bandlari tayyor bo‘ladi. Draftni keyin bosqichma-bosqich to‘ldirib saqlash mumkin.
                    </p>

                    <button
                        type="button"
                        disabled={isLocked}
                        onClick={() =>
                            setDraft(
                                (currentDraft) => ({
                                    ...currentDraft,
                                    questions:
                                        createSyntaxMatchingPracticeTemplate(),
                                }),
                            )
                        }
                    >
                        20 ta 33–34–35 blok yaratish
                    </button>
                </section>
            )}

            {isDiagnostic && (
                <section
                    id="admin-diagnostic-summary"
                    className={
                        styles.diagnosticSummary
                    }
                >
                    <div>
                        <span>
                            Diagnostika topshiriqlari
                        </span>
                        <strong>
                            {displayedQuestionCount} / 45
                        </strong>
                    </div>

                    <div>
                        <span>
                            Yakuniy shkala
                        </span>
                        <strong>
                            {displayedMaximumScore} / 100
                        </strong>
                    </div>

                    <div>
                        <span>
                            Savol og‘irliklari yig‘indisi
                        </span>
                        <strong>
                            {diagnosticRawMaximumScore}
                        </strong>
                    </div>

                    <p>
                        Yakuniy 100 ball normalizatsiya qilingan shkala.
                        Savol og‘irliklari yig‘indisi alohida saqlanadi.
                    </p>
                </section>
            )}

            {isDiagnostic && (
                <>
                    <AdminDiagnosticSectionDocxImporter
                        target="multiple-choice"
                        title="1–17 test savollari"
                        rangeLabel="1–17"
                        onImportDiagnostic={
                            importDiagnosticMultipleChoiceSection
                        }
                    />

                    <AdminDiagnosticSectionDocxImporter
                        target="scientific-text"
                        title="Ilmiy matn DOCX import"
                        rangeLabel="18–22"
                        onImportPassage={(parsedPassage) =>
                            importDiagnosticPassageSection(
                                parsedPassage,
                                "scientific-text",
                            )
                        }
                    />

                    <AdminDiagnosticSectionDocxImporter
                        target="literary-text"
                        title="Badiiy matn DOCX import"
                        rangeLabel="23–27"
                        onImportPassage={(parsedPassage) =>
                            importDiagnosticPassageSection(
                                parsedPassage,
                                "literary-text",
                            )
                        }
                    />

                    <AdminDiagnosticSectionDocxImporter
                        target="ghazal"
                        title="G‘azal DOCX import"
                        rangeLabel="28–32"
                        onImportGhazal={
                            importDiagnosticGhazalSection
                        }
                    />

                    <AdminDiagnosticSectionDocxImporter
                        target="structured"
                        title="33–44 yozma va matching savollar"
                        rangeLabel="33–44"
                        onImportMixed={
                            importDiagnosticStructuredSection
                        }
                    />

                    <AdminDiagnosticSectionDocxImporter
                        target="essay"
                        title="45-savol · Esse"
                        rangeLabel="45"
                        onImportDiagnostic={
                            importDiagnosticEssaySection
                        }
                    />
                </>
            )}

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

            {!isDiagnostic &&
                supportsImageOptionZipImport && (
                <AdminTestZipBulkImporter
                    draftId={
                        draft.id
                    }
                    expectedUpdatedAt={
                        lastPersistedDraftRef.current.audit.updatedAt
                    }
                    currentQuestionCount={
                        questions.length
                    }
                    disabled={
                        isLocked ||
                        hasUnsavedChanges
                    }
                    disabledReason={
                        isLocked
                            ? "Nashr qilingan yoki arxivlangan testga bulk import qilib bo‘lmaydi."
                            : hasUnsavedChanges
                              ? "Bulk importdan oldin joriy o‘zgarishlarni Draftni saqlash orqali saqlang."
                              : null
                    }
                    onImported={
                        handleZipBulkImport
                    }
                />
            )}

            {!isDiagnostic &&
                isPassageFiveNationalTest && (
                <AdminDiagnosticSectionDocxImporter
                    target={
                        draft.metadata.topicSlug ===
                            "gazal"
                            ? "ghazal"
                            : draft.metadata.topicSlug ===
                                "ilmiy-matn"
                              ? "scientific-text"
                              : "literary-text"
                    }
                    title={
                        draft.metadata.topicSlug ===
                            "gazal"
                            ? "G‘azal + lug‘at + 5 savol DOCX import"
                            : draft.metadata.topicSlug ===
                                "ilmiy-matn"
                              ? "Ilmiy matn + 5 savol DOCX import"
                              : "Badiiy matn + 5 savol DOCX import"
                    }
                    rangeLabel="Matn + 5 savol"
                    eyebrow="MILLIY SERTIFIKAT DOCX"
                    scopeBadge="1 ta matn va 5 ta savol import qilinadi"
                    importButtonLabel="DOCX ni draftga import qilish"
                    onImportPassage={
                        draft.metadata.topicSlug ===
                            "gazal"
                            ? undefined
                            : importParsedPassage
                    }
                    onImportGhazal={
                        draft.metadata.topicSlug ===
                            "gazal"
                            ? importParsedGhazal
                            : undefined
                    }
                />
            )}

            {!isDiagnostic &&
                !isPassageFiveNationalTest && (
                <AdminDocxImportPreview
                    parserTarget={
                        docxParserTarget
                    }
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
                    onImportMixed={
                        importParsedMixed
                    }
                    onImportDiagnostic={
                        importParsedDiagnostic
                    }
                />
            )}

            {supportsImageZipImport && (
                <AdminImageZipBulkImporter
                    draftId={draft.id}
                    targets={imageZipTargets}
                    disabled={isLocked || hasUnsavedChanges || imageZipTargets.length === 0}
                    disabledReason={
                        isLocked
                            ? "Nashr qilingan yoki arxivlangan testga rasm ZIP yuklab bo‘lmaydi."
                            : hasUnsavedChanges
                              ? "Rasm ZIP’dan oldin savollarni “Draftni saqlash” orqali saqlang."
                              : imageZipTargets.length === 0
                                ? "Avval Aralash test savollarini DOCX orqali import qiling va draftni saqlang."
                                : null
                    }
                    onApply={applyImageZipUpdates}
                    onQueueStorageRemoval={queueImageStorageRemoval}
                />
            )}

            {supportsAudioZipImport && (
                <AdminAudioZipBulkImporter
                    draftId={draft.id}
                    targets={audioZipTargets}
                    disabled={
                        isLocked ||
                        hasUnsavedChanges ||
                        audioZipTargets.length === 0
                    }
                    disabledReason={
                        isLocked
                            ? "Nashr qilingan yoki arxivlangan testga audio ZIP yuklab bo‘lmaydi."
                            : hasUnsavedChanges
                              ? "Audio ZIP’dan oldin savollarni “Draftni saqlash” orqali saqlang."
                              : audioZipTargets.length === 0
                                ? "Avval test savollarini DOCX/import orqali kiriting va draftni saqlang."
                                : null
                    }
                    onApply={applyAudioZipUpdates}
                    onQueueStorageRemoval={
                        queueAudioStorageRemoval
                    }
                />
            )}

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

            {publishState.message && (
                <div
                    className={
                        publishState.status ===
                        "success"
                            ? styles.successBanner
                            : styles.errorBanner
                    }
                    role="status"
                >
                    {publishState.message}
                </div>
            )}

            {isLocked && (
                <div
                    className={
                        styles.publishedNotice
                    }
                    role="status"
                >
                    <strong>
                        {draft.status ===
                        "published"
                            ? "Test nashr qilingan"
                            : "Test arxivlangan"}
                    </strong>
                    <span>
                        Ushbu versiyani oddiy draft saqlash orqali o‘zgartirib bo‘lmaydi.
                    </span>
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

                                <AdminQuestionImageUploader
                                    draftId={draft.id}
                                    questionId={
                                        passageGroup.id
                                    }
                                    image={
                                        passageGroup.image
                                    }
                                    onChange={(image) =>
                                        updatePassageGroup(
                                            passageGroup.id,
                                            {
                                                image,
                                            },
                                        )
                                    }
                                    onQueueStorageRemoval={(storagePath) =>
                                        queueImageStorageRemoval(
                                            passageGroup.id,
                                            storagePath,
                                        )
                                    }
                                />

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
                                                    {isDiagnostic
                                                        ? question.sourceOrder ??
                                                          questionIndex +
                                                              1
                                                        : questionIndex +
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

                                                <AdminQuestionImageUploader
                                                    draftId={
                                                        draft.id
                                                    }
                                                    questionId={
                                                        question.id
                                                    }
                                                    image={
                                                        question.image
                                                    }
                                                    onChange={(image) =>
                                                        updatePassageQuestion(
                                                            passageGroup.id,
                                                            question.id,
                                                            {
                                                                image,
                                                            },
                                                        )
                                                    }
                                                    onQueueStorageRemoval={(storagePath) =>
                                                        queueImageStorageRemoval(
                                                            question.id,
                                                            storagePath,
                                                        )
                                                    }
                                                />

                                                <AdminQuestionAudioUploader
                                                    draftId={draft.id}
                                                    questionId={question.id}
                                                    audio={
                                                        question.explanation.audio
                                                    }
                                                    compact
                                                    onChange={(audio) =>
                                                        updatePassageQuestion(
                                                            passageGroup.id,
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
                                                        queueAudioStorageRemoval(
                                                            question.id,
                                                            storagePath,
                                                        )
                                                    }
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

            <AdminMixedStructuredQuestionEditor
                questions={
                    structuredQuestions
                }
                onChange={
                    replaceStructuredQuestions
                }
                draftId={
                    draft.id
                }
                imageUploadSourceOrders={
                    isDiagnostic
                        ? [36]
                        : []
                }
                allowImageUploadForAll={
                    supportsImageZipImport
                }
                onQuestionImageChange={(
                    questionId,
                    image,
                ) =>
                    updateStructuredQuestionImage(
                        questionId,
                        image,
                    )
                }
                onQueueImageStorageRemoval={(
                    questionId,
                    storagePath,
                ) =>
                    queueImageStorageRemoval(
                        questionId,
                        storagePath,
                    )
                }
                onQueueAudioStorageRemoval={(
                    questionId,
                    storagePath,
                ) =>
                    queueAudioStorageRemoval(
                        questionId,
                        storagePath,
                    )
                }
            />

            {isDiagnostic &&
                essayQuestions.map(
                    (essayQuestion) => (
                        <AdminDiagnosticEssayEditor
                            key={
                                essayQuestion.id
                            }
                            question={
                                essayQuestion
                            }
                            onChange={
                                replaceEssayQuestion
                            }
                        />
                    ),
                )}

            <form
                action={formAction}
                onSubmit={
                    prepareAssetRemovalsForSave
                }
            >
                <input
                    type="hidden"
                    name="draft"
                    value={
                        JSON.stringify(
                            draftForSave,
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

                {!isSyntaxMatchingPractice && (
                    <>
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
                                            {isDiagnostic
                                                ? question.sourceOrder ??
                                                  index +
                                                      1
                                                : index +
                                                  1}
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

                                {(!isDiagnostic ||
                                    (question.sourceOrder !==
                                        null &&
                                        diagnosticManualImageSourceOrders.has(
                                            question.sourceOrder,
                                        ))) && (
                                    <AdminQuestionImageUploader
                                        draftId={draft.id}
                                        questionId={
                                            question.id
                                        }
                                        image={
                                            question.image
                                        }
                                        onChange={(image) =>
                                            updateQuestion(
                                                question.id,
                                                {
                                                    image,
                                                },
                                            )
                                        }
                                        onQueueStorageRemoval={(storagePath) =>
                                            queueImageStorageRemoval(
                                                question.id,
                                                storagePath,
                                            )
                                        }
                                    />
                                )}

                                <div
                                    className={
                                        styles.optionGrid
                                    }
                                >
                                    {question.options.map(
                                        (
                                            option,
                                        ) => {
                                            const optionImageOwnerId =
                                                getAdminOptionImageOwnerId(
                                                    question.id,
                                                    option.id,
                                                );

                                            return (
                                                <div
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
                                                    <label
                                                        className={
                                                            styles.optionMainRow
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
                                                                    {
                                                                        text:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                            placeholder={`${option.id} varianti — matn ixtiyoriy, rasm ham yuklash mumkin`}
                                                        />
                                                    </label>

                                                    <AdminQuestionImageUploader
                                                        draftId={
                                                            draft.id
                                                        }
                                                        questionId={
                                                            optionImageOwnerId
                                                        }
                                                        image={
                                                            option.image ??
                                                            null
                                                        }
                                                        eyebrow={`${option.id} VARIANT RASMI`}
                                                        defaultAlt={`${option.id} javob varianti rasmi`}
                                                        previewAltFallback={`${option.id} javob varianti rasmi`}
                                                        onChange={(image) =>
                                                            updateOption(
                                                                question.id,
                                                                option.id,
                                                                {
                                                                    image,
                                                                },
                                                            )
                                                        }
                                                        onQueueStorageRemoval={(storagePath) =>
                                                            queueImageStorageRemoval(
                                                                optionImageOwnerId,
                                                                storagePath,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            );
                                        },
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

                                <AdminQuestionAudioUploader
                                    draftId={draft.id}
                                    questionId={question.id}
                                    audio={
                                        question.explanation.audio
                                    }
                                    onChange={(audio) =>
                                        updateQuestion(
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
                                        queueAudioStorageRemoval(
                                            question.id,
                                            storagePath,
                                        )
                                    }
                                />
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
                    </>
                )}

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
                        disabled={
                            pending ||
                            publishing ||
                            isLocked
                        }
                        className={
                            styles.saveButton
                        }
                    >
                        {pending
                            ? "Saqlanmoqda..."
                            : isLocked
                                ? "Saqlash yopilgan"
                                : "Draftni saqlash"}
                    </button>
                </div>
            </form>

            <form
                action={
                    publishFormAction
                }
                className={
                    styles.publishPanel
                }
            >
                <input
                    type="hidden"
                    name="draft"
                    value={
                        JSON.stringify(
                            draftForSave,
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

                <div>
                    <strong>
                        Student testini faollashtirish
                    </strong>
                    <span>
                        Avval barcha o‘zgarishlarni draftga saqlang. Nashrdan keyin shu route studentlar uchun database versiyasini ochadi.
                    </span>
                    {hasUnsavedChanges &&
                    !isLocked ? (
                        <small>
                            Nashr qilishdan oldin “Draftni saqlash” tugmasini bosing.
                        </small>
                    ) : null}
                </div>

                <button
                    type="submit"
                    disabled={
                        pending ||
                        publishing ||
                        hasUnsavedChanges ||
                        isLocked
                    }
                    className={
                        styles.publishButton
                    }
                >
                    {publishing
                        ? "Nashr qilinmoqda..."
                        : draft.status ===
                          "published"
                            ? "Nashr qilingan"
                            : draft.status ===
                              "archived"
                                ? "Arxivlangan"
                                : "Testni nashr qilish"}
                </button>
            </form>
        </>
    );
}
