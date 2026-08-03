import {
    notFound,
} from "next/navigation";

import {
    MixedTestRunner,
} from "@/features/national-certificate/components/mixed-test-runner";

import {
    getNationalTest,
} from "@/features/national-certificate/model/national-test-registry";

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
        getNationalTest(
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