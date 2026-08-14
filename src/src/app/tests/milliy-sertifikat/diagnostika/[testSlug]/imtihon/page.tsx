import {
    notFound,
} from "next/navigation";

import {
    DiagnosticTestRunner,
} from "@/features/national-certificate/components/diagnostic-test-runner";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type DiagnosticExamRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function DiagnosticExamRoute({
    params,
}: DiagnosticExamRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        await getStudentNationalTest(
            "diagnostika",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
            "diagnostic" ||
        test.topic !==
            "diagnostika"
    ) {
        notFound();
    }

    return (
        <DiagnosticTestRunner
            test={test}
        />
    );
}
