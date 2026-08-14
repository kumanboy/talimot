import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type MixedTestTopic =
    | "aralash"
    | "sintaksis";

export type MixedOptionId =
    | "A"
    | "B"
    | "C"
    | "D";

export type MixedMatchingChoiceId =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";

export type WrittenAnswerComparison =
    | "exact"
    | "normalized"
    | "keywords";

export type WrittenAnswerVerdict =
    | "correct"
    | "incorrect"
    | "needs-review";


export interface MixedQuestionImage {
    readonly src: string;
    readonly alt: string;
    readonly caption?: string;
    readonly width?: number;
    readonly height?: number;
}

export interface MixedOption {
    readonly id:
        MixedOptionId;

    readonly text: string;
}

export interface MixedNumberedStatement {
    readonly number: number;
    readonly text: string;
}

export interface MixedDiagramNode {
    readonly id: string;
    readonly text: string;

    /**
     * Diagramdagi asosiy yoki
     * markaziy tushuncha.
     */
    readonly role?:
        | "root"
        | "branch"
        | "leaf";
}

export interface MixedDiagramConnection {
    readonly from: string;
    readonly to: string;
}

export interface MixedNumberedStatementsVisual {
    readonly type:
        "numbered-statements";

    readonly statements:
        readonly MixedNumberedStatement[];
}

export interface MixedWordDiagramVisual {
    readonly type:
        "word-diagram";

    readonly nodes:
        readonly MixedDiagramNode[];

    readonly connections:
        readonly MixedDiagramConnection[];
}

export type MixedQuestionVisual =
    | MixedNumberedStatementsVisual
    | MixedWordDiagramVisual;

export interface MixedMultipleChoiceQuestion {
    readonly type:
        "multiple-choice";

    readonly id: string;

    /**
     * Aralash to‘plam ichida
     * ko‘rsatiladigan tartib raqami.
     */
    readonly order: number;

    /**
     * Milliy sertifikatdagi
     * asl savol raqami.
     */
    readonly sourceOrder?: number;

    readonly question: string;

    readonly image?:
        MixedQuestionImage;

    /**
     * 4-savoldagi diagramma yoki
     * 12-savoldagi raqamlangan gaplar.
     */
    readonly visual?:
        MixedQuestionVisual;

    readonly options:
        readonly MixedOption[];

    readonly correctOptionId:
        MixedOptionId;

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface MixedMatchingChoice {
    readonly id:
        MixedMatchingChoiceId;

    readonly text: string;
}

export interface MixedMatchingItem {
    readonly id: string;

    /**
     * Guruh ichidagi ko‘rinish tartibi.
     */
    readonly order: number;

    readonly sourceOrder?: number;

    readonly prompt: string;

    readonly correctChoiceId:
        MixedMatchingChoiceId;

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface MixedMatchingGroup {
    readonly type:
        "matching-group";

    readonly id: string;
    readonly order: number;

    readonly title?: string;
    readonly instruction: string;

    readonly image?:
        MixedQuestionImage;

    /**
     * Masalan:
     * 33, 34 va 35-savollar.
     */
    readonly items:
        readonly MixedMatchingItem[];

    /**
     * Umumiy A–F variantlari.
     */
    readonly choices:
        readonly MixedMatchingChoice[];
}

export interface MixedShortAnswerQuestion {
    readonly type:
        "short-answer";

    readonly id: string;
    readonly order: number;

    readonly sourceOrder?: number;

    readonly question: string;

    readonly image?:
        MixedQuestionImage;

    /**
     * Savoldan oldin ko‘rsatiladigan
     * gap, parcha yoki izoh.
     */
    readonly context?: string;

    /**
     * Masalan, 36-savoldagi
     * uchta birikma.
     */
    readonly examples?:
        readonly string[];

    readonly acceptedAnswers:
        readonly string[];

    readonly comparison:
        WrittenAnswerComparison;

    /**
     * keywords rejimi uchun.
     */
    readonly requiredKeywords?:
        readonly string[];

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface MixedQuestionPart {
    readonly id: string;

    readonly label:
        | "a"
        | "b"
        | "c";

    readonly question: string;

    readonly acceptedAnswers:
        readonly string[];

    readonly comparison:
        WrittenAnswerComparison;

    readonly requiredKeywords?:
        readonly string[];

    readonly score: number;

    readonly explanation?:
        QuestionExplanation;
}

export interface MixedMultipartQuestion {
    readonly type:
        "multipart";

    readonly id: string;
    readonly order: number;

    readonly sourceOrder?: number;

    readonly question: string;

    readonly image?:
        MixedQuestionImage;

    /**
     * Tahlil qilinadigan gap,
     * she’riy parcha yoki qit’a.
     */
    readonly context?: string;

    readonly parts:
        readonly MixedQuestionPart[];

    readonly maximumScore:
        number;
}

export type MixedQuestion =
    | MixedMultipleChoiceQuestion
    | MixedMatchingGroup
    | MixedShortAnswerQuestion
    | MixedMultipartQuestion;

export interface MixedTestDefinition {
    readonly kind:
        "mixed";

    readonly id: string;
    readonly slug: string;

    readonly topic:
        MixedTestTopic;

    readonly title: string;
    readonly description: string;

    readonly instruction: string;

    /**
     * Bu savollar soni emas,
     * foydalanuvchi javob beradigan
     * alohida topshiriqlar soni.
     *
     * Matching group ichidagi har bir
     * item alohida topshiriq hisoblanadi.
     */
    readonly taskCount: number;

    readonly maximumScore:
        number;

    readonly estimatedMinutes:
        number;

    readonly access:
        | "free"
        | "premium";

    readonly questions:
        readonly MixedQuestion[];
}

export type MixedChoiceAnswer =
    MixedOptionId;

export type MixedMatchingAnswers =
    Readonly<
        Partial<
            Record<
                string,
                MixedMatchingChoiceId
            >
        >
    >;

export interface MixedMultipartAnswers {
    readonly [partId: string]:
        string;
}

export type MixedAnswerValue =
    | MixedChoiceAnswer
    | string
    | MixedMatchingAnswers
    | MixedMultipartAnswers;

export type MixedAnswers =
    Readonly<
        Partial<
            Record<
                string,
                MixedAnswerValue
            >
        >
    >;

export interface MixedQuestionScoreResult {
    readonly questionId: string;

    readonly awardedScore: number;
    readonly maximumScore: number;

    readonly verdict:
        WrittenAnswerVerdict;

    /**
     * Matching va multipart savollar
     * uchun ichki natijalar.
     */
    readonly parts?:
        readonly MixedPartScoreResult[];
}

export interface MixedPartScoreResult {
    readonly partId: string;

    readonly awardedScore: number;
    readonly maximumScore: number;

    readonly verdict:
        WrittenAnswerVerdict;
}

export interface MixedTestScoreResult {
    readonly score: number;
    readonly maximumScore: number;

    readonly percentage: number;

    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly needsReviewCount: number;
    readonly unansweredCount: number;

    readonly questionResults:
        readonly MixedQuestionScoreResult[];
}

export function isMixedOptionId(
    value: unknown,
): value is MixedOptionId {
    return (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D"
    );
}

export function isMixedMatchingChoiceId(
    value: unknown,
): value is MixedMatchingChoiceId {
    return (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D" ||
        value === "E" ||
        value === "F"
    );
}

export function isMixedQuestionAnswered(
    question:
    MixedQuestion,
    answer:
        MixedAnswerValue | undefined,
): boolean {
    if (answer === undefined) {
        return false;
    }

    if (
        question.type ===
        "multiple-choice"
    ) {
        return (
            typeof answer ===
            "string" &&
            isMixedOptionId(
                answer,
            )
        );
    }

    if (
        question.type ===
        "short-answer"
    ) {
        return (
            typeof answer ===
            "string" &&
            answer.trim().length >
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
            return false;
        }

        const matchingAnswers =
            answer as MixedMatchingAnswers;

        return question.items.some(
            (item) =>
                Boolean(
                    matchingAnswers[
                        item.id
                        ],
                ),
        );
    }

    if (
        typeof answer !==
        "object" ||
        answer === null
    ) {
        return false;
    }

    const multipartAnswers =
        answer as MixedMultipartAnswers;

    return question.parts.some(
        (part) =>
            Boolean(
                multipartAnswers[
                    part.id
                    ]?.trim(),
            ),
    );
}

export function countMixedTasks(
    questions:
    readonly MixedQuestion[],
): number {
    return questions.reduce(
        (
            total,
            question,
        ) => {
            if (
                question.type ===
                "matching-group"
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

export function calculateMixedMaximumScore(
    questions:
    readonly MixedQuestion[],
): number {
    const total =
        questions.reduce(
            (
                sum,
                question,
            ) => {
                if (
                    question.type ===
                    "matching-group"
                ) {
                    return (
                        sum +
                        question.items.reduce(
                            (
                                itemTotal,
                                item,
                            ) =>
                                itemTotal +
                                item.maximumScore,
                            0,
                        )
                    );
                }

                return (
                    sum +
                    question.maximumScore
                );
            },
            0,
        );

    return (
        Math.round(
            total * 10,
        ) / 10
    );
}