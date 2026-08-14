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
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import {
    getStudentStandardTest,
} from "@/features/tests/server/get-published-standard-test";

type MorphologyTestRouteProps = {
    readonly params: Promise<{
        subtopicSlug: string;
        testSlug: string;
    }>;
};

export default async function MorphologyTestRoute({
    params,
}: MorphologyTestRouteProps) {
    const {
        subtopicSlug,
        testSlug,
    } = await params;

    if (
        !isMorphologySubtopicSlug(
            subtopicSlug,
        )
    ) {
        notFound();
    }

    const test =
        await getStudentStandardTest(
            subtopicSlug,
            testSlug,
            "morphology",
        );

    if (!test) {
        notFound();
    }

    const collectionsHref =
        `/tests/grammatika/morfologiya/${subtopicSlug}`;
    const testHref =
        `${collectionsHref}/${testSlug}`;

    return (
        <Suspense fallback={null}>
            <TestRunner
                test={test}
                collectionsHref={
                    collectionsHref
                }
                testHref={
                    testHref
                }
            />
        </Suspense>
    );
}
