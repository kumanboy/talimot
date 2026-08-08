import {
    notFound,
} from "next/navigation";

import {
    MixedTestRunner,
} from "@/features/national-certificate/components/mixed-test-runner";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type MixedTestRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function MixedTestRoute({
    params,
}: MixedTestRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        await getStudentNationalTest(
            "aralash",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
            "mixed" ||
        test.topic !==
            "aralash"
    ) {
        notFound();
    }

    return (
        <MixedTestRunner
            test={test}
        />
    );
}
