"use client";

import dynamic from "next/dynamic";

import type {
    StandardTestDefinition,
} from "@/features/tests/model/questions/types";

type TestRunnerClientOnlyProps = {
    readonly test: StandardTestDefinition;
    readonly collectionsHref?: string;
    readonly testHref?: string;
};

/**
 * Keep the large interactive test runner out of the server-side Turbopack
 * chunk graph. The runner only depends on browser state (router/search params,
 * localStorage, timers, document/window), so there is no benefit in SSR'ing it.
 *
 * This also prevents production requests from having to load the generated
 * `server/chunks/ssr/src_features_tests_components_*` chunk that has been
 * failing intermittently on Vercel with Next.js 16/Turbopack builds.
 */
const BrowserTestRunner = dynamic(
    () =>
        import("./test-runner").then(
            (module) =>
                module.TestRunner,
        ),
    {
        ssr: false,
        loading: () => (
            <main
                aria-busy="true"
                aria-live="polite"
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "24px",
                }}
            >
                <p>Test yuklanmoqda...</p>
            </main>
        ),
    },
);

export function TestRunnerClientOnly(
    props: TestRunnerClientOnlyProps,
) {
    return (
        <BrowserTestRunner
            {...props}
        />
    );
}
