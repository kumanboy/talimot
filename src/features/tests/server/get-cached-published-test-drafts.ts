import "server-only";

import { unstable_cache } from "next/cache";

import type {
    AdminTestDraftGroup,
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

/**
 * Student collection pages only need published test metadata, not the full
 * question payload. Cache the three public catalogues briefly so moving from
 * Home -> Tests -> Imlo/Morfologiya/etc. does not repeat the same Supabase
 * listing queries on every first navigation.
 *
 * Access/purchase state is intentionally NOT cached here. That remains
 * user-specific and is queried separately so a new purchase is reflected
 * immediately.
 */
const getCachedPublishedGroupDrafts = unstable_cache(
    async (
        group: AdminTestDraftGroup,
    ): Promise<readonly AdminTestDraftSummary[]> =>
        adminTestDraftService.listPublished(
            group,
        ),
    [
        "student-published-test-draft-summaries-v1",
    ],
    {
        revalidate: 60,
    },
);

export function getCachedPublishedTestDraftSummaries(
    group: AdminTestDraftGroup,
): Promise<readonly AdminTestDraftSummary[]> {
    return getCachedPublishedGroupDrafts(
        group,
    );
}

export async function warmStudentTestCatalogCache(): Promise<void> {
    await Promise.all([
        getCachedPublishedTestDraftSummaries(
            "grammar",
        ),
        getCachedPublishedTestDraftSummaries(
            "morphology",
        ),
        getCachedPublishedTestDraftSummaries(
            "national-certificate",
        ),
    ]);
}
