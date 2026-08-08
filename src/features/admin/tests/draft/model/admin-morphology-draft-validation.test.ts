import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createEmptyAdminTestDraft,
} from "./admin-test-draft-factory";
import {
    validateAdminTestDraft,
} from "./admin-test-draft-validation";

describe(
    "admin morphology draft validation",
    () => {
        it(
            "allows an empty morphology draft with a real subtopic route",
            () => {
                const draft =
                    createEmptyAdminTestDraft({
                        metadata: {
                            title:
                                "Ot — 1",
                            description:
                                "Ot bo‘yicha test",
                            group:
                                "morphology",
                            category:
                                "Morfologiya",
                            topicSlug:
                                "ot",
                            slug:
                                "1",
                            format:
                                "morphology-standard",
                            difficulty:
                                "medium",
                            access:
                                "free",
                            estimatedMinutes:
                                25,
                        },
                        createdBy:
                            "admin",
                    });

                const result =
                    validateAdminTestDraft(
                        draft,
                    );

                expect(
                    result.errors,
                ).toEqual(
                    [],
                );
            },
        );

        it(
            "rejects an invalid morphology subtopic",
            () => {
                const draft =
                    createEmptyAdminTestDraft({
                        metadata: {
                            title:
                                "Morfologiya",
                            description:
                                "",
                            group:
                                "morphology",
                            category:
                                "Morfologiya",
                            topicSlug:
                                "morfologiya",
                            slug:
                                "1",
                            format:
                                "morphology-standard",
                            difficulty:
                                "medium",
                            access:
                                "free",
                            estimatedMinutes:
                                25,
                        },
                        createdBy:
                            "admin",
                    });

                const result =
                    validateAdminTestDraft(
                        draft,
                    );

                expect(
                    result.errors.some(
                        (issue) =>
                            issue.code ===
                            "MORPHOLOGY_ROUTE_INVALID",
                    ),
                ).toBe(
                    true,
                );
            },
        );
    },
);
