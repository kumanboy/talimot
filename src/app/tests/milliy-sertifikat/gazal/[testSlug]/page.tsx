import {
    notFound,
} from "next/navigation";

import {
    GhazalTestRunner,
} from "@/features/national-certificate/components/ghazal-test-runner";

import {
    ghazalOneTest,
} from "@/features/national-certificate/model/tests/ghazal-1";

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

    if (
        testSlug !==
        ghazalOneTest.slug
    ) {
        notFound();
    }

    return (
        <GhazalTestRunner
            test={ghazalOneTest}
        />
    );
}