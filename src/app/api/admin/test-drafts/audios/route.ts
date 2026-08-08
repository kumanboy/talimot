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
import {
    AdminTestAudioValidationError,
    assertAdminTestAudioOwnerId,
    createAdminTestAudioStoragePath,
    getAdminTestAudioExtension,
    isAdminTestAudioStoragePath,
    normalizeAdminTestAudioDuration,
    normalizeAdminTestAudioMimeType,
    sanitizeAdminTestAudioFileName,
    validateAdminTestAudioSize,
} from "@/features/admin/tests/draft/model/admin-test-audio-validation";
import type {
    AdminTestAudioErrorResponse,
    AdminTestAudioRemoveSuccessResponse,
    AdminTestAudioUploadSuccessResponse,
} from "@/features/admin/tests/draft/model/admin-test-audio-upload-types";
import {
    AdminTestAudioStorageError,
    createAdminTestAudioSignedUpload,
    getAdminTestAudioBucket,
    getAdminTestAudioPublicUrl,
    getAdminTestAudioStorageUrl,
    removeAdminTestAudioObject,
} from "@/features/admin/tests/draft/storage/admin-test-audio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
    message: string,
    status: number,
): NextResponse<AdminTestAudioErrorResponse> {
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

async function ensureAuthenticated():
    Promise<NextResponse<AdminTestAudioErrorResponse> | null> {
    const authenticated =
        await hasValidAdminSession();

    if (authenticated) {
        return null;
    }

    return errorResponse(
        "Admin sessiyasi tugagan. Qayta kiring.",
        401,
    );
}

function handleKnownError(
    error: unknown,
): NextResponse<AdminTestAudioErrorResponse> {
    if (
        error instanceof
        AdminTestAudioValidationError
    ) {
        return errorResponse(
            error.message,
            400,
        );
    }

    if (
        error instanceof
        AdminTestAudioStorageError
    ) {
        return errorResponse(
            error.message,
            502,
        );
    }

    console.error(
        "Admin test audio route failed.",
        error,
    );

    return errorResponse(
        "Audio bilan ishlashda server xatoligi yuz berdi.",
        500,
    );
}

function readBodyString(
    value: unknown,
): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function readBodyNumber(
    value: unknown,
): number {
    return typeof value === "number"
        ? value
        : Number.NaN;
}

export async function GET(
    request: NextRequest,
): Promise<NextResponse> {
    const unauthorized =
        await ensureAuthenticated();

    if (unauthorized) {
        return unauthorized;
    }

    const storagePath =
        request.nextUrl.searchParams
            .get("path")
            ?.trim() ?? "";

    if (
        !isAdminTestAudioStoragePath(
            storagePath,
        )
    ) {
        return errorResponse(
            "Audio storage manzili noto‘g‘ri.",
            400,
        );
    }

    return NextResponse.redirect(
        getAdminTestAudioPublicUrl(
            storagePath,
        ),
        307,
    );
}

export async function POST(
    request: NextRequest,
): Promise<NextResponse> {
    const unauthorized =
        await ensureAuthenticated();

    if (unauthorized) {
        return unauthorized;
    }

    try {
        const body =
            await request.json() as {
                readonly draftId?: unknown;
                readonly questionId?: unknown;
                readonly fileName?: unknown;
                readonly mimeType?: unknown;
                readonly sizeBytes?: unknown;
                readonly durationSeconds?: unknown;
            };

        const draftId =
            readBodyString(
                body.draftId,
            );
        const questionId =
            readBodyString(
                body.questionId,
            );
        const mimeType =
            normalizeAdminTestAudioMimeType(
                readBodyString(
                    body.mimeType,
                ),
            );
        const sizeBytes =
            validateAdminTestAudioSize(
                readBodyNumber(
                    body.sizeBytes,
                ),
            );
        const durationSeconds =
            normalizeAdminTestAudioDuration(
                body.durationSeconds,
            );

        assertAdminTestAudioOwnerId(
            draftId,
            "Draft ID",
        );
        assertAdminTestAudioOwnerId(
            questionId,
            "Savol ID",
        );

        const fileId =
            crypto.randomUUID();
        const extension =
            getAdminTestAudioExtension(
                mimeType,
            );
        const storagePath =
            createAdminTestAudioStoragePath({
                draftId,
                questionId,
                fileId,
                extension,
            });
        const signedUpload =
            await createAdminTestAudioSignedUpload(
                storagePath,
            );

        const audio:
            AdminDraftAudioAsset = {
            kind: "audio",
            id: fileId,
            fileName:
                sanitizeAdminTestAudioFileName(
                    readBodyString(
                        body.fileName,
                    ),
                    extension,
                ),
            mimeType,
            sizeBytes,
            durationSeconds,
            storagePath,
        };

        return NextResponse.json<
            AdminTestAudioUploadSuccessResponse
        >({
            status: "success",
            audio,
            upload: {
                storageUrl:
                    getAdminTestAudioStorageUrl(),
                bucket:
                    getAdminTestAudioBucket(),
                path: storagePath,
                token:
                    signedUpload.token,
            },
        });
    } catch (error) {
        return handleKnownError(
            error,
        );
    }
}

export async function DELETE(
    request: NextRequest,
): Promise<NextResponse> {
    const unauthorized =
        await ensureAuthenticated();

    if (unauthorized) {
        return unauthorized;
    }

    try {
        const body =
            await request.json() as {
                readonly draftId?: unknown;
                readonly questionId?: unknown;
                readonly storagePath?: unknown;
            };

        const draftId =
            readBodyString(
                body.draftId,
            );
        const questionId =
            readBodyString(
                body.questionId,
            );
        const storagePath =
            readBodyString(
                body.storagePath,
            );

        assertAdminTestAudioOwnerId(
            draftId,
            "Draft ID",
        );
        assertAdminTestAudioOwnerId(
            questionId,
            "Savol ID",
        );

        if (
            !isAdminTestAudioStoragePath(
                storagePath,
                {
                    draftId,
                    questionId,
                },
            )
        ) {
            throw new AdminTestAudioValidationError(
                "O‘chirilayotgan audio ushbu savol yoki savol qismiga tegishli emas.",
            );
        }

        await removeAdminTestAudioObject(
            storagePath,
        );

        return NextResponse.json<
            AdminTestAudioRemoveSuccessResponse
        >({
            status: "success",
            removedStoragePath:
                storagePath,
        });
    } catch (error) {
        return handleKnownError(
            error,
        );
    }
}
