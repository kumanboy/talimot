import type {
    AdminDraftQuestion,
} from "./admin-question-types";

export type AdminTestDraftStatus =
    | "draft"
    | "review"
    | "published"
    | "archived";

export type AdminTestDraftGroup =
    | "grammar"
    | "national-certificate";

export type AdminTestDraftFormat =
    | "standard"
    | "passage-five"
    | "standard-five"
    | "mixed"
    | "diagnostic";

export type AdminTestDraftDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type AdminTestDraftAccess =
    | "free"
    | "premium";

export type AdminTestDraftSource =
    | "manual"
    | "docx-import"
    | "pdf-import"
    | "existing-code";

export interface AdminTestDraftMetadata {
    readonly title: string;
    readonly description: string;
    readonly group:
        AdminTestDraftGroup;
    readonly category: string;
    readonly topicSlug: string;
    readonly slug: string;
    readonly format:
        AdminTestDraftFormat;
    readonly difficulty:
        AdminTestDraftDifficulty;
    readonly access:
        AdminTestDraftAccess;
    readonly estimatedMinutes:
        number;
}

export interface AdminTestDraftAudit {
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly createdBy:
        string | null;
    readonly updatedBy:
        string | null;
}

export interface AdminTestDraft {
    readonly version: 1;
    readonly id: string;
    readonly status:
        AdminTestDraftStatus;
    readonly source:
        AdminTestDraftSource;
    readonly metadata:
        AdminTestDraftMetadata;
    readonly questions:
        readonly AdminDraftQuestion[];
    readonly audit:
        AdminTestDraftAudit;
}

export interface AdminTestDraftSummary {
    readonly id: string;
    readonly title: string;
    readonly status:
        AdminTestDraftStatus;
    readonly source:
        AdminTestDraftSource;
    readonly group:
        AdminTestDraftGroup;
    readonly format:
        AdminTestDraftFormat;
    readonly questionCount:
        number;
    readonly maximumScore:
        number;
    readonly updatedAt:
        number;
}
