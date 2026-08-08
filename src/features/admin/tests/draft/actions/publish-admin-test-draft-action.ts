"use server";

import {
    revalidatePath,
} from "next/cache";
import {
    redirect,
} from "next/navigation";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import type {
    PublishAdminTestDraftActionState,
} from "@/features/admin/tests/draft/model/publish-admin-test-draft-action-state";
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
    AdminTestDraftPublishConversionError,
    convertAdminTestDraftToStudentTest,
} from "@/features/admin/tests/draft/publish/admin-test-draft-to-student-test";

function readString(
    formData: FormData,
    key: string,
): string {
    const value =
        formData.get(
            key,
        );

    return typeof value ===
        "string"
        ? value
        : "";
}

function revalidatePublishedDraft(
    draft: AdminTestDraft,
): void {
    revalidatePath(
        "/tests",
    );

    if (
        draft.metadata.group ===
        "national-certificate"
    ) {
        const collectionPath =
            `/tests/milliy-sertifikat/${draft.metadata.topicSlug}`;

        revalidatePath(
            collectionPath,
        );
        revalidatePath(
            `${collectionPath}/${draft.metadata.slug}`,
        );

        if (
            draft.metadata.format ===
            "diagnostic"
        ) {
            revalidatePath(
                `${collectionPath}/${draft.metadata.slug}/imtihon`,
            );
        }
        return;
    }

    if (
        draft.metadata.group ===
        "morphology"
    ) {
        const collectionPath =
            `/tests/grammatika/morfologiya/${draft.metadata.topicSlug}`;

        revalidatePath(
            "/tests/grammatika/morfologiya",
        );
        revalidatePath(
            collectionPath,
        );
        revalidatePath(
            `${collectionPath}/${draft.metadata.slug}`,
        );
        return;
    }

    const collectionPath =
        `/tests/grammatika/${draft.metadata.topicSlug}`;

    revalidatePath(
        collectionPath,
    );
    revalidatePath(
        `${collectionPath}/${draft.metadata.slug}`,
    );
}

export async function publishAdminTestDraftAction(
    _previousState:
        PublishAdminTestDraftActionState,
    formData: FormData,
): Promise<PublishAdminTestDraftActionState> {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    const draftJson =
        readString(
            formData,
            "draft",
        );
    const expectedUpdatedAt =
        Number(
            readString(
                formData,
                "expectedUpdatedAt",
            ),
        );

    if (
        !draftJson ||
        !Number.isFinite(
            expectedUpdatedAt,
        )
    ) {
        return {
            status:
                "error",
            message:
                "Nashr qilish ma’lumotlari noto‘g‘ri yuborildi.",
            publishedDraft:
                null,
        };
    }

    let submittedDraft:
        AdminTestDraft;

    try {
        submittedDraft =
            JSON.parse(
                draftJson,
            ) as AdminTestDraft;
    } catch {
        return {
            status:
                "error",
            message:
                "Draft ma’lumotlarini o‘qib bo‘lmadi.",
            publishedDraft:
                null,
        };
    }

    const now =
        Math.max(
            Date.now(),
            expectedUpdatedAt + 1,
        );
    const draftToPublish:
        AdminTestDraft = {
        ...submittedDraft,
        audit: {
            ...submittedDraft.audit,
            updatedAt:
                now,
            updatedBy:
                "admin",
        },
    };

    try {
        convertAdminTestDraftToStudentTest(
            draftToPublish,
        );

        const publishedDraft =
            await adminTestDraftService.publish(
                draftToPublish,
                expectedUpdatedAt,
            );

        revalidatePublishedDraft(
            publishedDraft,
        );

        return {
            status:
                "success",
            message:
                "Test nashr qilindi va student route uchun faollashtirildi.",
            publishedDraft,
        };
    } catch (error) {
        if (
            error instanceof
            AdminTestDraftPublishConversionError
        ) {
            return {
                status:
                    "error",
                message:
                    error.message,
                publishedDraft:
                    null,
            };
        }

        if (
            error instanceof
            AdminTestDraftValidationError
        ) {
            return {
                status:
                    "error",
                message:
                    error.validationMessages.join(
                        " ",
                    ),
                publishedDraft:
                    null,
            };
        }

        if (
            error instanceof
            AdminTestDraftConflictError
        ) {
            return {
                status:
                    "conflict",
                message:
                    "Bu draft boshqa oynada o‘zgartirilgan. Sahifani yangilang va qayta urinib ko‘ring.",
                publishedDraft:
                    null,
            };
        }

        if (
            error instanceof
            AdminTestDraftRouteConflictError
        ) {
            return {
                status:
                    "error",
                message:
                    "Ushbu route boshqa draft tomonidan band qilingan.",
                publishedDraft:
                    null,
            };
        }

        if (
            error instanceof
            AdminTestDraftNotFoundError
        ) {
            return {
                status:
                    "error",
                message:
                    "Draft topilmadi yoki o‘chirilgan.",
                publishedDraft:
                    null,
            };
        }

        throw error;
    }
}
