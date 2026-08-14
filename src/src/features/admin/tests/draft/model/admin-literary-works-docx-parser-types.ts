import type {
    AdminParsedMcqOption,
} from "./admin-docx-parser-types";

export interface AdminParsedStandardFiveQuestion {
    readonly sourceNumber:
        number;
    readonly prompt:
        string | null;
    readonly excerpt:
        readonly string[];
    readonly question:
        string;
    readonly options:
        readonly AdminParsedMcqOption[];
    readonly correctOptionId:
        "A" | "B" | "C" | "D" | null;
    readonly confidence:
        | "high"
        | "review"
        | "invalid";
    readonly confidenceScore:
        number;
    readonly issues:
        readonly string[];
}

export interface AdminLiteraryWorksDocxMetadata {
    readonly title:
        string | null;
    readonly description:
        string | null;
    readonly instruction:
        string | null;
}

export interface AdminLiteraryWorksDocxParseResult {
    readonly metadata:
        AdminLiteraryWorksDocxMetadata;
    readonly questions:
        readonly AdminParsedStandardFiveQuestion[];
    readonly answerKeyCount:
        number;
    readonly highConfidenceCount:
        number;
    readonly reviewCount:
        number;
    readonly invalidCount:
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
