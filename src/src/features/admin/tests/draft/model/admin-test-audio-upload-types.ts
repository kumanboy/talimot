import type {
    AdminDraftAudioAsset,
} from "./admin-question-types";

export interface AdminTestAudioSignedUpload {
    readonly storageUrl: string;
    readonly bucket: string;
    readonly path: string;
    readonly token: string;
}

export interface AdminTestAudioUploadSuccessResponse {
    readonly status: "success";
    readonly audio:
        AdminDraftAudioAsset;
    readonly upload:
        AdminTestAudioSignedUpload;
}

export interface AdminTestAudioRemoveSuccessResponse {
    readonly status: "success";
    readonly removedStoragePath:
        string;
}

export interface AdminTestAudioErrorResponse {
    readonly status: "error";
    readonly message: string;
}

export type AdminTestAudioUploadResponse =
    | AdminTestAudioUploadSuccessResponse
    | AdminTestAudioErrorResponse;

export type AdminTestAudioRemoveResponse =
    | AdminTestAudioRemoveSuccessResponse
    | AdminTestAudioErrorResponse;
