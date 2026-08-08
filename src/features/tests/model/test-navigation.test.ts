import {
    describe,
    expect,
    it,
} from "vitest";

import {
    getGrammarCollectionHref,
    getNationalCollectionHref,
    repairLegacyStoredTestHref,
} from "./test-navigation";

describe(
    "test navigation",
    () => {
        it(
            "builds a grammar collection route from the topic slug",
            () => {
                expect(
                    getGrammarCollectionHref(
                        "morfemika",
                    ),
                ).toBe(
                    "/tests/grammatika/morfemika",
                );
            },
        );

        it(
            "builds a national-certificate collection route from the topic slug",
            () => {
                expect(
                    getNationalCollectionHref(
                        "aralash",
                    ),
                ).toBe(
                    "/tests/milliy-sertifikat/aralash",
                );
            },
        );

        it(
            "repairs a legacy grammar progress route",
            () => {
                expect(
                    repairLegacyStoredTestHref(
                        "/tests/grammatika/1",
                        "Morfemika",
                    ),
                ).toBe(
                    "/tests/grammatika/morfemika/1",
                );
            },
        );

        it(
            "repairs the old double-slash grammar progress route",
            () => {
                expect(
                    repairLegacyStoredTestHref(
                        "/tests/grammatika//imlo-test1",
                        "Imlo",
                    ),
                ).toBe(
                    "/tests/grammatika/imlo/imlo-test1",
                );
            },
        );

        it(
            "repairs a legacy mixed-test progress route",
            () => {
                expect(
                    repairLegacyStoredTestHref(
                        "/tests/1",
                        "Aralash testlar",
                    ),
                ).toBe(
                    "/tests/milliy-sertifikat/aralash/1",
                );
            },
        );

        it(
            "does not alter an already-correct route",
            () => {
                expect(
                    repairLegacyStoredTestHref(
                        "/tests/grammatika/morfologiya/fe-l/1",
                        "Morfologiya",
                    ),
                ).toBe(
                    "/tests/grammatika/morfologiya/fe-l/1",
                );
            },
        );
    },
);
