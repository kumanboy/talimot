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
    getStudentStandardTest,
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
        await getStudentStandardTest(
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
