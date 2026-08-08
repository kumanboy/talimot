import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import type {
    MorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import type {
    MorphologyTestCollection,
} from "@/features/tests/model/morphology-test-collections";

function publishedMorphologySummary(
    draft:
        AdminTestDraftSummary,
    subtopic:
        MorphologySubtopicSlug,
): MorphologyTestCollection {
    return {
        id:
            draft.id,
        slug:
            draft.slug,
        subtopic,
        title:
            draft.title,
        description:
            draft.description,
        questionCount:
            draft.questionCount,
        estimatedMinutes:
            draft.estimatedMinutes,
        difficulty:
            draft.difficulty,
        access:
            draft.access,
        isAvailable:
            true,
        href:
            `/tests/grammatika/morfologiya/${subtopic}/${draft.slug}`,
    };
}

/**
 * Morphology collection pages are database-authoritative.
 * No planned/locked placeholder tests are returned.
 */
export async function getStudentMorphologyTestsBySubtopic(
    subtopic:
        MorphologySubtopicSlug,
): Promise<
    readonly MorphologyTestCollection[]
> {
    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "morphology",
        );

    return publishedDrafts
        .filter(
            (draft) =>
                draft.topicSlug ===
                    subtopic &&
                draft.format ===
                    "morphology-standard" &&
                draft.questionCount ===
                    20,
        )
        .map(
            (draft) =>
                publishedMorphologySummary(
                    draft,
                    subtopic,
                ),
        );
}
