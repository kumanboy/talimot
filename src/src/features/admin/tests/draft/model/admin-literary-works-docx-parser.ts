import {
    normalizeAdminDocxLine,
} from "./admin-standard-mcq-parser";
import type {
    AdminLiteraryWorksDocxParseResult,
    AdminParsedStandardFiveQuestion,
} from "./admin-literary-works-docx-parser-types";

type OptionId =
    "A" | "B" | "C" | "D";

interface WorkingQuestion {
    sourceNumber:
        number;
    promptParts:
        string[];
    excerpt:
        string[];
    questionParts:
        string[];
    options:
        Map<OptionId, string[]>;
    mode:
        | "question"
        | "prompt"
        | "excerpt"
        | "option";
    activeOption:
        OptionId | null;
}

const questionStartPattern =
    /^(?:SAVOL\s*)?(\d{1,3})\s*[\.\):\-]\s*(.*)$/iu;

const optionStartPattern =
    /^([A-D])\s*[\.\):\-]\s*(.*)$/iu;

const compactAnswerKeyPattern =
    /(\d{1,3})\s*(?:=|[-–—:]|\))\s*([A-D])\b/giu;

function normalizeHeading(
    value:
        string,
): string {
    return normalizeAdminDocxLine(
        value,
    )
        .toLocaleUpperCase(
            "uz",
        )
        .replace(
            /[‘’ʻʼ`´]/gu,
            "ʻ",
        );
}

function splitLines(
    rawText:
        string,
): readonly string[] {
    return rawText
        .replace(
            /\r\n?/gu,
            "\n",
        )
        .split(
            "\n",
        )
        .map(
            (line) =>
                line
                    .replace(
                        /\u00a0/gu,
                        " ",
                    )
                    .replace(
                        /[\t ]+/gu,
                        " ",
                    )
                    .trim(),
        );
}

function readMetadataValue(
    lines:
        readonly string[],
    label:
        string,
): string | null {
    const normalizedLabel =
        normalizeHeading(
            label,
        );

    for (
        const line
        of lines
    ) {
        const colonIndex =
            line.indexOf(
                ":",
            );

        if (
            colonIndex <
            0
        ) {
            continue;
        }

        const key =
            normalizeHeading(
                line.slice(
                    0,
                    colonIndex,
                ),
            );

        if (
            key !==
            normalizedLabel
        ) {
            continue;
        }

        return (
            line.slice(
                colonIndex +
                1,
            ).trim() ||
            null
        );
    }

    return null;
}

function findHeading(
    lines:
        readonly string[],
    candidates:
        readonly string[],
): number {
    const headings =
        candidates.map(
            normalizeHeading,
        );

    return lines.findIndex(
        (line) =>
            headings.includes(
                normalizeHeading(
                    line,
                ),
            ),
    );
}

function extractAnswerKey(
    lines:
        readonly string[],
): ReadonlyMap<number, OptionId> {
    const answers =
        new Map<number, OptionId>();

    for (
        const line
        of lines
    ) {
        compactAnswerKeyPattern.lastIndex =
            0;

        let match:
            RegExpExecArray | null;

        while (
            (
                match =
                    compactAnswerKeyPattern.exec(
                        line,
                    )
            ) !== null
        ) {
            const sourceNumber =
                Number(
                    match[1],
                );

            const optionId =
                match[2] as
                    OptionId;

            if (
                Number.isInteger(
                    sourceNumber,
                )
            ) {
                answers.set(
                    sourceNumber,
                    optionId,
                );
            }
        }
    }

    return answers;
}

function createWorkingQuestion(
    sourceNumber:
        number,
    firstText:
        string,
): WorkingQuestion {
    return {
        sourceNumber,
        promptParts:
            [],
        excerpt:
            [],
        questionParts:
            firstText
                ? [
                    firstText,
                ]
                : [],
        options:
            new Map(),
        mode:
            "question",
        activeOption:
            null,
    };
}

function appendCurrentLine(
    working:
        WorkingQuestion,
    text:
        string,
) {
    if (!text) {
        return;
    }

    if (
        working.mode ===
            "prompt"
    ) {
        working.promptParts.push(
            text,
        );
        return;
    }

    if (
        working.mode ===
            "excerpt"
    ) {
        working.excerpt.push(
            text,
        );
        return;
    }

    if (
        working.mode ===
            "option" &&
        working.activeOption
    ) {
        const current =
            working.options.get(
                working.activeOption,
            ) ??
            [];

        working.options.set(
            working.activeOption,
            [
                ...current,
                text,
            ],
        );
        return;
    }

    working.questionParts.push(
        text,
    );
}

function finalizeQuestion(
    working:
        WorkingQuestion,
    answerKey:
        ReadonlyMap<number, OptionId>,
): AdminParsedStandardFiveQuestion {
    const issues:
        string[] = [];

    const prompt =
        working.promptParts
            .join(
                " ",
            )
            .trim() ||
        null;

    const excerpt =
        working.excerpt
            .map(
                (line) =>
                    line.trim(),
            )
            .filter(
                Boolean,
            );

    const question =
        working.questionParts
            .join(
                " ",
            )
            .trim();

    if (!question) {
        issues.push(
            "Savol matni topilmadi.",
        );
    }

    const optionIds:
        readonly OptionId[] = [
            "A",
            "B",
            "C",
            "D",
        ];

    const options =
        optionIds
            .filter(
                (optionId) =>
                    working.options.has(
                        optionId,
                    ),
            )
            .map(
                (optionId) => ({
                    id:
                        optionId,
                    text:
                        (
                            working.options.get(
                                optionId,
                            ) ??
                            []
                        )
                            .join(
                                " ",
                            )
                            .trim(),
                }),
            );

    for (
        const optionId
        of optionIds
    ) {
        if (
            !working.options.has(
                optionId,
            )
        ) {
            issues.push(
                `${optionId} varianti topilmadi.`,
            );
        }
    }

    if (
        options.some(
            (option) =>
                !option.text,
        )
    ) {
        issues.push(
            "Variantlardan birining matni bo‘sh.",
        );
    }

    const correctOptionId =
        answerKey.get(
            working.sourceNumber,
        ) ??
        null;

    if (
        !correctOptionId
    ) {
        issues.push(
            "Javob kaliti topilmadi.",
        );
    }

    let confidenceScore =
        100;

    if (!question) {
        confidenceScore -=
            35;
    }

    confidenceScore -=
        Math.max(
            0,
            4 -
            options.length,
        ) *
        18;

    if (
        options.some(
            (option) =>
                !option.text,
        )
    ) {
        confidenceScore -=
            15;
    }

    if (
        !correctOptionId
    ) {
        confidenceScore -=
            20;
    }

    confidenceScore =
        Math.max(
            0,
            confidenceScore,
        );

    const confidence =
        !question ||
        options.length !==
            4 ||
        options.some(
            (option) =>
                !option.text,
        )
            ? "invalid"
            : correctOptionId
                ? "high"
                : "review";

    return {
        sourceNumber:
            working.sourceNumber,
        prompt,
        excerpt,
        question,
        options,
        correctOptionId,
        confidence,
        confidenceScore,
        issues,
    };
}

export function parseLiteraryWorksDocxDocument(
    rawText:
        string,
): AdminLiteraryWorksDocxParseResult | null {
    const lines =
        splitLines(
            rawText,
        );

    const typeDetected =
        lines.some(
            (line) =>
                /^TEST\s+TURI\s*:\s*(?:BADIIY|ADABIY)\s+ASARLAR$/iu.test(
                    line,
                ),
        );

    const questionsIndex =
        findHeading(
            lines,
            [
                "SAVOLLAR",
                "TOPSHIRIQLAR",
            ],
        );

    if (
        !typeDetected &&
        questionsIndex <
            0
    ) {
        return null;
    }

    const answersIndex =
        findHeading(
            lines,
            [
                "JAVOBLAR",
                "JAVOBLAR KALITI",
            ],
        );

    const answerKey =
        extractAnswerKey(
            answersIndex >=
            0
                ? lines.slice(
                    answersIndex,
                )
                : lines,
        );

    const questionLines =
        lines.slice(
            questionsIndex >=
            0
                ? questionsIndex +
                    1
                : 0,
            answersIndex >=
                0
                ? answersIndex
                : lines.length,
        );

    const workingQuestions:
        WorkingQuestion[] = [];

    let current:
        WorkingQuestion | null =
        null;

    for (
        const line
        of questionLines
    ) {
        if (!line) {
            continue;
        }

        const questionMatch =
            questionStartPattern.exec(
                line,
            );

        if (
            questionMatch
        ) {
            if (current) {
                workingQuestions.push(
                    current,
                );
            }

            current =
                createWorkingQuestion(
                    Number(
                        questionMatch[1],
                    ),
                    questionMatch[2]?.trim() ??
                    "",
                );

            continue;
        }

        if (!current) {
            continue;
        }

        const normalized =
            normalizeHeading(
                line,
            );

        if (
            normalized.startsWith(
                "PROMPT:",
            ) ||
            normalized.startsWith(
                "KOʻRSATMA:",
            )
        ) {
            current.mode =
                "prompt";
            current.activeOption =
                null;

            appendCurrentLine(
                current,
                line.slice(
                    line.indexOf(
                        ":",
                    ) +
                    1,
                ).trim(),
            );
            continue;
        }

        if (
            normalized ===
                "PARCHA" ||
            normalized ===
                "PARCHA:" ||
            normalized ===
                "IQTIBOS" ||
            normalized ===
                "IQTIBOS:"
        ) {
            current.mode =
                "excerpt";
            current.activeOption =
                null;
            continue;
        }

        if (
            normalized.startsWith(
                "PARCHA:",
            ) ||
            normalized.startsWith(
                "IQTIBOS:",
            )
        ) {
            current.mode =
                "excerpt";
            current.activeOption =
                null;

            appendCurrentLine(
                current,
                line.slice(
                    line.indexOf(
                        ":",
                    ) +
                    1,
                ).trim(),
            );
            continue;
        }

        if (
            normalized.startsWith(
                "SAVOL:",
            )
        ) {
            current.mode =
                "question";
            current.activeOption =
                null;

            appendCurrentLine(
                current,
                line.slice(
                    line.indexOf(
                        ":",
                    ) +
                    1,
                ).trim(),
            );
            continue;
        }

        const optionMatch =
            optionStartPattern.exec(
                line,
            );

        if (
            optionMatch
        ) {
            const optionId =
                optionMatch[1] as
                    OptionId;

            current.mode =
                "option";
            current.activeOption =
                optionId;
            current.options.set(
                optionId,
                [
                    optionMatch[2]?.trim() ??
                    "",
                ],
            );
            continue;
        }

        appendCurrentLine(
            current,
            line,
        );
    }

    if (current) {
        workingQuestions.push(
            current,
        );
    }

    const questions =
        workingQuestions.map(
            (working) =>
                finalizeQuestion(
                    working,
                    answerKey,
                ),
        );

    const highConfidenceCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "high",
        ).length;

    const reviewCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "review",
        ).length;

    const invalidCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "invalid",
        ).length;

    const issues:
        string[] = [];

    if (
        questions.length !==
        5
    ) {
        issues.push(
            `5 ta savol kutilgan edi, ${questions.length} ta topildi.`,
        );
    }

    if (
        invalidCount >
        0
    ) {
        issues.push(
            `${invalidCount} ta savol import uchun yaroqsiz.`,
        );
    }

    if (
        answerKey.size <
        questions.length
    ) {
        issues.push(
            "Barcha savollar uchun javob kaliti topilmadi.",
        );
    }

    const confidenceScore =
        questions.length >
        0
            ? Math.round(
                questions.reduce(
                    (
                        total,
                        question,
                    ) =>
                        total +
                        question.confidenceScore,
                    0,
                ) /
                questions.length,
            )
            : 0;

    const confidence =
        questions.length ===
            0 ||
        invalidCount >
            0
            ? "invalid"
            : questions.length ===
                    5 &&
                reviewCount ===
                    0
                ? "high"
                : "review";

    return {
        metadata: {
            title:
                readMetadataValue(
                    lines,
                    "SARLAVHA",
                ),
            description:
                readMetadataValue(
                    lines,
                    "TAVSIF",
                ),
            instruction:
                readMetadataValue(
                    lines,
                    "KOʻRSATMA",
                ),
        },
        questions,
        answerKeyCount:
            answerKey.size,
        highConfidenceCount,
        reviewCount,
        invalidCount,
        confidence,
        confidenceScore,
        issues,
    };
}
