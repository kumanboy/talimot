import "server-only";

import { cache } from "react";

import type {
    AdminTestDraft,
    AdminTestDraftGroup,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

/**
 * A test route may need the same published draft for both access validation
 * and rendering. React request memoization prevents downloading the same
 * JSONB question payload twice during one navigation request.
 */
export const getPublishedTestDraftByRoute = cache(
    async (
        group: AdminTestDraftGroup,
        topicSlug: string,
        slug: string,
    ): Promise<AdminTestDraft | null> => {
        const draft =
            await adminTestDraftService.getByRoute({
                group,
                topicSlug,
                slug,
            });

        return draft?.status ===
            "published"
            ? draft
            : null;
    },
);
