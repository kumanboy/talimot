import type {
    AdminParsedMcqQuestion,
} from "./admin-docx-parser-types";

export interface AdminParsedGhazalCouplet {
    readonly order: number;
    readonly firstLine: string;
    readonly secondLine: string;
}

export interface AdminParsedGhazalVocabularyItem {
    readonly marker:
        string | null;
    readonly term: string;
    readonly meaning: string;
}

export interface AdminParsedGhazalMetadata {
    readonly title:
        string | null;
    readonly author:
        string | null;
    readonly instruction:
        string | null;
    readonly source:
        string | null;
}

export interface AdminGhazalDocxParseResult {
    readonly metadata:
        AdminParsedGhazalMetadata;
    readonly couplets:
        readonly AdminParsedGhazalCouplet[];
    readonly vocabulary:
        readonly AdminParsedGhazalVocabularyItem[];
    readonly questions:
        readonly AdminParsedMcqQuestion[];
    readonly answerKeyCount:
        number;
    readonly confidence:
        | "high"
        | "review"
        | "invalid";
    readonly confidenceScore:
        number;
    readonly issues:
        readonly string[];
}
