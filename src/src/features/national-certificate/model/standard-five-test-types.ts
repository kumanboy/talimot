import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type StandardFiveTopic =
    "badiiy-asarlar";

export type StandardFiveOptionId =
    | "A"
    | "B"
    | "C"
    | "D";

export interface StandardFiveOption {
    readonly id:
        StandardFiveOptionId;

    readonly text: string;
}

export interface StandardFiveQuestion {
    readonly id: string;

    readonly order: number;

    readonly sourceOrder?: number;

    readonly prompt?: string;

    readonly excerpt?: readonly string[];

    readonly question: string;

    readonly options:
        readonly StandardFiveOption[];

    readonly correctOptionId:
        StandardFiveOptionId;

    readonly score: 1.7;
    readonly explanation?:
        QuestionExplanation;
}

export interface StandardFiveTestDefinition {
    readonly kind:
        "standard-five";

    readonly id: string;
    readonly slug: string;

    readonly topic:
        StandardFiveTopic;

    readonly title: string;
    readonly description: string;

    readonly questionCount: 5;

    readonly scorePerQuestion: 1.7;

    readonly maximumScore: 8.5;

    readonly estimatedMinutes: number;

    readonly access:
        | "free"
        | "premium";

    readonly questions:
        readonly StandardFiveQuestion[];
}

export type StandardFiveAnswers =
    Readonly<
        Partial<
            Record<
                string,
                StandardFiveOptionId
            >
        >
    >;

export interface StandardFiveScoreResult {
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;

    readonly score: number;
    readonly maximumScore: 8.5;
    readonly percentage: number;
}

export function calculateStandardFiveScore(
    test:
    StandardFiveTestDefinition,
    answers:
    StandardFiveAnswers,
): StandardFiveScoreResult {
    let correctCount = 0;
    let incorrectCount = 0;
    let score = 0;

    for (
        const question
        of test.questions
        ) {
        const selectedOptionId =
            answers[question.id];

        if (!selectedOptionId) {
            continue;
        }

        if (
            selectedOptionId ===
            question.correctOptionId
        ) {
            correctCount += 1;
            score += question.score;
        } else {
            incorrectCount += 1;
        }
    }

    const unansweredCount =
        test.questionCount -
        correctCount -
        incorrectCount;

    const roundedScore =
        Math.round(
            score * 10,
        ) / 10;

    const percentage =
        Math.round(
            (
                roundedScore /
                test.maximumScore
            ) *
            100,
        );

    return {
        correctCount,
        incorrectCount,
        unansweredCount,
        score:
        roundedScore,
        maximumScore:
        test.maximumScore,
        percentage,
    };
}