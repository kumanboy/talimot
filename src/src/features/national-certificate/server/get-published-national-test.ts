import "server-only";

import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import {
    convertAdminTestDraftToStudentTest,
} from "@/features/admin/tests/draft/publish/admin-test-draft-to-student-test";
import type {
    RegisteredNationalTest,
} from "@/features/national-certificate/model/national-test-registry";
import type {
    NationalTestTopic,
} from "@/features/national-certificate/model/national-test-types";

async function getPublishedDraft(
    topic: NationalTestTopic,
    slug: string,
) {
    const draft =
        await adminTestDraftService.getByRoute({
            group:
                "national-certificate",
            topicSlug:
                topic,
            slug,
        });

    return draft?.status ===
        "published"
        ? draft
        : null;
}

/**
 * Milliy sertifikat routes are database-authoritative.
 * Static registry tests are no longer exposed as a fallback.
 */
export async function getStudentNationalTest(
    topic: NationalTestTopic,
    slug: string,
): Promise<RegisteredNationalTest | null> {
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
