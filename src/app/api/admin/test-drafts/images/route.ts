import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import type {
    AdminDraftImageAsset,
} from "@/features/admin/tests/draft/model/admin-question-types";
import {
    AdminTestImageValidationError,
    assertAdminTestImageOwnerId,
    createAdminTestImageStoragePath,
    getAdminTestImageExtension,
    isAdminTestImageStoragePath,
    normalizeAdminTestImageAlt,
    normalizeAdminTestImageCaption,
    normalizeAdminTestImageDimension,
    normalizeAdminTestImageMimeType,
    sanitizeAdminTestImageFileName,
    validateAdminTestImageSize,
} from "@/features/admin/tests/draft/model/admin-test-image-validation";
import type {
    AdminTestImageErrorResponse,
    AdminTestImageRemoveSuccessResponse,
    AdminTestImageUploadSuccessResponse,
} from "@/features/admin/tests/draft/model/admin-test-image-upload-types";
import {
    AdminTestImageStorageError,
    createAdminTestImageSignedUpload,
    getAdminTestImageBucket,
    getAdminTestImagePublicUrl,
    getAdminTestImageStorageUrl,
    removeAdminTestImageObject,
} from "@/features/admin/tests/draft/storage/admin-test-image-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
    message: string,
    status: number,
): NextResponse<AdminTestImageErrorResponse> {
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
    Promise<NextResponse<AdminTestImageErrorResponse> | null> {
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
): NextResponse<AdminTestImageErrorResponse> {
    if (
        error instanceof
        AdminTestImageValidationError
    ) {
        return errorResponse(
            error.message,
            400,
        );
    }

    if (
        error instanceof
        AdminTestImageStorageError
    ) {
        return errorResponse(
            error.message,
            502,
        );
    }

    console.error(
        "Admin test image route failed.",
        error,
    );

    return errorResponse(
        "Rasm bilan ishlashda server xatoligi yuz berdi.",
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
        !isAdminTestImageStoragePath(
            storagePath,
        )
    ) {
        return errorResponse(
            "Rasm storage manzili noto‘g‘ri.",
            400,
        );
    }

    return NextResponse.redirect(
        getAdminTestImagePublicUrl(
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
                readonly width?: unknown;
                readonly height?: unknown;
                readonly alt?: unknown;
                readonly caption?: unknown;
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
            normalizeAdminTestImageMimeType(
                readBodyString(
                    body.mimeType,
                ),
            );
        const sizeBytes =
            validateAdminTestImageSize(
                readBodyNumber(
                    body.sizeBytes,
                ),
            );
        const width =
            normalizeAdminTestImageDimension(
                body.width,
            );
        const height =
            normalizeAdminTestImageDimension(
                body.height,
            );
        const alt =
            normalizeAdminTestImageAlt(
                readBodyString(
                    body.alt,
                ),
            );
        const caption =
            normalizeAdminTestImageCaption(
                readBodyString(
                    body.caption,
                ),
            );

        assertAdminTestImageOwnerId(
            draftId,
            "Draft ID",
        );
        assertAdminTestImageOwnerId(
            questionId,
            "Savol ID",
        );

        const fileId =
            crypto.randomUUID();
        const extension =
            getAdminTestImageExtension(
                mimeType,
            );
        const storagePath =
            createAdminTestImageStoragePath({
                draftId,
                questionId,
                fileId,
                extension,
            });
        const signedUpload =
            await createAdminTestImageSignedUpload(
                storagePath,
            );

        const image:
            AdminDraftImageAsset = {
                kind: "image",
                id: fileId,
                fileName:
                    sanitizeAdminTestImageFileName(
                        readBodyString(
                            body.fileName,
                        ),
                        extension,
                    ),
                mimeType,
                sizeBytes,
                width,
                height,
                storagePath,
                alt,
                caption,
            };

        return NextResponse.json<
            AdminTestImageUploadSuccessResponse
        >({
            status: "success",
            image,
            upload: {
                storageUrl:
                    getAdminTestImageStorageUrl(),
                bucket:
                    getAdminTestImageBucket(),
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

        assertAdminTestImageOwnerId(
            draftId,
            "Draft ID",
        );
        assertAdminTestImageOwnerId(
            questionId,
            "Savol ID",
        );

        if (
            !isAdminTestImageStoragePath(
                storagePath,
                {
                    draftId,
                    questionId,
                },
            )
        ) {
            throw new AdminTestImageValidationError(
                "O‘chirilayotgan rasm ushbu savolga tegishli emas.",
            );
        }

        await removeAdminTestImageObject(
            storagePath,
        );

        return NextResponse.json<
            AdminTestImageRemoveSuccessResponse
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
