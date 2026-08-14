import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import {
    AdminImageOptionBundleError,
    parseAdminImageOptionBundleManifest,
    resolveAdminBundleEntryPath,
} from "@/features/admin/tests/draft/bulk-import/admin-image-option-bundle";
import {
    AdminZipReaderError,
    readAdminZipEntries,
} from "@/features/admin/tests/draft/bulk-import/admin-zip-reader";
import {
    getAdminOptionImageOwnerId,
} from "@/features/admin/tests/draft/model/admin-option-image-owner";
import type {
    AdminDraftImageAsset,
    AdminDraftMultipleChoiceQuestion,
    AdminDraftQuestion,
} from "@/features/admin/tests/draft/model/admin-question-types";
import type {
    AdminTestBulkImportErrorResponse,
    AdminTestBulkImportSuccessResponse,
} from "@/features/admin/tests/draft/model/admin-test-bulk-import-types";
import {
    createAdminTestImageStoragePath,
    inspectAdminTestImage,
    normalizeAdminTestImageAlt,
    sanitizeAdminTestImageFileName,
} from "@/features/admin/tests/draft/model/admin-test-image-validation";
import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    AdminTestDraftConflictError,
    AdminTestDraftNotFoundError,
    AdminTestDraftRouteConflictError,
    AdminTestDraftValidationError,
} from "@/features/admin/tests/draft/repository/admin-test-draft-repository-errors";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import {
    getAdminTestAudioBucket,
} from "@/features/admin/tests/draft/storage/admin-test-audio-storage";
import {
    getAdminTestImageBucket,
} from "@/features/admin/tests/draft/storage/admin-test-image-storage";
import {
    getSupabaseAdminStorageClient,
} from "@/lib/supabase/admin-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ZIP_BYTES =
    4 * 1024 * 1024;
const MAX_ZIP_ENTRIES =
    500;
const MAX_UNCOMPRESSED_BYTES =
    100 * 1024 * 1024;
const UPLOAD_BATCH_SIZE =
    10;

function errorResponse(
    message: string,
    status: number,
): NextResponse<AdminTestBulkImportErrorResponse> {
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
    Promise<NextResponse<AdminTestBulkImportErrorResponse> | null> {
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

function readFormString(
    value: FormDataEntryValue | null,
): string {
    return typeof value ===
        "string"
        ? value.trim()
        : "";
}

function createQuestionId(): string {
    return `question-${crypto.randomUUID()}`;
}

function getBaseName(
    path: string,
): string {
    return path
        .split("/")
        .pop() ||
        "image.png";
}

function collectOldImagePaths(
    questions:
        readonly AdminDraftQuestion[],
): readonly string[] {
    const paths =
        new Set<string>();

    for (
        const question of questions
    ) {
        if (
            question.image?.storagePath
        ) {
            paths.add(
                question.image.storagePath,
            );
        }

        if (
            question.type ===
            "multiple-choice"
        ) {
            for (
                const option
                of question.options
            ) {
                if (
                    option.image?.storagePath
                ) {
                    paths.add(
                        option.image.storagePath,
                    );
                }
            }
        }
    }

    return [
        ...paths,
    ];
}

function collectOldAudioPaths(
    questions:
        readonly AdminDraftQuestion[],
): readonly string[] {
    const paths =
        new Set<string>();

    for (
        const question of questions
    ) {
        const explanationAudio =
            question.explanation.audio
                ?.storagePath;

        if (explanationAudio) {
            paths.add(
                explanationAudio,
            );
        }

        if (
            question.type ===
            "matching"
        ) {
            for (
                const item
                of question.items
            ) {
                const path =
                    item.explanation
                        ?.audio
                        ?.storagePath;

                if (path) {
                    paths.add(
                        path,
                    );
                }
            }
        }

        if (
            question.type ===
            "multipart"
        ) {
            for (
                const part
                of question.parts
            ) {
                const path =
                    part.explanation
                        ?.audio
                        ?.storagePath;

                if (path) {
                    paths.add(
                        path,
                    );
                }
            }
        }

        if (
            question.type ===
            "passage-group"
        ) {
            for (
                const nestedQuestion
                of question.questions
            ) {
                const path =
                    nestedQuestion
                        .explanation
                        .audio
                        ?.storagePath;

                if (path) {
                    paths.add(
                        path,
                    );
                }
            }
        }
    }

    return [
        ...paths,
    ];
}

async function removeStoragePathsBestEffort({
    bucket,
    paths,
}: {
    readonly bucket: string;
    readonly paths:
        readonly string[];
}) {
    if (
        paths.length === 0
    ) {
        return;
    }

    try {
        const storage =
            getSupabaseAdminStorageClient();

        for (
            let index = 0;
            index < paths.length;
            index += 100
        ) {
            const batch =
                paths.slice(
                    index,
                    index + 100,
                );
            const {
                error,
            } = await storage
                .from(bucket)
                .remove(
                    batch,
                );

            if (error) {
                console.error(
                    "Bulk-import cleanup failed.",
                    error,
                );
            }
        }
    } catch (error) {
        console.error(
            "Bulk-import cleanup failed.",
            error,
        );
    }
}

async function uploadImageAsset({
    draftId,
    questionId,
    optionId,
    entryName,
    bytes,
    alt,
}: {
    readonly draftId: string;
    readonly questionId: string;
    readonly optionId:
        "A" | "B" | "C" | "D";
    readonly entryName: string;
    readonly bytes: Uint8Array;
    readonly alt: string;
}): Promise<{
    readonly image:
        AdminDraftImageAsset;
    readonly storagePath: string;
}> {
    const inspection =
        inspectAdminTestImage(
            bytes,
            "",
        );
    const fileId =
        crypto.randomUUID();
    const ownerId =
        getAdminOptionImageOwnerId(
            questionId,
            optionId,
        );
    const storagePath =
        createAdminTestImageStoragePath({
            draftId,
            questionId:
                ownerId,
            fileId,
            extension:
                inspection.extension,
        });
    const storage =
        getSupabaseAdminStorageClient();
    const {
        error,
    } = await storage
        .from(
            getAdminTestImageBucket(),
        )
        .upload(
            storagePath,
            Buffer.from(
                bytes.buffer,
                bytes.byteOffset,
                bytes.byteLength,
            ),
            {
                upsert: false,
                cacheControl:
                    "3600",
                contentType:
                    inspection.mimeType,
            },
        );

    if (error) {
        throw new Error(
            `${questionId}-${optionId} rasmini Storage’ga yuklab bo‘lmadi: ${error.message}`,
        );
    }

    const image:
        AdminDraftImageAsset = {
            kind: "image",
            id: fileId,
            fileName:
                sanitizeAdminTestImageFileName(
                    getBaseName(
                        entryName,
                    ),
                    inspection.extension,
                ),
            mimeType:
                inspection.mimeType,
            sizeBytes:
                bytes.byteLength,
            width:
                inspection.width,
            height:
                inspection.height,
            storagePath,
            alt:
                normalizeAdminTestImageAlt(
                    alt,
                ),
            caption: null,
        };

    return {
        image,
        storagePath,
    };
}

interface PendingOptionUpload {
    readonly questionIndex: number;
    readonly optionIndex: number;
    readonly questionId: string;
    readonly optionId:
        "A" | "B" | "C" | "D";
    readonly text: string;
    readonly entryName: string;
    readonly bytes: Uint8Array;
    readonly alt: string;
}

async function uploadOptionImages({
    draftId,
    uploads,
}: {
    readonly draftId: string;
    readonly uploads:
        readonly PendingOptionUpload[];
}): Promise<{
    readonly assets:
        ReadonlyMap<
            string,
            AdminDraftImageAsset
        >;
    readonly storagePaths:
        readonly string[];
}> {
    const assets =
        new Map<
            string,
            AdminDraftImageAsset
        >();
    const storagePaths:
        string[] = [];

    try {
        for (
            let index = 0;
            index < uploads.length;
            index +=
                UPLOAD_BATCH_SIZE
        ) {
            const batch =
                uploads.slice(
                    index,
                    index +
                        UPLOAD_BATCH_SIZE,
                );
            const settled =
                await Promise.allSettled(
                    batch.map(
                        async (
                            upload,
                        ) => {
                            const result =
                                await uploadImageAsset({
                                    draftId,
                                    questionId:
                                        upload.questionId,
                                    optionId:
                                        upload.optionId,
                                    entryName:
                                        upload.entryName,
                                    bytes:
                                        upload.bytes,
                                    alt:
                                        upload.alt,
                                });

                            return {
                                key:
                                    `${upload.questionIndex}:${upload.optionIndex}`,
                                ...result,
                            };
                        },
                    ),
                );

            let firstError:
                unknown = null;

            for (
                const result
                of settled
            ) {
                if (
                    result.status ===
                    "fulfilled"
                ) {
                    assets.set(
                        result.value.key,
                        result.value.image,
                    );
                    storagePaths.push(
                        result.value.storagePath,
                    );
                    continue;
                }

                if (
                    firstError ===
                    null
                ) {
                    firstError =
                        result.reason;
                }
            }

            if (
                firstError !== null
            ) {
                throw firstError;
            }
        }
    } catch (error) {
        await removeStoragePathsBestEffort({
            bucket:
                getAdminTestImageBucket(),
            paths:
                storagePaths,
        });
        throw error;
    }

    return {
        assets,
        storagePaths,
    };
}

function handleKnownError(
    error: unknown,
): NextResponse<AdminTestBulkImportErrorResponse> {
    if (
        error instanceof
            AdminZipReaderError ||
        error instanceof
            AdminImageOptionBundleError
    ) {
        return errorResponse(
            error.message,
            400,
        );
    }

    if (
        error instanceof
        AdminTestDraftConflictError
    ) {
        return errorResponse(
            "Draft boshqa oynada o‘zgartirilgan. Sahifani yangilang va importni qayta boshlang.",
            409,
        );
    }

    if (
        error instanceof
        AdminTestDraftNotFoundError
    ) {
        return errorResponse(
            "Import qilinadigan draft topilmadi.",
            404,
        );
    }

    if (
        error instanceof
        AdminTestDraftRouteConflictError
    ) {
        return errorResponse(
            "Ushbu test route’i boshqa draft bilan to‘qnashmoqda.",
            409,
        );
    }

    if (
        error instanceof
        AdminTestDraftValidationError
    ) {
        return errorResponse(
            error.validationMessages.join(
                " ",
            ),
            400,
        );
    }

    console.error(
        "Admin test ZIP bulk import failed.",
        error,
    );

    return errorResponse(
        error instanceof Error &&
            error.message
            ? error.message
            : "ZIP import vaqtida server xatoligi yuz berdi.",
        500,
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

    let uploadedStoragePaths:
        readonly string[] = [];

    try {
        const formData =
            await request.formData();
        const draftId =
            readFormString(
                formData.get(
                    "draftId",
                ),
            );
        const expectedUpdatedAt =
            Number(
                readFormString(
                    formData.get(
                        "expectedUpdatedAt",
                    ),
                ),
            );
        const bundleFile =
            formData.get(
                "bundle",
            );

        if (
            !draftId ||
            !Number.isFinite(
                expectedUpdatedAt,
            )
        ) {
            return errorResponse(
                "Draft ID yoki versiya ma’lumoti noto‘g‘ri yuborildi.",
                400,
            );
        }

        if (
            !(bundleFile instanceof File)
        ) {
            return errorResponse(
                "ZIP import fayli tanlanmagan.",
                400,
            );
        }

        if (
            bundleFile.size <= 0 ||
            bundleFile.size >
                MAX_ZIP_BYTES
        ) {
            return errorResponse(
                "ZIP fayl hajmi 4 MB dan oshmasligi kerak.",
                400,
            );
        }

        if (
            !bundleFile.name
                .toLowerCase()
                .endsWith(".zip")
        ) {
            return errorResponse(
                "Faqat .zip import bundle yuklash mumkin.",
                400,
            );
        }

        const existingDraft =
            await adminTestDraftService
                .getById(
                    draftId,
                );

        if (!existingDraft) {
            throw new AdminTestDraftNotFoundError(
                draftId,
            );
        }

        if (
            existingDraft.status ===
                "published" ||
            existingDraft.status ===
                "archived"
        ) {
            return errorResponse(
                "Nashr qilingan yoki arxivlangan testga bulk import qilib bo‘lmaydi.",
                400,
            );
        }

        if (
            existingDraft.metadata.format !==
                "standard" &&
            existingDraft.metadata.format !==
                "morphology-standard"
        ) {
            return errorResponse(
                "Image-option ZIP import hozircha faqat standart grammatika testlari uchun ishlaydi.",
                400,
            );
        }

        const zipBytes =
            new Uint8Array(
                await bundleFile.arrayBuffer(),
            );
        const entries =
            readAdminZipEntries({
                bytes:
                    zipBytes,
                maxEntries:
                    MAX_ZIP_ENTRIES,
                maxTotalUncompressedBytes:
                    MAX_UNCOMPRESSED_BYTES,
            });
        const parsedBundle =
            parseAdminImageOptionBundleManifest(
                entries,
            );
        const manifest =
            parsedBundle.manifest;

        if (
            manifest.questionCount !==
            20
        ) {
            return errorResponse(
                `Standart test import bundle’i aynan 20 ta savol bo‘lishi kerak. Hozir: ${manifest.questionCount}.`,
                400,
            );
        }

        const questionIds =
            manifest.questions.map(
                () =>
                    createQuestionId(),
            );
        const uploads:
            PendingOptionUpload[] =
            [];

        manifest.questions.forEach(
            (
                question,
                questionIndex,
            ) => {
                question.options.forEach(
                    (
                        option,
                        optionIndex,
                    ) => {
                        const entryName =
                            resolveAdminBundleEntryPath({
                                baseDirectory:
                                    parsedBundle.manifestBaseDirectory,
                                relativePath:
                                    option.imageFile,
                            });
                        const bytes =
                            entries.get(
                                entryName,
                            );

                        if (!bytes) {
                            throw new AdminImageOptionBundleError(
                                `${question.number}-savol ${option.id} varianti rasmi ZIP ichida topilmadi: ${option.imageFile}.`,
                            );
                        }

                        uploads.push({
                            questionIndex,
                            optionIndex,
                            questionId:
                                questionIds[
                                    questionIndex
                                ],
                            optionId:
                                option.id,
                            text:
                                option.text,
                            entryName,
                            bytes,
                            alt:
                                option.alt,
                        });
                    },
                );
            },
        );

        const uploadResult =
            await uploadOptionImages({
                draftId,
                uploads,
            });
        uploadedStoragePaths =
            uploadResult.storagePaths;

        const importedQuestions:
            AdminDraftMultipleChoiceQuestion[] =
            manifest.questions.map(
                (
                    question,
                    questionIndex,
                ): AdminDraftMultipleChoiceQuestion => ({
                    type:
                        "multiple-choice",
                    id:
                        questionIds[
                            questionIndex
                        ],
                    order:
                        questionIndex +
                        1,
                    sourceOrder:
                        question.number,
                    section:
                        "grammar",
                    question:
                        question.question,
                    instruction:
                        question.instruction,
                    context:
                        null,
                    maximumScore:
                        1,
                    image:
                        null,
                    explanation: {
                        text:
                            "ZIP bulk import orqali qo‘shildi. To‘g‘ri javob va variant rasmlarini tekshiring.",
                        audio:
                            null,
                    },
                    options:
                        question.options.map(
                            (
                                option,
                                optionIndex,
                            ) => ({
                                id:
                                    option.id,
                                text:
                                    option.text,
                                image:
                                    uploadResult.assets.get(
                                        `${questionIndex}:${optionIndex}`,
                                    ) ??
                                    null,
                            }),
                        ),
                    correctOptionId:
                        question.correctOptionId,
                }),
            );

        if (
            importedQuestions.some(
                (question) =>
                    question.options.some(
                        (option) =>
                            !option.image,
                    ),
            )
        ) {
            throw new Error(
                "Import qilingan variant rasmlaridan ayrimlari tayyorlanmadi.",
            );
        }

        const now =
            Math.max(
                Date.now(),
                expectedUpdatedAt +
                    1,
            );
        const draftToSave:
            AdminTestDraft = {
                ...existingDraft,
                source:
                    "pdf-import",
                questions:
                    importedQuestions,
                audit: {
                    ...existingDraft.audit,
                    updatedAt:
                        now,
                    updatedBy:
                        "admin",
                },
            };
        const oldImagePaths =
            collectOldImagePaths(
                existingDraft.questions,
            );
        const oldAudioPaths =
            collectOldAudioPaths(
                existingDraft.questions,
            );

        let savedDraft:
            AdminTestDraft;

        try {
            savedDraft =
                await adminTestDraftService
                    .update(
                        draftToSave,
                        expectedUpdatedAt,
                    );
        } catch (error) {
            await removeStoragePathsBestEffort({
                bucket:
                    getAdminTestImageBucket(),
                paths:
                    uploadedStoragePaths,
            });
            uploadedStoragePaths =
                [];
            throw error;
        }

        await Promise.all([
            removeStoragePathsBestEffort({
                bucket:
                    getAdminTestImageBucket(),
                paths:
                    oldImagePaths.filter(
                        (path) =>
                            !uploadedStoragePaths.includes(
                                path,
                            ),
                    ),
            }),
            removeStoragePathsBestEffort({
                bucket:
                    getAdminTestAudioBucket(),
                paths:
                    oldAudioPaths,
            }),
        ]);

        return NextResponse.json<
            AdminTestBulkImportSuccessResponse
        >({
            status:
                "success",
            message:
                `${manifest.questionCount} ta savol va ${manifest.optionCount} ta variant rasmi import qilindi. Draft avtomatik saqlandi.`,
            bundleTitle:
                manifest.title,
            importedQuestionCount:
                manifest.questionCount,
            importedImageCount:
                manifest.optionCount,
            savedDraft,
        });
    } catch (error) {
        if (
            uploadedStoragePaths.length >
            0
        ) {
            await removeStoragePathsBestEffort({
                bucket:
                    getAdminTestImageBucket(),
                paths:
                    uploadedStoragePaths,
            });
        }

        return handleKnownError(
            error,
        );
    }
}
