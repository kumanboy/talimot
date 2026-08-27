import type {
    AdminDraftEssayQuestion,
    AdminDraftMatchingQuestion,
    AdminDraftMultipartQuestion,
    AdminDraftMultipleChoiceQuestion,
    AdminDraftPassageGroupQuestion,
    AdminDraftQuestion,
    AdminDraftShortAnswerQuestion,
} from "./admin-question-types";
import type {
    AdminDiagnosticDocxParseResult,
    AdminParsedDiagnosticQuestion,
} from "./admin-diagnostic-docx-parser-types";
import type {
    AdminTestDraftMetadata,
} from "./admin-test-draft-types";

export interface AdminDiagnosticDraftImport {
    readonly metadata:
        Partial<
            AdminTestDraftMetadata
        >;
    readonly questions:
        readonly AdminDraftQuestion[];
}

function diagnosticId(
    prefix:
        string,
    sourceOrder:
        number,
    suffix?:
        string | number,
): string {
    return [
        "diagnostic",
        prefix,
        sourceOrder,
        suffix,
    ]
        .filter(
            (
                value,
            ) =>
                value !==
                    undefined &&
                value !==
                    null &&
                value !==
                    "",
        )
        .join("-");
}

function explanation(
    text:
        string,
) {
    return {
        text,
        audio:
            null,
    } as const;
}

export function createAdminDiagnosticQuestionImport(
    parsedQuestion:
        AdminParsedDiagnosticQuestion,
): AdminDraftQuestion {
    if (
        parsedQuestion.type ===
        "multiple-choice"
    ) {
        return {
            type:
                "multiple-choice",
            id:
                diagnosticId(
                    "question",
                    parsedQuestion.sourceOrder,
                ),
            order:
                parsedQuestion.sourceOrder,
            sourceOrder:
                parsedQuestion.sourceOrder,
            section:
                parsedQuestion.section,
            question:
                parsedQuestion.question,
            instruction:
                null,
            context:
                parsedQuestion.context,
            maximumScore:
                parsedQuestion.maximumScore,
            image:
                null,
            explanation:
                explanation(
                    "DOCX diagnostika import orqali qo‘shildi. To‘g‘ri javob va audio izohni tekshiring.",
                ),
            options:
                parsedQuestion.options,
            correctOptionId:
                parsedQuestion.correctOptionId,
            visual:
                parsedQuestion.visual,
        } satisfies
            AdminDraftMultipleChoiceQuestion;
    }

    if (
        parsedQuestion.type ===
        "matching"
    ) {
        return {
            type:
                "matching",
            id:
                diagnosticId(
                    "matching",
                    parsedQuestion.sourceOrder,
                ),
            order:
                parsedQuestion.sourceOrder,
            sourceOrder:
                parsedQuestion.sourceOrder,
            section:
                parsedQuestion.section,
            question:
                parsedQuestion.question,
            instruction:
                parsedQuestion.instruction,
            context:
                parsedQuestion.context,
            maximumScore:
                parsedQuestion.maximumScore,
            image:
                null,
            explanation:
                explanation(
                    "DOCX diagnostika import orqali qo‘shildi. Mosliklar va audio izohlarni tekshiring.",
                ),
            title:
                parsedQuestion.title,
            choices:
                parsedQuestion.choices,
            items:
                parsedQuestion.items.map(
                    (item) => ({
                        id:
                            diagnosticId(
                                "matching-item",
                                item.sourceOrder,
                            ),
                        order:
                            item.sourceOrder,
                        sourceOrder:
                            item.sourceOrder,
                        prompt:
                            item.prompt,
                        correctChoiceId:
                            item.correctChoiceId,
                        maximumScore:
                            item.maximumScore,
                        explanation:
                            explanation(
                                "DOCX diagnostika import orqali qo‘shildi. Ushbu matching bandi uchun audio izohni tekshiring.",
                            ),
                    }),
                ),
        } satisfies
            AdminDraftMatchingQuestion;
    }

    if (
        parsedQuestion.type ===
        "short-answer"
    ) {
        return {
            type:
                "short-answer",
            id:
                diagnosticId(
                    "question",
                    parsedQuestion.sourceOrder,
                ),
            order:
                parsedQuestion.sourceOrder,
            sourceOrder:
                parsedQuestion.sourceOrder,
            section:
                parsedQuestion.section,
            question:
                parsedQuestion.question,
            instruction:
                null,
            context:
                parsedQuestion.context,
            maximumScore:
                parsedQuestion.maximumScore,
            image:
                null,
            explanation:
                explanation(
                    "DOCX diagnostika import orqali qo‘shildi. Qabul qilinadigan javob va audio izohni tekshiring.",
                ),
            acceptedAnswers:
                parsedQuestion.acceptedAnswers,
            requiredKeywords:
                parsedQuestion.requiredKeywords,
            comparison:
                parsedQuestion.comparison,
            examples:
                parsedQuestion.examples,
        } satisfies
            AdminDraftShortAnswerQuestion;
    }

    if (
        parsedQuestion.type ===
        "multipart"
    ) {
        return {
            type:
                "multipart",
            id:
                diagnosticId(
                    "question",
                    parsedQuestion.sourceOrder,
                ),
            order:
                parsedQuestion.sourceOrder,
            sourceOrder:
                parsedQuestion.sourceOrder,
            section:
                parsedQuestion.section,
            question:
                parsedQuestion.question,
            instruction:
                null,
            context:
                parsedQuestion.context,
            maximumScore:
                parsedQuestion.maximumScore,
            image:
                null,
            explanation:
                explanation(
                    "DOCX diagnostika import orqali qo‘shildi. Har bir qism javobi, balli va audio izohini tekshiring.",
                ),
            parts:
                parsedQuestion.parts.map(
                    (
                        part,
                        index,
                    ) => ({
                        id:
                            diagnosticId(
                                "question-part",
                                parsedQuestion.sourceOrder,
                                part.label,
                            ),
                        order:
                            index +
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
                            explanation(
                                "DOCX diagnostika import orqali qo‘shildi. Ushbu qism uchun audio izohni tekshiring.",
                            ),
                    }),
                ),
        } satisfies
            AdminDraftMultipartQuestion;
    }

    if (
        parsedQuestion.type ===
        "passage-group"
    ) {
        return {
            type:
                "passage-group",
            id:
                diagnosticId(
                    "passage-group",
                    parsedQuestion.sourceOrder,
                ),
            order:
                parsedQuestion.sourceOrder,
            sourceOrder:
                parsedQuestion.sourceOrder,
            section:
                parsedQuestion.section,
            instruction:
                parsedQuestion.instruction,
            context:
                parsedQuestion.context,
            image:
                null,
            explanation:
                explanation(
                    "",
                ),
            title:
                parsedQuestion.title,
            passage:
                parsedQuestion.passage.map(
                    (block) => ({
                        id:
                            diagnosticId(
                                "passage-block",
                                parsedQuestion.sourceOrder,
                                block.order,
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
                parsedQuestion.questions.map(
                    (question) => ({
                        type:
                            "multiple-choice",
                        id:
                            diagnosticId(
                                "question",
                                question.sourceOrder,
                            ),
                        order:
                            question.sourceOrder,
                        sourceOrder:
                            question.sourceOrder,
                        section:
                            parsedQuestion.section,
                        question:
                            question.question,
                        instruction:
                            null,
                        context:
                            question.context,
                        maximumScore:
                            question.maximumScore,
                        image:
                            null,
                        explanation:
                            explanation(
                                "DOCX diagnostika passage import orqali qo‘shildi. To‘g‘ri javob va audio izohni tekshiring.",
                            ),
                        options:
                            question.options,
                        correctOptionId:
                            question.correctOptionId,
                        visual:
                            question.visual,
                    })),
        } satisfies
            AdminDraftPassageGroupQuestion;
    }

    return {
        type:
            "essay",
        id:
            diagnosticId(
                "question",
                parsedQuestion.sourceOrder,
            ),
        order:
            parsedQuestion.sourceOrder,
        sourceOrder:
            parsedQuestion.sourceOrder,
        section:
            "essay",
        question:
            parsedQuestion.question,
        instruction:
            null,
        context:
            parsedQuestion.situation,
        maximumScore:
            parsedQuestion.maximumScore,
        image:
            null,
        explanation:
            explanation(
                "",
            ),
        topic:
            parsedQuestion.title ??
            "ESSE",
        requirements: {
            minimumWords:
                parsedQuestion.minimumWords,
            recommendedWords:
                parsedQuestion.recommendedWords,
            maximumWords:
                parsedQuestion.maximumWords,
            recommendedParagraphs:
                parsedQuestion.recommendedParagraphs,
            introduction:
                parsedQuestion.introductionRequirements,
            body:
                parsedQuestion.bodyRequirements,
            conclusion:
                parsedQuestion.conclusionRequirements,
            warnings:
                parsedQuestion.warnings,
            rubric:
                parsedQuestion.rubric,
        },
        comparison:
            "manual-review",
    } satisfies
        AdminDraftEssayQuestion;
}

export function createAdminDiagnosticDraftImport(
    parsedDiagnostic:
        AdminDiagnosticDocxParseResult,
): AdminDiagnosticDraftImport {
    const questions =
        parsedDiagnostic.questions
            .filter(
                (question) =>
                    question.confidence !==
                    "invalid",
            )
            .map(
                createAdminDiagnosticQuestionImport,
            )
            .sort(
                (
                    left,
                    right,
                ) =>
                    left.order -
                    right.order,
            );

    return {
        metadata: {
            ...(parsedDiagnostic.metadata.title
                ? {
                    title:
                        parsedDiagnostic.metadata.title,
                }
                : {}),
            ...(parsedDiagnostic.metadata.description
                ? {
                    description:
                        parsedDiagnostic.metadata.description,
                }
                : {}),
            group:
                "national-certificate",
            category:
                "Diagnostika",
            topicSlug:
                "diagnostika",
            format:
                "diagnostic",
            ...(parsedDiagnostic.metadata.difficulty
                ? {
                    difficulty:
                        parsedDiagnostic.metadata.difficulty,
                }
                : {}),
            ...(parsedDiagnostic.metadata.access
                ? {
                    access:
                        parsedDiagnostic.metadata.access,
                }
                : {}),
            ...(parsedDiagnostic.metadata.tangaPrice !== null
                ? {
                    tangaPrice:
                        parsedDiagnostic.metadata.access === "free"
                            ? 0
                            : Math.max(0, Math.round(parsedDiagnostic.metadata.tangaPrice)),
                }
                : {}),
            ...(parsedDiagnostic.metadata.estimatedMinutes !==
            null
                ? {
                    estimatedMinutes:
                        parsedDiagnostic.metadata.estimatedMinutes,
                }
                : {}),
            diagnostic: {
                taskCount:
                    parsedDiagnostic.taskCount,
                finalMaximumScore:
                    parsedDiagnostic.maximumScore,
                rawMaximumScore:
                    parsedDiagnostic.rawMaximumScore,
            },
        },
        questions,
    };
}
