import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type PassageFiveTopic =
    | "ilmiy-matn"
    | "badiiy-matn";

export type PassageFiveOptionId =
    | "A"
    | "B"
    | "C"
    | "D";

export type RomanSectionMarker =
    | "I"
    | "II"
    | "III"
    | "IV";

export interface PassageFiveOption {
    readonly id:
        PassageFiveOptionId;

    readonly text: string;
}

export interface PassageParagraphBlock {
    readonly type:
        "paragraph";

    readonly id: string;
    readonly text: string;

    readonly marker?: string;
}

export interface PassageNumberedSectionBlock {
    readonly type:
        "numbered-section";

    readonly id: string;

    readonly marker:
        RomanSectionMarker;

    readonly paragraphs:
        readonly string[];
}

export interface PassageDialogueBlock {
    readonly type:
        "dialogue";

    readonly id: string;
    readonly speaker?: string;
    readonly text: string;
    readonly marker?: string;
}

export interface PassageHeadingBlock {
    readonly type:
        "heading";

    readonly id: string;
    readonly text: string;
}

export type PassageBlock =
    | PassageParagraphBlock
    | PassageNumberedSectionBlock
    | PassageDialogueBlock
    | PassageHeadingBlock;

export interface PassageFiveQuestion {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder?: number;

    readonly question: string;

    readonly options:
        readonly PassageFiveOption[];

    readonly correctOptionId:
        PassageFiveOptionId;

    /**
     * Ilmiy matn: 1.7
     * Badiiy matn: 1.1
     */
    readonly score: number;
    readonly explanation?:
        QuestionExplanation;
}

export interface PassageFiveTestDefinition {
    readonly kind:
        "passage-five";

    readonly id: string;
    readonly slug: string;

    readonly topic:
        PassageFiveTopic;

    readonly title: string;
    readonly subtitle?: string;

    readonly description: string;
    readonly instruction: string;

    readonly author?: string;
    readonly source?: string;

    readonly passage:
        readonly PassageBlock[];

    readonly questionCount: 5;

    /**
     * Ilmiy matn: 1.7
     * Badiiy matn: 1.1
     */
    readonly scorePerQuestion:
        number;

    /**
     * Ilmiy matn: 8.5
     * Badiiy matn: 5.5
     */
    readonly maximumScore:
        number;

    readonly estimatedMinutes:
        number;

    readonly access:
        | "free"
        | "premium";

    readonly questions:
        readonly PassageFiveQuestion[];
}

export type PassageFiveAnswers =
    Readonly<
        Partial<
            Record<
                string,
                PassageFiveOptionId
            >
        >
    >;

export interface PassageFiveScoreResult {
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;

    readonly score: number;
    readonly maximumScore: number;
    readonly percentage: number;
}

export function calculatePassageFiveScore(
    test:
    PassageFiveTestDefinition,
    answers:
    PassageFiveAnswers,
): PassageFiveScoreResult {
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

export function isPassageFiveTopic(
    value: string,
): value is PassageFiveTopic {
    return (
        value ===
        "ilmiy-matn" ||
        value ===
        "badiiy-matn"
    );
}

export function isPassageFiveOptionId(
    value: unknown,
): value is PassageFiveOptionId {
    return (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D"
    );
}