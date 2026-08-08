import {
    describe,
    expect,
    it,
} from "vitest";

import {
    AdminTestImageValidationError,
    createAdminTestImageStoragePath,
    inspectAdminTestImage,
    isAdminTestImageStoragePath,
    normalizeAdminTestImageAlt,
    normalizeAdminTestImageCaption,
} from "./admin-test-image-validation";

function createPngHeader(
    width: number,
    height: number,
): Uint8Array {
    const bytes =
        new Uint8Array(24);

    bytes.set(
        [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ],
        0,
    );

    const view =
        new DataView(bytes.buffer);

    view.setUint32(
        16,
        width,
        false,
    );
    view.setUint32(
        20,
        height,
        false,
    );

    return bytes;
}

describe(
    "admin test image validation",
    () => {
        it(
            "detects PNG content and dimensions",
            () => {
                const inspection =
                    inspectAdminTestImage(
                        createPngHeader(
                            800,
                            600,
                        ),
                        "image/png",
                    );

                expect(inspection).toEqual({
                    mimeType:
                        "image/png",
                    extension: "png",
                    width: 800,
                    height: 600,
                });
            },
        );

        it(
            "rejects a declared MIME mismatch",
            () => {
                expect(() =>
                    inspectAdminTestImage(
                        createPngHeader(
                            100,
                            100,
                        ),
                        "image/jpeg",
                    ),
                ).toThrow(
                    AdminTestImageValidationError,
                );
            },
        );

        it(
            "builds and verifies an owned draft path",
            () => {
                const path =
                    createAdminTestImageStoragePath({
                        draftId:
                            "test-draft-123",
                        questionId:
                            "question-456",
                        fileId:
                            "4d7e44da-0d3f-4f8e-8c12-6fc3eaf7231f",
                        extension: "webp",
                    });

                expect(path).toBe(
                    "drafts/test-draft-123/question-456/4d7e44da-0d3f-4f8e-8c12-6fc3eaf7231f.webp",
                );
                expect(
                    isAdminTestImageStoragePath(
                        path,
                        {
                            draftId:
                                "test-draft-123",
                            questionId:
                                "question-456",
                        },
                    ),
                ).toBe(true);
                expect(
                    isAdminTestImageStoragePath(
                        path,
                        {
                            draftId:
                                "another-draft",
                        },
                    ),
                ).toBe(false);
            },
        );

        it(
            "requires trimmed alt text and normalizes caption",
            () => {
                expect(
                    normalizeAdminTestImageAlt(
                        "  Diagramma  ",
                    ),
                ).toBe("Diagramma");
                expect(
                    normalizeAdminTestImageCaption(
                        "   ",
                    ),
                ).toBeNull();
                expect(() =>
                    normalizeAdminTestImageAlt(
                        "   ",
                    ),
                ).toThrow(
                    "Rasm uchun alt matn kiritilishi kerak.",
                );
            },
        );
    },
);
