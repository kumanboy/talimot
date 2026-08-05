import {
    Suspense,
} from "react";

import {
    notFound,
} from "next/navigation";

import {
    TestRunner,
} from "@/features/tests/components/test-runner";

import {
    getStandardTest,
    standardTestRegistry,
} from "@/features/tests/model/test-registry";

type StandardTestRouteProps = {
    params: Promise<{
        topic: string;
        testSlug: string;
    }>;
};

export function generateStaticParams() {
    return standardTestRegistry.map(
        (test) => ({
            topic:
            test.topicSlug,
            testSlug:
            test.slug,
        }),
    );
}

export default async function StandardTestRoute({
                                                    params,
                                                }: StandardTestRouteProps) {
    const {
        topic,
        testSlug,
    } = await params;

    const test =
        getStandardTest(
            topic,
            testSlug,
        );

    if (!test) {
        notFound();
    }

    return (
        <Suspense fallback={null}>
            <TestRunner test={test} />
        </Suspense>
    );
}