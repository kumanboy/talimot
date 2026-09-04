import "server-only";

import {
    getPublishedTestDraftByRoute,
} from "@/features/tests/server/get-published-test-draft-by-route";
import {
    convertAdminTestDraftToStudentTest,
} from "@/features/admin/tests/draft/publish/admin-test-draft-to-student-test";
import type {
    RegisteredNationalTest,
} from "@/features/national-certificate/model/national-test-registry";
import type {
    StandardTestDefinition,
} from "@/features/tests/model/questions/types";
import type {
    NationalTestTopic,
} from "@/features/national-certificate/model/national-test-types";

function getPublishedDraft(
    topic: NationalTestTopic,
    slug: string,
) {
    return getPublishedTestDraftByRoute(
        "national-certificate",
        topic,
        slug,
    );
}

/**
 * Milliy sertifikat routes are database-authoritative.
 * Static registry tests are no longer exposed as a fallback.
 */
export async function getStudentNationalTest(
    topic: NationalTestTopic,
    slug: string,
): Promise<RegisteredNationalTest | StandardTestDefinition | null> {
    try {
        const draft =
            await getPublishedDraft(
                topic,
                slug,
            );

        if (!draft) {
            return null;
        }

        const converted =
            convertAdminTestDraftToStudentTest(
                draft,
            );

        if (
            converted.kind ===
                "standard"
        ) {
            return converted.topicSlug ===
                topic
                ? converted
                : null;
        }

        if (
            "topic" in converted &&
            converted.topic ===
                topic
        ) {
            return converted;
        }

        return null;
    } catch (error) {
        console.error(
            "Published national test lookup failed.",
            error,
        );
        return null;
    }
}

export async function isPublishedNationalTest(
    topic: NationalTestTopic,
    slug: string,
): Promise<boolean> {
    try {
        return Boolean(
            await getPublishedDraft(
                topic,
                slug,
            ),
        );
    } catch (error) {
        console.error(
            "Published national test availability lookup failed.",
            error,
        );
        return false;
    }
}
