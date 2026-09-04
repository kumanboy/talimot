import { connection } from "next/server";

import { getActiveStudentUserId } from "@/features/auth/server/get-active-student-user";
import { getPurchasedTestIds } from "@/features/tests/server/get-test-access";

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
import {
    sortTestCollectionsByVariant,
} from "@/features/tests/model/sort-test-collections";

function expectedFormats(
    topic:
        NationalTestTopic,
): readonly NationalTestFormat[] {
    if (
        topic === "gazal" ||
        topic === "ilmiy-matn" ||
        topic === "badiiy-matn"
    ) {
        return ["passage-five"];
    }

    if (
        topic === "badiiy-asarlar"
    ) {
        // New literary-works tests are regular 20-question standard tests.
        // Keep old 5-question published tests visible for backwards compatibility.
        return [
            "standard",
            "standard-five",
        ];
    }

    if (
        topic === "aralash"
    ) {
        return ["mixed"];
    }

    return ["diagnostic"];
}

function publishedNationalSummary(
    draft: AdminTestDraftSummary,
    topic: NationalTestTopic,
    purchasedIds: ReadonlySet<string>,
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
            draft.format as
                NationalTestFormat,
        questionCount:
            draft.questionCount,
        estimatedMinutes:
            draft.estimatedMinutes,
        difficulty:
            draft.difficulty,
        access:
            draft.access,
        tangaPrice:
            draft.access === "premium"
                ? Math.max(1, draft.tangaPrice)
                : 0,
        isPurchased:
            purchasedIds.has(draft.id),
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
    await connection();

    const requiredFormats =
        new Set(
            expectedFormats(
                topic,
            ),
        );
    const publishedDrafts =
        await adminTestDraftService.listPublished(
            "national-certificate",
            {
                topicSlug: topic,
            },
        );

    const userId = await getActiveStudentUserId();
    const purchasedIds = await getPurchasedTestIds(
        userId,
        publishedDrafts.map((draft) => draft.id),
    );

    return sortTestCollectionsByVariant(
        publishedDrafts
            .filter(
                (draft) =>
                    draft.topicSlug ===
                        topic &&
                    requiredFormats.has(
                        draft.format as
                            NationalTestFormat,
                    ),
            )
            .map(
                (draft) =>
                    publishedNationalSummary(
                        draft,
                        topic,
                        purchasedIds,
                    ),
            ),
    );
}
