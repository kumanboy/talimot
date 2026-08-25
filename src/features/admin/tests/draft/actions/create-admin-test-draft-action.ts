"use server";

import {
    redirect,
} from "next/navigation";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import {
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
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
        "morphology",
    ]);

const allowedFormats =
    new Set<AdminTestDraftFormat>([
        "standard",
        "passage-five",
        "standard-five",
        "mixed",
        "diagnostic",
        "morphology-standard",
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

const nationalCertificateCategoryRoutes = {
    "Badiiy asarlar": {
        topicSlug: "badiiy-asarlar",
        format: "standard-five",
    },
    "Ilmiy matn": {
        topicSlug: "ilmiy-matn",
        format: "passage-five",
    },
    "Badiiy matn": {
        topicSlug: "badiiy-matn",
        format: "passage-five",
    },
    "G‘azal": {
        topicSlug: "gazal",
        format: "passage-five",
    },
    Aralash: {
        topicSlug: "aralash",
        format: "mixed",
    },
    Diagnostika: {
        topicSlug: "diagnostika",
        format: "diagnostic",
    },
} as const;

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

    const rawValues = {
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
        tangaPrice:
            readText(
                formData,
                "tangaPrice",
            ),
        estimatedMinutes:
            readText(
                formData,
                "estimatedMinutes",
            ),
    };

    const isDiagnostic =
        rawValues.format ===
        "diagnostic";

    const isMorphology =
        rawValues.group ===
            "morphology" ||
        rawValues.format ===
            "morphology-standard";

    const nationalCategoryRoute =
        rawValues.group ===
            "national-certificate" &&
        rawValues.category in
            nationalCertificateCategoryRoutes
            ? nationalCertificateCategoryRoutes[
                rawValues.category as
                    keyof typeof nationalCertificateCategoryRoutes
            ]
            : null;

    const values =
        isDiagnostic
            ? {
                ...rawValues,
                group:
                    "national-certificate",
                category:
                    "Diagnostika",
                topicSlug:
                    "diagnostika",
                format:
                    "diagnostic",
                difficulty:
                    "hard",
                estimatedMinutes:
                    "180",
            }
            : isMorphology
              ? {
                    ...rawValues,
                    group:
                        "morphology",
                    category:
                        "Morfologiya",
                    format:
                        "morphology-standard",
                }
              : nationalCategoryRoute
                ? {
                    ...rawValues,
                    group:
                        "national-certificate",
                    topicSlug:
                        nationalCategoryRoute.topicSlug,
                    format:
                        nationalCategoryRoute.format,
                }
                : rawValues;

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
        values.group ===
            "morphology" &&
        !isMorphologySubtopicSlug(
            values.topicSlug,
        )
    ) {
        fieldErrors.topicSlug =
            "Morfologiya bo‘limini tanlang.";
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
            "Kirish turini tanlang.";
    }

    const requestedTangaPrice =
        Number(
            values.tangaPrice,
        );

    const tangaPrice =
        values.access === "premium"
            ? requestedTangaPrice
            : 0;

    if (
        values.access === "premium" &&
        (
            !Number.isInteger(
                requestedTangaPrice,
            ) ||
            requestedTangaPrice < 1 ||
            requestedTangaPrice > 1000
        )
    ) {
        fieldErrors.tangaPrice =
            "Pullik test narxi 1 dan 1000 gacha bo‘lgan butun Tanga miqdori bo‘lishi kerak.";
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
                tangaPrice,
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
