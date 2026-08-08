import {
    notFound,
} from "next/navigation";

import {
    GhazalTestRunner,
} from "@/features/national-certificate/components/ghazal-test-runner";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";

type GhazalTestRouteProps = {
    readonly params: Promise<{
        testSlug: string;
    }>;
};

export default async function GhazalTestRoute({
    params,
}: GhazalTestRouteProps) {
    const {
        testSlug,
    } = await params;

    const test =
        await getStudentNationalTest(
            "gazal",
            testSlug,
        );

    if (
        !test ||
        test.kind !==
            "ghazal" ||
        test.topic !==
            "gazal"
    ) {
        notFound();
    }

    return (
        <GhazalTestRunner
            test={test}
        />
    );
}
