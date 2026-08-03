import {
    notFound,
} from "next/navigation";

import {
    DiagnosticTestRunner,
} from "@/features/national-certificate/components/diagnostic-test-runner";

import {
    getNationalTest,
} from "@/features/national-certificate/model/national-test-registry";

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
        getNationalTest(
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