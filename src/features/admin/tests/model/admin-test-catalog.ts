import {
    morphologyTestCollections,
} from "@/features/tests/model/morphology-test-collections";
import {
    plannedStandardTests,
} from "@/features/tests/model/test-collections";
import {
    standardTestRegistry,
} from "@/features/tests/model/test-registry";

import {
    plannedNationalTests,
} from "@/features/national-certificate/model/national-test-collections";
import {
    nationalTestRegistry,
} from "@/features/national-certificate/model/national-test-registry";

export type AdminTestGroup =
    | "grammar"
    | "national-certificate"
    | "morphology";

export type AdminTestStatus =
    | "active"
    | "planned";

export type AdminTestAccess =
    | "free"
    | "premium";

export type AdminTestDifficulty =
    | "easy"
    | "medium"
    | "hard";

export interface AdminTestCatalogItem {
    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    readonly group:
        AdminTestGroup;

    readonly category: string;
    readonly topicSlug: string;
    readonly format: string;

    readonly questionCount: number;
    readonly maximumScore:
        number | null;
    readonly estimatedMinutes:
        number;

    readonly difficulty:
        AdminTestDifficulty;
    readonly access:
        AdminTestAccess;
    readonly status:
        AdminTestStatus;

    readonly href: string;
    readonly detailsHref: string;
    readonly hasDataset: boolean;
}

const nationalTopicLabels:
    Readonly<Record<string, string>> = {
        gazal: "G‘azal",
        "ilmiy-matn": "Ilmiy matn",
        "badiiy-matn": "Badiiy matn",
        "badiiy-asarlar": "Badiiy asarlar",
        aralash: "Aralash savollar",
        diagnostika: "To‘liq diagnostika",
    };

function getMaximumScore(
    value: unknown,
): number | null {
    if (
        typeof value !== "object" ||
        value === null ||
        !("maximumScore" in value)
    ) {
        return null;
    }

    const maximumScore =
        value.maximumScore;

    return (
        typeof maximumScore === "number" &&
        Number.isFinite(maximumScore)
    )
        ? maximumScore
        : null;
}

function createGrammarCatalog():
    readonly AdminTestCatalogItem[] {
    return plannedStandardTests.map(
        (planned) => {
            const registered =
                standardTestRegistry.find(
                    (test) =>
                        test.topicSlug ===
                            planned.topicSlug &&
                        test.slug ===
                            planned.slug,
                );

            return {
                id: planned.id,
                slug: planned.slug,
                title: planned.title,
                description:
                    planned.description,
                group: "grammar",
                category:
                    planned.category,
                topicSlug:
                    planned.topicSlug,
                format: "standard",
                questionCount:
                    planned.questionCount,
                maximumScore: null,
                estimatedMinutes:
                    planned.estimatedMinutes,
                difficulty:
                    planned.difficulty,
                access:
                    planned.access,
                status: registered
                    ? "active"
                    : "planned",
                href:
                    `/tests/grammatika/${planned.topicSlug}/${planned.slug}`,
                detailsHref:
                    `/admin/tests/${planned.id}`,
                hasDataset:
                    Boolean(registered),
            };
        },
    );
}

function createNationalCatalog():
    readonly AdminTestCatalogItem[] {
    return plannedNationalTests.map(
        (planned) => {
            const registered =
                nationalTestRegistry.find(
                    (test) =>
                        test.topic ===
                            planned.topic &&
                        test.slug ===
                            planned.slug,
                );

            return {
                id: planned.id,
                slug: planned.slug,
                title: planned.title,
                description:
                    planned.description,
                group:
                    "national-certificate",
                category:
                    nationalTopicLabels[
                        planned.topic
                    ] ?? planned.topic,
                topicSlug:
                    planned.topic,
                format:
                    planned.format,
                questionCount:
                    planned.questionCount,
                maximumScore:
                    getMaximumScore(
                        registered,
                    ),
                estimatedMinutes:
                    planned.estimatedMinutes,
                difficulty:
                    planned.difficulty,
                access:
                    planned.access,
                status: registered
                    ? "active"
                    : "planned",
                href:
                    `/tests/milliy-sertifikat/${planned.topic}/${planned.slug}`,
                detailsHref:
                    `/admin/tests/${planned.id}`,
                hasDataset:
                    Boolean(registered),
            };
        },
    );
}

function createMorphologyCatalog():
    readonly AdminTestCatalogItem[] {
    return morphologyTestCollections.map(
        (test) => ({
            id: test.id,
            slug: test.slug,
            title: test.title,
            description:
                test.description,
            group: "morphology",
            category: "Morfologiya",
            topicSlug:
                test.subtopic,
            format:
                "morphology-standard",
            questionCount:
                test.questionCount,
            maximumScore: null,
            estimatedMinutes:
                test.estimatedMinutes,
            difficulty:
                test.difficulty,
            access:
                test.access,
            status:
                test.isAvailable
                    ? "active"
                    : "planned",
            href: test.href,
            detailsHref:
                `/admin/tests/${test.id}`,
            hasDataset:
                test.isAvailable,
        }),
    );
}

export const adminTestCatalog:
    readonly AdminTestCatalogItem[] = [
        ...createGrammarCatalog(),
        ...createNationalCatalog(),
        ...createMorphologyCatalog(),
    ];

export function getAdminTestCatalogItem(
    testId: string,
): AdminTestCatalogItem | null {
    return (
        adminTestCatalog.find(
            (test) =>
                test.id === testId,
        ) ?? null
    );
}

export const adminTestCatalogStats = {
    total:
        adminTestCatalog.length,
    active:
        adminTestCatalog.filter(
            (test) =>
                test.status === "active",
        ).length,
    planned:
        adminTestCatalog.filter(
            (test) =>
                test.status === "planned",
        ).length,
    premium:
        adminTestCatalog.filter(
            (test) =>
                test.access === "premium",
        ).length,
} as const;
