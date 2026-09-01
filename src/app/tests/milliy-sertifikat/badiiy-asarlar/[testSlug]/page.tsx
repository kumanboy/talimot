import {
    notFound,
} from "next/navigation";

import {
    StandardFiveTestRunner,
} from "@/features/national-certificate/components/standard-five-test-runner";
import {
    TestRunnerClientOnly,
} from "@/features/tests/components/test-runner-client-only";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type LiteraryWorksRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function LiteraryWorksRoute({
    params,
}: LiteraryWorksRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        await getStudentNationalTest(
            "badiiy-asarlar",
            testSlug,
        );

    if (!test) {
        notFound();
    }

    if (
        test.kind ===
        "standard"
    ) {
        return (
            <TestRunnerClientOnly
                test={test}
                collectionsHref="/tests/milliy-sertifikat/badiiy-asarlar"
                testHref={`/tests/milliy-sertifikat/badiiy-asarlar/${testSlug}`}
            />
        );
    }

    if (
        test.kind ===
            "standard-five" &&
        test.topic ===
            "badiiy-asarlar"
    ) {
        return (
            <StandardFiveTestRunner
                test={test}
            />
        );
    }

    notFound();
}
