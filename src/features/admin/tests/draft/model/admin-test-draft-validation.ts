import type {
    AdminDraftQuestion,
} from "./admin-question-types";
import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

export type AdminDraftValidationSeverity =
    | "error"
    | "warning";

export interface AdminDraftValidationIssue {
    readonly severity:
        AdminDraftValidationSeverity;
    readonly code: string;
    readonly message: string;
    readonly path: string;
    readonly questionId:
        string | null;
}

export interface AdminDraftValidationResult {
    readonly isValid: boolean;
    readonly errors:
        readonly AdminDraftValidationIssue[];
    readonly warnings:
        readonly AdminDraftValidationIssue[];
}

type AdminDraftValidationIssueInput =
    Omit<
        AdminDraftValidationIssue,
        "questionId"
    > & {
        readonly questionId?:
            string | null;
    };

function issue({
    severity,
    code,
    message,
    path,
    questionId = null,
}: AdminDraftValidationIssueInput):
    AdminDraftValidationIssue {
    return {
        severity,
        code,
        message,
        path,
        questionId,
    };
}

function validateBaseQuestion(
    question:
        AdminDraftQuestion,
    index: number,
): readonly AdminDraftValidationIssue[] {
    const path =
        `questions.${index}`;

    const issues:
        AdminDraftValidationIssue[] = [];

    if (
        question.order < 1 ||
        !Number.isInteger(
            question.order,
        )
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "QUESTION_ORDER_INVALID",
                message:
                    "Savol tartib raqami musbat butun son bo‘lishi kerak.",
                path:
                    `${path}.order`,
                questionId:
                    question.id,
            }),
        );
    }

    if (
        "question" in question &&
        question.question.trim()
            .length === 0 &&
        question.type !== "essay"
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "QUESTION_TEXT_REQUIRED",
                message:
                    "Savol matni kiritilishi kerak.",
                path:
                    `${path}.question`,
                questionId:
                    question.id,
            }),
        );
    }

    if (
        "maximumScore" in question &&
        (
            !Number.isFinite(
                question.maximumScore,
            ) ||
            question.maximumScore < 0
        )
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "QUESTION_SCORE_INVALID",
                message:
                    "Savol balli 0 yoki undan katta son bo‘lishi kerak.",
                path:
                    `${path}.maximumScore`,
                questionId:
                    question.id,
            }),
        );
    }

    return issues;
}

function validateQuestionSpecific(
    question:
        AdminDraftQuestion,
    index: number,
): readonly AdminDraftValidationIssue[] {
    const path =
        `questions.${index}`;

    const issues:
        AdminDraftValidationIssue[] = [];

    if (
        question.type ===
        "multiple-choice"
    ) {
        if (
            question.options.length <
            2
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MCQ_OPTIONS_TOO_FEW",
                    message:
                        "Variantli savolda kamida 2 ta variant bo‘lishi kerak.",
                    path:
                        `${path}.options`,
                    questionId:
                        question.id,
                }),
            );
        }

        const optionIds =
            question.options.map(
                (option) =>
                    option.id,
            );

        if (
            new Set(optionIds).size !==
            optionIds.length
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MCQ_OPTION_IDS_DUPLICATED",
                    message:
                        "Variant harflari takrorlanmasligi kerak.",
                    path:
                        `${path}.options`,
                    questionId:
                        question.id,
                }),
            );
        }

        if (
            question.options.some(
                (option) =>
                    option.text.trim()
                        .length === 0,
            )
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MCQ_OPTION_TEXT_REQUIRED",
                    message:
                        "Har bir variant matni to‘ldirilishi kerak.",
                    path:
                        `${path}.options`,
                    questionId:
                        question.id,
                }),
            );
        }

        if (
            !question.correctOptionId
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MCQ_CORRECT_ANSWER_REQUIRED",
                    message:
                        "To‘g‘ri javob belgilanmagan.",
                    path:
                        `${path}.correctOptionId`,
                    questionId:
                        question.id,
                }),
            );
        } else if (
            !optionIds.includes(
                question.correctOptionId,
            )
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MCQ_CORRECT_ANSWER_NOT_FOUND",
                    message:
                        "To‘g‘ri javob variantlar ichida mavjud emas.",
                    path:
                        `${path}.correctOptionId`,
                    questionId:
                        question.id,
                }),
            );
        }
    }

    if (
        question.type ===
        "short-answer" &&
        question.acceptedAnswers
            .length === 0 &&
        question.requiredKeywords
            .length === 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "SHORT_ANSWER_KEY_REQUIRED",
                message:
                    "Qisqa javob uchun kamida bitta qabul qilinadigan javob yoki kalit so‘z kerak.",
                path:
                    `${path}.acceptedAnswers`,
                questionId:
                    question.id,
            }),
        );
    }

    if (
        question.type ===
        "matching"
    ) {
        if (
            question.choices.length <
            2
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MATCHING_CHOICES_TOO_FEW",
                    message:
                        "Moslashtirish savolida kamida 2 ta tanlov bo‘lishi kerak.",
                    path:
                        `${path}.choices`,
                    questionId:
                        question.id,
                }),
            );
        }

        if (
            question.items.length ===
            0
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MATCHING_ITEMS_REQUIRED",
                    message:
                        "Moslashtirish savolida kamida bitta topshiriq bo‘lishi kerak.",
                    path:
                        `${path}.items`,
                    questionId:
                        question.id,
                }),
            );
        }
    }

    if (
        question.type ===
            "multipart" &&
        question.parts.length === 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "MULTIPART_PARTS_REQUIRED",
                message:
                    "Ko‘p qismli savolda kamida bitta qism bo‘lishi kerak.",
                path:
                    `${path}.parts`,
                questionId:
                    question.id,
            }),
        );
    }

    if (
        question.type ===
        "passage-group"
    ) {
        if (
            question.passage.length ===
            0
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "PASSAGE_REQUIRED",
                    message:
                        "Matnli savol guruhida matn bo‘lishi kerak.",
                    path:
                        `${path}.passage`,
                    questionId:
                        question.id,
                }),
            );
        }

        if (
            question.questions.length ===
            0
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "PASSAGE_QUESTIONS_REQUIRED",
                    message:
                        "Matnli savol guruhida kamida bitta savol bo‘lishi kerak.",
                    path:
                        `${path}.questions`,
                    questionId:
                        question.id,
                }),
            );
        }
    }

    if (
        question.type === "essay"
    ) {
        if (
            question.topic.trim()
                .length === 0
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "ESSAY_TOPIC_REQUIRED",
                    message:
                        "Esse mavzusi kiritilishi kerak.",
                    path:
                        `${path}.topic`,
                    questionId:
                        question.id,
                }),
            );
        }

        const {
            minimumWords,
            maximumWords,
        } =
            question.requirements;

        if (
            minimumWords !== null &&
            maximumWords !== null &&
            minimumWords >
                maximumWords
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "ESSAY_WORD_LIMIT_INVALID",
                    message:
                        "Minimal so‘zlar soni maksimal qiymatdan katta bo‘la olmaydi.",
                    path:
                        `${path}.requirements`,
                    questionId:
                        question.id,
                }),
            );
        }
    }

    if (
        question.explanation.audio &&
        question.explanation.audio
            .storagePath === null
    ) {
        issues.push(
            issue({
                severity: "warning",
                code:
                    "AUDIO_NOT_UPLOADED",
                message:
                    "Audio metadata mavjud, lekin storage manzili hali belgilanmagan.",
                path:
                    `${path}.explanation.audio`,
                questionId:
                    question.id,
            }),
        );
    }

    return issues;
}

export function validateAdminTestDraft(
    draft:
        AdminTestDraft,
): AdminDraftValidationResult {
    const issues:
        AdminDraftValidationIssue[] = [];

    if (
        draft.metadata.title.trim()
            .length === 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "TEST_TITLE_REQUIRED",
                message:
                    "Test nomi kiritilishi kerak.",
                path:
                    "metadata.title",
            }),
        );
    }

    if (
        draft.metadata.category.trim()
            .length === 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "TEST_CATEGORY_REQUIRED",
                message:
                    "Test kategoriyasi kiritilishi kerak.",
                path:
                    "metadata.category",
            }),
        );
    }

    if (
        draft.metadata.topicSlug.trim()
            .length === 0 ||
        draft.metadata.slug.trim()
            .length === 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "TEST_ROUTE_REQUIRED",
                message:
                    "Topic slug va test slug kiritilishi kerak.",
                path:
                    "metadata.slug",
            }),
        );
    }

    if (
        !Number.isFinite(
            draft.metadata
                .estimatedMinutes,
        ) ||
        draft.metadata
            .estimatedMinutes <= 0
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "TEST_DURATION_INVALID",
                message:
                    "Test vaqti 0 dan katta bo‘lishi kerak.",
                path:
                    "metadata.estimatedMinutes",
            }),
        );
    }

    if (
        draft.questions.length === 0
    ) {
        issues.push(
            issue({
                severity: "warning",
                code:
                    "TEST_HAS_NO_QUESTIONS",
                message:
                    "Testda hali savollar mavjud emas.",
                path:
                    "questions",
            }),
        );
    }

    const questionIds =
        draft.questions.map(
            (question) =>
                question.id,
        );

    if (
        new Set(questionIds).size !==
        questionIds.length
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "QUESTION_IDS_DUPLICATED",
                message:
                    "Savol ID qiymatlari takrorlangan.",
                path:
                    "questions",
            }),
        );
    }

    const questionOrders =
        draft.questions.map(
            (question) =>
                question.order,
        );

    if (
        new Set(questionOrders).size !==
        questionOrders.length
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "QUESTION_ORDERS_DUPLICATED",
                message:
                    "Savol tartib raqamlari takrorlangan.",
                path:
                    "questions",
            }),
        );
    }

    draft.questions.forEach(
        (
            question,
            index,
        ) => {
            issues.push(
                ...validateBaseQuestion(
                    question,
                    index,
                ),
                ...validateQuestionSpecific(
                    question,
                    index,
                ),
            );
        },
    );

    const errors =
        issues.filter(
            (item) =>
                item.severity ===
                "error",
        );

    const warnings =
        issues.filter(
            (item) =>
                item.severity ===
                "warning",
        );

    return {
        isValid:
            errors.length === 0,
        errors,
        warnings,
    };
}

export function calculateAdminDraftMaximumScore(
    draft:
        AdminTestDraft,
): number {
    const score =
        draft.questions.reduce(
            (
                total,
                question,
            ) => {
                if (
                    question.type ===
                    "passage-group"
                ) {
                    return (
                        total +
                        question.questions.reduce(
                            (
                                nestedTotal,
                                nestedQuestion,
                            ) =>
                                nestedTotal +
                                nestedQuestion
                                    .maximumScore,
                            0,
                        )
                    );
                }

                return (
                    total +
                    question.maximumScore
                );
            },
            0,
        );

    return (
        Math.round(
            score * 100,
        ) / 100
    );
}
