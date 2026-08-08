import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import {
    isMorphologySubtopicSlug,
    morphologyCategories,
} from "@/features/tests/model/morphology-categories";
import type {
    MorphologyCategory,
    MorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";

/**
 * Morphology category availability and counts come only from published
 * database tests. Static placeholder availability is ignored.
 */
export async function getStudentMorphologyCategories(): Promise<
    readonly MorphologyCategory[]
> {
    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "morphology",
        );
    const testSlugsBySubtopic =
        new Map<
            MorphologySubtopicSlug,
            Set<string>
        >();

    for (
        const draft of
        publishedDrafts
    ) {
        if (
            draft.format !==
                "morphology-standard" ||
            draft.questionCount !==
                20 ||
            !isMorphologySubtopicSlug(
                draft.topicSlug,
            )
        ) {
            continue;
        }

        const current =
            testSlugsBySubtopic.get(
                draft.topicSlug,
            ) ?? new Set<string>();

        current.add(
            draft.slug,
        );
        testSlugsBySubtopic.set(
            draft.topicSlug,
            current,
        );
    }

    return morphologyCategories.map(
        (category) => {
            const testCount =
                testSlugsBySubtopic.get(
                    category.slug,
                )?.size ?? 0;

            return {
                ...category,
                isAvailable:
                    testCount > 0,
                itemCountLabel:
                    `${testCount} ta test`,
            };
        },
    );
}
