export const ESSAY_CRITERION_IDS = [
    "publicistic_style",
    "views_and_opinion",
    "argumentation",
    "composition",
    "paragraph_structure",
    "coherence_and_repetition",
    "spelling",
    "punctuation",
    "suffix_usage",
    "word_usage_style",
    "lexical_richness",
    "speech_purity",
] as const;

export type EssayCriterionId = (typeof ESSAY_CRITERION_IDS)[number];
export type EssayCriterionScore = 0 | 0.5 | 1 | 1.5 | 2;

export const ESSAY_STOP_REASONS = [
    "none",
    "topic_mismatch",
    "copied",
    "only_introduction",
    "fully_cyrillic",
] as const;

export type EssayStopReason = (typeof ESSAY_STOP_REASONS)[number];

export type EssayCriterionModelResult = {
    readonly score: EssayCriterionScore;
    readonly evidence: string;
    readonly issueCount: number | null;
};

export type EssayModelGrade = {
    readonly stopReason: EssayStopReason;
    readonly stopExplanation: string;
    readonly criteria: Record<EssayCriterionId, EssayCriterionModelResult>;
    readonly sectionFeedback: {
        readonly introduction: string;
        readonly body: string;
        readonly conclusion: string;
    };
    readonly keySpellingErrors: readonly string[];
    readonly keyPunctuationErrors: readonly string[];
    readonly recommendations: readonly string[];
    readonly summary: string;
};

export type EssayGradingInput = {
    readonly topic: string;
    readonly situationText?: string | null;
    readonly essayText: string;
};

export type FinalEssayGrade = {
    readonly rubricVersion: "uzbmb-essay-v3";
    readonly model: string | null;
    readonly wordCount: number;
    readonly stopReason:
        | EssayStopReason
        | "empty"
        | "under_100_words"
        | "over_350_words";
    readonly rawScore: number | null;
    readonly scaledScore: number | null;
    readonly criteria: Record<EssayCriterionId, EssayCriterionModelResult> | null;
    readonly sectionFeedback: EssayModelGrade["sectionFeedback"] | null;
    readonly keySpellingErrors: readonly string[];
    readonly keyPunctuationErrors: readonly string[];
    readonly recommendations: readonly string[];
    readonly summary: string;
};
