import type {
    AdminDraftQuestion,
    AdminDraftQuestionExplanation,
} from "./admin-question-types";
import type {
    AdminTestDraft,
} from "./admin-test-draft-types";
import {
    ADMIN_TEST_IMAGE_MAX_BYTES,
    isAdminTestImageStoragePath,
} from "./admin-test-image-validation";
import {
    ADMIN_TEST_AUDIO_MAX_BYTES,
    isAdminTestAudioStoragePath,
} from "./admin-test-audio-validation";
import {
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";

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

        if (
            question.question.trim()
                .length === 0
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "ESSAY_PROMPT_REQUIRED",
                    message:
                        "Esse topshirig‘i kiritilishi kerak.",
                    path:
                        `${path}.question`,
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

        const recommendedWords =
            question.requirements
                .recommendedWords ??
            null;

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

        if (
            recommendedWords !==
                null &&
            minimumWords !==
                null &&
            recommendedWords <
                minimumWords
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "ESSAY_RECOMMENDED_WORDS_TOO_LOW",
                    message:
                        "Tavsiya etilgan so‘zlar soni minimal qiymatdan kam bo‘la olmaydi.",
                    path:
                        `${path}.requirements.recommendedWords`,
                    questionId:
                        question.id,
                }),
            );
        }

        if (
            recommendedWords !==
                null &&
            maximumWords !==
                null &&
            recommendedWords >
                maximumWords
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "ESSAY_RECOMMENDED_WORDS_TOO_HIGH",
                    message:
                        "Tavsiya etilgan so‘zlar soni maksimal qiymatdan katta bo‘la olmaydi.",
                    path:
                        `${path}.requirements.recommendedWords`,
                    questionId:
                        question.id,
                }),
            );
        }
    }

    return issues;
}

function validateQuestionAudio({
    explanation,
    path,
    draftId,
    questionId,
}: {
    readonly explanation:
        AdminDraftQuestionExplanation |
        undefined;
    readonly path: string;
    readonly draftId: string;
    readonly questionId: string;
}): readonly AdminDraftValidationIssue[] {
    const audio =
        explanation?.audio;

    if (!audio) {
        return [];
    }

    const issues:
        AdminDraftValidationIssue[] = [];

    if (
        !Number.isInteger(
            audio.sizeBytes,
        ) ||
        audio.sizeBytes <= 0 ||
        audio.sizeBytes >
            ADMIN_TEST_AUDIO_MAX_BYTES
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "AUDIO_SIZE_INVALID",
                message:
                    "Audio hajmi 0 dan katta va 25 MB dan oshmagan bo‘lishi kerak.",
                path:
                    `${path}.sizeBytes`,
                questionId,
            }),
        );
    }

    if (
        audio.mimeType !==
            "audio/mpeg" &&
        audio.mimeType !==
            "audio/mp4" &&
        audio.mimeType !==
            "audio/wav"
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "AUDIO_MIME_TYPE_INVALID",
                message:
                    "Faqat MP3, M4A yoki WAV audioga ruxsat beriladi.",
                path:
                    `${path}.mimeType`,
                questionId,
            }),
        );
    }

    if (
        audio.durationSeconds !==
            null &&
        (
            !Number.isFinite(
                audio.durationSeconds,
            ) ||
            audio.durationSeconds < 0 ||
            audio.durationSeconds >
                6 * 60 * 60
        )
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "AUDIO_DURATION_INVALID",
                message:
                    "Audio davomiyligi noto‘g‘ri.",
                path:
                    `${path}.durationSeconds`,
                questionId,
            }),
        );
    }

    if (audio.storagePath === null) {
        issues.push(
            issue({
                severity: "warning",
                code:
                    "AUDIO_NOT_UPLOADED",
                message:
                    "Audio metadata mavjud, lekin Storage manzili belgilanmagan.",
                path:
                    `${path}.storagePath`,
                questionId,
            }),
        );
    } else if (
        !isAdminTestAudioStoragePath(
            audio.storagePath,
            {
                draftId,
                questionId,
            },
        )
    ) {
        issues.push(
            issue({
                severity: "error",
                code:
                    "AUDIO_STORAGE_PATH_INVALID",
                message:
                    "Audio Storage manzili ushbu draft va savol yoki savol qismiga tegishli emas.",
                path:
                    `${path}.storagePath`,
                questionId,
            }),
        );
    }

    return issues;
}

function validateQuestionImage({
    image,
    path,
    draftId,
    questionId,
}: {
    readonly image:
        AdminDraftQuestion["image"];
    readonly path: string;
    readonly draftId: string;
    readonly questionId: string;
}): readonly AdminDraftValidationIssue[] {
    if (!image) {
        return [];
    }

    const issues:
        AdminDraftValidationIssue[] = [];

    const normalizedAlt =
        image.alt.trim();

    if (normalizedAlt.length === 0) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_ALT_REQUIRED",
                message:
                    "Rasm uchun alt matn kiritilishi kerak.",
                path: `${path}.alt`,
                questionId,
            }),
        );
    } else if (normalizedAlt.length > 300) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_ALT_TOO_LONG",
                message:
                    "Rasm alt matni 300 belgidan oshmasligi kerak.",
                path: `${path}.alt`,
                questionId,
            }),
        );
    }

    if (
        image.caption !== null &&
        image.caption.trim().length > 500
    ) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_CAPTION_TOO_LONG",
                message:
                    "Rasm izohi 500 belgidan oshmasligi kerak.",
                path: `${path}.caption`,
                questionId,
            }),
        );
    }

    if (
        !Number.isInteger(
            image.sizeBytes,
        ) ||
        image.sizeBytes <= 0 ||
        image.sizeBytes >
            ADMIN_TEST_IMAGE_MAX_BYTES
    ) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_SIZE_INVALID",
                message:
                    "Rasm hajmi 0 dan katta va 5 MB dan oshmagan bo‘lishi kerak.",
                path: `${path}.sizeBytes`,
                questionId,
            }),
        );
    }

    if (
        image.mimeType !== "image/jpeg" &&
        image.mimeType !== "image/png" &&
        image.mimeType !== "image/webp"
    ) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_MIME_TYPE_INVALID",
                message:
                    "Faqat JPEG, PNG yoki WebP rasmga ruxsat beriladi.",
                path: `${path}.mimeType`,
                questionId,
            }),
        );
    }

    if (image.storagePath === null) {
        issues.push(
            issue({
                severity: "warning",
                code: "IMAGE_NOT_UPLOADED",
                message:
                    "Rasm metama’lumoti mavjud, lekin Storage manzili belgilanmagan.",
                path: `${path}.storagePath`,
                questionId,
            }),
        );
    } else if (
        !isAdminTestImageStoragePath(
            image.storagePath,
            {
                draftId,
                questionId,
            },
        )
    ) {
        issues.push(
            issue({
                severity: "error",
                code: "IMAGE_STORAGE_PATH_INVALID",
                message:
                    "Rasm Storage manzili ushbu draft va savolga tegishli emas.",
                path: `${path}.storagePath`,
                questionId,
            }),
        );
    }

    return issues;
}

export function calculateAdminDraftTaskCount(
    draft:
        AdminTestDraft,
): number {
    return draft.questions.reduce(
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
                    question.questions.length
                );
            }

            if (
                question.type ===
                "matching"
            ) {
                return (
                    total +
                    question.items.length
                );
            }

            return total + 1;
        },
        0,
    );
}

function diagnosticSourceOrders(
    draft:
        AdminTestDraft,
): readonly number[] {
    return draft.questions.flatMap(
        (question) => {
            if (
                question.type ===
                "passage-group"
            ) {
                return question.questions.flatMap(
                    (nestedQuestion) =>
                        nestedQuestion.sourceOrder ===
                        null
                            ? []
                            : [
                                nestedQuestion.sourceOrder,
                            ],
                );
            }

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
        },
    );
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
        draft.metadata.group ===
        "morphology"
    ) {
        if (
            draft.metadata.category !==
                "Morfologiya" ||
            draft.metadata.format !==
                "morphology-standard" ||
            !isMorphologySubtopicSlug(
                draft.metadata.topicSlug,
            )
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "MORPHOLOGY_ROUTE_INVALID",
                    message:
                        "Morfologiya ichki testi Morfologiya kategoriyasida, morphology-standard formatida va to‘g‘ri bo‘lim slugida bo‘lishi kerak.",
                    path:
                        "metadata.topicSlug",
                }),
            );
        }
    }

    if (
        draft.metadata.format ===
        "diagnostic"
    ) {
        const taskCount =
            calculateAdminDraftTaskCount(
                draft,
            );

        const rawMaximumScore =
            calculateAdminDraftMaximumScore(
                draft,
            );

        const diagnostic =
            draft.metadata.diagnostic;

        if (
            draft.metadata.group !==
                "national-certificate" ||
            draft.metadata.topicSlug !==
                "diagnostika"
        ) {
            issues.push(
                issue({
                    severity: "error",
                    code:
                        "DIAGNOSTIC_ROUTE_INVALID",
                    message:
                        "Diagnostika testi milliy sertifikat guruhida va diagnostika yo‘nalishida bo‘lishi kerak.",
                    path:
                        "metadata.topicSlug",
                }),
            );
        }

        const shouldValidateDiagnosticContent =
            draft.questions.length >
                0 ||
            diagnostic !==
                null &&
            diagnostic !==
                undefined;

        if (
            shouldValidateDiagnosticContent
        ) {
            if (
                taskCount !==
                45
            ) {
                issues.push(
                    issue({
                        severity: "error",
                        code:
                            "DIAGNOSTIC_TASK_COUNT_INVALID",
                        message:
                            `Diagnostika testida 45 ta topshiriq bo‘lishi kerak. Hozir: ${taskCount}.`,
                        path:
                            "questions",
                    }),
                );
            }

            if (
                !diagnostic
            ) {
                issues.push(
                    issue({
                        severity: "error",
                        code:
                            "DIAGNOSTIC_METADATA_REQUIRED",
                        message:
                            "Diagnostika uchun yakuniy ball va topshiriqlar metama’lumoti mavjud emas.",
                        path:
                            "metadata.diagnostic",
                    }),
                );
            } else {
                if (
                    diagnostic.taskCount !==
                    taskCount
                ) {
                    issues.push(
                        issue({
                            severity: "error",
                            code:
                                "DIAGNOSTIC_METADATA_TASK_COUNT_MISMATCH",
                            message:
                                `Diagnostika metama’lumotidagi topshiriqlar soni (${diagnostic.taskCount}) haqiqiy son (${taskCount}) bilan mos emas.`,
                            path:
                                "metadata.diagnostic.taskCount",
                        }),
                    );
                }

                if (
                    diagnostic.finalMaximumScore !==
                    100
                ) {
                    issues.push(
                        issue({
                            severity: "error",
                            code:
                                "DIAGNOSTIC_FINAL_SCORE_INVALID",
                            message:
                                "Diagnostika testining yakuniy maksimal balli 100 bo‘lishi kerak.",
                            path:
                                "metadata.diagnostic.finalMaximumScore",
                        }),
                    );
                }

                if (
                    Math.abs(
                        diagnostic.rawMaximumScore -
                        rawMaximumScore,
                    ) >
                    0.01
                ) {
                    issues.push(
                        issue({
                            severity: "warning",
                            code:
                                "DIAGNOSTIC_RAW_SCORE_CHANGED",
                            message:
                                `Savol og‘irliklari yig‘indisi ${rawMaximumScore} ball. Import vaqtida ${diagnostic.rawMaximumScore} ball edi.`,
                            path:
                                "metadata.diagnostic.rawMaximumScore",
                        }),
                    );
                }
            }

            const sourceOrders =
                diagnosticSourceOrders(
                    draft,
                );

            const uniqueSourceOrders =
                new Set(
                    sourceOrders,
                );

            const missingSourceOrders =
                Array.from(
                    {
                        length:
                            45,
                    },
                    (
                        _value,
                        index,
                    ) =>
                        index +
                        1,
                ).filter(
                    (sourceOrder) =>
                        !uniqueSourceOrders.has(
                            sourceOrder,
                        ),
                );

            if (
                sourceOrders.length !==
                    uniqueSourceOrders.size ||
                missingSourceOrders.length >
                    0
            ) {
                issues.push(
                    issue({
                        severity: "error",
                        code:
                            "DIAGNOSTIC_SOURCE_ORDER_INVALID",
                        message:
                            missingSourceOrders.length >
                                0
                                ? `Diagnostika savol raqamlari to‘liq emas. Yetishmaydi: ${missingSourceOrders.join(", ")}.`
                                : "Diagnostika savol raqamlari takrorlangan.",
                        path:
                            "questions",
                    }),
                );
            }

            const essayQuestions =
                draft.questions.filter(
                    (question) =>
                        question.type ===
                        "essay",
                );

            if (
                essayQuestions.length !==
                    1 ||
                essayQuestions[0]
                    ?.sourceOrder !==
                    45
            ) {
                issues.push(
                    issue({
                        severity: "error",
                        code:
                            "DIAGNOSTIC_ESSAY_INVALID",
                        message:
                            "Diagnostika testida 45-savol sifatida bitta esse bo‘lishi kerak.",
                        path:
                            "questions",
                    }),
                );
            }
        }
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
                ...validateQuestionImage({
                    image: question.image,
                    path:
                        `questions.${index}.image`,
                    draftId: draft.id,
                    questionId:
                        question.id,
                }),
                ...validateQuestionAudio({
                    explanation:
                        question.explanation,
                    path:
                        `questions.${index}.explanation.audio`,
                    draftId: draft.id,
                    questionId:
                        question.id,
                }),
            );

            if (
                question.type ===
                "passage-group"
            ) {
                question.questions.forEach(
                    (
                        nestedQuestion,
                        nestedIndex,
                    ) => {
                        issues.push(
                            ...validateQuestionImage({
                                image:
                                    nestedQuestion.image,
                                path:
                                    `questions.${index}.questions.${nestedIndex}.image`,
                                draftId:
                                    draft.id,
                                questionId:
                                    nestedQuestion.id,
                            }),
                            ...validateQuestionAudio({
                                explanation:
                                    nestedQuestion.explanation,
                                path:
                                    `questions.${index}.questions.${nestedIndex}.explanation.audio`,
                                draftId:
                                    draft.id,
                                questionId:
                                    nestedQuestion.id,
                            }),
                        );
                    },
                );
            }

            if (
                question.type ===
                "matching"
            ) {
                question.items.forEach(
                    (
                        item,
                        itemIndex,
                    ) => {
                        issues.push(
                            ...validateQuestionAudio({
                                explanation:
                                    item.explanation,
                                path:
                                    `questions.${index}.items.${itemIndex}.explanation.audio`,
                                draftId:
                                    draft.id,
                                questionId:
                                    item.id,
                            }),
                        );
                    },
                );
            }

            if (
                question.type ===
                "multipart"
            ) {
                question.parts.forEach(
                    (
                        part,
                        partIndex,
                    ) => {
                        issues.push(
                            ...validateQuestionAudio({
                                explanation:
                                    part.explanation,
                                path:
                                    `questions.${index}.parts.${partIndex}.explanation.audio`,
                                draftId:
                                    draft.id,
                                questionId:
                                    part.id,
                            }),
                        );
                    },
                );
            }
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
