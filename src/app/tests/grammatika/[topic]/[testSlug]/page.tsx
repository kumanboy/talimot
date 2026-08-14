import {
    Suspense,
} from "react";
import {
    notFound,
} from "next/navigation";

import {
    TestRunnerClientOnly,
} from "@/features/tests/components/test-runner-client-only";
import {
    MixedTestRunner,
} from "@/features/national-certificate/components/mixed-test-runner";
import {
    getStudentGrammarTest,
} from "@/features/tests/server/get-published-standard-test";

type StandardTestRouteProps = {
    params: Promise<{
        topic: string;
        testSlug: string;
    }>;
};

export default async function StandardTestRoute({
    params,
}: StandardTestRouteProps) {
    const {
        topic,
        testSlug,
    } = await params;

    const test =
        await getStudentGrammarTest(
            topic,
            testSlug,
        );

    if (!test) {
        notFound();
    }

    if (test.kind === "standard") {
        return (
            <TestRunnerClientOnly
                test={test}
            />
        );
    }

    return (
        <Suspense fallback={null}>
            <MixedTestRunner
                test={test}
            />
        </Suspense>
    );
}
