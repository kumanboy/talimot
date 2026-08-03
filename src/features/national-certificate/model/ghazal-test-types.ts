import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type GhazalOptionId =
    | "A"
    | "B"
    | "C"
    | "D";

export interface GhazalOption {
    readonly id: GhazalOptionId;
    readonly text: string;
}

export interface GhazalQuestion {
    readonly id: string;

    /**
     * Question number displayed inside
     * the standalone practice test.
     */
    readonly order: number;

    /**
     * Original question number from
     * the complete diagnostic test.
     */
    readonly sourceOrder?: number;

    readonly question: string;

    readonly options:
        readonly GhazalOption[];

    readonly correctOptionId:
        GhazalOptionId;

    readonly score: 2.5;

    readonly explanation?:
        QuestionExplanation;
}

export interface GhazalVocabularyItem {
    readonly term: string;
    readonly meaning: string;
    readonly marker?: string;
}

export interface GhazalCouplet {
    readonly order: number;
    readonly firstLine: string;
    readonly secondLine: string;
}

export interface GhazalTestDefinition {
    readonly kind: "ghazal";

    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    /**
     * Stable URL slug.
     * Do not translate or change it.
     */
    readonly topic: "gazal";

    readonly author?: string;
    readonly instruction: string;

    readonly couplets:
        readonly GhazalCouplet[];

    readonly vocabulary:
        readonly GhazalVocabularyItem[];

    readonly questionCount: 5;
    readonly scorePerQuestion: 2.5;
    readonly maximumScore: 12.5;

    readonly estimatedMinutes: number;

    readonly access:
        | "free"
        | "premium";

    readonly questions:
        readonly GhazalQuestion[];
}

export type GhazalAnswers =
    Readonly<
        Partial<
            Record<
                string,
                GhazalOptionId
            >
        >
    >;

export interface GhazalScoreResult {
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;

    readonly score: number;
    readonly maximumScore: 12.5;
    readonly percentage: number;
}