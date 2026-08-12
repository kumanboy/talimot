import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

export interface AdminTestBulkImportSuccessResponse {
    readonly status: "success";
    readonly message: string;
    readonly bundleTitle: string;
    readonly importedQuestionCount: number;
    readonly importedImageCount: number;
    readonly savedDraft:
        AdminTestDraft;
}

export interface AdminTestBulkImportErrorResponse {
    readonly status: "error";
    readonly message: string;
}

export type AdminTestBulkImportResponse =
    | AdminTestBulkImportSuccessResponse
    | AdminTestBulkImportErrorResponse;
