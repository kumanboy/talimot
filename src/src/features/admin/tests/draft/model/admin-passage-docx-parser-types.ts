import type {
    AdminParsedMcqQuestion,
} from "./admin-docx-parser-types";

export type AdminPassageDocxTopic =
    | "scientific-text"
    | "literary-text";

export type AdminParsedPassageBlockType =
    | "heading"
    | "paragraph"
    | "numbered-paragraph"
    | "dialogue";

export interface AdminParsedPassageBlock {
    readonly id: string;
    readonly order: number;
    readonly type:
        AdminParsedPassageBlockType;
    readonly marker:
        string | null;
    readonly speaker:
        string | null;
    readonly text: string;
}

export interface AdminParsedPassageMetadata {
    readonly topic:
        AdminPassageDocxTopic;
    readonly title:
        string | null;
    readonly subtitle:
        string | null;
    readonly author:
        string | null;
    readonly source:
        string | null;
    readonly instruction:
        string | null;
}

export interface AdminPassageDocxParseResult {
    readonly metadata:
        AdminParsedPassageMetadata;
    readonly passage:
        readonly AdminParsedPassageBlock[];
    readonly questions:
        readonly AdminParsedMcqQuestion[];
    readonly confidence:
        | "high"
        | "review"
        | "invalid";
    readonly confidenceScore:
        number;
    readonly issues:
        readonly string[];
    readonly answerKeyCount:
        number;
}
