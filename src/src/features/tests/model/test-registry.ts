import {
    spellingTypeOneTest,
} from "@/features/tests/model/questions/spelling-type-1";

import type {
    StandardTestDefinition,
} from "@/features/tests/model/questions/types";

export const standardTestRegistry = [
    spellingTypeOneTest,
] as const satisfies readonly StandardTestDefinition[];

function createTestRegistryKey(
    topicSlug: string,
    testSlug: string,
) {
    return `${topicSlug}/${testSlug}`;
}

const standardTestRegistryMap =
    new Map<
        string,
        StandardTestDefinition
    >(
        standardTestRegistry.map(
            (test) => [
                createTestRegistryKey(
                    test.topicSlug,
                    test.slug,
                ),
                test,
            ],
        ),
    );

export function getStandardTest(
    topicSlug: string,
    testSlug: string,
): StandardTestDefinition | null {
    return (
        standardTestRegistryMap.get(
            createTestRegistryKey(
                topicSlug,
                testSlug,
            ),
        ) ?? null
    );
}

export function getStandardTestsByTopic(
    topicSlug: string,
) {
    return standardTestRegistry.filter(
        (test) =>
            test.topicSlug ===
            topicSlug,
    );
}

export function getStandardTestHref(
    test: StandardTestDefinition,
) {
    return `/tests/grammatika/${test.topicSlug}/${test.slug}`;
}

export function isStandardTestRegistered(
    topicSlug: string,
    testSlug: string,
) {
    return standardTestRegistryMap.has(
        createTestRegistryKey(
            topicSlug,
            testSlug,
        ),
    );
}