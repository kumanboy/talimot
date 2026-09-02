import "server-only";

import {
    getAdminTestAudioPublicUrl,
} from "@/features/admin/tests/draft/storage/admin-test-audio-storage";
import {
    getAdminTestImagePublicUrl,
} from "@/features/admin/tests/draft/storage/admin-test-image-storage";
import type {
    AdminDraftAudioAsset,
    AdminDraftImageAsset,
    AdminDraftMultipleChoiceQuestion,
    AdminDraftPassageBlock,
    AdminDraftPassageGroupQuestion,
    AdminDraftQuestion,
    AdminDraftQuestionExplanation,
    AdminDraftQuestionSection,
} from "@/features/admin/tests/draft/model/admin-question-types";
import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    calculateAdminDraftMaximumScore,
    calculateAdminDraftTaskCount,
} from "@/features/admin/tests/draft/model/admin-test-draft-validation";
import type {
    StandardTestDefinition,
    StandardTestOptionId,
    StandardTestQuestion,
} from "@/features/tests/model/questions/types";
import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";
import type {
    GhazalCouplet,
    GhazalQuestion,
    GhazalTestDefinition,
    GhazalVocabularyItem,
} from "@/features/national-certificate/model/ghazal-test-types";
import type {
    PassageBlock,
    PassageFiveQuestion,
    PassageFiveTestDefinition,
    PassageFiveTopic,
    RomanSectionMarker,
} from "@/features/national-certificate/model/passage-five-test-types";
import type {
    StandardFiveQuestion,
    StandardFiveTestDefinition,
} from "@/features/national-certificate/model/standard-five-test-types";
import type {
    MixedMatchingChoiceId,
    MixedOptionId,
    MixedQuestion,
    MixedQuestionImage,
    MixedQuestionVisual,
    MixedTestDefinition,
    WrittenAnswerComparison,
} from "@/features/national-certificate/model/mixed-test-types";
import type {
    DiagnosticQuestion,
    DiagnosticQuestionImage,
    DiagnosticQuestionSection,
    DiagnosticTestDefinition,
} from "@/features/national-certificate/model/diagnostic-test-types";

export type PublishedAdminStudentTest =
    | StandardTestDefinition
    | GhazalTestDefinition
    | PassageFiveTestDefinition
    | StandardFiveTestDefinition
    | MixedTestDefinition
    | DiagnosticTestDefinition;

export class AdminTestDraftPublishConversionError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminTestDraftPublishConversionError";
    }
}

function fail(message: string): never {
    throw new AdminTestDraftPublishConversionError(
        message,
    );
}

function nonEmpty(
    value: string | null | undefined,
): string | null {
    const normalized =
        value?.trim() ?? "";

    return normalized.length > 0
        ? normalized
        : null;
}

function formatDurationLabel(
    durationSeconds: number | null,
): string | null {
    if (
        durationSeconds === null ||
        !Number.isFinite(
            durationSeconds,
        ) ||
        durationSeconds <= 0
    ) {
        return null;
    }

    const totalSeconds =
        Math.max(
            1,
            Math.round(
                durationSeconds,
            ),
        );
    const minutes =
        Math.floor(
            totalSeconds / 60,
        );
    const seconds =
        totalSeconds % 60;

    return `${minutes}:${String(
        seconds,
    ).padStart(2, "0")}`;
}

function mapAudio(
    audio: AdminDraftAudioAsset | null,
): QuestionExplanation["audio"] | undefined {
    if (!audio) {
        return undefined;
    }

    if (!audio.storagePath) {
        fail(
            "Audio yuklangan, lekin Storage manzili mavjud emas.",
        );
    }

    const durationLabel =
        formatDurationLabel(
            audio.durationSeconds,
        );

    return {
        src:
            getAdminTestAudioPublicUrl(
                audio.storagePath,
            ),
        ...(durationLabel
            ? {
                durationLabel,
            }
            : {}),
    };
}

function mapExplanation(
    explanation:
        AdminDraftQuestionExplanation | undefined,
): QuestionExplanation | undefined {
    if (!explanation) {
        return undefined;
    }

    const text =
        nonEmpty(
            explanation.text,
        );
    const audio =
        mapAudio(
            explanation.audio,
        );

    if (!text && !audio) {
        return undefined;
    }

    return {
        ...(text
            ? {
                text,
            }
            : {}),
        ...(audio
            ? {
                audio,
            }
            : {}),
    };
}

function mapImage(
    image: AdminDraftImageAsset | null,
): MixedQuestionImage | undefined {
    if (!image) {
        return undefined;
    }

    if (!image.storagePath) {
        fail(
            "Rasm yuklangan, lekin Storage manzili mavjud emas.",
        );
    }

    const caption =
        nonEmpty(
            image.caption,
        );

    return {
        src:
            getAdminTestImagePublicUrl(
                image.storagePath,
            ),
        alt:
            image.alt.trim(),
        ...(caption
            ? {
                caption,
            }
            : {}),
        ...(image.width !== null
            ? {
                width:
                    image.width,
            }
            : {}),
        ...(image.height !== null
            ? {
                height:
                    image.height,
            }
            : {}),
    };
}

function mapDiagnosticImage(
    image: AdminDraftImageAsset | null,
): DiagnosticQuestionImage | undefined {
    const mapped =
        mapImage(
            image,
        );

    return mapped;
}

function toStandardOptionId(
    value: string | null,
): StandardTestOptionId {
    if (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D"
    ) {
        return value;
    }

    return fail(
        "Student testi uchun to‘g‘ri javob A–D oralig‘ida bo‘lishi kerak.",
    );
}

function toMixedOptionId(
    value: string | null,
): MixedOptionId {
    return toStandardOptionId(
        value,
    );
}

function toMatchingChoiceId(
    value: string | null,
): MixedMatchingChoiceId {
    if (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D" ||
        value === "E" ||
        value === "F"
    ) {
        return value;
    }

    return fail(
        "Moslashtirish savolining javobi A–F oralig‘ida bo‘lishi kerak.",
    );
}

function toWrittenComparison(
    value: string,
): WrittenAnswerComparison {
    if (
        value === "exact" ||
        value === "normalized" ||
        value === "keywords" ||
        value === "manual-review"
    ) {
        return value;
    }

    return fail(
        "Yozma javobni tekshirish rejimi aniqlanmadi.",
    );
}

function toMultipartLabel(
    value: string,
): "a" | "b" | "c" {
    const normalized =
        value
            .trim()
            .toLocaleLowerCase(
                "uz",
            );

    if (
        normalized === "a" ||
        normalized === "b" ||
        normalized === "c"
    ) {
        return normalized;
    }

    return fail(
        "Ko‘p qismli savol yorlig‘i a, b yoki c bo‘lishi kerak.",
    );
}

function optionalSourceOrder(
    sourceOrder: number | null | undefined,
): { readonly sourceOrder: number } | Record<string, never> {
    return sourceOrder === null ||
        sourceOrder === undefined
        ? {}
        : {
            sourceOrder,
        };
}

function mapStandardQuestion(
    question:
        AdminDraftMultipleChoiceQuestion,
): StandardTestQuestion {
    const explanation =
        mapExplanation(
            question.explanation,
        );

    return {
        id:
            question.id,
        order:
            question.order,
        question:
            question.question,
        options:
            question.options.map(
                (option) => {
                    const image =
                        mapImage(
                            option.image ?? null,
                        );

                    return {
                        id:
                            toStandardOptionId(
                                option.id,
                            ),
                        text:
                            option.text,
                        ...(image
                            ? { image }
                            : {}),
                    };
                },
            ),
        correctOptionId:
            toStandardOptionId(
                question.correctOptionId,
            ),
        ...(explanation
            ? {
                explanation,
            }
            : {}),
    };
}

function convertStandardDraft(
    draft: AdminTestDraft,
): StandardTestDefinition {
    const questions =
        draft.questions.map(
            (question) => {
                if (
                    question.type !==
                    "multiple-choice"
                ) {
                    return fail(
                        "Standart testda faqat variantli savollar bo‘lishi mumkin.",
                    );
                }

                return mapStandardQuestion(
                    question,
                );
            },
        );

    if (questions.length !== 20) {
        fail(
            "Standart test 20 ta savoldan iborat bo‘lishi kerak.",
        );
    }

    return {
        kind:
            "standard",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        title:
            draft.metadata.title,
        category:
            draft.metadata.category,
        topicSlug:
            draft.metadata.topicSlug,
        description:
            draft.metadata.description,
        questionCount:
            20,
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
        difficulty:
            draft.metadata.difficulty,
        access:
            draft.metadata.access,
        dataSource:
            "admin",
        answerKeyStatus:
            "verified",
        questions,
    };
}

function mapStandardFiveQuestion(
    question:
        AdminDraftMultipleChoiceQuestion,
): StandardFiveQuestion {
    const prompt =
        nonEmpty(
            question.instruction,
        );
    const context =
        nonEmpty(
            question.context,
        );
    const explanation =
        mapExplanation(
            question.explanation,
        );

    return {
        id:
            question.id,
        order:
            question.order,
        ...optionalSourceOrder(
            question.sourceOrder,
        ),
        ...(prompt
            ? {
                prompt,
            }
            : {}),
        ...(context
            ? {
                excerpt:
                    context
                        .split(/\r?\n/)
                        .map(
                            (line) =>
                                line.trim(),
                        )
                        .filter(
                            Boolean,
                        ),
            }
            : {}),
        question:
            question.question,
        options:
            question.options.map(
                (option) => ({
                    id:
                        toStandardOptionId(
                            option.id,
                        ),
                    text:
                        option.text,
                }),
            ),
        correctOptionId:
            toStandardOptionId(
                question.correctOptionId,
            ),
        score:
            1.7,
        ...(explanation
            ? {
                explanation,
            }
            : {}),
    };
}

function convertStandardFiveDraft(
    draft: AdminTestDraft,
): StandardFiveTestDefinition {
    const questions =
        draft.questions.map(
            (question) => {
                if (
                    question.type !==
                    "multiple-choice"
                ) {
                    return fail(
                        "Badiiy asarlar testida faqat 5 ta variantli savol bo‘lishi kerak.",
                    );
                }

                return mapStandardFiveQuestion(
                    question,
                );
            },
        );

    if (questions.length !== 5) {
        fail(
            "Badiiy asarlar testi 5 ta savoldan iborat bo‘lishi kerak.",
        );
    }

    return {
        kind:
            "standard-five",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        topic:
            "badiiy-asarlar",
        title:
            draft.metadata.title,
        description:
            draft.metadata.description,
        questionCount:
            5,
        scorePerQuestion:
            1.7,
        maximumScore:
            8.5,
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
        access:
            draft.metadata.access,
        questions,
    };
}

function isRomanSectionMarker(
    value: string | null,
): value is RomanSectionMarker {
    return (
        value === "I" ||
        value === "II" ||
        value === "III" ||
        value === "IV"
    );
}

const canonicalScientificMarkers:
    readonly RomanSectionMarker[] = [
        "I",
        "II",
        "III",
        "IV",
    ];

function splitInlineScientificSections(
    value: string,
): readonly string[] {
    return value
        .split(
            /(?:^|\s)(?:I|II|III|IV|V)\s*[\.\):\-]\s+/gu,
        )
        .map(
            (part) =>
                part.trim(),
        )
        .filter(Boolean);
}

function mapScientificPassageBlocks(
    blocks:
        readonly AdminDraftPassageBlock[],
): readonly PassageBlock[] {
    const chunks:
        string[] = [];

    [...blocks]
        .sort(
            (left, right) =>
                left.order -
                right.order,
        )
        .forEach(
            (block) => {
                splitInlineScientificSections(
                    block.text,
                ).forEach(
                    (part) => {
                        chunks.push(
                            part,
                        );
                    },
                );
            },
        );

    if (chunks.length < 4) {
        return mapPassageBlocks(
            blocks,
        );
    }

    return canonicalScientificMarkers.map(
        (marker, index) => ({
            type:
                "numbered-section" as const,
            id:
                blocks[index]?.id ??
                `scientific-section-${index + 1}`,
            marker,
            paragraphs:
                index === 3
                    ? chunks.slice(3)
                    : [
                        chunks[index] ??
                            "",
                    ],
        }),
    );
}

function mapPassageBlocks(
    blocks:
        readonly AdminDraftPassageBlock[],
): readonly PassageBlock[] {
    const result:
        PassageBlock[] = [];

    for (let index = 0;
        index < blocks.length;
        index += 1) {
        const block =
            blocks[index];

        if (!block) {
            continue;
        }

        if (
            block.type ===
            "numbered-paragraph" &&
            isRomanSectionMarker(
                block.marker,
            )
        ) {
            const paragraphs = [
                block.text,
            ];
            let nextIndex =
                index + 1;

            while (
                nextIndex <
                blocks.length
            ) {
                const next =
                    blocks[nextIndex];

                if (
                    !next ||
                    next.type !==
                        "numbered-paragraph" ||
                    next.marker !==
                        block.marker
                ) {
                    break;
                }

                paragraphs.push(
                    next.text,
                );
                nextIndex += 1;
            }

            result.push({
                type:
                    "numbered-section",
                id:
                    block.id,
                marker:
                    block.marker,
                paragraphs,
            });
            index =
                nextIndex - 1;
            continue;
        }

        if (
            block.type ===
            "heading"
        ) {
            result.push({
                type:
                    "heading",
                id:
                    block.id,
                text:
                    block.text,
            });
            continue;
        }

        if (
            block.type ===
            "dialogue"
        ) {
            const speaker =
                nonEmpty(
                    block.speaker,
                );
            const marker =
                nonEmpty(
                    block.marker,
                );

            result.push({
                type:
                    "dialogue",
                id:
                    block.id,
                text:
                    block.text,
                ...(speaker
                    ? {
                        speaker,
                    }
                    : {}),
                ...(marker
                    ? {
                        marker,
                    }
                    : {}),
            });
            continue;
        }

        const marker =
            nonEmpty(
                block.marker,
            );

        result.push({
            type:
                "paragraph",
            id:
                block.id,
            text:
                block.text,
            ...(marker
                ? {
                    marker,
                }
                : {}),
        });
    }

    return result;
}

function mapPassageQuestion(
    question:
        AdminDraftMultipleChoiceQuestion,
): PassageFiveQuestion {
    const explanation =
        mapExplanation(
            question.explanation,
        );

    return {
        id:
            question.id,
        order:
            question.order,
        ...optionalSourceOrder(
            question.sourceOrder,
        ),
        question:
            question.question,
        options:
            question.options.map(
                (option) => ({
                    id:
                        toStandardOptionId(
                            option.id,
                        ),
                    text:
                        option.text,
                }),
            ),
        correctOptionId:
            toStandardOptionId(
                question.correctOptionId,
            ),
        score:
            question.maximumScore,
        ...(explanation
            ? {
                explanation,
            }
            : {}),
    };
}

function getOnlyPassageGroup(
    draft: AdminTestDraft,
): AdminDraftPassageGroupQuestion {
    if (
        draft.questions.length !== 1 ||
        draft.questions[0]?.type !==
            "passage-group"
    ) {
        return fail(
            "Ushbu format uchun bitta passage-group kutilgan.",
        );
    }

    return draft.questions[0];
}

function convertPassageFiveDraft(
    draft: AdminTestDraft,
): PassageFiveTestDefinition {
    const topic =
        draft.metadata.topicSlug;

    if (
        topic !== "ilmiy-matn" &&
        topic !== "badiiy-matn"
    ) {
        return fail(
            "Passage-five student testi faqat ilmiy-matn yoki badiiy-matn yo‘nalishida bo‘lishi mumkin.",
        );
    }

    const group =
        getOnlyPassageGroup(
            draft,
        );
    const questions =
        group.questions.map(
            mapPassageQuestion,
        );

    if (questions.length !== 5) {
        fail(
            "Matn testi 5 ta savoldan iborat bo‘lishi kerak.",
        );
    }

    const scorePerQuestion =
        topic === "ilmiy-matn"
            ? 1.7
            : 1.1;
    const maximumScore =
        scorePerQuestion * 5;

    return {
        kind:
            "passage-five",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        topic:
            topic satisfies PassageFiveTopic,
        title:
            group.title ??
            draft.metadata.title,
        description:
            draft.metadata.description,
        instruction:
            group.instruction ??
            "Matnni o‘qing va savollarga javob bering.",
        passage:
            topic ===
            "ilmiy-matn"
                ? mapScientificPassageBlocks(
                    group.passage,
                )
                : mapPassageBlocks(
                    group.passage,
                ),
        questionCount:
            5,
        scorePerQuestion,
        maximumScore,
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
        access:
            draft.metadata.access,
        questions,
    };
}

function parseGhazalContent(
    group:
        AdminDraftPassageGroupQuestion,
): {
    readonly author: string | null;
    readonly couplets:
        readonly GhazalCouplet[];
    readonly vocabulary:
        readonly GhazalVocabularyItem[];
} {
    let author:
        string | null = null;
    let vocabularyMode =
        false;
    const couplets:
        GhazalCouplet[] = [];
    const vocabulary:
        GhazalVocabularyItem[] = [];

    group.passage.forEach(
        (block) => {
            if (
                block.type ===
                "heading"
            ) {
                if (
                    block.text
                        .trim()
                        .toLocaleUpperCase(
                            "uz",
                        ) ===
                    "LUG‘AT"
                ) {
                    vocabularyMode =
                        true;
                    return;
                }

                if (
                    !author &&
                    couplets.length ===
                        0
                ) {
                    author =
                        block.text.trim();
                }
                return;
            }

            if (
                block.type ===
                "poetry"
            ) {
                const lines =
                    block.text
                        .split(/\r?\n/)
                        .map(
                            (line) =>
                                line.trim(),
                        )
                        .filter(
                            Boolean,
                        );

                if (
                    lines.length < 2
                ) {
                    fail(
                        "G‘azal baytida ikki misra bo‘lishi kerak.",
                    );
                }

                couplets.push({
                    order:
                        Number(
                            block.marker,
                        ) ||
                        couplets.length +
                            1,
                    firstLine:
                        lines[0] ?? "",
                    secondLine:
                        lines[1] ?? "",
                });
                return;
            }

            if (
                vocabularyMode &&
                block.type ===
                    "paragraph"
            ) {
                const separatorIndex =
                    block.text.indexOf(
                        "—",
                    );

                if (
                    separatorIndex <= 0
                ) {
                    return;
                }

                const term =
                    block.text
                        .slice(
                            0,
                            separatorIndex,
                        )
                        .trim();
                const meaning =
                    block.text
                        .slice(
                            separatorIndex +
                                1,
                        )
                        .trim();
                const marker =
                    nonEmpty(
                        block.marker,
                    );

                if (
                    term &&
                    meaning
                ) {
                    vocabulary.push({
                        term,
                        meaning,
                        ...(marker
                            ? {
                                marker,
                            }
                            : {}),
                    });
                }
            }
        },
    );

    return {
        author,
        couplets,
        vocabulary,
    };
}

function mapGhazalQuestion(
    question:
        AdminDraftMultipleChoiceQuestion,
): GhazalQuestion {
    const explanation =
        mapExplanation(
            question.explanation,
        );

    return {
        id:
            question.id,
        order:
            question.order,
        ...optionalSourceOrder(
            question.sourceOrder,
        ),
        question:
            question.question,
        options:
            question.options.map(
                (option) => ({
                    id:
                        toStandardOptionId(
                            option.id,
                        ),
                    text:
                        option.text,
                }),
            ),
        correctOptionId:
            toStandardOptionId(
                question.correctOptionId,
            ),
        score:
            2.5,
        ...(explanation
            ? {
                explanation,
            }
            : {}),
    };
}

function convertGhazalDraft(
    draft: AdminTestDraft,
): GhazalTestDefinition {
    const group =
        getOnlyPassageGroup(
            draft,
        );
    const content =
        parseGhazalContent(
            group,
        );
    const questions =
        group.questions.map(
            mapGhazalQuestion,
        );

    if (
        questions.length !== 5
    ) {
        fail(
            "G‘azal testi 5 ta savoldan iborat bo‘lishi kerak.",
        );
    }

    if (
        content.couplets.length ===
        0
    ) {
        fail(
            "G‘azal matnida kamida bitta bayt bo‘lishi kerak.",
        );
    }

    return {
        kind:
            "ghazal",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        title:
            group.title ??
            draft.metadata.title,
        description:
            draft.metadata.description,
        topic:
            "gazal",
        ...(content.author
            ? {
                author:
                    content.author,
            }
            : {}),
        instruction:
            group.instruction ??
            "G‘azalni o‘qing va savollarga javob bering.",
        couplets:
            content.couplets,
        vocabulary:
            content.vocabulary,
        questionCount:
            5,
        scorePerQuestion:
            2.5,
        maximumScore:
            12.5,
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
        access:
            draft.metadata.access,
        questions,
    };
}

function mapMixedVisual(
    question:
        AdminDraftMultipleChoiceQuestion,
): MixedQuestionVisual | undefined {
    const visual =
        question.visual;

    if (!visual) {
        return undefined;
    }

    if (
        visual.type ===
        "numbered-statements"
    ) {
        return {
            type:
                "numbered-statements",
            statements:
                visual.statements.map(
                    (statement) => ({
                        number:
                            statement.number,
                        text:
                            statement.text,
                    }),
                ),
        };
    }

    return {
        type:
            "word-diagram",
        nodes:
            visual.nodes.map(
                (node) => ({
                    id:
                        node.id,
                    text:
                        node.text,
                    role:
                        node.role,
                }),
            ),
        connections:
            visual.connections.map(
                (connection) => ({
                    from:
                        connection.from,
                    to:
                        connection.to,
                }),
            ),
    };
}

function mapMixedQuestion(
    question:
        AdminDraftQuestion,
): MixedQuestion {
    if (
        question.type ===
        "multiple-choice"
    ) {
        const image =
            mapImage(
                question.image,
            );
        const visual =
            mapMixedVisual(
                question,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "multiple-choice",
            id:
                question.id,
            order:
                question.order,
            ...optionalSourceOrder(
                question.sourceOrder,
            ),
            question:
                question.question,
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(visual
                ? {
                    visual,
                }
                : {}),
            options:
                question.options.map(
                    (option) => ({
                        id:
                            toMixedOptionId(
                                option.id,
                            ),
                        text:
                            option.text,
                    }),
                ),
            correctOptionId:
                toMixedOptionId(
                    question.correctOptionId,
                ),
            maximumScore:
                question.maximumScore,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    if (
        question.type ===
        "matching"
    ) {
        const image =
            mapImage(
                question.image,
            );
        const title =
            nonEmpty(
                question.title,
            );

        return {
            type:
                "matching-group",
            id:
                question.id,
            order:
                question.order,
            ...(title
                ? {
                    title,
                }
                : {}),
            instruction:
                question.instruction ??
                "Mos variantni tanlang.",
            ...(image
                ? {
                    image,
                }
                : {}),
            items:
                question.items.map(
                    (item) => {
                        const explanation =
                            mapExplanation(
                                item.explanation,
                            );

                        return {
                            id:
                                item.id,
                            order:
                                item.order,
                            ...optionalSourceOrder(
                                item.sourceOrder,
                            ),
                            prompt:
                                item.prompt,
                            correctChoiceId:
                                toMatchingChoiceId(
                                    item.correctChoiceId,
                                ),
                            maximumScore:
                                item.maximumScore,
                            ...(explanation
                                ? {
                                    explanation,
                                }
                                : {}),
                        };
                    },
                ),
            choices:
                question.choices.map(
                    (choice) => ({
                        id:
                            toMatchingChoiceId(
                                choice.id,
                            ),
                        text:
                            choice.text,
                    }),
                ),
        };
    }

    if (
        question.type ===
        "short-answer"
    ) {
        const image =
            mapImage(
                question.image,
            );
        const context =
            nonEmpty(
                question.context,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "short-answer",
            id:
                question.id,
            order:
                question.order,
            ...optionalSourceOrder(
                question.sourceOrder,
            ),
            question:
                question.question,
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(context
                ? {
                    context,
                }
                : {}),
            ...(question.examples &&
            question.examples.length > 0
                ? {
                    examples:
                        question.examples,
                }
                : {}),
            acceptedAnswers:
                question.acceptedAnswers,
            comparison:
                toWrittenComparison(
                    question.comparison,
                ),
            ...(question.requiredKeywords.length >
            0
                ? {
                    requiredKeywords:
                        question.requiredKeywords,
                }
                : {}),
            maximumScore:
                question.maximumScore,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    if (
        question.type ===
        "multipart"
    ) {
        const image =
            mapImage(
                question.image,
            );
        const context =
            nonEmpty(
                question.context,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "multipart",
            id:
                question.id,
            order:
                question.order,
            ...optionalSourceOrder(
                question.sourceOrder,
            ),
            question:
                question.question,
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(context
                ? {
                    context,
                }
                : {}),
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
            parts:
                question.parts.map(
                    (part) => {
                        const partExplanation =
                            explanation
                                ? undefined
                                : mapExplanation(
                                    part.explanation,
                                );
                        const isManualQuestion44Part =
                            question.sourceOrder ===
                                44 &&
                            toMultipartLabel(
                                part.label,
                            ) ===
                                "b";

                        return {
                            id:
                                part.id,
                            label:
                                toMultipartLabel(
                                    part.label,
                                ),
                            question:
                                part.prompt,
                            acceptedAnswers:
                                isManualQuestion44Part
                                    ? []
                                    : part.acceptedAnswers,
                            comparison:
                                isManualQuestion44Part
                                    ? "manual-review"
                                    : toWrittenComparison(
                                        part.comparison,
                                    ),
                            ...(
                                !isManualQuestion44Part &&
                                part.requiredKeywords.length >
                                    0
                                    ? {
                                        requiredKeywords:
                                            part.requiredKeywords,
                                    }
                                    : {}
                            ),
                            score:
                                isManualQuestion44Part
                                    ? 0
                                    : part.maximumScore,
                            ...(partExplanation
                                ? {
                                    explanation:
                                        partExplanation,
                                }
                                : {}),
                        };
                    },
                ),
            maximumScore:
                question.sourceOrder ===
                44
                    ? question.parts.reduce(
                        (
                            total,
                            part,
                        ) =>
                            total +
                            (
                                toMultipartLabel(
                                    part.label,
                                ) ===
                                "b"
                                    ? 0
                                    : part.maximumScore
                            ),
                        0,
                    )
                    : question.maximumScore,
        };
    }

    return fail(
        "Aralash student testida passage-group yoki esse nashr qilinmaydi.",
    );
}

function findInstruction(
    draft: AdminTestDraft,
    fallback: string,
): string {
    for (
        const question
        of draft.questions
    ) {
        const instruction =
            nonEmpty(
                question.instruction,
            );

        if (instruction) {
            return instruction;
        }
    }

    return fallback;
}

function calculatePublishedMixedMaximumScore(
    draft:
        AdminTestDraft,
): number {
    const baseScore =
        calculateAdminDraftMaximumScore(
            draft,
        );

    const excludedManualScore =
        draft.questions.reduce(
            (
                total,
                question,
            ) => {
                if (
                    question.type !==
                        "multipart" ||
                    question.sourceOrder !==
                        44
                ) {
                    return total;
                }

                return (
                    total +
                    question.parts.reduce(
                        (
                            partTotal,
                            part,
                        ) =>
                            partTotal +
                            (
                                toMultipartLabel(
                                    part.label,
                                ) ===
                                "b"
                                    ? part.maximumScore
                                    : 0
                            ),
                        0,
                    )
                );
            },
            0,
        );

    return (
        Math.round(
            (
                baseScore -
                excludedManualScore
            ) *
                100,
        ) /
        100
    );
}

function convertMixedDraft(
    draft: AdminTestDraft,
): MixedTestDefinition {
    return {
        kind:
            "mixed",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        topic:
            draft.metadata.group === "grammar" &&
            draft.metadata.topicSlug === "sintaksis"
                ? "sintaksis"
                : "aralash",
        title:
            draft.metadata.title,
        description:
            draft.metadata.description,
        instruction:
            findInstruction(
                draft,
                "Topshiriqlarni bajaring.",
            ),
        taskCount:
            calculateAdminDraftTaskCount(
                draft,
            ),
        maximumScore:
            calculatePublishedMixedMaximumScore(
                draft,
            ),
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
        access:
            draft.metadata.access,
        questions:
            draft.questions.map(
                mapMixedQuestion,
            ),
    };
}

function toDiagnosticSection(
    section:
        AdminDraftQuestionSection,
): DiagnosticQuestionSection {
    if (
        section === "grammar" ||
        section === "literature" ||
        section === "scientific-text" ||
        section === "literary-text" ||
        section === "ghazal" ||
        section === "syntax" ||
        section === "written" ||
        section === "essay"
    ) {
        return section;
    }

    return fail(
        "Diagnostika savol bo‘limi aniqlanmagan.",
    );
}

function mapDiagnosticQuestion(
    question:
        AdminDraftQuestion,
): DiagnosticQuestion {
    if (
        question.type ===
        "multiple-choice"
    ) {
        const context =
            nonEmpty(
                question.context,
            );
        const image =
            mapDiagnosticImage(
                question.image,
            );
        const visual =
            mapMixedVisual(
                question,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "multiple-choice",
            id:
                question.id,
            order:
                question.sourceOrder ??
                question.order,
            section:
                toDiagnosticSection(
                    question.section,
                ),
            question:
                question.question,
            ...(context
                ? {
                    context,
                }
                : {}),
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(visual
                ? {
                    visual,
                }
                : {}),
            options:
                question.options.map(
                    (option) => ({
                        id:
                            toMixedOptionId(
                                option.id,
                            ),
                        text:
                            option.text,
                    }),
                ),
            correctOptionId:
                toMixedOptionId(
                    question.correctOptionId,
                ),
            maximumScore:
                question.maximumScore,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    if (
        question.type ===
        "passage-group"
    ) {
        const title =
            nonEmpty(
                question.title,
            );

        return {
            type:
                "passage-group",
            id:
                question.id,
            order:
                question.order,
            section:
                toDiagnosticSection(
                    question.section,
                ),
            ...(title
                ? {
                    title,
                }
                : {}),
            instruction:
                question.instruction ??
                "Matnni o‘qing va savollarga javob bering.",
            passage:
                question.passage.map(
                    (block) => {
                        const marker =
                            nonEmpty(
                                block.marker,
                            );

                        return {
                            id:
                                block.id,
                            type:
                                block.type,
                            ...(marker
                                ? {
                                    marker,
                                }
                                : {}),
                            text:
                                block.speaker
                                    ? `${block.speaker}: ${block.text}`
                                    : block.text,
                        };
                    },
                ),
            questions:
                question.questions.map(
                    (nestedQuestion) => {
                        const mapped =
                            mapDiagnosticQuestion(
                                nestedQuestion,
                            );

                        if (
                            mapped.type !==
                            "multiple-choice"
                        ) {
                            return fail(
                                "Passage-group ichida faqat variantli savol bo‘lishi mumkin.",
                            );
                        }

                        return mapped;
                    },
                ),
        };
    }

    if (
        question.type ===
        "matching"
    ) {
        const title =
            nonEmpty(
                question.title,
            );
        const image =
            mapDiagnosticImage(
                question.image,
            );

        return {
            type:
                "matching-group",
            id:
                question.id,
            order:
                question.order,
            section:
                toDiagnosticSection(
                    question.section,
                ),
            ...(title
                ? {
                    title,
                }
                : {}),
            instruction:
                question.instruction ??
                "Mos variantni tanlang.",
            ...(image
                ? {
                    image,
                }
                : {}),
            items:
                question.items.map(
                    (item) => {
                        const explanation =
                            mapExplanation(
                                item.explanation,
                            );

                        return {
                            id:
                                item.id,
                            order:
                                item.sourceOrder ??
                                item.order,
                            prompt:
                                item.prompt,
                            correctChoiceId:
                                toMatchingChoiceId(
                                    item.correctChoiceId,
                                ),
                            maximumScore:
                                item.maximumScore,
                            ...(explanation
                                ? {
                                    explanation,
                                }
                                : {}),
                        };
                    },
                ),
            choices:
                question.choices.map(
                    (choice) => ({
                        id:
                            toMatchingChoiceId(
                                choice.id,
                            ),
                        text:
                            choice.text,
                    }),
                ),
        };
    }

    if (
        question.type ===
        "short-answer"
    ) {
        const context =
            nonEmpty(
                question.context,
            );
        const image =
            mapDiagnosticImage(
                question.image,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "short-answer",
            id:
                question.id,
            order:
                question.sourceOrder ??
                question.order,
            section:
                toDiagnosticSection(
                    question.section,
                ),
            question:
                question.question,
            ...(context
                ? {
                    context,
                }
                : {}),
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(question.examples &&
            question.examples.length > 0
                ? {
                    examples:
                        question.examples,
                }
                : {}),
            acceptedAnswers:
                question.acceptedAnswers,
            comparison:
                toWrittenComparison(
                    question.comparison,
                ),
            ...(question.requiredKeywords.length >
            0
                ? {
                    requiredKeywords:
                        question.requiredKeywords,
                }
                : {}),
            maximumScore:
                question.maximumScore,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    if (
        question.type ===
        "multipart"
    ) {
        const context =
            nonEmpty(
                question.context,
            );
        const image =
            mapDiagnosticImage(
                question.image,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );

        return {
            type:
                "multipart",
            id:
                question.id,
            order:
                question.sourceOrder ??
                question.order,
            section:
                toDiagnosticSection(
                    question.section,
                ),
            question:
                question.question,
            ...(context
                ? {
                    context,
                }
                : {}),
            ...(image
                ? {
                    image,
                }
                : {}),
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
            parts:
                question.parts.map(
                    (part) => {
                        const partExplanation =
                            explanation
                                ? undefined
                                : mapExplanation(
                                    part.explanation,
                                );

                        return {
                            id:
                                part.id,
                            label:
                                toMultipartLabel(
                                    part.label,
                                ),
                            question:
                                part.prompt,
                            acceptedAnswers:
                                part.acceptedAnswers,
                            comparison:
                                toWrittenComparison(
                                    part.comparison,
                                ),
                            ...(part.requiredKeywords.length >
                            0
                                ? {
                                    requiredKeywords:
                                        part.requiredKeywords,
                                }
                                : {}),
                            score:
                                part.maximumScore,
                            ...(partExplanation
                                ? {
                                    explanation:
                                        partExplanation,
                                }
                                : {}),
                        };
                    },
                ),
            maximumScore:
                question.maximumScore,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    if (
        question.type ===
        "essay"
    ) {
        const situation =
            nonEmpty(
                question.context,
            );
        const explanation =
            mapExplanation(
                question.explanation,
            );
        // Q45 is display-only in the diagnostic runner. Word-count fields are optional.
        const minimumWords =
            question.requirements.minimumWords ?? 0;

        return {
            type:
                "essay",
            id:
                question.id,
            order:
                45,
            section:
                "essay",
            title:
                question.topic.trim() ||
                "Esse",
            prompt:
                question.question,
            ...(situation
                ? {
                    situation,
                }
                : {}),
            requirements: {
                minimumWords,
                ...(question.requirements
                    .recommendedWords !==
                    null &&
                question.requirements
                    .recommendedWords !==
                    undefined
                    ? {
                        recommendedWords:
                            question.requirements
                                .recommendedWords,
                    }
                    : {}),
                introduction:
                    question.requirements
                        .introduction ??
                    [],
                body:
                    question.requirements
                        .body ??
                    [],
                conclusion:
                    question.requirements
                        .conclusion ??
                    [],
                ...(question.requirements
                    .warnings &&
                question.requirements
                    .warnings.length > 0
                    ? {
                        warnings:
                            question.requirements
                                .warnings,
                    }
                    : {}),
            },
            // Essay score is optionally supplied from a previous essay result (0–75).
            // The displayed Q45 itself is not auto-scored.
            maximumScore:
                0,
            ...(explanation
                ? {
                    explanation,
                }
                : {}),
        };
    }

    return fail(
        "Diagnostika savol turi qo‘llab-quvvatlanmaydi.",
    );
}

function convertDiagnosticDraft(
    draft: AdminTestDraft,
): DiagnosticTestDefinition {
    return {
        kind:
            "diagnostic",
        id:
            draft.id,
        slug:
            draft.metadata.slug,
        topic:
            "diagnostika",
        title:
            draft.metadata.title,
        description:
            draft.metadata.description,
        instruction:
            findInstruction(
                draft,
                "Barcha topshiriqlarni ketma-ket bajaring.",
            ),
        questionCount:
            45,
        estimatedMinutes:
            180,
        // Questions 1–44 are normalized to the TA’LIMOT 75-point test scale.
        maximumScore:
            75,
        difficulty:
            draft.metadata.difficulty,
        access:
            draft.metadata.access,
        questions:
            draft.questions.map(
                mapDiagnosticQuestion,
            ),
    };
}

export function convertAdminTestDraftToStudentTest(
    draft: AdminTestDraft,
): PublishedAdminStudentTest {
    if (
        draft.metadata.format ===
            "standard" ||
        draft.metadata.format ===
            "morphology-standard"
    ) {
        return convertStandardDraft(
            draft,
        );
    }

    if (
        draft.metadata.format ===
        "standard-five"
    ) {
        return convertStandardFiveDraft(
            draft,
        );
    }

    if (
        draft.metadata.format ===
        "passage-five"
    ) {
        return draft.metadata.topicSlug ===
            "gazal"
            ? convertGhazalDraft(
                draft,
            )
            : convertPassageFiveDraft(
                draft,
            );
    }

    if (
        draft.metadata.format ===
        "mixed"
    ) {
        return convertMixedDraft(
            draft,
        );
    }

    if (
        draft.metadata.format ===
        "diagnostic"
    ) {
        return convertDiagnosticDraft(
            draft,
        );
    }

    return fail(
        "Draft formati student testiga aylantirilmaydi.",
    );
}
