import "server-only";

import {
    adminTestCatalog,
} from "@/features/admin/tests/model/admin-test-catalog";

import type {
    AdminTestCatalogItem,
} from "@/features/admin/tests/model/admin-test-catalog";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";

function routeKey(
    group: string,
    topicSlug: string,
    slug: string,
): string {
    return `${group}/${topicSlug}/${slug}`;
}

function publishedDraftHref(
    draft:
        AdminTestDraftSummary,
): string {
    if (
        draft.group ===
        "national-certificate"
    ) {
        return `/tests/milliy-sertifikat/${draft.topicSlug}/${draft.slug}`;
    }

    if (
        draft.group ===
        "morphology"
    ) {
        return `/tests/grammatika/morfologiya/${draft.topicSlug}/${draft.slug}`;
    }

    return `/tests/grammatika/${draft.topicSlug}/${draft.slug}`;
}

function publishedDraftToCatalogItem(
    draft:
        AdminTestDraftSummary,
): AdminTestCatalogItem {
    return {
        id:
            draft.id,
        slug:
            draft.slug,
        title:
            draft.title,
        description:
            draft.description,
        group:
            draft.group,
        category:
            draft.category,
        topicSlug:
            draft.topicSlug,
        format:
            draft.format,
        questionCount:
            draft.questionCount,
        maximumScore:
            draft.maximumScore,
        estimatedMinutes:
            draft.estimatedMinutes,
        difficulty:
            draft.difficulty,
        access:
            draft.access,
        status:
            "active",
        href:
            publishedDraftHref(
                draft,
            ),
        detailsHref:
            `/admin/tests/${encodeURIComponent(
                draft.id,
            )}/edit`,
        hasDataset:
            true,
    };
}

export interface AdminTestCatalogStats {
    readonly total: number;
    readonly active: number;
    readonly planned: number;
    readonly publishedDatabase:
        number;
}

export interface AdminTestCatalogData {
    readonly tests:
        readonly AdminTestCatalogItem[];
    readonly stats:
        AdminTestCatalogStats;
}

export function getAdminTestCatalogData(
    publishedDrafts:
        readonly AdminTestDraftSummary[],
): AdminTestCatalogData {
    const publishedByRoute =
        new Map(
            publishedDrafts.map(
                (draft) => [
                    routeKey(
                        draft.group,
                        draft.topicSlug,
                        draft.slug,
                    ),
                    draft,
                ] as const,
            ),
        );

    const staticRoutes =
        new Set<string>();

    const merged =
        adminTestCatalog.map(
            (item) => {
                const key =
                    routeKey(
                        item.group,
                        item.topicSlug,
                        item.slug,
                    );
                staticRoutes.add(
                    key,
                );

                const published =
                    publishedByRoute.get(
                        key,
                    );

                return published
                    ? publishedDraftToCatalogItem(
                        published,
                    )
                    : item;
            },
        );

    const publishedExtras =
        publishedDrafts
            .filter(
                (draft) =>
                    !staticRoutes.has(
                        routeKey(
                            draft.group,
                            draft.topicSlug,
                            draft.slug,
                        ),
                    ),
            )
            .map(
                publishedDraftToCatalogItem,
            );

    const tests = [
        ...merged,
        ...publishedExtras,
    ];

    return {
        tests,
        stats: {
            total:
                tests.length,
            active:
                tests.filter(
                    (test) =>
                        test.status ===
                        "active",
                ).length,
            planned:
                tests.filter(
                    (test) =>
                        test.status ===
                        "planned",
                ).length,
            publishedDatabase:
                publishedDrafts.length,
        },
    };
}
