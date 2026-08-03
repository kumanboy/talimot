import {
    getPlannedNationalTestsByTopic,
} from "@/features/national-certificate/model/national-test-collections";

import {
    isNationalTestRegistered,
} from "@/features/national-certificate/model/national-test-registry";

import type {
    NationalTestSummary,
    NationalTestTopic,
} from "@/features/national-certificate/model/national-test-types";

export async function getNationalTestsByTopic(
    topic: NationalTestTopic,
): Promise<
    readonly NationalTestSummary[]
> {
    const plannedTests =
        getPlannedNationalTestsByTopic(
            topic,
        );

    return plannedTests.map(
        (test) => ({
            id: test.id,
            slug: test.slug,

            title: test.title,
            description:
            test.description,

            topic: test.topic,
            format: test.format,

            questionCount:
            test.questionCount,

            estimatedMinutes:
            test.estimatedMinutes,

            difficulty:
            test.difficulty,

            access: test.access,

            href:
                `/tests/milliy-sertifikat/${test.topic}/${test.slug}`,

            isAvailable:
                isNationalTestRegistered(
                    test.topic,
                    test.slug,
                ),
        }),
    );
}