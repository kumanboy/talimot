import { connection } from "next/server";

import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    getActiveStudentUserId,
} from "@/features/auth/server/get-active-student-user";
import type {
    MorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import type {
    MorphologyTestCollection,
} from "@/features/tests/model/morphology-test-collections";
import {
    getPurchasedTestIds,
} from "@/features/tests/server/get-test-access";

function publishedMorphologySummary(
    draft: AdminTestDraftSummary,
    subtopic: MorphologySubtopicSlug,
    purchasedIds: ReadonlySet<string>,
): MorphologyTestCollection {
    return {
        id: draft.id,
        slug: draft.slug,
        subtopic,
        title: draft.title,
        description: draft.description,
        questionCount: draft.questionCount,
        estimatedMinutes: draft.estimatedMinutes,
        difficulty: draft.difficulty,
        access: draft.access,
        tangaPrice:
            draft.access === "premium"
                ? Math.max(1, draft.tangaPrice)
                : 0,
        isPurchased: purchasedIds.has(draft.id),
        isAvailable: true,
        href: `/tests/grammatika/morfologiya/${subtopic}/${draft.slug}`,
    };
}

/**
 * Morphology collection pages are database-authoritative.
 * No planned/locked placeholder tests are returned.
 */
export async function getStudentMorphologyTestsBySubtopic(
    subtopic: MorphologySubtopicSlug,
): Promise<readonly MorphologyTestCollection[]> {
    await connection();

    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "morphology",
            {
                topicSlug: subtopic,
                format: "morphology-standard",
            },
        );

    const drafts = publishedDrafts.filter(
        (draft) =>
            draft.topicSlug === subtopic &&
            draft.format === "morphology-standard" &&
            draft.questionCount === 20,
    );

    const userId = await getActiveStudentUserId();
    const purchasedIds = await getPurchasedTestIds(
        userId,
        drafts.map((draft) => draft.id),
    );

    return drafts.map((draft) =>
        publishedMorphologySummary(
            draft,
            subtopic,
            purchasedIds,
        ),
    );
}
