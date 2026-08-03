import {
    getPlannedTestsByTopic,
} from "@/features/tests/model/test-collections";

import {
    getStandardTest,
    getStandardTestHref,
} from "@/features/tests/model/test-registry";

import type {
    StandardTestSummary,
} from "@/features/tests/model/test-summary";

export async function getStandardTestsByTopic(
    topicSlug: string,
): Promise<
    readonly StandardTestSummary[]
> {
    const plannedTests =
        getPlannedTestsByTopic(
            topicSlug,
        );

    return plannedTests.map(
        (plannedTest) => {
            const registeredTest =
                getStandardTest(
                    plannedTest.topicSlug,
                    plannedTest.slug,
                );

            if (registeredTest) {
                return {
                    id:
                    registeredTest.id,

                    slug:
                    registeredTest.slug,

                    title:
                    registeredTest.title,

                    description:
                    registeredTest.description,

                    category:
                    registeredTest.category,

                    topicSlug:
                    registeredTest.topicSlug,

                    questionCount:
                    registeredTest.questionCount,

                    estimatedMinutes:
                    registeredTest.estimatedMinutes,

                    difficulty:
                    registeredTest.difficulty,

                    access:
                    registeredTest.access,

                    href:
                        getStandardTestHref(
                            registeredTest,
                        ),

                    isAvailable: true,
                } satisfies StandardTestSummary;
            }

            return {
                id: plannedTest.id,
                slug: plannedTest.slug,

                title:
                plannedTest.title,

                description:
                plannedTest.description,

                category:
                plannedTest.category,

                topicSlug:
                plannedTest.topicSlug,

                questionCount:
                plannedTest.questionCount,

                estimatedMinutes:
                plannedTest.estimatedMinutes,

                difficulty:
                plannedTest.difficulty,

                access:
                plannedTest.access,

                href:
                    `/tests/grammatika/${plannedTest.topicSlug}/${plannedTest.slug}`,

                isAvailable: false,
            } satisfies StandardTestSummary;
        },
    );
}