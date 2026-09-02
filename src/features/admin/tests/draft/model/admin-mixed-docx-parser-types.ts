import type {
    AdminDocxParserConfidence,
    AdminParsedMcqOption,
} from "./admin-docx-parser-types";

export type AdminParsedMixedComparison =
    | "exact"
    | "normalized"
    | "keywords"
    | "manual-review";

export interface AdminParsedMixedMetadata {
    readonly title: string | null;
    readonly description: string | null;
    readonly instruction: string | null;
    readonly estimatedMinutes: number | null;
    readonly access: "free" | "premium" | null;
}

interface AdminParsedMixedBaseQuestion {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder: number;
    readonly question: string;
    readonly context: string | null;
    readonly maximumScore: number;
    readonly confidence: AdminDocxParserConfidence;
    readonly confidenceScore: number;
    readonly issues: readonly string[];
}

export interface AdminParsedMixedNumberedStatementsVisual {
    readonly type: "numbered-statements";
    readonly statements: readonly {
        readonly number: number;
        readonly text: string;
    }[];
}

export interface AdminParsedMixedWordDiagramVisual {
    readonly type: "word-diagram";
    readonly nodes: readonly {
        readonly id: string;
        readonly text: string;
        readonly role: "root" | "branch" | "leaf";
    }[];
    readonly connections: readonly {
        readonly from: string;
        readonly to: string;
    }[];
}

export type AdminParsedMixedVisual =
    | AdminParsedMixedNumberedStatementsVisual
    | AdminParsedMixedWordDiagramVisual;

export interface AdminParsedMixedMultipleChoiceQuestion
    extends AdminParsedMixedBaseQuestion {
    readonly type: "multiple-choice";
    readonly options: readonly AdminParsedMcqOption[];
    readonly correctOptionId: "A" | "B" | "C" | "D" | null;
    readonly visual: AdminParsedMixedVisual | null;
}

export interface AdminParsedMixedMatchingItem {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder: number;
    readonly prompt: string;
    readonly correctChoiceId: "A" | "B" | "C" | "D" | "E" | "F" | null;
    readonly maximumScore: number;
}

export interface AdminParsedMixedMatchingQuestion
    extends AdminParsedMixedBaseQuestion {
    readonly type: "matching";
    readonly title: string | null;
    readonly instruction: string | null;
    readonly choices: readonly {
        readonly id: "A" | "B" | "C" | "D" | "E" | "F";
        readonly text: string;
    }[];
    readonly items: readonly AdminParsedMixedMatchingItem[];
}

export interface AdminParsedMixedShortAnswerQuestion
    extends AdminParsedMixedBaseQuestion {
    readonly type: "short-answer";
    readonly examples: readonly string[];
    readonly acceptedAnswers: readonly string[];
    readonly comparison: AdminParsedMixedComparison;
    readonly requiredKeywords: readonly string[];
}

export interface AdminParsedMixedMultipartPart {
    readonly id: string;
    readonly label: "a" | "b" | "c";
    readonly question: string;
    readonly acceptedAnswers: readonly string[];
    readonly comparison: AdminParsedMixedComparison;
    readonly requiredKeywords: readonly string[];
    readonly maximumScore: number;
}

export interface AdminParsedMixedMultipartQuestion
    extends AdminParsedMixedBaseQuestion {
    readonly type: "multipart";
    readonly parts: readonly AdminParsedMixedMultipartPart[];
}

export type AdminParsedMixedQuestion =
    | AdminParsedMixedMultipleChoiceQuestion
    | AdminParsedMixedMatchingQuestion
    | AdminParsedMixedShortAnswerQuestion
    | AdminParsedMixedMultipartQuestion;

export interface AdminMixedDocxParseResult {
    readonly metadata: AdminParsedMixedMetadata;
    readonly questions: readonly AdminParsedMixedQuestion[];
    readonly taskCount: number;
    readonly maximumScore: number;
    readonly highConfidenceCount: number;
    readonly reviewCount: number;
    readonly invalidCount: number;
    readonly confidence: AdminDocxParserConfidence;
    readonly confidenceScore: number;
    readonly issues: readonly string[];
}
