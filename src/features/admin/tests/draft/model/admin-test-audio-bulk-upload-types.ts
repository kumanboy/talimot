import type {
    AdminDraftAudioAsset,
} from "./admin-question-types";

export interface AdminTestAudioBulkUploadRequestItem {
    readonly clientId: string;
    readonly questionId: string;
    readonly fileName: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly durationSeconds: number | null;
}

export interface AdminTestAudioBulkSignedUploadItem {
    readonly clientId: string;
    readonly questionId: string;
    readonly audio: AdminDraftAudioAsset;
    readonly upload: {
        readonly storageUrl: string;
        readonly bucket: string;
        readonly path: string;
        readonly token: string;
    };
}

export interface AdminTestAudioBulkUploadSuccessResponse {
    readonly status: "success";
    readonly items: readonly AdminTestAudioBulkSignedUploadItem[];
}

export interface AdminTestAudioBulkUploadErrorResponse {
    readonly status: "error";
    readonly message: string;
}

export type AdminTestAudioBulkUploadResponse =
    | AdminTestAudioBulkUploadSuccessResponse
    | AdminTestAudioBulkUploadErrorResponse;
