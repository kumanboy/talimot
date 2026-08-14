import type {
    MixedAnswerValue,
    MixedAnswers,
    MixedMatchingAnswers,
    MixedMultipartAnswers,
    MixedMultipartQuestion,
    MixedPartScoreResult,
    MixedQuestion,
    MixedQuestionPart,
    MixedQuestionScoreResult,
    MixedShortAnswerQuestion,
    MixedTestDefinition,
    MixedTestScoreResult,
    WrittenAnswerComparison,
    WrittenAnswerVerdict,
} from "./mixed-test-types";

function roundScore(
    value: number,
): number {
    return (
        Math.round(
            value * 10,
        ) / 10
    );
}

function normalizeWhitespace(
    value: string,
): string {
    return value
        .trim()
        .replace(
            /\s+/g,
            " ",
        );
}

function normalizeApostrophes(
    value: string,
): string {
    return value.replace(
        /[‘’ʻʼ`´]/g,
        "'",
    );
}

function normalizeDashes(
    value: string,
): string {
    return value.replace(
        /[–—−]/g,
        "-",
    );
}

function normalizeQuotes(
    value: string,
): string {
    return value.replace(
        /[“”«»]/g,
        '"',
    );
}

function normalizePunctuationSpacing(
    value: string,
): string {
    return value
        .replace(
            /\s+([,.;:!?])/g,
            "$1",
        )
        .replace(
            /([,.;:!?])(?=\S)/g,
            "$1 ",
        )
        .replace(
            /\s*-\s*/g,
            " - ",
        )
        .replace(
            /\s+/g,
            " ",
        )
        .trim();
}

export function normalizeWrittenAnswer(
    value: string,
): string {
    return normalizeWhitespace(
        normalizePunctuationSpacing(
            normalizeQuotes(
                normalizeDashes(
                    normalizeApostrophes(
                        value,
                    ),
                ),
            ),
        ),
    ).toLocaleLowerCase(
        "uz",
    );
}

function normalizeExactAnswer(
    value: string,
): string {
    return normalizeWhitespace(
        normalizeQuotes(
            normalizeDashes(
                normalizeApostrophes(
                    value,
                ),
            ),
        ),
    ).toLocaleLowerCase(
        "uz",
    );
}

function hasAllRequiredKeywords(
    normalizedAnswer: string,
    requiredKeywords:
    readonly string[],
): boolean {
    return requiredKeywords.every(
        (keyword) =>
            normalizedAnswer.includes(
                normalizeWrittenAnswer(
                    keyword,
                ),
            ),
    );
}

function matchesAcceptedAnswer(
    answer: string,
    acceptedAnswers:
    readonly string[],
    comparison:
    WrittenAnswerComparison,
    requiredKeywords?:
    readonly string[],
): WrittenAnswerVerdict {
    const trimmedAnswer =
        answer.trim();

    if (
        trimmedAnswer.length ===
        0
    ) {
        return "incorrect";
    }

    if (
        comparison === "exact"
    ) {
        const normalizedAnswer =
            normalizeExactAnswer(
                trimmedAnswer,
            );

        const matches =
            acceptedAnswers.some(
                (
                    acceptedAnswer,
                ) =>
                    normalizedAnswer ===
                    normalizeExactAnswer(
                        acceptedAnswer,
                    ),
            );

        return matches
            ? "correct"
            : "incorrect";
    }

    const normalizedAnswer =
        normalizeWrittenAnswer(
            trimmedAnswer,
        );

    if (
        comparison ===
        "normalized"
    ) {
        const matches =
            acceptedAnswers.some(
                (
                    acceptedAnswer,
                ) =>
                    normalizedAnswer ===
                    normalizeWrittenAnswer(
                        acceptedAnswer,
                    ),
            );

        return matches
            ? "correct"
            : "incorrect";
    }

    const keywords =
        requiredKeywords ??
        [];

    if (
        keywords.length === 0
    ) {
        return "incorrect";
    }

    if (
        hasAllRequiredKeywords(
            normalizedAnswer,
            keywords,
        )
    ) {
        return "correct";
    }

    return "incorrect";
}

function getAwardedScore(
    verdict:
    WrittenAnswerVerdict,
    maximumScore: number,
): number {
    return verdict ===
    "correct"
        ? maximumScore
        : 0;
}

function scoreMultipleChoiceQuestion(
    question:
    Extract<
        MixedQuestion,
        {
            readonly type:
                "multiple-choice";
        }
    >,
    answer:
        MixedAnswerValue | undefined,
): MixedQuestionScoreResult {
    const isCorrect =
        typeof answer ===
        "string" &&
        answer ===
        question.correctOptionId;

    return {
        questionId:
        question.id,

        awardedScore:
            isCorrect
                ? question.maximumScore
                : 0,

        maximumScore:
        question.maximumScore,

        verdict:
            isCorrect
                ? "correct"
                : "incorrect",
    };
}

function scoreMatchingGroup(
    question:
    Extract<
        MixedQuestion,
        {
            readonly type:
                "matching-group";
        }
    >,
    answer:
        MixedAnswerValue | undefined,
): MixedQuestionScoreResult {
    const matchingAnswers =
        typeof answer ===
        "object" &&
        answer !== null
            ? (
                answer as
                    MixedMatchingAnswers
            )
            : {};

    const partResults:
        MixedPartScoreResult[] =
        question.items.map(
            (item) => {
                const selectedChoiceId =
                    matchingAnswers[
                        item.id
                        ];

                const isCorrect =
                    selectedChoiceId ===
                    item.correctChoiceId;

                return {
                    partId:
                    item.id,

                    awardedScore:
                        isCorrect
                            ? item.maximumScore
                            : 0,

                    maximumScore:
                    item.maximumScore,

                    verdict:
                        isCorrect
                            ? "correct"
                            : "incorrect",
                };
            },
        );

    const awardedScore =
        roundScore(
            partResults.reduce(
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
            partResults.reduce(
                (
                    total,
                    result,
                ) =>
                    total +
                    result.maximumScore,
                0,
            ),
        );

    const correctParts =
        partResults.filter(
            (result) =>
                result.verdict ===
                "correct",
        ).length;

    const verdict:
        WrittenAnswerVerdict =
        correctParts ===
        partResults.length
            ? "correct"
            : "incorrect";

    return {
        questionId:
        question.id,

        awardedScore,
        maximumScore,
        verdict,
        parts:
        partResults,
    };
}

function scoreShortAnswerQuestion(
    question:
    MixedShortAnswerQuestion,
    answer:
        MixedAnswerValue | undefined,
): MixedQuestionScoreResult {
    const textAnswer =
        typeof answer ===
        "string"
            ? answer
            : "";

    const verdict =
        matchesAcceptedAnswer(
            textAnswer,
            question.acceptedAnswers,
            question.comparison,
            question.requiredKeywords,
        );

    return {
        questionId:
        question.id,

        awardedScore:
            getAwardedScore(
                verdict,
                question.maximumScore,
            ),

        maximumScore:
        question.maximumScore,

        verdict,
    };
}

function scoreMultipartPart(
    part:
    MixedQuestionPart,
    answer: string,
): MixedPartScoreResult {
    const verdict =
        matchesAcceptedAnswer(
            answer,
            part.acceptedAnswers,
            part.comparison,
            part.requiredKeywords,
        );

    return {
        partId:
        part.id,

        awardedScore:
            getAwardedScore(
                verdict,
                part.score,
            ),

        maximumScore:
        part.score,

        verdict,
    };
}

function getMultipartVerdict(
    partResults:
    readonly MixedPartScoreResult[],
): WrittenAnswerVerdict {
    if (
        partResults.every(
            (result) =>
                result.verdict ===
                "correct",
        )
    ) {
        return "correct";
    }

    if (
        partResults.some(
            (result) =>
                result.verdict ===
                "needs-review",
        )
    ) {
        return "needs-review";
    }

    return "incorrect";
}

function scoreMultipartQuestion(
    question:
    MixedMultipartQuestion,
    answer:
        MixedAnswerValue | undefined,
): MixedQuestionScoreResult {
    const multipartAnswers =
        typeof answer ===
        "object" &&
        answer !== null
            ? (
                answer as
                    MixedMultipartAnswers
            )
            : {};

    const partResults:
        MixedPartScoreResult[] =
        question.parts.map(
            (part) =>
                scoreMultipartPart(
                    part,
                    multipartAnswers[
                        part.id
                        ] ?? "",
                ),
        );

    const awardedScore =
        roundScore(
            partResults.reduce(
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
            partResults.reduce(
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
        questionId:
        question.id,

        awardedScore,
        maximumScore,
        verdict:
            getMultipartVerdict(
                partResults,
            ),
        parts:
        partResults,
    };
}

export function scoreMixedQuestion(
    question:
    MixedQuestion,
    answer:
        MixedAnswerValue | undefined,
): MixedQuestionScoreResult {
    if (
        question.type ===
        "multiple-choice"
    ) {
        return scoreMultipleChoiceQuestion(
            question,
            answer,
        );
    }

    if (
        question.type ===
        "matching-group"
    ) {
        return scoreMatchingGroup(
            question,
            answer,
        );
    }

    if (
        question.type ===
        "short-answer"
    ) {
        return scoreShortAnswerQuestion(
            question,
            answer,
        );
    }

    return scoreMultipartQuestion(
        question,
        answer,
    );
}

function isAnswerEmpty(
    question:
    MixedQuestion,
    answer:
        MixedAnswerValue | undefined,
): boolean {
    if (
        answer === undefined
    ) {
        return true;
    }

    if (
        question.type ===
        "multiple-choice"
    ) {
        return (
            typeof answer !==
            "string" ||
            answer.trim().length ===
            0
        );
    }

    if (
        question.type ===
        "short-answer"
    ) {
        return (
            typeof answer !==
            "string" ||
            answer.trim().length ===
            0
        );
    }

    if (
        question.type ===
        "matching-group"
    ) {
        if (
            typeof answer !==
            "object" ||
            answer === null
        ) {
            return true;
        }

        const matchingAnswers =
            answer as
                MixedMatchingAnswers;

        return question.items.every(
            (item) =>
                !matchingAnswers[
                    item.id
                    ],
        );
    }

    if (
        typeof answer !==
        "object" ||
        answer === null
    ) {
        return true;
    }

    const multipartAnswers =
        answer as
            MixedMultipartAnswers;

    return question.parts.every(
        (part) =>
            !multipartAnswers[
                part.id
                ]?.trim(),
    );
}

function countQuestionUnits(
    question:
    MixedQuestion,
): number {
    if (
        question.type ===
        "matching-group"
    ) {
        return question.items.length;
    }

    return 1;
}

function countAnsweredUnits(
    question:
    MixedQuestion,
    answer:
        MixedAnswerValue | undefined,
): number {
    if (
        question.type !==
        "matching-group"
    ) {
        return isAnswerEmpty(
            question,
            answer,
        )
            ? 0
            : 1;
    }

    if (
        typeof answer !==
        "object" ||
        answer === null
    ) {
        return 0;
    }

    const matchingAnswers =
        answer as
            MixedMatchingAnswers;

    return question.items.filter(
        (item) =>
            Boolean(
                matchingAnswers[
                    item.id
                    ],
            ),
    ).length;
}

function countResultUnits(
    result:
    MixedQuestionScoreResult,
    verdict:
    WrittenAnswerVerdict,
): number {
    if (
        result.parts
    ) {
        return result.parts.filter(
            (part) =>
                part.verdict ===
                verdict,
        ).length;
    }

    return result.verdict ===
    verdict
        ? 1
        : 0;
}

export function calculateMixedTestScore(
    test:
    MixedTestDefinition,
    answers:
    MixedAnswers,
): MixedTestScoreResult {
    const questionResults =
        test.questions.map(
            (question) =>
                scoreMixedQuestion(
                    question,
                    answers[
                        question.id
                        ],
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

    const maximumScore =
        roundScore(
            questionResults.reduce(
                (
                    total,
                    result,
                ) =>
                    total +
                    result.maximumScore,
                0,
            ),
        );

    const percentage =
        maximumScore > 0
            ? Math.round(
                (
                    score /
                    maximumScore
                ) *
                100,
            )
            : 0;

    const totalUnits =
        test.questions.reduce(
            (
                total,
                question,
            ) =>
                total +
                countQuestionUnits(
                    question,
                ),
            0,
        );

    const answeredUnits =
        test.questions.reduce(
            (
                total,
                question,
            ) =>
                total +
                countAnsweredUnits(
                    question,
                    answers[
                        question.id
                        ],
                ),
            0,
        );

    const correctCount =
        questionResults.reduce(
            (
                total,
                result,
            ) =>
                total +
                countResultUnits(
                    result,
                    "correct",
                ),
            0,
        );

    const incorrectCount =
        questionResults.reduce(
            (
                total,
                result,
            ) =>
                total +
                countResultUnits(
                    result,
                    "incorrect",
                ),
            0,
        );

    const needsReviewCount =
        questionResults.reduce(
            (
                total,
                result,
            ) =>
                total +
                countResultUnits(
                    result,
                    "needs-review",
                ),
            0,
        );

    const unansweredCount =
        Math.max(
            0,
            totalUnits -
            answeredUnits,
        );

    return {
        score,
        maximumScore,
        percentage,

        correctCount,
        incorrectCount,
        needsReviewCount,
        unansweredCount,

        questionResults,
    };
}