import { connection } from "next/server";

import {
    getCachedPublishedTestDraftSummaries,
} from "@/features/tests/server/get-cached-published-test-drafts";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    getActiveStudentUserId,
} from "@/features/auth/server/get-active-student-user";
import {
    getPurchasedTestIds,
} from "@/features/tests/server/get-test-access";
import type {
    StandardTestSummary,
} from "@/features/tests/model/test-summary";
import {
    sortTestCollectionsByVariant,
} from "@/features/tests/model/sort-test-collections";

function publishedStandardSummary(
    draft: AdminTestDraftSummary,
    purchasedIds: ReadonlySet<string>,
): StandardTestSummary {
    return {
        id: draft.id,
        slug: draft.slug,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        topicSlug: draft.topicSlug,
        questionCount: 20,
        estimatedMinutes: draft.estimatedMinutes,
        difficulty: draft.difficulty,
        access: draft.access,
        tangaPrice:
            draft.access === "premium"
                ? Math.max(1, draft.tangaPrice)
                : 0,
        isPurchased: purchasedIds.has(draft.id),
        href: `/tests/grammatika/${draft.topicSlug}/${draft.slug}`,
        isAvailable: true,
    };
}

/**
 * Student grammar collection pages are database-authoritative.
 * Only tests that have actually been published from Admin are shown.
 * Planned/static placeholders are intentionally excluded.
 */
export async function getStandardTestsByTopic(
    topicSlug: string,
): Promise<readonly StandardTestSummary[]> {
    await connection();

    const publishedDrafts =
        await getCachedPublishedTestDraftSummaries(
            "grammar",
        );

    const drafts = publishedDrafts.filter(
        (draft) =>
            draft.topicSlug === topicSlug &&
            (
                (
                    draft.format === "standard" &&
                    draft.questionCount === 20
                ) ||
                (
                    topicSlug === "sintaksis" &&
                    draft.format === "mixed" &&
                    draft.questionCount === 60
                )
            ),
    );

    const userId = await getActiveStudentUserId();
    const purchasedIds = await getPurchasedTestIds(
        userId,
        drafts.map((draft) => draft.id),
    );

    return sortTestCollectionsByVariant(
        drafts.map((draft) =>
            publishedStandardSummary(
                draft,
                purchasedIds,
            ),
        ),
    );
}
