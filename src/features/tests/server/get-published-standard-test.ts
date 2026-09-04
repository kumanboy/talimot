import "server-only";

import {
    getPublishedTestDraftByRoute,
} from "@/features/tests/server/get-published-test-draft-by-route";
import {
    convertAdminTestDraftToStudentTest,
} from "@/features/admin/tests/draft/publish/admin-test-draft-to-student-test";
import type {
    StandardTestDefinition,
} from "@/features/tests/model/questions/types";
import type {
    MixedTestDefinition,
} from "@/features/national-certificate/model/mixed-test-types";

function getPublishedDraft(
    topicSlug: string,
    testSlug: string,
    group:
        "grammar" |
        "morphology",
) {
    return getPublishedTestDraftByRoute(
        group,
        topicSlug,
        testSlug,
    );
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


export async function getStudentGrammarTest(
    topicSlug: string,
    testSlug: string,
): Promise<
    StandardTestDefinition | MixedTestDefinition | null
> {
    try {
        const draft =
            await getPublishedDraft(
                topicSlug,
                testSlug,
                "grammar",
            );

        if (!draft) {
            return null;
        }

        const converted =
            convertAdminTestDraftToStudentTest(
                draft,
            );

        if (converted.kind === "standard") {
            return converted;
        }

        if (
            topicSlug === "sintaksis" &&
            converted.kind === "mixed" &&
            converted.topic === "sintaksis"
        ) {
            return converted;
        }

        return null;
    } catch (error) {
        console.error(
            "Published grammar test lookup failed.",
            error,
        );
        return null;
    }
}
