"use server";

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
    SaveAdminTestDraftActionState,
} from "@/features/admin/tests/draft/model/save-admin-test-draft-action-state";
import {
    AdminTestDraftConflictError,
    AdminTestDraftNotFoundError,
    AdminTestDraftRouteConflictError,
    AdminTestDraftValidationError,
} from "@/features/admin/tests/draft/repository/admin-test-draft-repository-errors";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

function readString(
    formData:
        FormData,
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

export async function saveAdminTestDraftAction(
    _previousState:
        SaveAdminTestDraftActionState,
    formData:
        FormData,
): Promise<SaveAdminTestDraftActionState> {
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
                "Saqlash ma’lumotlari noto‘g‘ri yuborildi.",
            savedDraft:
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
            savedDraft:
                null,
        };
    }

    const now =
        Math.max(
            Date.now(),
            expectedUpdatedAt + 1,
        );

    const draftToSave:
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
        const savedDraft =
            await adminTestDraftService.update(
                draftToSave,
                expectedUpdatedAt,
            );

        return {
            status:
                "success",
            message:
                "Draft Supabase bazasiga saqlandi.",
            savedDraft,
        };
    } catch (error) {
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
                savedDraft:
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
                savedDraft:
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
                savedDraft:
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
                savedDraft:
                    null,
            };
        }

        throw error;
    }
}
