import {
    describe,
    expect,
    it,
} from "vitest";

import {
    AdminTestAudioValidationError,
    createAdminTestAudioStoragePath,
    inspectAdminTestAudio,
    isAdminTestAudioStoragePath,
    normalizeAdminTestAudioMimeType,
} from "./admin-test-audio-validation";

function asciiBytes(
    value: string,
): Uint8Array {
    return Uint8Array.from(
        Array.from(value).map(
            (character) =>
                character.charCodeAt(0),
        ),
    );
}

describe(
    "admin test audio validation",
    () => {
        it(
            "detects MP3, M4A and WAV signatures",
            () => {
                expect(
                    inspectAdminTestAudio(
                        asciiBytes(
                            "ID3abcdef",
                        ),
                        "audio/mpeg",
                        "teacher.mp3",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/mpeg",
                    extension:
                        "mp3",
                });

                const m4a =
                    new Uint8Array(16);
                m4a.set(
                    asciiBytes(
                        "ftypM4A ",
                    ),
                    4,
                );

                expect(
                    inspectAdminTestAudio(
                        m4a,
                        "audio/x-m4a",
                        "teacher.m4a",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/mp4",
                    extension:
                        "m4a",
                });

                const wav =
                    new Uint8Array(16);
                wav.set(
                    asciiBytes(
                        "RIFF",
                    ),
                    0,
                );
                wav.set(
                    asciiBytes(
                        "WAVE",
                    ),
                    8,
                );

                expect(
                    inspectAdminTestAudio(
                        wav,
                        "audio/x-wav",
                        "teacher.wav",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/wav",
                    extension:
                        "wav",
                });
            },
        );

        it(
            "normalizes common browser audio MIME aliases",
            () => {
                expect(
                    normalizeAdminTestAudioMimeType(
                        "audio/x-m4a",
                    ),
                ).toBe(
                    "audio/mp4",
                );
                expect(
                    normalizeAdminTestAudioMimeType(
                        "audio/x-wav",
                    ),
                ).toBe(
                    "audio/wav",
                );
                expect(
                    normalizeAdminTestAudioMimeType(
                        "audio/mp3",
                    ),
                ).toBe(
                    "audio/mpeg",
                );
            },
        );

        it(
            "accepts a browser file with an empty declared MIME when content is valid",
            () => {
                expect(
                    inspectAdminTestAudio(
                        asciiBytes(
                            "ID3abcdef",
                        ),
                        "",
                        "teacher.mp3",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/mpeg",
                    extension:
                        "mp3",
                });
            },
        );

        it(
            "falls back to a supported file extension when a valid browser audio file has an uncommon header",
            () => {
                expect(
                    inspectAdminTestAudio(
                        asciiBytes(
                            "uncommon-mp3-header",
                        ),
                        "audio/mpeg",
                        "teacher.mp3",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/mpeg",
                    extension:
                        "mp3",
                });

                expect(
                    inspectAdminTestAudio(
                        asciiBytes(
                            "uncommon-m4a-header",
                        ),
                        "audio/x-m4a",
                        "teacher.m4a",
                    ),
                ).toEqual({
                    mimeType:
                        "audio/mp4",
                    extension:
                        "m4a",
                });
            },
        );

        it(
            "rejects a declared MIME mismatch",
            () => {
                expect(() =>
                    inspectAdminTestAudio(
                        asciiBytes(
                            "ID3abcdef",
                        ),
                        "audio/wav",
                        "teacher.mp3",
                    ),
                ).toThrow(
                    AdminTestAudioValidationError,
                );
            },
        );

        it(
            "rejects an unsupported extension when no signature can be detected",
            () => {
                expect(() =>
                    inspectAdminTestAudio(
                        asciiBytes(
                            "unknown-header",
                        ),
                        "",
                        "teacher.ogg",
                    ),
                ).toThrow(
                    AdminTestAudioValidationError,
                );
            },
        );

        it(
            "builds and verifies an owned audio path",
            () => {
                const path =
                    createAdminTestAudioStoragePath({
                        draftId:
                            "test-draft-123",
                        questionId:
                            "question-456",
                        fileId:
                            "4d7e44da-0d3f-4f8e-8c12-6fc3eaf7231f",
                        extension:
                            "mp3",
                    });

                expect(path).toBe(
                    "drafts/test-draft-123/question-456/audio/4d7e44da-0d3f-4f8e-8c12-6fc3eaf7231f.mp3",
                );
                expect(
                    isAdminTestAudioStoragePath(
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
                    isAdminTestAudioStoragePath(
                        path,
                        {
                            draftId:
                                "other-draft",
                        },
                    ),
                ).toBe(false);
            },
        );
    },
);
