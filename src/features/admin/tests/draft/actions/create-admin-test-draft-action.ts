"use server";

import {
    redirect,
} from "next/navigation";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import {
    createEmptyAdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-factory";
import type {
    AdminTestDraftAccess,
    AdminTestDraftDifficulty,
    AdminTestDraftFormat,
    AdminTestDraftGroup,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    AdminTestDraftRouteConflictError,
    AdminTestDraftValidationError,
} from "@/features/admin/tests/draft/repository/admin-test-draft-repository-errors";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

import type {
    CreateAdminTestDraftActionState,
} from "../model/create-admin-test-draft-action-state";

const allowedGroups =
    new Set<AdminTestDraftGroup>([
        "grammar",
        "national-certificate",
    ]);

const allowedFormats =
    new Set<AdminTestDraftFormat>([
        "standard",
        "passage-five",
        "standard-five",
        "mixed",
        "diagnostic",
    ]);

const allowedDifficulties =
    new Set<AdminTestDraftDifficulty>([
        "easy",
        "medium",
        "hard",
    ]);

const allowedAccess =
    new Set<AdminTestDraftAccess>([
        "free",
        "premium",
    ]);

function readText(
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
        ? value.trim()
        : "";
}

function isSlug(
    value: string,
): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        value,
    );
}

export async function createAdminTestDraftAction(
    _previousState:
        CreateAdminTestDraftActionState,
    formData:
        FormData,
): Promise<CreateAdminTestDraftActionState> {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    const values = {
        title:
            readText(
                formData,
                "title",
            ),
        description:
            readText(
                formData,
                "description",
            ),
        group:
            readText(
                formData,
                "group",
            ),
        category:
            readText(
                formData,
                "category",
            ),
        topicSlug:
            readText(
                formData,
                "topicSlug",
            ),
        slug:
            readText(
                formData,
                "slug",
            ),
        format:
            readText(
                formData,
                "format",
            ),
        difficulty:
            readText(
                formData,
                "difficulty",
            ),
        access:
            readText(
                formData,
                "access",
            ),
        estimatedMinutes:
            readText(
                formData,
                "estimatedMinutes",
            ),
    };

    const fieldErrors:
        Record<string, string> = {};

    if (!values.title) {
        fieldErrors.title =
            "Test nomini kiriting.";
    }

    if (!values.category) {
        fieldErrors.category =
            "Kategoriyani kiriting.";
    }

    if (
        !allowedGroups.has(
            values.group as
                AdminTestDraftGroup,
        )
    ) {
        fieldErrors.group =
            "Test guruhini tanlang.";
    }

    if (
        !values.topicSlug ||
        !isSlug(
            values.topicSlug,
        )
    ) {
        fieldErrors.topicSlug =
            "Faqat kichik lotin harflari, raqamlar va tire ishlating.";
    }

    if (
        !values.slug ||
        !isSlug(
            values.slug,
        )
    ) {
        fieldErrors.slug =
            "Faqat kichik lotin harflari, raqamlar va tire ishlating.";
    }

    if (
        !allowedFormats.has(
            values.format as
                AdminTestDraftFormat,
        )
    ) {
        fieldErrors.format =
            "Test formatini tanlang.";
    }

    if (
        !allowedDifficulties.has(
            values.difficulty as
                AdminTestDraftDifficulty,
        )
    ) {
        fieldErrors.difficulty =
            "Qiyinlik darajasini tanlang.";
    }

    if (
        !allowedAccess.has(
            values.access as
                AdminTestDraftAccess,
        )
    ) {
        fieldErrors.access =
            "Access turini tanlang.";
    }

    const estimatedMinutes =
        Number(
            values.estimatedMinutes,
        );

    if (
        !Number.isInteger(
            estimatedMinutes,
        ) ||
        estimatedMinutes <= 0 ||
        estimatedMinutes > 600
    ) {
        fieldErrors.estimatedMinutes =
            "Vaqt 1 dan 600 gacha bo‘lgan butun son bo‘lishi kerak.";
    }

    if (
        Object.keys(
            fieldErrors,
        ).length > 0
    ) {
        return {
            status:
                "error",
            message:
                "Formadagi xatolarni to‘g‘rilang.",
            fieldErrors,
            values,
        };
    }

    const draft =
        createEmptyAdminTestDraft({
            metadata: {
                title:
                    values.title,
                description:
                    values.description,
                group:
                    values.group as
                        AdminTestDraftGroup,
                category:
                    values.category,
                topicSlug:
                    values.topicSlug,
                slug:
                    values.slug,
                format:
                    values.format as
                        AdminTestDraftFormat,
                difficulty:
                    values.difficulty as
                        AdminTestDraftDifficulty,
                access:
                    values.access as
                        AdminTestDraftAccess,
                estimatedMinutes,
            },
            source:
                "manual",
            createdBy:
                "admin",
        });

    try {
        const created =
            await adminTestDraftService.create(
                draft,
            );

        redirect(
            `/admin/tests/${encodeURIComponent(
                created.id,
            )}/edit`,
        );
    } catch (error) {
        if (
            error instanceof
            AdminTestDraftRouteConflictError
        ) {
            return {
                status:
                    "error",
                message:
                    "Bu guruh, topic slug va test slug kombinatsiyasi allaqachon mavjud.",
                fieldErrors: {
                    topicSlug:
                        "Mavjud route bilan to‘qnashmoqda.",
                    slug:
                        "Mavjud route bilan to‘qnashmoqda.",
                },
                values,
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
                fieldErrors:
                    {},
                values,
            };
        }

        throw error;
    }
}
