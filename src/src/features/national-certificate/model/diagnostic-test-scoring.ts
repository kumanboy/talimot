import type {
    DiagnosticAnswerValue,
    DiagnosticAnswers,
    DiagnosticMatchingAnswers,
    DiagnosticMultipartAnswers,
    DiagnosticPartScoreResult,
    DiagnosticQuestion,
    DiagnosticQuestionScoreResult,
    DiagnosticQuestionSection,
    DiagnosticSectionScoreResult,
    DiagnosticTestDefinition,
    DiagnosticTestScoreResult,
} from "@/features/national-certificate/model/diagnostic-test-types";

function roundScore(
    value: number,
): number {
    return Math.round(
        value * 10,
    ) / 10;
}

function normalizeAnswer(
    value: string,
): string {
    return value
        .trim()
        .replace(
            /[‘’ʻʼ`´]/g,
            "'",
        )
        .replace(
            /[–—−]/g,
            "-",
        )
        .replace(
            /\s+/g,
            " ",
        )
        .toLocaleUpperCase(
            "uz",
        );
}

function isTextCorrect(
    answer: string,
    acceptedAnswers:
    readonly string[],
    requiredKeywords?:
    readonly string[],
): boolean {
    const normalized =
        normalizeAnswer(
            answer,
        );

    if (
        normalized.length ===
        0
    ) {
        return false;
    }

    if (
        acceptedAnswers.some(
            (
                accepted,
            ) =>
                normalized ===
                normalizeAnswer(
                    accepted,
                ),
        )
    ) {
        return true;
    }

    if (
        requiredKeywords &&
        requiredKeywords.length >
        0
    ) {
        return requiredKeywords.every(
            (
                keyword,
            ) =>
                normalized.includes(
                    normalizeAnswer(
                        keyword,
                    ),
                ),
        );
    }

    return false;
}

function scoreChoice(
    question:
    Extract<
        DiagnosticQuestion,
        {
            readonly type:
                "multiple-choice";
        }
    >,
    answer:
        DiagnosticAnswerValue | undefined,
): DiagnosticQuestionScoreResult {
    const unanswered =
        typeof answer !==
        "string" ||
        answer.trim().length ===
        0;

    const correct =
        !unanswered &&
        answer ===
        question.correctOptionId;

    return {
        questionId:
        question.id,
        order:
        question.order,
        section:
        question.section,
        awardedScore:
            correct
                ? question.maximumScore
                : 0,
        maximumScore:
        question.maximumScore,
        verdict:
            unanswered
                ? "unanswered"
                : correct
                    ? "correct"
                    : "incorrect",
    };
}

function scoreShortAnswer(
    question:
    Extract<
        DiagnosticQuestion,
        {
            readonly type:
                "short-answer";
        }
    >,
    answer:
        DiagnosticAnswerValue | undefined,
): DiagnosticQuestionScoreResult {
    const text =
        typeof answer ===
        "string"
            ? answer
            : "";

    const unanswered =
        text.trim().length ===
        0;

    const correct =
        !unanswered &&
        isTextCorrect(
            text,
            question.acceptedAnswers,
            question.requiredKeywords,
        );

    return {
        questionId:
        question.id,
        order:
        question.order,
        section:
        question.section,
        awardedScore:
            correct
                ? question.maximumScore
                : 0,
        maximumScore:
        question.maximumScore,
        verdict:
            unanswered
                ? "unanswered"
                : correct
                    ? "correct"
                    : "incorrect",
    };
}

function scoreMultipart(
    question:
    Extract<
        DiagnosticQuestion,
        {
            readonly type:
                "multipart";
        }
    >,
    answer:
        DiagnosticAnswerValue | undefined,
): DiagnosticQuestionScoreResult {
    const values:
        DiagnosticMultipartAnswers =
        typeof answer ===
        "object" &&
        answer !== null
            ? (
                answer as
                    DiagnosticMultipartAnswers
            )
            : {};

    const parts:
        DiagnosticPartScoreResult[] =
        question.parts.map(
            (
                part,
            ) => {
                const text =
                    values[
                        part.id
                        ] ?? "";

                const unanswered =
                    text.trim()
                        .length === 0;

                const correct =
                    !unanswered &&
                    isTextCorrect(
                        text,
                        part.acceptedAnswers,
                        part.requiredKeywords,
                    );

                return {
                    partId:
                    part.id,
                    awardedScore:
                        correct
                            ? part.score
                            : 0,
                    maximumScore:
                    part.score,
                    verdict:
                        unanswered
                            ? "unanswered"
                            : correct
                                ? "correct"
                                : "incorrect",
                };
            },
        );

    const awardedScore =
        roundScore(
            parts.reduce(
                (
                    total,
                    part,
                ) =>
                    total +
                    part.awardedScore,
                0,
            ),
        );

    const allUnanswered =
        parts.every(
            (
                part,
            ) =>
                part.verdict ===
                "unanswered",
        );

    const allCorrect =
        parts.every(
            (
                part,
            ) =>
                part.verdict ===
                "correct",
        );

    return {
        questionId:
        question.id,
        order:
        question.order,
        section:
        question.section,
        awardedScore,
        maximumScore:
        question.maximumScore,
        verdict:
            allUnanswered
                ? "unanswered"
                : allCorrect
                    ? "correct"
                    : "incorrect",
        parts,
    };
}

function scoreMatching(
    question:
    Extract<
        DiagnosticQuestion,
        {
            readonly type:
                "matching-group";
        }
    >,
    answer:
        DiagnosticAnswerValue | undefined,
): readonly DiagnosticQuestionScoreResult[] {
    const values:
        DiagnosticMatchingAnswers =
        typeof answer ===
        "object" &&
        answer !== null
            ? (
                answer as
                    DiagnosticMatchingAnswers
            )
            : {};

    return question.items.map(
        (
            item,
        ) => {
            const selected =
                values[
                    item.id
                    ];

            const unanswered =
                selected ===
                undefined;

            const correct =
                selected ===
                item.correctChoiceId;

            return {
                questionId:
                item.id,
                order:
                item.order,
                section:
                question.section,
                awardedScore:
                    correct
                        ? item.maximumScore
                        : 0,
                maximumScore:
                item.maximumScore,
                verdict:
                    unanswered
                        ? "unanswered"
                        : correct
                            ? "correct"
                            : "incorrect",
            };
        },
    );
}

function scoreEssay(
    question:
    Extract<
        DiagnosticQuestion,
        {
            readonly type:
                "essay";
        }
    >,
    answer:
        DiagnosticAnswerValue | undefined,
): DiagnosticQuestionScoreResult {
    const text =
        typeof answer ===
        "string"
            ? answer.trim()
            : "";

    return {
        questionId:
        question.id,
        order:
        question.order,
        section:
        question.section,
        awardedScore:
            0,
        maximumScore:
        question.maximumScore,
        verdict:
            text.length ===
            0
                ? "unanswered"
                : "pending",
    };
}

function scoreQuestion(
    question:
    DiagnosticQuestion,
    answers:
    DiagnosticAnswers,
): readonly DiagnosticQuestionScoreResult[] {
    if (
        question.type ===
        "passage-group"
    ) {
        return question.questions.map(
            (
                item,
            ) =>
                scoreChoice(
                    item,
                    answers[
                        item.id
                        ],
                ),
        );
    }

    if (
        question.type ===
        "matching-group"
    ) {
        return scoreMatching(
            question,
            answers[
                question.id
                ],
        );
    }

    if (
        question.type ===
        "multiple-choice"
    ) {
        return [
            scoreChoice(
                question,
                answers[
                    question.id
                    ],
            ),
        ];
    }

    if (
        question.type ===
        "short-answer"
    ) {
        return [
            scoreShortAnswer(
                question,
                answers[
                    question.id
                    ],
            ),
        ];
    }

    if (
        question.type ===
        "multipart"
    ) {
        return [
            scoreMultipart(
                question,
                answers[
                    question.id
                    ],
            ),
        ];
    }

    return [
        scoreEssay(
            question,
            answers[
                question.id
                ],
        ),
    ];
}

function createSectionResults(
    questionResults:
    readonly DiagnosticQuestionScoreResult[],
): readonly DiagnosticSectionScoreResult[] {
    const sections:
        readonly DiagnosticQuestionSection[] =
        [
            "grammar",
            "literature",
            "scientific-text",
            "literary-text",
            "ghazal",
            "syntax",
            "written",
            "essay",
        ];

    return sections
        .map(
            (
                section,
            ) => {
                const results =
                    questionResults.filter(
                        (
                            result,
                        ) =>
                            result.section ===
                            section,
                    );

                const score =
                    roundScore(
                        results.reduce(
                            (
                                total,
                                result,
                            ) =>
                                total +
                                result.awardedScore,
                            0,
                        ),
                    );

                const maximumScore =
                    roundScore(
                        results.reduce(
                            (
                                total,
                                result,
                            ) =>
                                total +
                                result.maximumScore,
                            0,
                        ),
                    );

                return {
                    section,
                    score,
                    maximumScore,
                    percentage:
                        maximumScore >
                        0
                            ? Math.round(
                                (
                                    score /
                                    maximumScore
                                ) *
                                100,
                            )
                            : 0,
                };
            },
        )
        .filter(
            (
                section,
            ) =>
                section.maximumScore >
                0,
        );
}

export function calculateDiagnosticTestScore(
    test:
    DiagnosticTestDefinition,
    answers:
    DiagnosticAnswers,
): DiagnosticTestScoreResult {
    const questionResults =
        test.questions.flatMap(
            (
                question,
            ) =>
                scoreQuestion(
                    question,
                    answers,
                ),
        );

    const score =
        roundScore(
            questionResults.reduce(
                (
                    total,
                    result,
                ) =>
                    total +
                    result.awardedScore,
                0,
            ),
        );

    const correctCount =
        questionResults.filter(
            (
                result,
            ) =>
                result.verdict ===
                "correct",
        ).length;

    const incorrectCount =
        questionResults.filter(
            (
                result,
            ) =>
                result.verdict ===
                "incorrect",
        ).length;

    const unansweredCount =
        questionResults.filter(
            (
                result,
            ) =>
                result.verdict ===
                "unanswered",
        ).length;

    const pendingCount =
        questionResults.filter(
            (
                result,
            ) =>
                result.verdict ===
                "pending",
        ).length;

    return {
        score,
        maximumScore:
        test.maximumScore,
        percentage:
            Math.round(
                (
                    score /
                    test.maximumScore
                ) *
                100,
            ),
        correctCount,
        incorrectCount,
        unansweredCount,
        pendingCount,
        questionResults,
        sectionResults:
            createSectionResults(
                questionResults,
            ),
    };
}