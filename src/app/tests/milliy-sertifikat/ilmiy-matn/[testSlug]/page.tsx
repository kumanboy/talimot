import {
    notFound,
} from "next/navigation";

import {
    PassageFiveTestRunner,
} from "@/features/national-certificate/components/passage-five-test-runner";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

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
        await getStudentNationalTest(
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
            test={test}
        />
    );
}
