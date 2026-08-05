export type AdminDocxParserConfidence =
    | "high"
    | "review"
    | "invalid";

export interface AdminParsedMcqOption {
    readonly id:
        | "A"
        | "B"
        | "C"
        | "D";
    readonly text: string;
}

export interface AdminParsedMcqQuestion {
    readonly sourceNumber:
        number;
    readonly question: string;
    readonly options:
        readonly AdminParsedMcqOption[];
    readonly correctOptionId:
        | "A"
        | "B"
        | "C"
        | "D"
        | null;
    readonly confidence:
        AdminDocxParserConfidence;
    readonly confidenceScore:
        number;
    readonly issues:
        readonly string[];
    readonly sourceLines:
        readonly string[];
}

export interface AdminStandardMcqParseResult {
    readonly questions:
        readonly AdminParsedMcqQuestion[];
    readonly orphanLines:
        readonly string[];
    readonly answerKeyCount:
        number;
    readonly highConfidenceCount:
        number;
    readonly reviewCount:
        number;
    readonly invalidCount:
        number;
}
