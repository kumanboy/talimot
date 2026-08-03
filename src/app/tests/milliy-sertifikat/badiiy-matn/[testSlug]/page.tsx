import {
    notFound,
} from "next/navigation";

import {
    PassageFiveTestRunner,
} from "@/features/national-certificate/components/passage-five-test-runner";

import {
    getNationalTest,
} from "@/features/national-certificate/model/national-test-registry";

type LiteraryTextRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function LiteraryTextRoute({
                                                    params,
                                                }: LiteraryTextRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        getNationalTest(
            "badiiy-matn",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
        "passage-five" ||
        test.topic !==
        "badiiy-matn"
    ) {
        notFound();
    }

    return (
        <PassageFiveTestRunner
            test={test}
        />
    );
}