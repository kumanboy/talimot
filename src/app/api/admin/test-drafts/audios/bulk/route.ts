import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import type {
    AdminDraftAudioAsset,
} from "@/features/admin/tests/draft/model/admin-question-types";
import type {
    AdminTestAudioBulkUploadErrorResponse,
    AdminTestAudioBulkUploadRequestItem,
    AdminTestAudioBulkUploadSuccessResponse,
} from "@/features/admin/tests/draft/model/admin-test-audio-bulk-upload-types";
import {
    AdminTestAudioValidationError,
    assertAdminTestAudioOwnerId,
    createAdminTestAudioStoragePath,
    getAdminTestAudioExtension,
    normalizeAdminTestAudioDuration,
    normalizeAdminTestAudioMimeType,
    sanitizeAdminTestAudioFileName,
    validateAdminTestAudioSize,
} from "@/features/admin/tests/draft/model/admin-test-audio-validation";
import {
    AdminTestAudioStorageError,
    createAdminTestAudioSignedUploads,
    getAdminTestAudioBucket,
    getAdminTestAudioStorageUrl,
} from "@/features/admin/tests/draft/storage/admin-test-audio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 120;
const MAX_DECLARED_TOTAL_BYTES = 400 * 1024 * 1024;

function errorResponse(
    message: string,
    status: number,
): NextResponse<AdminTestAudioBulkUploadErrorResponse> {
    return NextResponse.json(
        {
            status: "error",
            message,
        },
        {
            status,
        },
    );
}

function readString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function handleKnownError(error: unknown): NextResponse<AdminTestAudioBulkUploadErrorResponse> {
    if (error instanceof AdminTestAudioValidationError) {
        return errorResponse(error.message, 400);
    }

    if (error instanceof AdminTestAudioStorageError) {
        return errorResponse(error.message, 502);
    }

    console.error("Admin bulk audio upload route failed.", error);
    return errorResponse("Audio ZIP uchun xavfsiz yuklash manzillarini yaratib bo‘lmadi.", 500);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!(await hasValidAdminSession())) {
        return errorResponse("Admin sessiyasi tugagan. Qayta kiring.", 401);
    }

    try {
        const body = await request.json() as {
            readonly draftId?: unknown;
            readonly files?: unknown;
        };
        const draftId = readString(body.draftId);
        assertAdminTestAudioOwnerId(draftId, "Draft ID");

        if (!Array.isArray(body.files) || body.files.length === 0 || body.files.length > MAX_FILES) {
            throw new AdminTestAudioValidationError(
                `Bir bulk audio yuklashda 1–${MAX_FILES} ta fayl bo‘lishi kerak.`,
            );
        }

        const seenClientIds = new Set<string>();
        const seenQuestionIds = new Set<string>();
        let totalBytes = 0;

        const prepared = body.files.map((rawValue) => {
            const value = rawValue as Partial<AdminTestAudioBulkUploadRequestItem>;
            const clientId = readString(value.clientId);
            const questionId = readString(value.questionId);
            const fileName = readString(value.fileName);
            const mimeType = normalizeAdminTestAudioMimeType(readString(value.mimeType));
            const sizeBytes = validateAdminTestAudioSize(Number(value.sizeBytes));
            const durationSeconds = normalizeAdminTestAudioDuration(value.durationSeconds);

            assertAdminTestAudioOwnerId(clientId, "Bulk audio client ID");
            assertAdminTestAudioOwnerId(questionId, "Savol ID");

            if (seenClientIds.has(clientId)) {
                throw new AdminTestAudioValidationError("Bulk audio client ID takrorlangan.");
            }

            if (seenQuestionIds.has(questionId)) {
                throw new AdminTestAudioValidationError("Bitta savolga bir bulk yuklashda ikki audio yuborib bo‘lmaydi.");
            }

            seenClientIds.add(clientId);
            seenQuestionIds.add(questionId);
            totalBytes += sizeBytes;

            if (totalBytes > MAX_DECLARED_TOTAL_BYTES) {
                throw new AdminTestAudioValidationError("Bulk audioning umumiy hajmi 400 MB dan oshmasligi kerak.");
            }

            const fileId = crypto.randomUUID();
            const extension = getAdminTestAudioExtension(mimeType);
            const storagePath = createAdminTestAudioStoragePath({
                draftId,
                questionId,
                fileId,
                extension,
            });
            const audio: AdminDraftAudioAsset = {
                kind: "audio",
                id: fileId,
                fileName: sanitizeAdminTestAudioFileName(fileName, extension),
                mimeType,
                sizeBytes,
                durationSeconds,
                storagePath,
            };

            return {
                clientId,
                questionId,
                storagePath,
                audio,
            };
        });

        const signedUploads = await createAdminTestAudioSignedUploads(
            prepared.map((item) => item.storagePath),
        );
        const tokenByPath = new Map(
            signedUploads.map((upload) => [upload.storagePath, upload.token]),
        );
        const storageUrl = getAdminTestAudioStorageUrl();
        const bucket = getAdminTestAudioBucket();

        return NextResponse.json<AdminTestAudioBulkUploadSuccessResponse>({
            status: "success",
            items: prepared.map((item) => ({
                clientId: item.clientId,
                questionId: item.questionId,
                audio: item.audio,
                upload: {
                    storageUrl,
                    bucket,
                    path: item.storagePath,
                    token: tokenByPath.get(item.storagePath) ?? "",
                },
            })),
        });
    } catch (error) {
        return handleKnownError(error);
    }
}
