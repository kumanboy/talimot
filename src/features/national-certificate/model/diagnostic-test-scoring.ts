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
    return Math.round(value * 100) / 100;
}

export const DIAGNOSTIC_PART_MAXIMUM = 75 as const;

export function normalizeDiagnosticTestScore(
    rawScore: number,
    rawMaximumScore: number,
): number {
    if (!Number.isFinite(rawScore) || !Number.isFinite(rawMaximumScore) || rawMaximumScore <= 0) {
        return 0;
    }

    return roundScore(
        Math.max(0, Math.min(rawScore, rawMaximumScore)) / rawMaximumScore * DIAGNOSTIC_PART_MAXIMUM,
    );
}

export function getDiagnosticLevel(score: number | null | undefined): string | null {
    if (score === null || score === undefined || !Number.isFinite(score)) return null;
    if (score >= 70) return "A+";
    if (score >= 65) return "A";
    if (score >= 60) return "B+";
    if (score >= 55) return "B";
    if (score >= 50) return "C+";
    if (score >= 46) return "C";
    return null;
}

export function getDiagnosticPercentageIndicator(score: number | null | undefined): number | null {
    if (score === null || score === undefined || !Number.isFinite(score)) return null;
    return roundScore(Math.min(100, Math.max(0, score) / 65 * 100));
}

/**
 * Milliy sertifikat reference weights for questions 1–44.
 * The printed reference totals 76 raw points; TA’LIMOT normalizes this to 75.
 */
export function getDiagnosticOfficialWeight(order: number): number {
    if (order >= 1 && order <= 3) return 1.1;
    if (order === 4) return 1.7;
    if (order === 5 || order === 6) return 1.1;
    if (order === 7) return 1.7;
    if (order === 8) return 2.5;
    if (order >= 9 && order <= 11) return 1.7;
    if (order === 12) return 2.5;
    if (order >= 13 && order <= 22) return 1.7;
    if (order >= 23 && order <= 27) return 1.1;
    if (order >= 28 && order <= 32) return 2.5;
    if (order >= 33 && order <= 36) return 1.7;
    if (order === 37) return 2.5;
    if (order === 38 || order === 39) return 1.7;
    if (order === 40) return 2.5;
    if (order >= 41 && order <= 44) return 1.7;
    return 0;
}

function applyOfficialDiagnosticWeight(
    result: DiagnosticQuestionScoreResult,
): DiagnosticQuestionScoreResult {
    if (result.order === 40 && result.parts?.length === 2) {
        const weights = [1.2, 1.3] as const;
        const parts = result.parts.map((part, index) => ({
            ...part,
            maximumScore: weights[index] ?? part.maximumScore,
            awardedScore: part.verdict === "correct" ? (weights[index] ?? part.maximumScore) : 0,
        }));
        return {
            ...result,
            parts,
            awardedScore: roundScore(parts.reduce((sum, part) => sum + part.awardedScore, 0)),
            maximumScore: 2.5,
        };
    }

    if (result.order >= 41 && result.order <= 44 && result.parts?.length === 2) {
        const weights = [0.8, 0.9] as const;
        const parts = result.parts.map((part, index) => ({
            ...part,
            maximumScore: weights[index] ?? part.maximumScore,
            awardedScore: part.verdict === "correct" ? (weights[index] ?? part.maximumScore) : 0,
        }));
        return {
            ...result,
            parts,
            awardedScore: roundScore(parts.reduce((sum, part) => sum + part.awardedScore, 0)),
            maximumScore: 1.7,
        };
    }

    const maximumScore = getDiagnosticOfficialWeight(result.order);
    if (maximumScore <= 0) return result;

    return {
        ...result,
        maximumScore,
        awardedScore: result.verdict === "correct" ? maximumScore : 0,
    };
}

export function calculateDiagnosticFinalResult(testScore: number, essayScore: number | null) {
    const safeTestScore = roundScore(Math.max(0, Math.min(DIAGNOSTIC_PART_MAXIMUM, testScore)));
    const safeEssayScore = essayScore === null
        ? null
        : roundScore(Math.max(0, Math.min(DIAGNOSTIC_PART_MAXIMUM, essayScore)));
    const finalScore = safeEssayScore === null
        ? null
        : roundScore((safeTestScore + safeEssayScore) / 2);

    return {
        testScore: safeTestScore,
        essayScore: safeEssayScore,
        finalScore,
        grade: getDiagnosticLevel(finalScore),
        finalPercentage: getDiagnosticPercentageIndicator(finalScore),
    };
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
    test: DiagnosticTestDefinition,
    answers: DiagnosticAnswers,
    essayScore: number | null = null,
): DiagnosticTestScoreResult {
    // Question 45 is display-only. Only questions 1–44 form the test part.
    const questionResults = test.questions
        .filter((question) => question.type !== "essay")
        .flatMap((question) => scoreQuestion(question, answers))
        .map(applyOfficialDiagnosticWeight);

    const rawTestScore = roundScore(
        questionResults.reduce((total, result) => total + result.awardedScore, 0),
    );
    const rawTestMaximumScore = roundScore(
        questionResults.reduce((total, result) => total + result.maximumScore, 0),
    );
    const testScore = normalizeDiagnosticTestScore(rawTestScore, rawTestMaximumScore);
    const final = calculateDiagnosticFinalResult(testScore, essayScore);

    const correctCount = questionResults.filter((result) => result.verdict === "correct").length;
    const incorrectCount = questionResults.filter((result) => result.verdict === "incorrect").length;
    const unansweredCount = questionResults.filter((result) => result.verdict === "unanswered").length;
    const pendingCount = questionResults.filter((result) => result.verdict === "pending").length;

    const displayScore = final.finalScore ?? testScore;
    const displayPercentage = final.finalPercentage
        ?? getDiagnosticPercentageIndicator(testScore)
        ?? 0;

    return {
        rawTestScore,
        rawTestMaximumScore,
        testScore,
        essayScore: final.essayScore,
        finalScore: final.finalScore,
        grade: final.grade,
        finalPercentage: final.finalPercentage,
        score: displayScore,
        maximumScore: DIAGNOSTIC_PART_MAXIMUM,
        percentage: displayPercentage,
        correctCount,
        incorrectCount,
        unansweredCount,
        pendingCount,
        questionResults,
        sectionResults: createSectionResults(questionResults),
    };
}
