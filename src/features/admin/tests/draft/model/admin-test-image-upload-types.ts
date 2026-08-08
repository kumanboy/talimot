import type {
    AdminDraftImageAsset,
} from "./admin-question-types";

export interface AdminTestImageSignedUpload {
    readonly storageUrl: string;
    readonly bucket: string;
    readonly path: string;
    readonly token: string;
}

export interface AdminTestImageUploadSuccessResponse {
    readonly status: "success";
    readonly image:
        AdminDraftImageAsset;
    readonly upload:
        AdminTestImageSignedUpload;
}

export interface AdminTestImageRemoveSuccessResponse {
    readonly status: "success";
    readonly removedStoragePath:
        string;
}

export interface AdminTestImageErrorResponse {
    readonly status: "error";
    readonly message: string;
}

export type AdminTestImageUploadResponse =
    | AdminTestImageUploadSuccessResponse
    | AdminTestImageErrorResponse;

export type AdminTestImageRemoveResponse =
    | AdminTestImageRemoveSuccessResponse
    | AdminTestImageErrorResponse;
