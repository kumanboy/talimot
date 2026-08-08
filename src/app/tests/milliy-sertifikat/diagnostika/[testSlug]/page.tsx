import {
    notFound,
} from "next/navigation";

import {
    DiagnosticTestStart,
} from "@/features/national-certificate/components/diagnostic-test-start";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type DiagnosticTestRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function DiagnosticTestRoute({
    params,
}: DiagnosticTestRouteProps) {
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
        <DiagnosticTestStart
            test={test}
        />
    );
}
