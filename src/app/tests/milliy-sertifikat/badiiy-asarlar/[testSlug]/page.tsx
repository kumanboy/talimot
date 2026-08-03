import {
    notFound,
} from "next/navigation";

import {
    StandardFiveTestRunner,
} from "@/features/national-certificate/components/standard-five-test-runner";

import {
    getNationalTest,
} from "@/features/national-certificate/model/national-test-registry";

type LiteraryWorksTestRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function LiteraryWorksTestRoute({
                                                         params,
                                                     }: LiteraryWorksTestRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        getNationalTest(
            "badiiy-asarlar",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
        "standard-five" ||
        test.topic !==
        "badiiy-asarlar"
    ) {
        notFound();
    }

    return (
        <StandardFiveTestRunner
            test={test}
        />
    );
}