import type {
    AdminTestDraft,
    AdminTestDraftAccess,
    AdminTestDraftFormat,
    AdminTestDraftGroup,
    AdminTestDraftSource,
    AdminTestDraftStatus,
} from "../model";

export interface AdminTestDraftStorageRecord {
    readonly id: string;
    readonly version: number;
    readonly status:
        AdminTestDraftStatus;
    readonly source:
        AdminTestDraftSource;
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly difficulty:
        AdminTestDraft["metadata"]["difficulty"];
    readonly estimatedMinutes: number;
    readonly groupName:
        AdminTestDraftGroup;
    readonly topicSlug: string;
    readonly slug: string;
    readonly format:
        AdminTestDraftFormat;
    readonly access:
        AdminTestDraftAccess;
    readonly questionCount: number;

    /**
     * PostgreSQL numeric values are returned as
     * strings by postgres.js to avoid precision loss.
     */
    readonly maximumScore: string;

    readonly payload:
        AdminTestDraft;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly createdBy:
        string | null;
    readonly updatedBy:
        string | null;
}
