import type {
    AdminDocxParserConfidence,
} from "./admin-docx-parser-types";
import type {
    AdminParsedMixedMultipleChoiceQuestion,
    AdminParsedMixedQuestion,
} from "./admin-mixed-docx-parser-types";

export type AdminParsedDiagnosticQuestionSection =
    | "grammar"
    | "literature"
    | "scientific-text"
    | "literary-text"
    | "ghazal"
    | "syntax"
    | "written"
    | "essay";

type WithDiagnosticSection<T> =
    T extends unknown
        ? T & {
            readonly section:
                AdminParsedDiagnosticQuestionSection;
        }
        : never;

export type AdminParsedDiagnosticRegularQuestion =
    WithDiagnosticSection<
        AdminParsedMixedQuestion
    >;

export interface AdminParsedDiagnosticPassageBlock {
    readonly id: string;
    readonly order: number;
    readonly type:
        | "heading"
        | "paragraph"
        | "numbered-paragraph"
        | "dialogue"
        | "poetry";
    readonly marker: string | null;
    readonly speaker: string | null;
    readonly text: string;
}

export interface AdminParsedDiagnosticPassageGroup {
    readonly type: "passage-group";
    readonly id: string;
    readonly order: number;
    readonly sourceOrder: number;
    readonly section:
        | "scientific-text"
        | "literary-text"
        | "ghazal";
    readonly title: string | null;
    readonly instruction: string | null;
    readonly context: string | null;
    readonly passage:
        readonly AdminParsedDiagnosticPassageBlock[];
    readonly questions:
        readonly AdminParsedMixedMultipleChoiceQuestion[];
    readonly maximumScore: number;
    readonly confidence: AdminDocxParserConfidence;
    readonly confidenceScore: number;
    readonly issues: readonly string[];
}

export interface AdminParsedDiagnosticEssayQuestion {
    readonly type: "essay";
    readonly id: string;
    readonly order: number;
    readonly sourceOrder: number;
    readonly title: string | null;
    readonly question: string;
    readonly situation: string | null;
    readonly minimumWords: number | null;
    readonly maximumWords: number | null;
    readonly recommendedWords: number | null;
    readonly recommendedParagraphs: number | null;
    readonly introductionRequirements:
        readonly string[];
    readonly bodyRequirements:
        readonly string[];
    readonly conclusionRequirements:
        readonly string[];
    readonly warnings:
        readonly string[];
    readonly rubric: readonly string[];
    readonly maximumScore: number;
    readonly confidence: AdminDocxParserConfidence;
    readonly confidenceScore: number;
    readonly issues: readonly string[];
}

export type AdminParsedDiagnosticQuestion =
    | AdminParsedDiagnosticRegularQuestion
    | AdminParsedDiagnosticPassageGroup
    | AdminParsedDiagnosticEssayQuestion;

export interface AdminParsedDiagnosticMetadata {
    readonly title: string | null;
    readonly description: string | null;
    readonly instruction: string | null;
    readonly estimatedMinutes: number | null;
    readonly access: "free" | "premium" | null;
    readonly difficulty:
        | "easy"
        | "medium"
        | "hard"
        | null;
    readonly declaredTaskCount:
        number | null;
    readonly declaredMaximumScore:
        number | null;
}

export interface AdminDiagnosticDocxParseResult {
    readonly metadata:
        AdminParsedDiagnosticMetadata;
    readonly questions:
        readonly AdminParsedDiagnosticQuestion[];
    readonly taskCount: number;
    readonly rawMaximumScore: number;
    readonly maximumScore: number;
    readonly highConfidenceCount: number;
    readonly reviewCount: number;
    readonly invalidCount: number;
    readonly confidence:
        AdminDocxParserConfidence;
    readonly confidenceScore: number;
    readonly issues:
        readonly string[];
}
