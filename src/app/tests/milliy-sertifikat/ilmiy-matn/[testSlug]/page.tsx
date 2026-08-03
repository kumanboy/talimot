import {
    notFound,
} from "next/navigation";

import {
    PassageFiveTestRunner,
} from "@/features/national-certificate/components/passage-five-test-runner";

import {
    getNationalTest,
} from "@/features/national-certificate/model/national-test-registry";

import type {
    PassageFiveTestDefinition,
} from "@/features/national-certificate/model/passage-five-test-types";

type ScientificTextRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function ScientificTextRoute({
                                                      params,
                                                  }: ScientificTextRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        getNationalTest(
            "ilmiy-matn",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
        "passage-five" ||
        test.topic !==
        "ilmiy-matn"
    ) {
        notFound();
    }

    return (
        <PassageFiveTestRunner
            test={
                test as PassageFiveTestDefinition
            }
        />
    );
}