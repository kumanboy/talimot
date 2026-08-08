import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import type {
    NationalTestFormat,
    NationalTestSummary,
    NationalTestTopic,
} from "@/features/national-certificate/model/national-test-types";

function expectedFormat(
    topic:
        NationalTestTopic,
): NationalTestFormat {
    if (
        topic === "gazal" ||
        topic === "ilmiy-matn" ||
        topic === "badiiy-matn"
    ) {
        return "passage-five";
    }

    if (
        topic === "badiiy-asarlar"
    ) {
        return "standard-five";
    }

    if (
        topic === "aralash"
    ) {
        return "mixed";
    }

    return "diagnostic";
}

function publishedNationalSummary(
    draft:
        AdminTestDraftSummary,
    topic:
        NationalTestTopic,
): NationalTestSummary {
    return {
        id:
            draft.id,
        slug:
            draft.slug,
        title:
            draft.title,
        description:
            draft.description,
        topic,
        format:
            expectedFormat(
                topic,
            ),
        questionCount:
            draft.questionCount,
        estimatedMinutes:
            draft.estimatedMinutes,
        difficulty:
            draft.difficulty,
        access:
            draft.access,
        href:
            `/tests/milliy-sertifikat/${topic}/${draft.slug}`,
        isAvailable:
            true,
    };
}

/**
 * Milliy sertifikat collection pages are database-authoritative.
 * Only published Admin tests are visible to students.
 */
export async function getNationalTestsByTopic(
    topic: NationalTestTopic,
): Promise<
    readonly NationalTestSummary[]
> {
    const requiredFormat =
        expectedFormat(
            topic,
        );
    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "national-certificate",
        );

    return publishedDrafts
        .filter(
            (draft) =>
                draft.topicSlug ===
                    topic &&
                draft.format ===
                    requiredFormat,
        )
        .map(
            (draft) =>
                publishedNationalSummary(
                    draft,
                    topic,
                ),
        );
}
