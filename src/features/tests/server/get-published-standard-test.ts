import "server-only";

import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import {
    convertAdminTestDraftToStudentTest,
} from "@/features/admin/tests/draft/publish/admin-test-draft-to-student-test";
import type {
    StandardTestDefinition,
} from "@/features/tests/model/questions/types";

async function getPublishedDraft(
    topicSlug: string,
    testSlug: string,
    group:
        "grammar" |
        "morphology",
) {
    const draft =
        await adminTestDraftService.getByRoute({
            group,
            topicSlug,
            slug:
                testSlug,
        });

    return draft?.status ===
        "published"
        ? draft
        : null;
}

/**
 * Student test routes are database-authoritative.
 * There is deliberately no static-registry fallback: an unpublished or
 * missing DB test must not be exposed to students by a direct URL.
 */
export async function getStudentStandardTest(
    topicSlug: string,
    testSlug: string,
    group:
        "grammar" |
        "morphology" =
        "grammar",
): Promise<StandardTestDefinition | null> {
    try {
        const draft =
            await getPublishedDraft(
                topicSlug,
                testSlug,
                group,
            );

        if (!draft) {
            return null;
        }

        const converted =
            convertAdminTestDraftToStudentTest(
                draft,
            );

        return converted.kind ===
            "standard"
            ? converted
            : null;
    } catch (error) {
        console.error(
            "Published standard test lookup failed.",
            error,
        );
        return null;
    }
}

export async function isPublishedStandardTest(
    topicSlug: string,
    testSlug: string,
    group:
        "grammar" |
        "morphology" =
        "grammar",
): Promise<boolean> {
    try {
        return Boolean(
            await getPublishedDraft(
                topicSlug,
                testSlug,
                group,
            ),
        );
    } catch (error) {
        console.error(
            "Published standard test availability lookup failed.",
            error,
        );
        return false;
    }
}
