import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import {
    getPublishedTestDraftByRoute,
} from "@/features/tests/server/get-published-test-draft-by-route";
import { db } from "@/lib/database/db";
import { testPurchases } from "@/lib/database/schema/test-purchases";

export type StudentTestAccess = {
    readonly testId: string;
    readonly title: string;
    readonly href: string;
    readonly access: "free" | "premium";
    readonly tangaPrice: number;
    readonly purchased: boolean;
    readonly canAccess: boolean;
};

type TestRoute = {
    readonly group: "grammar" | "morphology" | "national-certificate";
    readonly topicSlug: string;
    readonly testSlug: string;
    readonly href: string;
};

export async function getPurchasedTestIds(
    userId: string | null,
    testIds: readonly string[],
): Promise<ReadonlySet<string>> {
    if (!userId || testIds.length === 0) {
        return new Set<string>();
    }

    const rows = await db
        .select({ testId: testPurchases.testId })
        .from(testPurchases)
        .where(
            and(
                eq(testPurchases.userId, userId),
                inArray(testPurchases.testId, [...testIds]),
            ),
        );

    return new Set(rows.map((row) => row.testId));
}

export async function getStudentTestAccessByRoute(
    route: TestRoute,
    userId: string | null,
): Promise<StudentTestAccess | null> {
    const draft =
        await getPublishedTestDraftByRoute(
            route.group,
            route.topicSlug,
            route.testSlug,
        );

    if (!draft) {
        return null;
    }

    const access = draft.metadata.access;
    const tangaPrice = access === "premium"
        ? Math.max(1, draft.metadata.tangaPrice)
        : 0;

    if (access === "free") {
        return {
            testId: draft.id,
            title: draft.metadata.title,
            href: route.href,
            access,
            tangaPrice,
            purchased: false,
            canAccess: true,
        };
    }

    const purchasedIds = await getPurchasedTestIds(
        userId,
        [draft.id],
    );
    const purchased = purchasedIds.has(draft.id);

    return {
        testId: draft.id,
        title: draft.metadata.title,
        href: route.href,
        access,
        tangaPrice,
        purchased,
        canAccess: purchased,
    };
}
