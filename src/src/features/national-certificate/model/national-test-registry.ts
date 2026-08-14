import {
    diagnosticTestOne,
} from "@/features/national-certificate/model/tests/diagnostic-test-1";

import {
    ghazalOneTest,
} from "@/features/national-certificate/model/tests/ghazal-1";

import {
    literaryTextOneTest,
} from "@/features/national-certificate/model/tests/literary-text-1";
import {
    literaryWorksOneTest,
} from "@/features/national-certificate/model/tests/literary-works-1";
import {
    scientificTextOneTest,
} from "@/features/national-certificate/model/tests/scientific-text-1";

import type {
    GhazalTestDefinition,
} from "@/features/national-certificate/model/ghazal-test-types";

import type {
    PassageFiveTestDefinition,
} from "@/features/national-certificate/model/passage-five-test-types";

import type {
    DiagnosticTestDefinition,
} from "@/features/national-certificate/model/diagnostic-test-types";

import type {
    NationalTestTopic,
} from "./national-test-types";

import type {
    StandardFiveTestDefinition,
} from "@/features/national-certificate/model/standard-five-test-types";

import {
    mixedTestOne,
} from "@/features/national-certificate/model/tests/mixed-test-1";
import type {
    MixedTestDefinition,
} from "@/features/national-certificate/model/mixed-test-types";

export type RegisteredNationalTest =
    | GhazalTestDefinition
    | PassageFiveTestDefinition
    | StandardFiveTestDefinition
    | MixedTestDefinition
    | DiagnosticTestDefinition;


export const nationalTestRegistry:
    readonly RegisteredNationalTest[] = [
    ghazalOneTest,
    scientificTextOneTest,
    literaryTextOneTest,
    literaryWorksOneTest,
    mixedTestOne,
    diagnosticTestOne,
];

function createRegistryKey(
    topic: NationalTestTopic,
    slug: string,
): string {
    return `${topic}/${slug}`;
}

const nationalTestRegistryKeys =
    new Set<string>(
        nationalTestRegistry.map(
            (test) =>
                createRegistryKey(
                    test.topic,
                    test.slug,
                ),
        ),
    );

export function isNationalTestRegistered(
    topic: NationalTestTopic,
    slug: string,
): boolean {
    return nationalTestRegistryKeys.has(
        createRegistryKey(
            topic,
            slug,
        ),
    );
}

export function getNationalTest(
    topic: NationalTestTopic,
    slug: string,
): RegisteredNationalTest | null {
    return (
        nationalTestRegistry.find(
            (test) =>
                test.topic === topic &&
                test.slug === slug,
        ) ?? null
    );
}