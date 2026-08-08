export type AdminDraftQuestionType =
    | "multiple-choice"
    | "short-answer"
    | "matching"
    | "multipart"
    | "passage-group"
    | "essay";

export type AdminDraftOptionId =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";

export type AdminDraftQuestionSection =
    | "grammar"
    | "literature"
    | "scientific-text"
    | "literary-text"
    | "ghazal"
    | "syntax"
    | "written"
    | "essay"
    | "general";

export type AdminDraftAnswerComparison =
    | "exact"
    | "normalized"
    | "keywords"
    | "manual-review";

export interface AdminDraftAudioAsset {
    readonly kind: "audio";
    readonly id: string;
    readonly fileName: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly durationSeconds:
        number | null;
    readonly storagePath:
        string | null;
}

export interface AdminDraftImageAsset {
    readonly kind: "image";
    readonly id: string;
    readonly fileName: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly width: number | null;
    readonly height: number | null;
    readonly storagePath:
        string | null;
    readonly alt: string;
    readonly caption:
        string | null;
}

export interface AdminDraftQuestionExplanation {
    readonly text: string;
    readonly audio:
        AdminDraftAudioAsset | null;
}

export interface AdminDraftOption {
    readonly id:
        AdminDraftOptionId;
    readonly text: string;
}

export interface AdminDraftNumberedStatement {
    readonly number: number;
    readonly text: string;
}

export interface AdminDraftWordDiagramNode {
    readonly id: string;
    readonly text: string;
    readonly role:
        | "root"
        | "branch"
        | "leaf";
}

export interface AdminDraftWordDiagramConnection {
    readonly from: string;
    readonly to: string;
}

export type AdminDraftQuestionVisual =
    | {
        readonly type:
            "numbered-statements";
        readonly statements:
            readonly AdminDraftNumberedStatement[];
    }
    | {
        readonly type:
            "word-diagram";
        readonly nodes:
            readonly AdminDraftWordDiagramNode[];
        readonly connections:
            readonly AdminDraftWordDiagramConnection[];
    };

export interface AdminDraftBaseQuestion {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder:
        number | null;
    readonly section:
        AdminDraftQuestionSection;
    readonly question: string;
    readonly instruction:
        string | null;
    readonly context:
        string | null;
    readonly maximumScore:
        number;
    readonly image:
        AdminDraftImageAsset | null;
    readonly explanation:
        AdminDraftQuestionExplanation;
}

export interface AdminDraftMultipleChoiceQuestion
    extends AdminDraftBaseQuestion {
    readonly type:
        "multiple-choice";
    readonly options:
        readonly AdminDraftOption[];
    readonly correctOptionId:
        AdminDraftOptionId | null;
    readonly visual?:
        AdminDraftQuestionVisual | null;
}

export interface AdminDraftShortAnswerQuestion
    extends AdminDraftBaseQuestion {
    readonly type:
        "short-answer";
    readonly acceptedAnswers:
        readonly string[];
    readonly requiredKeywords:
        readonly string[];
    readonly comparison:
        AdminDraftAnswerComparison;
    readonly examples?:
        readonly string[];
}

export interface AdminDraftMatchingChoice {
    readonly id:
        AdminDraftOptionId;
    readonly text: string;
}

export interface AdminDraftMatchingItem {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder?:
        number | null;
    readonly prompt: string;
    readonly correctChoiceId:
        AdminDraftOptionId | null;
    readonly maximumScore:
        number;
    readonly explanation?:
        AdminDraftQuestionExplanation;
}

export interface AdminDraftMatchingQuestion
    extends AdminDraftBaseQuestion {
    readonly type:
        "matching";
    readonly title?:
        string | null;
    readonly choices:
        readonly AdminDraftMatchingChoice[];
    readonly items:
        readonly AdminDraftMatchingItem[];
}

export interface AdminDraftMultipartPart {
    readonly id: string;
    readonly order: number;
    readonly label: string;
    readonly prompt: string;
    readonly acceptedAnswers:
        readonly string[];
    readonly requiredKeywords:
        readonly string[];
    readonly comparison:
        AdminDraftAnswerComparison;
    readonly maximumScore:
        number;
    readonly explanation?:
        AdminDraftQuestionExplanation;
}

export interface AdminDraftMultipartQuestion
    extends AdminDraftBaseQuestion {
    readonly type:
        "multipart";
    readonly parts:
        readonly AdminDraftMultipartPart[];
}

export interface AdminDraftPassageBlock {
    readonly id: string;
    readonly order: number;
    readonly type:
        | "heading"
        | "paragraph"
        | "numbered-paragraph"
        | "dialogue"
        | "poetry";
    readonly marker:
        string | null;
    readonly speaker:
        string | null;
    readonly text: string;
}

export interface AdminDraftPassageGroupQuestion
    extends Omit<
        AdminDraftBaseQuestion,
        "question" | "maximumScore"
    > {
    readonly type:
        "passage-group";
    readonly title:
        string | null;
    readonly passage:
        readonly AdminDraftPassageBlock[];
    readonly questions:
        readonly AdminDraftMultipleChoiceQuestion[];
}

export interface AdminDraftEssayRequirements {
    readonly minimumWords:
        number | null;
    readonly recommendedWords?:
        number | null;
    readonly maximumWords:
        number | null;
    readonly recommendedParagraphs:
        number | null;
    readonly introduction?:
        readonly string[];
    readonly body?:
        readonly string[];
    readonly conclusion?:
        readonly string[];
    readonly warnings?:
        readonly string[];
    readonly rubric:
        readonly string[];
}

export interface AdminDraftEssayQuestion
    extends AdminDraftBaseQuestion {
    readonly type:
        "essay";
    readonly topic: string;
    readonly requirements:
        AdminDraftEssayRequirements;
    readonly comparison:
        "manual-review";
}

export type AdminDraftQuestion =
    | AdminDraftMultipleChoiceQuestion
    | AdminDraftShortAnswerQuestion
    | AdminDraftMatchingQuestion
    | AdminDraftMultipartQuestion
    | AdminDraftPassageGroupQuestion
    | AdminDraftEssayQuestion;
