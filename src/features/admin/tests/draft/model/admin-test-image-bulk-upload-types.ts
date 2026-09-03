import type { AdminDraftImageAsset } from "./admin-question-types";

export interface AdminTestImageBulkUploadRequestItem {
    readonly clientId: string;
    readonly questionId: string;
    readonly fileName: string;
    readonly mimeType: string;
    readonly sizeBytes: number;
    readonly width: number | null;
    readonly height: number | null;
    readonly alt: string;
    readonly caption?: string | null;
}

export interface AdminTestImageBulkUploadSuccessResponse {
    readonly status: "success";
    readonly items: readonly {
        readonly clientId: string;
        readonly questionId: string;
        readonly image: AdminDraftImageAsset;
        readonly upload: { readonly storageUrl: string; readonly bucket: string; readonly path: string; readonly token: string };
    }[];
}

export interface AdminTestImageBulkUploadErrorResponse { readonly status: "error"; readonly message: string; }
export type AdminTestImageBulkUploadResponse = AdminTestImageBulkUploadSuccessResponse | AdminTestImageBulkUploadErrorResponse;
