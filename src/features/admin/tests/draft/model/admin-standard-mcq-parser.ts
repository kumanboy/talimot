import type {
    AdminParsedMcqOption,
    AdminParsedMcqQuestion,
    AdminStandardMcqParseResult,
} from "./admin-docx-parser-types";

type OptionId =
    AdminParsedMcqOption["id"];

interface WorkingQuestion {
    sourceNumber:
        number;
    questionParts:
        string[];
    options:
        Map<OptionId, string[]>;
    sourceLines:
        string[];
}

const questionStartPattern =
    /^(?:savol\s*)?(\d{1,3})\s*[\.\):\-]\s*(\S.*)$/iu;

const optionStartPattern =
    /^([A-D])\s*[\.\):\-]\s*(\S.*)$/iu;

const answerLinePattern =
    /^(?:javob|to['ʻʼ‘’`´]g['ʻʼ‘’`´]ri\s+javob)\s*[:\-]\s*([A-D])\s*$/iu;

const compactAnswerKeyPattern =
    /(\d{1,3})\s*(?:=|[-–—:]|\))\s*([A-D])\b/giu;

const compactAnswerKeyLinePattern =
    /^(\d{1,3})\s*(?:[\.\):=]|[-–—])\s*([A-D])\s*$/iu;

const headingPatterns =
    [
        /^#\s*/u,
        /^test\b/iu,
        /^savollar\b/iu,
        /^javoblar\b/iu,
        /^javoblar\s+kaliti\b/iu,
        /^to['ʻʼ‘’`´]g['ʻʼ‘’`´]ri\s+javoblar\s+kaliti\b/iu,
        /^imlo\s+tip\b/iu,
    ];

function normalizeApostrophes(
    value: string,
): string {
    return value
        .replace(
            /[\u2018\u2019\u02BB\u02BC\u0060\u00B4]/gu,
            "ʻ",
        );
}

export function normalizeAdminDocxLine(
    value: string,
): string {
    return normalizeApostrophes(
        value
            .replace(
                /\u00A0/gu,
                " ",
            )
            .replace(
                /[\t ]+/gu,
                " ",
            )
            .trim(),
    );
}

export function splitAdminDocxRawText(
    rawText: string,
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
            normalizeAdminDocxLine,
        )
        .filter(
            Boolean,
        );
}

function isStructuralHeading(
    line: string,
): boolean {
    return headingPatterns.some(
        (pattern) =>
            pattern.test(
                line,
            ),
    );
}

function extractAnswerKey(
    lines:
        readonly string[],
): Map<number, OptionId> {
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
            const number =
                Number(
                    match[1],
                );

            const option =
                match[2] as
                    OptionId;

            if (
                Number.isInteger(
                    number,
                )
            ) {
                answers.set(
                    number,
                    option,
                );
            }
        }
    }

    return answers;
}

function createWorkingQuestion(
    sourceNumber:
        number,
    question:
        string,
    sourceLine:
        string,
): WorkingQuestion {
    return {
        sourceNumber,
        questionParts: [
            question,
        ],
        options:
            new Map(),
        sourceLines: [
            sourceLine,
        ],
    };
}

function appendOption(
    working:
        WorkingQuestion,
    optionId:
        OptionId,
    text:
        string,
) {
    const current =
        working.options.get(
            optionId,
        ) ?? [];

    working.options.set(
        optionId,
        [
            ...current,
            text,
        ],
    );
}

function finalizeQuestion(
    working:
        WorkingQuestion,
    answerKey:
        ReadonlyMap<number, OptionId>,
): AdminParsedMcqQuestion {
    const issues:
        string[] = [];

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

    const expectedOptions:
        readonly OptionId[] = [
            "A",
            "B",
            "C",
            "D",
        ];

    const options =
        expectedOptions
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
                            ) ?? []
                        )
                            .join(
                                " ",
                            )
                            .trim(),
                }),
            );

    for (
        const optionId
        of expectedOptions
    ) {
        const optionParts =
            working.options.get(
                optionId,
            );

        if (!optionParts) {
            issues.push(
                `${optionId} varianti topilmadi.`,
            );
            continue;
        }

        if (
            optionParts.length >
            1
        ) {
            issues.push(
                `${optionId} varianti bir necha marta uchradi.`,
            );
        }

        if (
            optionParts
                .join(
                    " ",
                )
                .trim()
                .length ===
            0
        ) {
            issues.push(
                `${optionId} varianti bo‘sh.`,
            );
        }
    }

    const correctOptionId =
        answerKey.get(
            working.sourceNumber,
        ) ??
        null;

    if (!correctOptionId) {
        issues.push(
            "To‘g‘ri javob kaliti topilmadi.",
        );
    }

    const fatalIssue =
        !question ||
        options.length <
            4;

    const confidence =
        fatalIssue
            ? "invalid"
            : correctOptionId
              ? "high"
              : "review";

    const confidenceScore =
        confidence ===
        "high"
            ? 100
            : confidence ===
              "review"
              ? 75
              : Math.max(
                    10,
                    25 +
                        options.length *
                            12,
                );

    return {
        sourceNumber:
            working.sourceNumber,
        question,
        options,
        correctOptionId,
        confidence,
        confidenceScore,
        issues,
        sourceLines:
            working.sourceLines,
    };
}

export function parseStandardMcqDocument(
    rawText: string,
): AdminStandardMcqParseResult {
    const lines =
        splitAdminDocxRawText(
            rawText,
        );

    const answerKey =
        extractAnswerKey(
            lines,
        );

    const questions:
        AdminParsedMcqQuestion[] = [];

    const orphanLines:
        string[] = [];

    let current:
        WorkingQuestion | null =
            null;

    let activeOption:
        OptionId | null =
            null;

    function flushCurrent() {
        if (!current) {
            return;
        }

        questions.push(
            finalizeQuestion(
                current,
                answerKey,
            ),
        );

        current =
            null;

        activeOption =
            null;
    }

    for (
        const line
        of lines
    ) {
        // Important: answer-key rows such as "1. B" also resemble
        // numbered questions. Consume them first so they cannot replace
        // the real question with the same source number.
        if (
            compactAnswerKeyLinePattern.test(
                line,
            )
        ) {
            continue;
        }

        const questionMatch =
            questionStartPattern.exec(
                line,
            );

        if (questionMatch) {
            flushCurrent();

            current =
                createWorkingQuestion(
                    Number(
                        questionMatch[1],
                    ),
                    questionMatch[2] ??
                        "",
                    line,
                );

            continue;
        }

        const optionMatch =
            optionStartPattern.exec(
                line,
            );

        if (
            optionMatch &&
            current
        ) {
            const optionId =
                optionMatch[1] as
                    OptionId;

            appendOption(
                current,
                optionId,
                optionMatch[2] ??
                    "",
            );

            current.sourceLines.push(
                line,
            );

            activeOption =
                optionId;

            continue;
        }

        if (
            current &&
            answerLinePattern.test(
                line,
            )
        ) {
            const answerMatch =
                answerLinePattern.exec(
                    line,
                );

            if (
                answerMatch?.[1]
            ) {
                answerKey.set(
                    current.sourceNumber,
                    answerMatch[1] as
                        OptionId,
                );
            }

            current.sourceLines.push(
                line,
            );

            continue;
        }

        if (current) {
            current.sourceLines.push(
                line,
            );

            if (
                activeOption
            ) {
                appendOption(
                    current,
                    activeOption,
                    line,
                );
            } else {
                current.questionParts.push(
                    line,
                );
            }

            continue;
        }

        if (
            !isStructuralHeading(
                line,
            ) &&
            !compactAnswerKeyPattern.test(
                line,
            )
        ) {
            orphanLines.push(
                line,
            );
        }

        compactAnswerKeyPattern.lastIndex =
            0;
    }

    flushCurrent();

    return {
        questions,
        orphanLines,
        answerKeyCount:
            answerKey.size,
        highConfidenceCount:
            questions.filter(
                (question) =>
                    question.confidence ===
                    "high",
            ).length,
        reviewCount:
            questions.filter(
                (question) =>
                    question.confidence ===
                    "review",
            ).length,
        invalidCount:
            questions.filter(
                (question) =>
                    question.confidence ===
                    "invalid",
            ).length,
    };
}
