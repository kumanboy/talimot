import type {
    AdminTestDraft,
    AdminTestDraftGroup,
    AdminTestDraftSource,
    AdminTestDraftStatus,
    AdminTestDraftSummary,
} from "../model";

export interface AdminTestDraftListFilters {
    readonly status?:
        AdminTestDraftStatus;
    readonly group?:
        AdminTestDraftGroup;
    readonly source?:
        AdminTestDraftSource;
    readonly search?: string;
    readonly limit?: number;
    readonly offset?: number;
}

export interface AdminTestDraftListResult {
    readonly items:
        readonly AdminTestDraftSummary[];
    readonly total: number;
}

export interface CreateAdminTestDraftInput {
    readonly draft:
        AdminTestDraft;
}

export interface UpdateAdminTestDraftInput {
    readonly draft:
        AdminTestDraft;

    /**
     * Timestamp read by the editor before saving.
     * The update is rejected when another request
     * has already modified the same draft.
     */
    readonly expectedUpdatedAt:
        number;
}

export interface AdminTestDraftRoute {
    readonly group:
        AdminTestDraftGroup;
    readonly topicSlug: string;
    readonly slug: string;
}

export interface AdminTestDraftRepository {
    create(
        input:
            CreateAdminTestDraftInput,
    ): Promise<AdminTestDraft>;

    getById(
        id: string,
    ): Promise<AdminTestDraft | null>;

    list(
        filters?:
            AdminTestDraftListFilters,
    ): Promise<AdminTestDraftListResult>;

    update(
        input:
            UpdateAdminTestDraftInput,
    ): Promise<AdminTestDraft>;

    delete(
        id: string,
    ): Promise<boolean>;

    existsByRoute(
        route:
            AdminTestDraftRoute,
        excludeDraftId?: string,
    ): Promise<boolean>;
}
