import {
    describe,
    expect,
    it,
} from "vitest";

import {
    validateAdminTestDraft,
} from "./admin-test-draft-validation";

import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

function createEmptyDiagnosticDraft({
    topicSlug =
        "diagnostika",
}: {
    readonly topicSlug?:
        string;
} = {}): AdminTestDraft {
    return {
        version:
            1,
        id:
            "diagnostic-empty-draft",
        status:
            "draft",
        source:
            "manual",
        metadata: {
            title:
                "Diagnostika 3",
            description:
                "",
            group:
                "national-certificate",
            category:
                "Diagnostika",
            topicSlug,
            slug:
                "diagnostika3",
            format:
                "diagnostic",
            difficulty:
                "hard",
            access:
                "free",
            tangaPrice:
                0,
            estimatedMinutes:
                180,
            diagnostic:
                null,
        },
        questions:
            [],
        audit: {
            createdAt:
                1,
            updatedAt:
                1,
            createdBy:
                "admin",
            updatedBy:
                "admin",
        },
    };
}

describe(
    "empty diagnostic draft validation",
    () => {
        it(
            "allows creating an empty diagnostic draft before DOCX import",
            () => {
                const result =
                    validateAdminTestDraft(
                        createEmptyDiagnosticDraft(),
                    );

                expect(
                    result.isValid,
                ).toBe(
                    true,
                );

                expect(
                    result.errors,
                ).toEqual(
                    [],
                );

                expect(
                    result.warnings.some(
                        (warning) =>
                            warning.code ===
                            "TEST_HAS_NO_QUESTIONS",
                    ),
                ).toBe(
                    true,
                );
            },
        );

        it(
            "still rejects the wrong diagnostic route",
            () => {
                const result =
                    validateAdminTestDraft(
                        createEmptyDiagnosticDraft({
                            topicSlug:
                                "diagnostika3",
                        }),
                    );

                expect(
                    result.isValid,
                ).toBe(
                    false,
                );

                expect(
                    result.errors.some(
                        (error) =>
                            error.code ===
                            "DIAGNOSTIC_ROUTE_INVALID",
                    ),
                ).toBe(
                    true,
                );
            },
        );
    },
);
