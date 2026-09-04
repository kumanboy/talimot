import {
    describe,
    expect,
    it,
} from "vitest";

import {
    getTestVariantNumber,
    sortTestCollectionsByVariant,
} from "./sort-test-collections";

describe(
    "sortTestCollectionsByVariant",
    () => {
        it(
            "orders explicit variants numerically instead of by updated order",
            () => {
                const tests = [
                    {
                        title: "Imlo 10-variant",
                        slug: "imlo-10-variant",
                    },
                    {
                        title: "Imlo 2-variant",
                        slug: "imlo-2-variant",
                    },
                    {
                        title: "Imlo 1-variant",
                        slug: "imlo-1-variant",
                    },
                ];

                expect(
                    sortTestCollectionsByVariant(
                        tests,
                    ).map(
                        (test) => test.title,
                    ),
                ).toEqual([
                    "Imlo 1-variant",
                    "Imlo 2-variant",
                    "Imlo 10-variant",
                ]);
            },
        );

        it(
            "recognizes variant numbers in either title or slug",
            () => {
                expect(
                    getTestVariantNumber({
                        title: "Ot bo‘yicha test",
                        slug: "ot_3_variant_20",
                    }),
                ).toBe(3);

                expect(
                    getTestVariantNumber({
                        title: "Variant 2 — Ravish",
                        slug: "ravish-second",
                    }),
                ).toBe(2);
            },
        );

        it(
            "does not mistake question counts for variant numbers",
            () => {
                expect(
                    getTestVariantNumber({
                        title: "Morfologiya — 20 ta savol",
                        slug: "morfologiya-20-test",
                    }),
                ).toBeNull();
            },
        );

        it(
            "places explicit variants before unnumbered collections",
            () => {
                const tests = [
                    {
                        title: "Qo‘shimcha test",
                        slug: "qoshimcha-test",
                    },
                    {
                        title: "Ravish 2-variant",
                        slug: "ravish-2-variant",
                    },
                    {
                        title: "Ravish 1-variant",
                        slug: "ravish-1-variant",
                    },
                ];

                expect(
                    sortTestCollectionsByVariant(
                        tests,
                    ).map(
                        (test) => test.title,
                    ),
                ).toEqual([
                    "Ravish 1-variant",
                    "Ravish 2-variant",
                    "Qo‘shimcha test",
                ]);
            },
        );
    },
);
