import {
    notFound,
} from "next/navigation";

import {
    DiagnosticTestResult,
} from "@/features/national-certificate/components/diagnostic-test-result";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type DiagnosticResultRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function DiagnosticResultRoute({
    params,
}: DiagnosticResultRouteProps) {
    const { testSlug } = await params;

    const test =
        await getStudentNationalTest(
            "diagnostika",
            testSlug,
        );

    if (
        !test ||
        test.kind !== "diagnostic" ||
        test.topic !== "diagnostika"
    ) {
        notFound();
    }

    return (
        <DiagnosticTestResult
            test={test}
        />
    );
}
