import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

export interface SaveAdminTestDraftActionState {
    readonly status:
        | "idle"
        | "success"
        | "error"
        | "conflict";
    readonly message:
        string | null;
    readonly savedDraft:
        AdminTestDraft | null;
}

export const initialSaveAdminTestDraftActionState:
    SaveAdminTestDraftActionState = {
        status:
            "idle",
        message:
            null,
        savedDraft:
            null,
    };
