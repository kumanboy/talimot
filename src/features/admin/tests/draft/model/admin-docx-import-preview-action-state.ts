export type AdminDocxPreviewBlockKind =
    | "heading"
    | "paragraph"
    | "list-item"
    | "table-row";

export interface AdminDocxPreviewBlock {
    readonly id: string;
    readonly kind:
        AdminDocxPreviewBlockKind;
    readonly text: string;
}

export interface AdminDocxImportPreviewSummary {
    readonly blockCount: number;
    readonly headingCount: number;
    readonly paragraphCount: number;
    readonly listItemCount: number;
    readonly tableRowCount: number;
    readonly detectedQuestionStarts:
        number;
    readonly warningCount: number;
}

import type {
    AdminStandardMcqParseResult,
} from "./admin-docx-parser-types";

export interface AdminDocxImportPreviewActionState {
    readonly status:
        | "idle"
        | "success"
        | "error";
    readonly message:
        string | null;
    readonly fileName:
        string | null;
    readonly fileSizeBytes:
        number | null;
    readonly summary:
        AdminDocxImportPreviewSummary | null;
    readonly blocks:
        readonly AdminDocxPreviewBlock[];
    readonly rawTextPreview:
        string;
    readonly warnings:
        readonly string[];
    readonly parsedMcq:
        AdminStandardMcqParseResult | null;
}

export const initialAdminDocxImportPreviewActionState:
    AdminDocxImportPreviewActionState = {
        status:
            "idle",
        message:
            null,
        fileName:
            null,
        fileSizeBytes:
            null,
        summary:
            null,
        blocks:
            [],
        rawTextPreview:
            "",
        warnings:
            [],
        parsedMcq:
            null,
    };
