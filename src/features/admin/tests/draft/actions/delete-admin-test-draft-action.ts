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
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";

function revalidateDeletedDraft(
    draft:
        AdminTestDraft,
): void {
    revalidatePath(
        "/admin/tests",
    );
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

export async function deleteAdminTestDraftAction(
    formData:
        FormData,
): Promise<void> {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    const rawId =
        formData.get(
            "draftId",
        );
    const draftId =
        typeof rawId ===
        "string"
            ? rawId.trim()
            : "";

    if (!draftId) {
        redirect(
            "/admin/tests",
        );
        return;
    }

    const draft =
        await adminTestDraftService.getById(
            draftId,
        );

    if (!draft) {
        revalidatePath(
            "/admin/tests",
        );
        redirect(
            "/admin/tests",
        );
        return;
    }

    await adminTestDraftService.delete(
        draftId,
    );

    revalidateDeletedDraft(
        draft,
    );

    redirect(
        "/admin/tests",
    );
}
