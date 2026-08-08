import {
    notFound,
} from "next/navigation";

import {
    StandardFiveTestRunner,
} from "@/features/national-certificate/components/standard-five-test-runner";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type LiteraryWorksRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function LiteraryWorksRoute({
    params,
}: LiteraryWorksRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        await getStudentNationalTest(
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
