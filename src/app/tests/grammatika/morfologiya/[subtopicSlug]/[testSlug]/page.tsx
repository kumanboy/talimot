import {
    notFound,
} from "next/navigation";

import {
    getActiveStudentUserId,
} from "@/features/auth/server/get-active-student-user";
import {
    PaidTestAccessRequired,
} from "@/features/tests/components/paid-test-access-required";
import {
    TestRunnerClientOnly,
} from "@/features/tests/components/test-runner-client-only";
import {
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import {
    getStudentTestAccessByRoute,
} from "@/features/tests/server/get-test-access";
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

    if (!isMorphologySubtopicSlug(subtopicSlug)) {
        notFound();
    }

    const collectionsHref =
        `/tests/grammatika/morfologiya/${subtopicSlug}`;
    const testHref =
        `${collectionsHref}/${testSlug}`;

    const userId = await getActiveStudentUserId();
    const access = await getStudentTestAccessByRoute(
        {
            group: "morphology",
            topicSlug: subtopicSlug,
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

    const test = await getStudentStandardTest(
        subtopicSlug,
        testSlug,
        "morphology",
    );

    if (!test) {
        notFound();
    }

    return (
        <TestRunnerClientOnly
            test={test}
            collectionsHref={collectionsHref}
            testHref={testHref}
        />
    );
}
