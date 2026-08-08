import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

export type PublishAdminTestDraftActionStatus =
    | "idle"
    | "success"
    | "error"
    | "conflict";

export interface PublishAdminTestDraftActionState {
    readonly status:
        PublishAdminTestDraftActionStatus;
    readonly message:
        string | null;
    readonly publishedDraft:
        AdminTestDraft | null;
}

export const initialPublishAdminTestDraftActionState:
    PublishAdminTestDraftActionState = {
    status:
        "idle",
    message:
        null,
    publishedDraft:
        null,
};
