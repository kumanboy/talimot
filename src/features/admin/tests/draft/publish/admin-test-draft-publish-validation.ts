import {
    validateAdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-validation";
import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
const PUBLISH_BLOCKING_WARNING_CODES =
    new Set([
        "TEST_HAS_NO_QUESTIONS",
        "IMAGE_NOT_UPLOADED",
        "AUDIO_NOT_UPLOADED",
    ]);

function approximately(
    first: number,
    second: number,
): boolean {
    return Math.abs(
        first - second,
    ) <= 0.01;
}

export function getAdminTestDraftPublishValidationMessages(
    draft: AdminTestDraft,
): readonly string[] {
    const validation =
        validateAdminTestDraft(
            draft,
        );
    const messages = [
        ...validation.errors.map(
            (item) =>
                item.message,
        ),
        ...validation.warnings
            .filter(
                (item) =>
                    PUBLISH_BLOCKING_WARNING_CODES.has(
                        item.code,
                    ),
            )
            .map(
                (item) =>
                    item.message,
            ),
    ];

    if (
        draft.status ===
        "published"
    ) {
        messages.push(
            "Test allaqachon nashr qilingan.",
        );
    }

    if (
        draft.status ===
        "archived"
    ) {
        messages.push(
            "Arxivlangan testni to‘g‘ridan-to‘g‘ri nashr qilib bo‘lmaydi.",
        );
    }

    if (
        draft.metadata.format ===
            "standard" ||
        draft.metadata.format ===
            "morphology-standard"
    ) {
        if (
            draft.questions.length !==
                20 ||
            draft.questions.some(
                (question) =>
                    question.type !==
                    "multiple-choice",
            )
        ) {
            messages.push(
                "Standart test nashr uchun aynan 20 ta variantli savoldan iborat bo‘lishi kerak.",
            );
        }
    }

    if (
        draft.metadata.format ===
        "standard-five"
    ) {
        if (
            draft.metadata.group !==
                "national-certificate" ||
            draft.metadata.topicSlug !==
                "badiiy-asarlar" ||
            draft.questions.length !==
                5 ||
            draft.questions.some(
                (question) =>
                    question.type !==
                        "multiple-choice" ||
                    !approximately(
                        question.maximumScore,
                        1.7,
                    ),
            )
        ) {
            messages.push(
                "Badiiy asarlar testi 5 ta variantli savoldan iborat va har biri 1.7 ball bo‘lishi kerak.",
            );
        }
    }

    if (
        draft.metadata.format ===
        "passage-five"
    ) {
        const group =
            draft.questions.length ===
                1 &&
            draft.questions[0]?.type ===
                "passage-group"
                ? draft.questions[0]
                : null;

        if (
            !group ||
            group.questions.length !==
                5
        ) {
            messages.push(
                "Matn/G‘azal testi bitta passage-group va 5 ta ichki savoldan iborat bo‘lishi kerak.",
            );
        } else if (
            draft.metadata.topicSlug ===
            "gazal"
        ) {
            if (
                group.section !==
                    "ghazal" ||
                group.questions.some(
                    (question) =>
                        !approximately(
                            question.maximumScore,
                            2.5,
                        ),
                )
            ) {
                messages.push(
                    "G‘azal testining 5 ta savoli 2.5 balldan bo‘lishi kerak.",
                );
            }
        } else if (
            draft.metadata.topicSlug ===
            "ilmiy-matn"
        ) {
            if (
                group.section !==
                    "scientific-text" ||
                group.questions.some(
                    (question) =>
                        !approximately(
                            question.maximumScore,
                            1.7,
                        ),
                )
            ) {
                messages.push(
                    "Ilmiy matnning 5 ta savoli 1.7 balldan bo‘lishi kerak.",
                );
            }
        } else if (
            draft.metadata.topicSlug ===
            "badiiy-matn"
        ) {
            if (
                group.section !==
                    "literary-text" ||
                group.questions.some(
                    (question) =>
                        !approximately(
                            question.maximumScore,
                            1.1,
                        ),
                )
            ) {
                messages.push(
                    "Badiiy matnning 5 ta savoli 1.1 balldan bo‘lishi kerak.",
                );
            }
        } else {
            messages.push(
                "Passage-five uchun topic slug gazal, ilmiy-matn yoki badiiy-matn bo‘lishi kerak.",
            );
        }
    }

    if (
        draft.metadata.format ===
        "mixed"
    ) {
        const isNationalMixed =
            draft.metadata.group ===
                "national-certificate" &&
            draft.metadata.topicSlug ===
                "aralash";

        const isSyntaxMatchingPractice =
            draft.metadata.group ===
                "grammar" &&
            draft.metadata.category ===
                "Sintaksis" &&
            draft.metadata.topicSlug ===
                "sintaksis";

        if (isSyntaxMatchingPractice) {
            const expectedChoiceIds =
                ["A", "B", "C", "D", "E", "F"] as const;
            const expectedSourceOrders =
                [33, 34, 35] as const;

            if (
                draft.questions.length !== 20 ||
                draft.questions.some(
                    (question) =>
                        question.type !==
                        "matching",
                )
            ) {
                messages.push(
                    "33–34–35 Sintaksis testi nashr uchun aynan 20 ta moslashtirish blokidan iborat bo‘lishi kerak.",
                );
            } else {
                const invalidBlock =
                    draft.questions.some(
                        (question) => {
                            if (question.type !== "matching") {
                                return true;
                            }

                            const choiceIds =
                                question.choices.map(
                                    (choice) => choice.id,
                                );
                            const sourceOrders =
                                question.items.map(
                                    (item) =>
                                        item.sourceOrder ?? null,
                                );

                            return (
                                question.section !== "syntax" ||
                                question.choices.length !== 6 ||
                                expectedChoiceIds.some(
                                    (id, index) =>
                                        choiceIds[index] !== id,
                                ) ||
                                question.items.length !== 3 ||
                                expectedSourceOrders.some(
                                    (sourceOrder, index) =>
                                        sourceOrders[index] !== sourceOrder,
                                ) ||
                                question.items.some(
                                    (item) =>
                                        !approximately(
                                            item.maximumScore,
                                            1,
                                        ),
                                )
                            );
                        },
                    );

                if (invalidBlock) {
                    messages.push(
                        "Har bir 33–34–35 blokida A–F bo‘yicha 6 ta tanlov, 33/34/35 raqamli 3 ta band va har bir band uchun 1 ball bo‘lishi kerak.",
                    );
                }
            }
        } else if (
            !isNationalMixed ||
            draft.questions.length === 0 ||
            draft.questions.some(
                (question) =>
                    question.type ===
                        "passage-group" ||
                    question.type ===
                        "essay",
            )
        ) {
            messages.push(
                "Aralash test faqat Milliy sertifikat / Aralash yoki Grammatika / Sintaksis 33–34–35 formatida ishlatilishi mumkin.",
            );
        }
    }

    if (
        draft.metadata.format ===
        "diagnostic"
    ) {
        if (
            draft.metadata.estimatedMinutes !==
            180
        ) {
            messages.push(
                "Diagnostika nashr qilinishi uchun vaqt 180 daqiqa bo‘lishi kerak.",
            );
        }
    }

    return [
        ...new Set(
            messages,
        ),
    ];
}
