import {
    parseMixedDocxDocument,
} from "./admin-mixed-docx-parser";
import type {
    AdminDocxParserConfidence,
    AdminParsedMcqOption,
} from "./admin-docx-parser-types";
import type {
    AdminParsedMixedMultipleChoiceQuestion,
} from "./admin-mixed-docx-parser-types";
import type {
    AdminDiagnosticDocxParseResult,
    AdminParsedDiagnosticEssayQuestion,
    AdminParsedDiagnosticPassageBlock,
    AdminParsedDiagnosticPassageGroup,
    AdminParsedDiagnosticQuestion,
    AdminParsedDiagnosticQuestionSection,
    AdminParsedDiagnosticRegularQuestion,
} from "./admin-diagnostic-docx-parser-types";

const diagnosticTypePattern =
    /^TEST\s+TURI\s*:\s*(?:DIAGNOSTIKA|DIAGNOSTIC)$/imu;

const questionHeadingPattern =
    /^(?:SAVOL|QUESTION)\s+(\d{1,3})(?:\s*[-–—:]\s*(.*))?$/iu;

const fieldPattern =
    /^([A-ZА-ЯOʻGʻQ‘’ʼ' -]+)\s*:\s*(.*)$/u;

const nestedQuestionPattern =
    /^(\d{1,3})\s*[\.\):-]\s*SAVOL\s*:\s*(.*)$/iu;

const optionPattern =
    /^([A-D])\s*[\)\.\-:]\s*(.*)$/u;

function sectionFromSourceOrder(
    sourceOrder:
        number,
): AdminParsedDiagnosticQuestionSection {
    if (sourceOrder <= 12) {
        return "grammar";
    }

    if (sourceOrder <= 17) {
        return "literature";
    }

    if (sourceOrder <= 22) {
        return "scientific-text";
    }

    if (sourceOrder <= 27) {
        return "literary-text";
    }

    if (sourceOrder <= 32) {
        return "ghazal";
    }

    if (sourceOrder <= 35) {
        return "syntax";
    }

    if (sourceOrder <= 44) {
        return "written";
    }

    return "essay";
}

function normalizeLine(
    value:
        string,
): string {
    return value
        .replace(
            /\u00a0/gu,
            " ",
        )
        .replace(
            /[‘’ʻʼ`´]/gu,
            "ʻ",
        )
        .replace(
            /\s+/gu,
            " ",
        )
        .trim();
}

function normalizeKey(
    value:
        string,
): string {
    return normalizeLine(
        value,
    ).toLocaleUpperCase(
        "uz",
    );
}

function parseNumber(
    value:
        string | null,
): number | null {
    if (!value) {
        return null;
    }

    const match =
        /-?\d+(?:[\.,]\d+)?/u.exec(
            value,
        );

    if (!match?.[0]) {
        return null;
    }

    const parsed =
        Number(
            match[0].replace(
                ",",
                ".",
            ),
        );

    return Number.isFinite(
        parsed,
    )
        ? parsed
        : null;
}

function collectFields(
    lines:
        readonly string[],
): ReadonlyMap<
    string,
    readonly string[]
> {
    const fields =
        new Map<
            string,
            string[]
        >();

    let activeKey:
        string | null =
        null;

    for (
        const rawLine of
        lines
    ) {
        const line =
            rawLine.trim();

        if (!line) {
            continue;
        }

        const match =
            fieldPattern.exec(
                line,
            );

        if (
            match?.[1] !==
            undefined
        ) {
            activeKey =
                normalizeKey(
                    match[1],
                );

            fields.set(
                activeKey,
                match[2]
                    ? [
                        match[2].trim(),
                    ]
                    : [],
            );

            continue;
        }

        if (activeKey) {
            fields.set(
                activeKey,
                [
                    ...(fields.get(
                        activeKey,
                    ) ?? []),
                    line,
                ],
            );
        }
    }

    return fields;
}

function first(
    fields:
        ReadonlyMap<
            string,
            readonly string[]
        >,
    ...keys:
        readonly string[]
): string | null {
    for (
        const key of
        keys
    ) {
        const value =
            fields
                .get(
                    normalizeKey(
                        key,
                    ),
                )
                ?.join(
                    "\n",
                )
                .trim();

        if (value) {
            return value;
        }
    }

    return null;
}

function list(
    fields:
        ReadonlyMap<
            string,
            readonly string[]
        >,
    ...keys:
        readonly string[]
): readonly string[] {
    const values =
        keys.flatMap(
            (key) =>
                fields.get(
                    normalizeKey(
                        key,
                    ),
                ) ??
                [],
        );

    return values
        .flatMap(
            (value) =>
                value.split(
                    /\s*[;|]\s*/gu,
                ),
        )
        .map(
            (item) =>
                item
                    .replace(
                        /^[-•]\s*/u,
                        "",
                    )
                    .trim(),
        )
        .filter(
            Boolean,
        );
}

function confidenceFromIssues(
    issues:
        readonly string[],
    fatal:
        boolean,
): {
    readonly confidence:
        AdminDocxParserConfidence;
    readonly confidenceScore:
        number;
} {
    if (fatal) {
        return {
            confidence:
                "invalid",
            confidenceScore:
                Math.max(
                    10,
                    45 -
                        issues.length *
                            5,
                ),
        };
    }

    if (
        issues.length >
        0
    ) {
        return {
            confidence:
                "review",
            confidenceScore:
                Math.max(
                    55,
                    88 -
                        issues.length *
                            7,
                ),
        };
    }

    return {
        confidence:
            "high",
        confidenceScore:
            100,
    };
}

function parsePassageBlocks(
    lines:
        readonly string[],
    section:
        AdminParsedDiagnosticPassageGroup["section"],
): readonly AdminParsedDiagnosticPassageBlock[] {
    return lines
        .flatMap(
            (
                rawLine,
                index,
            ): readonly AdminParsedDiagnosticPassageBlock[] => {
                const line =
                    rawLine.trim();

                if (!line) {
                    return [];
                }

                const numbered =
                    /^(\d{1,3})\s*[\.\):-]\s*(.*)$/u.exec(
                        line,
                    );

                if (
                    numbered?.[1] &&
                    numbered[2]
                ) {
                    return [
                        {
                            id:
                                `diagnostic-passage-${section}-${index + 1}`,
                            order:
                                index +
                                1,
                            type:
                                section ===
                                "ghazal"
                                    ? "poetry" as const
                                    : "numbered-paragraph" as const,
                            marker:
                                numbered[1],
                            speaker:
                                null,
                            text:
                                numbered[2].trim(),
                        },
                    ];
                }

                if (
                    /^MUALLIF\s*:/iu.test(
                        line,
                    ) ||
                    /^LUGʻAT\s*:/iu.test(
                        normalizeLine(
                            line,
                        ),
                    )
                ) {
                    return [
                        {
                            id:
                                `diagnostic-passage-${section}-${index + 1}`,
                            order:
                                index +
                                1,
                            type:
                                /^MUALLIF\s*:/iu.test(
                                    line,
                                )
                                    ? "heading" as const
                                    : "paragraph" as const,
                            marker:
                                null,
                            speaker:
                                null,
                            text:
                                line.replace(
                                    /^[^:]+:\s*/u,
                                    "",
                                ),
                        },
                    ];
                }

                const dialogue =
                    /^([^:]{1,60})\s*:\s*(.+)$/u.exec(
                        line,
                    );

                if (
                    section ===
                        "literary-text" &&
                    dialogue?.[1] &&
                    dialogue[2]
                ) {
                    return [
                        {
                            id:
                                `diagnostic-passage-${section}-${index + 1}`,
                            order:
                                index +
                                1,
                            type:
                                "dialogue" as const,
                            marker:
                                null,
                            speaker:
                                dialogue[1].trim(),
                            text:
                                dialogue[2].trim(),
                        },
                    ];
                }

                return [
                    {
                        id:
                            `diagnostic-passage-${section}-${index + 1}`,
                        order:
                            index +
                            1,
                        type:
                            section ===
                            "ghazal"
                                ? "poetry" as const
                                : "paragraph" as const,
                        marker:
                            null,
                        speaker:
                            null,
                        text:
                            line,
                    },
                ];
            },
        );
}

function parseNestedQuestions({
    sourceOrder,
    lines,
}: {
    readonly sourceOrder:
        number;
    readonly lines:
        readonly string[];
}): readonly AdminParsedMixedMultipleChoiceQuestion[] {
    const groups:
        {
            sourceOrder:
                number;
            question:
                string;
            lines:
                string[];
        }[] = [];

    let current:
        {
            sourceOrder:
                number;
            question:
                string;
            lines:
                string[];
        } | null =
        null;

    for (
        const rawLine of
        lines
    ) {
        const line =
            rawLine.trim();

        const match =
            nestedQuestionPattern.exec(
                line,
            );

        if (
            match?.[1] &&
            match[2] !==
                undefined
        ) {
            if (current) {
                groups.push(
                    current,
                );
            }

            current = {
                sourceOrder:
                    Number(
                        match[1],
                    ),
                question:
                    match[2].trim(),
                lines:
                    [],
            };

            continue;
        }

        if (current) {
            current.lines.push(
                line,
            );
        }
    }

    if (current) {
        groups.push(
            current,
        );
    }

    return groups.map(
        (
            group,
            index,
        ) => {
            const fields =
                collectFields(
                    group.lines,
                );

            const options:
                AdminParsedMcqOption[] =
                group.lines.flatMap(
                    (line) => {
                        const match =
                            optionPattern.exec(
                                line,
                            );

                        return match?.[1] &&
                            match[2]
                            ? [
                                {
                                    id:
                                        match[1] as
                                            | "A"
                                            | "B"
                                            | "C"
                                            | "D",
                                    text:
                                        match[2].trim(),
                                },
                            ]
                            : [];
                    },
                );

            const answer =
                (
                    first(
                        fields,
                        "JAVOB",
                        "TOʻGʻRI JAVOB",
                    ) ??
                    ""
                ).toLocaleUpperCase(
                    "uz",
                );

            const correctOptionId =
                /^[A-D]$/u.test(
                    answer,
                )
                    ? answer as
                        | "A"
                        | "B"
                        | "C"
                        | "D"
                    : null;

            const maximumScore =
                parseNumber(
                    first(
                        fields,
                        "BALL",
                        "SCORE",
                    ),
                ) ??
                0;

            const issues:
                string[] = [];

            if (
                !group.question
            ) {
                issues.push(
                    "Ichki savol matni topilmadi.",
                );
            }

            if (
                options.length !==
                4
            ) {
                issues.push(
                    `4 ta variant kutilgan, ${options.length} ta topildi.`,
                );
            }

            if (
                !correctOptionId
            ) {
                issues.push(
                    "To‘g‘ri javob topilmadi.",
                );
            }

            if (
                maximumScore <=
                0
            ) {
                issues.push(
                    "Savol balli topilmadi yoki noto‘g‘ri.",
                );
            }

            const status =
                confidenceFromIssues(
                    issues,
                    !group.question ||
                        options.length !==
                            4,
                );

            return {
                type:
                    "multiple-choice",
                id:
                    `diagnostic-${sourceOrder}-nested-${group.sourceOrder}`,
                order:
                    index +
                    1,
                sourceOrder:
                    group.sourceOrder,
                question:
                    group.question,
                context:
                    null,
                maximumScore,
                options,
                correctOptionId,
                visual:
                    null,
                issues,
                ...status,
            };
        },
    );
}

function parsePassageGroup({
    sourceOrder,
    order,
    lines,
}: {
    readonly sourceOrder:
        number;
    readonly order:
        number;
    readonly lines:
        readonly string[];
}): AdminParsedDiagnosticPassageGroup {
    const fields =
        collectFields(
            lines,
        );

    const sectionText =
        normalizeKey(
            first(
                fields,
                "BOʻLIM",
                "SECTION",
            ) ??
            "",
        );

    const section:
        AdminParsedDiagnosticPassageGroup["section"] =
        sectionText ===
            "LITERARY-TEXT" ||
        sectionText ===
            "BADIIY MATN"
            ? "literary-text"
            : sectionText ===
                    "GHAZAL" ||
                sectionText ===
                    "GʻAZAL"
              ? "ghazal"
              : "scientific-text";

    const passageStart =
        lines.findIndex(
            (line) =>
                normalizeKey(
                    line.replace(
                        /:\s*$/u,
                        "",
                    ),
                ) ===
                "MATN",
        );

    const questionsStart =
        lines.findIndex(
            (line) =>
                normalizeKey(
                    line.replace(
                        /:\s*$/u,
                        "",
                    ),
                ) ===
                "ICHKI SAVOLLAR",
        );

    const passageLines =
        passageStart >=
            0 &&
        questionsStart >
            passageStart
            ? lines.slice(
                passageStart +
                    1,
                questionsStart,
            )
            : [];

    const nestedLines =
        questionsStart >=
        0
            ? lines.slice(
                questionsStart +
                    1,
            )
            : [];

    const passage =
        parsePassageBlocks(
            passageLines,
            section,
        );

    const questions =
        parseNestedQuestions({
            sourceOrder,
            lines:
                nestedLines,
        });

    const maximumScore =
        Math.round(
            questions.reduce(
                (
                    total,
                    question,
                ) =>
                    total +
                    question.maximumScore,
                0,
            ) *
                10,
        ) /
        10;

    const issues:
        string[] = [];

    if (
        passage.length ===
        0
    ) {
        issues.push(
            "Passage matni topilmadi.",
        );
    }

    if (
        questions.length !==
        5
    ) {
        issues.push(
            `Passage-group ichida 5 ta savol kutilgan, ${questions.length} ta topildi.`,
        );
    }

    const nestedInvalid =
        questions.some(
            (question) =>
                question.confidence ===
                "invalid",
        );

    const nestedReview =
        questions.some(
            (question) =>
                question.confidence ===
                "review",
        );

    const status =
        confidenceFromIssues(
            issues,
            passage.length ===
                0 ||
                questions.length ===
                    0 ||
                nestedInvalid,
        );

    return {
        type:
            "passage-group",
        id:
            `diagnostic-passage-group-${sourceOrder}`,
        order,
        sourceOrder,
        section,
        title:
            first(
                fields,
                "SARLAVHA",
                "TITLE",
            ),
        instruction:
            first(
                fields,
                "KOʻRSATMA",
                "INSTRUCTION",
            ),
        context:
            null,
        passage,
        questions,
        maximumScore,
        issues,
        confidence:
            status.confidence ===
                "high" &&
            nestedReview
                ? "review"
                : status.confidence,
        confidenceScore:
            Math.min(
                status.confidenceScore,
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
                    : 0,
            ),
    };
}

function parseEssay({
    sourceOrder,
    order,
    heading,
    lines,
}: {
    readonly sourceOrder:
        number;
    readonly order:
        number;
    readonly heading:
        string;
    readonly lines:
        readonly string[];
}): AdminParsedDiagnosticEssayQuestion {
    const fields =
        collectFields(
            lines,
        );

    const title =
        first(
            fields,
            "SARLAVHA",
            "TITLE",
        );

    const question =
        first(
            fields,
            "SAVOL",
            "PROMPT",
            "TOPSHIRIQ",
            "QUESTION",
        ) ??
        heading;

    const situation =
        first(
            fields,
            "VAZIYAT",
            "SITUATION",
            "KONTEKST",
            "CONTEXT",
        );

    const minimumWords =
        parseNumber(
            first(
                fields,
                "MINIMAL SOʻZ",
                "MINIMUM WORDS",
                "MIN SOʻZ",
            ),
        );

    const maximumWords =
        parseNumber(
            first(
                fields,
                "MAKSIMAL SOʻZ",
                "MAXIMUM WORDS",
                "MAX SOʻZ",
            ),
        );

    const recommendedWords =
        parseNumber(
            first(
                fields,
                "TAVSIYA ETILGAN SOʻZ",
                "RECOMMENDED WORDS",
            ),
        );

    const recommendedParagraphs =
        parseNumber(
            first(
                fields,
                "TAVSIYA ETILGAN XATBOSHI",
                "RECOMMENDED PARAGRAPHS",
                "XATBOSHI",
            ),
        );

    const introductionRequirements =
        list(
            fields,
            "KIRISH TALABLARI",
        );

    const bodyRequirements =
        list(
            fields,
            "ASOSIY QISM TALABLARI",
        );

    const conclusionRequirements =
        list(
            fields,
            "XULOSA TALABLARI",
        );

    const warnings =
        list(
            fields,
            "OGOHLANTIRISHLAR",
        );

    const rubric =
        list(
            fields,
            "RUBRIKA",
            "RUBRIC",
            "TALABLAR",
            "REQUIREMENTS",
        );

    const maximumScore =
        parseNumber(
            first(
                fields,
                "BALL",
                "SCORE",
                "MAKSIMAL BALL",
            ),
        ) ??
        0;

    const issues:
        string[] = [];

    if (!question) {
        issues.push(
            "Esse topshirig‘i topilmadi.",
        );
    }

    if (!situation) {
        issues.push(
            "Esse vaziyati topilmadi.",
        );
    }

    // Q45 is display-only in TA’LIMOT diagnostics. Its own score can be 0;
    // the optional previous essay result (0–75) is entered by the student at finish time.
    if (
        maximumScore <
        0
    ) {
        issues.push(
            "Esse balli 0 yoki undan katta bo‘lishi kerak.",
        );
    }

    if (
        minimumWords !==
            null &&
        maximumWords !==
            null &&
        minimumWords >
            maximumWords
    ) {
        issues.push(
            "Minimal so‘zlar soni maksimal qiymatdan katta.",
        );
    }

    const status =
        confidenceFromIssues(
            issues,
            !question ||
                maximumScore <
                    0,
        );

    return {
        type:
            "essay",
        id:
            `diagnostic-${sourceOrder}`,
        order,
        sourceOrder,
        title,
        question,
        situation,
        minimumWords,
        maximumWords,
        recommendedWords,
        recommendedParagraphs,
        introductionRequirements,
        bodyRequirements,
        conclusionRequirements,
        warnings,
        rubric,
        maximumScore,
        ...status,
        issues,
    };
}


function normalizeRegularSectionLinesForMixedParser(
    lines:
        readonly string[],
): readonly string[] {
    const fields =
        collectFields(
            lines,
        );

    const type =
        normalizeKey(
            first(
                fields,
                "TUR",
                "TYPE",
            ) ??
            "",
        );

    if (
        type !==
            "MATCHING-GROUP" &&
        type !==
            "MATCHING GROUP"
    ) {
        return lines;
    }

    let typeLineReplaced =
        false;

    return lines.map(
        (line) => {
            if (
                typeLineReplaced ||
                !/^\s*(?:TUR|TYPE)\s*:/iu.test(
                    line,
                )
            ) {
                return line;
            }

            typeLineReplaced =
                true;

            return line.replace(
                /^(\s*(?:TUR|TYPE)\s*:\s*).*$/iu,
                "$1MATCHING",
            );
        },
    );
}

export function parseDiagnosticDocxDocument(
    rawText:
        string,
): AdminDiagnosticDocxParseResult | null {
    if (
        !diagnosticTypePattern.test(
            rawText,
        )
    ) {
        return null;
    }

    const lines =
        rawText
            .replace(
                /\r\n?/gu,
                "\n",
            )
            .split(
                "\n",
            );

    const metadataLines:
        string[] = [];

    const sections:
        {
            readonly sourceOrder:
                number;
            readonly heading:
                string;
            readonly lines:
                readonly string[];
        }[] = [];

    let current:
        {
            sourceOrder:
                number;
            heading:
                string;
            lines:
                string[];
        } | null =
        null;

    for (
        const rawLine of
        lines
    ) {
        const normalized =
            normalizeLine(
                rawLine,
            );

        const match =
            questionHeadingPattern.exec(
                normalized,
            );

        if (
            match?.[1]
        ) {
            if (current) {
                sections.push(
                    current,
                );
            }

            current = {
                sourceOrder:
                    Number(
                        match[1],
                    ),
                heading:
                    match[2]?.trim() ??
                    "",
                lines:
                    [],
            };

            continue;
        }

        if (current) {
            current.lines.push(
                rawLine,
            );
        } else {
            metadataLines.push(
                rawLine,
            );
        }
    }

    if (current) {
        sections.push(
            current,
        );
    }

    const regularSections =
        sections.filter(
            (section) => {
                const fields =
                    collectFields(
                        section.lines,
                    );

                const type =
                    normalizeKey(
                        first(
                            fields,
                            "TUR",
                            "TYPE",
                        ) ??
                        "",
                    );

                return (
                    type !==
                        "PASSAGE-GROUP" &&
                    type !==
                        "PASSAGE GROUP" &&
                    type !==
                        "ESSAY" &&
                    type !==
                        "ESSE"
                );
            },
        );

    const regularRaw =
        [
            ...metadataLines,
            ...regularSections.flatMap(
                (section) => [
                    `SAVOL ${section.sourceOrder}${
                        section.heading
                            ? ` — ${section.heading}`
                            : ""
                    }`,
                    ...normalizeRegularSectionLinesForMixedParser(
                        section.lines,
                    ),
                ],
            ),
        ]
            .join(
                "\n",
            )
            .replace(
                diagnosticTypePattern,
                "TEST TURI: ARALASH",
            );

    const parsedRegular =
        parseMixedDocxDocument(
            regularRaw,
        );

    const regularQuestions:
        AdminParsedDiagnosticRegularQuestion[] =
        (
            parsedRegular?.questions ??
            []
        ).map(
            (question) => ({
                ...question,
                section:
                    sectionFromSourceOrder(
                        question.sourceOrder,
                    ),
            }),
        );

    const specialQuestions:
        AdminParsedDiagnosticQuestion[] =
        sections.flatMap<
            AdminParsedDiagnosticQuestion
        >(
            (
                section,
                index,
            ): readonly AdminParsedDiagnosticQuestion[] => {
                const fields =
                    collectFields(
                        section.lines,
                    );

                const type =
                    normalizeKey(
                        first(
                            fields,
                            "TUR",
                            "TYPE",
                        ) ??
                        "",
                    );

                if (
                    type ===
                        "PASSAGE-GROUP" ||
                    type ===
                        "PASSAGE GROUP"
                ) {
                    return [
                        parsePassageGroup({
                            sourceOrder:
                                section.sourceOrder,
                            order:
                                index +
                                1,
                            lines:
                                section.lines,
                        }),
                    ];
                }

                if (
                    type ===
                        "ESSAY" ||
                    type ===
                        "ESSE"
                ) {
                    return [
                        parseEssay({
                            sourceOrder:
                                section.sourceOrder,
                            order:
                                index +
                                1,
                            heading:
                                section.heading,
                            lines:
                                section.lines,
                        }),
                    ];
                }

                return [];
            },
        );

    const questions = [
        ...regularQuestions,
        ...specialQuestions,
    ].sort(
        (
            left,
            right,
        ) =>
            left.sourceOrder -
            right.sourceOrder,
    );

    const taskCount =
        questions.reduce(
            (
                total,
                question,
            ) => {
                if (
                    question.type ===
                    "matching"
                ) {
                    return (
                        total +
                        question.items.length
                    );
                }

                if (
                    question.type ===
                    "passage-group"
                ) {
                    return (
                        total +
                        question.questions.length
                    );
                }

                return total + 1;
            },
            0,
        );

    const rawMaximumScore =
        Math.round(
            questions.reduce(
                (
                    total,
                    question,
                ) =>
                    total +
                    question.maximumScore,
                0,
            ) *
                10,
        ) /
        10;

    const metadataFields =
        collectFields(
            metadataLines,
        );

    const declaredTaskCount =
        parseNumber(
            first(
                metadataFields,
                "TOPSHIRIQLAR",
                "TASK COUNT",
            ),
        );

    const declaredMaximumScore =
        parseNumber(
            first(
                metadataFields,
                "MAKSIMAL BALL",
                "MAXIMUM SCORE",
            ),
        );

    const issues:
        string[] = [];

    if (
        questions.length ===
        0
    ) {
        issues.push(
            "Diagnostika savollari topilmadi.",
        );
    }

    if (
        declaredTaskCount !==
            null &&
        declaredTaskCount !==
            taskCount
    ) {
        issues.push(
            `Topshiriqlar soni mos emas: hujjatda ${declaredTaskCount}, parserda ${taskCount}.`,
        );
    }

    const answerableSourceOrders =
        questions.flatMap(
            (question) => {
                if (
                    question.type ===
                    "passage-group"
                ) {
                    return question.questions.map(
                        (nestedQuestion) =>
                            nestedQuestion.sourceOrder,
                    );
                }

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

    const duplicatedSourceOrders =
        answerableSourceOrders.filter(
            (
                sourceOrder,
                index,
                values,
            ) =>
                values.indexOf(
                    sourceOrder,
                ) !==
                index,
        );

    if (
        duplicatedSourceOrders.length >
        0
    ) {
        issues.push(
            `Savol raqamlari takrorlangan: ${[
                ...new Set(
                    duplicatedSourceOrders,
                ),
            ].join(", ")}.`,
        );
    }

    if (
        declaredTaskCount ===
        45
    ) {
        const expectedOrders =
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
            );

        const foundOrders =
            new Set(
                answerableSourceOrders,
            );

        const missingOrders =
            expectedOrders.filter(
                (sourceOrder) =>
                    !foundOrders.has(
                        sourceOrder,
                    ),
            );

        if (
            missingOrders.length >
            0
        ) {
            issues.push(
                `Savol raqamlari yetishmaydi: ${missingOrders.join(", ")}.`,
            );
        }
    }

    const invalidCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "invalid",
        ).length;

    const reviewCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "review",
        ).length;

    const highConfidenceCount =
        questions.filter(
            (question) =>
                question.confidence ===
                "high",
        ).length;

    const confidence:
        AdminDocxParserConfidence =
        questions.length ===
            0 ||
        invalidCount >
            0
            ? "invalid"
            : issues.length >
                    0 ||
                reviewCount >
                    0
              ? "review"
              : "high";

    const confidenceScore =
        questions.length ===
        0
            ? 0
            : Math.max(
                0,
                Math.round(
                    questions.reduce(
                        (
                            total,
                            question,
                        ) =>
                            total +
                            question.confidenceScore,
                        0,
                    ) /
                        questions.length -
                        issues.length *
                            4,
                ),
            );

    const accessText =
        normalizeKey(
            first(
                metadataFields,
                "KIRISH",
                "ACCESS",
            ) ??
            "",
        );

    const difficultyText =
        normalizeKey(
            first(
                metadataFields,
                "QIYINLIK",
                "DIFFICULTY",
            ) ??
            "",
        );

    return {
        metadata: {
            title:
                first(
                    metadataFields,
                    "SARLAVHA",
                    "TITLE",
                ),
            description:
                first(
                    metadataFields,
                    "TAVSIF",
                    "DESCRIPTION",
                ),
            instruction:
                first(
                    metadataFields,
                    "KOʻRSATMA",
                    "INSTRUCTION",
                ),
            estimatedMinutes:
                parseNumber(
                    first(
                        metadataFields,
                        "DAQIQA",
                        "ESTIMATED MINUTES",
                    ),
                ),
            access:
                accessText ===
                    "PREMIUM" ||
                accessText ===
                    "PULLIK"
                    ? "premium"
                    : accessText ===
                            "FREE" ||
                        accessText ===
                            "BEPUL"
                      ? "free"
                      : null,
            tangaPrice:
                parseNumber(
                    first(
                        metadataFields,
                        "TANGA NARXI",
                        "TANGA PRICE",
                        "PRICE",
                    ),
                ),
            difficulty:
                difficultyText ===
                "EASY"
                    ? "easy"
                    : difficultyText ===
                        "MEDIUM"
                      ? "medium"
                      : difficultyText ===
                            "HARD"
                        ? "hard"
                        : null,
            declaredTaskCount,
            declaredMaximumScore,
        },
        questions,
        taskCount,
        rawMaximumScore,
        maximumScore:
            declaredMaximumScore ??
            rawMaximumScore,
        highConfidenceCount,
        reviewCount,
        invalidCount,
        confidence,
        confidenceScore,
        issues,
    };
}
