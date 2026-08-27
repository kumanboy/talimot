import {
    Suspense,
} from "react";
import {
    notFound,
} from "next/navigation";

import {
    getActiveStudentUserId,
} from "@/features/auth/server/get-active-student-user";
import {
    MixedTestRunner,
} from "@/features/national-certificate/components/mixed-test-runner";
import {
    PaidTestAccessRequired,
} from "@/features/tests/components/paid-test-access-required";
import {
    TestRunnerClientOnly,
} from "@/features/tests/components/test-runner-client-only";
import {
    getStudentTestAccessByRoute,
} from "@/features/tests/server/get-test-access";
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

    const collectionsHref = `/tests/grammatika/${topic}`;
    const testHref = `${collectionsHref}/${testSlug}`;
    const userId = await getActiveStudentUserId();
    const access = await getStudentTestAccessByRoute(
        {
            group: "grammar",
            topicSlug: topic,
            testSlug,
            href: testHref,
        },
        userId,
    );

    if (!access) {
        notFound();
    }

    if (!access.canAccess) {
        return (
            <PaidTestAccessRequired
                testId={access.testId}
                title={access.title}
                href={testHref}
                backHref={collectionsHref}
                tangaPrice={access.tangaPrice}
            />
        );
    }

    const test = await getStudentGrammarTest(
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
