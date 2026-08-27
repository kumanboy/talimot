import type {
    MorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import {
    isStandardTestRegistered,
} from "@/features/tests/model/test-registry";

export type MorphologyTestDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type MorphologyTestAccess =
    | "free"
    | "premium";

export interface MorphologyTestCollection {
    readonly id: string;
    readonly slug: string;

    readonly subtopic:
        MorphologySubtopicSlug;

    readonly title: string;
    readonly description: string;

    readonly questionCount:
        number;

    readonly estimatedMinutes:
        number;

    readonly difficulty:
        MorphologyTestDifficulty;

    readonly access:
        MorphologyTestAccess;

    readonly tangaPrice: number;
    readonly isPurchased: boolean;

    readonly isAvailable:
        boolean;

    readonly href: string;
}

export const morphologyTestCollections:
    readonly MorphologyTestCollection[] =
    [
        {
            id:
                "morphology-noun-test-1",

            slug:
                "1",

            subtopic:
                "ot",

            title:
                "Ot — 1",

            description:
                "Otning ma’no turlari, tuzilishi va grammatik shakllariga doir test.",

            questionCount:
                20,

            estimatedMinutes:
                25,

            difficulty:
                "medium",

            access:
                "free",

            tangaPrice:
                0,

            isPurchased:
                false,

            isAvailable:
                isStandardTestRegistered(
                    "ot",
                    "1",
                ),

            href:
                "/tests/grammatika/morfologiya/ot/1",
        },
    ];

export function getMorphologyTestsBySubtopic(
    subtopic:
    MorphologySubtopicSlug,
): readonly MorphologyTestCollection[] {
    return morphologyTestCollections.filter(
        (
            test,
        ) =>
            test.subtopic ===
            subtopic,
    );
}

export function getMorphologyTest(
    subtopic:
    MorphologySubtopicSlug,
    testSlug: string,
): MorphologyTestCollection | null {
    return (
        morphologyTestCollections.find(
            (
                test,
            ) =>
                test.subtopic ===
                subtopic &&
                test.slug ===
                testSlug,
        ) ?? null
    );
}