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

    return (
        <Suspense fallback={null}>
            {test.kind === "mixed" ? (
                <MixedTestRunner test={test} />
            ) : (
                <TestRunner test={test} />
            )}
        </Suspense>
    );
}
