import { connection } from "next/server";
import { unstable_cache } from "next/cache";

import "server-only";

import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    NationalTestTopic,
} from "@/features/national-certificate/model/national-test-types";
import {
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import {
    grammarTestCategories,
    nationalCertificateTestCategories,
} from "@/features/tests/model/test-categories";
import type {
    TestCategory,
} from "@/features/tests/model/types";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model/admin-test-draft-types";

interface StudentTestCategories {
    readonly grammar:
        readonly TestCategory[];
    readonly nationalCertificate:
        readonly TestCategory[];
}

const grammarTopicByCategoryId:
    Readonly<Record<string, string>> = {
        spelling: "imlo",
        morphemics: "morfemika",
        lexicology: "leksikologiya",
        stylistics: "uslubiyat",
        syntax: "sintaksis",
        punctuation: "punktuatsiya",
    };

const nationalTopicByCategoryId:
    Readonly<Record<string, NationalTestTopic>> = {
        ghazal: "gazal",
        "scientific-text": "ilmiy-matn",
        "literary-text": "badiiy-matn",
        literature: "badiiy-asarlar",
        mixed: "aralash",
        diagnostics: "diagnostika",
    };

function addRouteKey(
    routesByTopic:
        Map<string, Set<string>>,
    topicSlug: string,
    testSlug: string,
): void {
    const current =
        routesByTopic.get(
            topicSlug,
        ) ?? new Set<string>();

    current.add(
        testSlug,
    );
    routesByTopic.set(
        topicSlug,
        current,
    );
}

function countRoutes(
    routesByTopic:
        ReadonlyMap<string, ReadonlySet<string>>,
    topicSlug: string,
): number {
    return (
        routesByTopic.get(
            topicSlug,
        )?.size ?? 0
    );
}

function isPublishedGrammarDraft(
    draft:
        AdminTestDraftSummary,
): boolean {
    return (
        (
            draft.format === "standard" &&
            draft.questionCount === 20
        ) ||
        (
            draft.topicSlug === "sintaksis" &&
            draft.format === "mixed" &&
            draft.questionCount === 60
        )
    );
}

function isPublishedMorphologyDraft(
    draft:
        AdminTestDraftSummary,
): boolean {
    return (
        draft.format ===
            "morphology-standard" &&
        draft.questionCount === 20
    );
}

function expectedNationalFormat(
    topic:
        NationalTestTopic,
) {
    if (
        topic === "gazal" ||
        topic === "ilmiy-matn" ||
        topic === "badiiy-matn"
    ) {
        return "passage-five" as const;
    }

    if (
        topic === "badiiy-asarlar"
    ) {
        return "standard-five" as const;
    }

    if (
        topic === "aralash"
    ) {
        return "mixed" as const;
    }

    return "diagnostic" as const;
}

function formatTestCount(
    count: number,
): string {
    return `${count} ta test`;
}

const getPublishedCategoryDrafts = unstable_cache(
    async () => Promise.all([
        adminTestDraftService.listPublished("grammar"),
        adminTestDraftService.listPublished("morphology"),
        adminTestDraftService.listPublished("national-certificate"),
    ]),
    ["student-test-categories-v1"],
    { revalidate: 60 },
);

/**
 * Root student counts are based only on real published DB tests.
 * Static registries/planned placeholders are not included in the numbers.
 */
export async function getStudentTestCategories(): Promise<
    StudentTestCategories
> {
    await connection();

    const [
        publishedGrammar,
        publishedMorphology,
        publishedNational,
    ] = await getPublishedCategoryDrafts();

    const grammarRoutes =
        new Map<string, Set<string>>();

    for (
        const draft of
        publishedGrammar
    ) {
        if (
            isPublishedGrammarDraft(
                draft,
            )
        ) {
            addRouteKey(
                grammarRoutes,
                draft.topicSlug,
                draft.slug,
            );
        }
    }

    const morphologyRoutes =
        new Map<string, Set<string>>();

    for (
        const draft of
        publishedMorphology
    ) {
        if (
            isPublishedMorphologyDraft(
                draft,
            ) &&
            isMorphologySubtopicSlug(
                draft.topicSlug,
            )
        ) {
            addRouteKey(
                morphologyRoutes,
                draft.topicSlug,
                draft.slug,
            );
        }
    }

    const activeMorphologySubtopicCount =
        [...morphologyRoutes.values()]
            .filter(
                (tests) =>
                    tests.size > 0,
            ).length;

    const nationalRoutes =
        new Map<string, Set<string>>();

    for (
        const draft of
        publishedNational
    ) {
        const topic =
            draft.topicSlug as
                NationalTestTopic;

        if (
            !Object.values(
                nationalTopicByCategoryId,
            ).includes(
                topic,
            ) ||
            draft.format !==
                expectedNationalFormat(
                    topic,
                )
        ) {
            continue;
        }

        addRouteKey(
            nationalRoutes,
            topic,
            draft.slug,
        );
    }

    const grammar =
        grammarTestCategories.map(
            (category) => {
                if (
                    category.id ===
                    "morphology"
                ) {
                    return {
                        ...category,
                        itemCountLabel:
                            `${activeMorphologySubtopicCount} ta faol ichki bo‘lim`,
                    } satisfies TestCategory;
                }

                const topicSlug =
                    grammarTopicByCategoryId[
                        category.id
                    ];
                const count =
                    topicSlug
                        ? countRoutes(
                            grammarRoutes,
                            topicSlug,
                        )
                        : 0;

                return {
                    ...category,
                    itemCountLabel:
                        formatTestCount(
                            count,
                        ),
                } satisfies TestCategory;
            },
        );

    const nationalCertificate =
        nationalCertificateTestCategories.map(
            (category) => {
                const topic =
                    nationalTopicByCategoryId[
                        category.id
                    ];
                const count =
                    topic
                        ? countRoutes(
                            nationalRoutes,
                            topic,
                        )
                        : 0;

                return {
                    ...category,
                    itemCountLabel:
                        formatTestCount(
                            count,
                        ),
                } satisfies TestCategory;
            },
        );

    return {
        grammar,
        nationalCertificate,
    };
}
