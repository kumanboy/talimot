import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import type {
    StandardTestSummary,
} from "@/features/tests/model/test-summary";

function publishedStandardSummary(
    draft:
        AdminTestDraftSummary,
): StandardTestSummary {
    return {
        id:
            draft.id,
        slug:
            draft.slug,
        title:
            draft.title,
        description:
            draft.description,
        category:
            draft.category,
        topicSlug:
            draft.topicSlug,
        questionCount:
            20,
        estimatedMinutes:
            draft.estimatedMinutes,
        difficulty:
            draft.difficulty,
        access:
            draft.access,
        href:
            `/tests/grammatika/${draft.topicSlug}/${draft.slug}`,
        isAvailable:
            true,
    };
}

/**
 * Student grammar collection pages are database-authoritative.
 * Only tests that have actually been published from Admin are shown.
 * Planned/static placeholders are intentionally excluded.
 */
export async function getStandardTestsByTopic(
    topicSlug: string,
): Promise<
    readonly StandardTestSummary[]
> {
    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "grammar",
        );

    return publishedDrafts
        .filter(
            (draft) =>
                draft.topicSlug ===
                    topicSlug &&
                draft.format ===
                    "standard" &&
                draft.questionCount ===
                    20,
        )
        .map(
            publishedStandardSummary,
        );
}
