"use client";

import {
    StorageClient,
} from "@supabase/storage-js";
import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    AdminDraftAudioAsset,
} from "../model/admin-question-types";
import {
    ADMIN_TEST_AUDIO_ACCEPT,
    ADMIN_TEST_AUDIO_MAX_BYTES,
    inspectAdminTestAudio,
} from "../model/admin-test-audio-validation";
import type {
    AdminTestAudioUploadResponse,
} from "../model/admin-test-audio-upload-types";

import styles from "./admin-question-audio-uploader.module.css";

interface AdminQuestionAudioUploaderProps {
    readonly draftId: string;
    readonly questionId: string;
    readonly audio:
        AdminDraftAudioAsset | null;
    readonly onChange: (
        audio:
            AdminDraftAudioAsset | null,
    ) => void;
    readonly onQueueStorageRemoval: (
        storagePath: string,
    ) => void;
    readonly compact?: boolean;
}

type Feedback = {
    readonly type:
        | "success"
        | "error"
        | "warning";
    readonly message: string;
};

const ENDPOINT =
    "/api/admin/test-drafts/audios";

function formatBytes(
    bytes: number,
): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes =
        bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(1)} KB`;
    }

    return `${(
        kilobytes / 1024
    ).toFixed(2)} MB`;
}

function formatDuration(
    seconds: number | null,
): string {
    if (
        seconds === null ||
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {
        return "davomiylik noma’lum";
    }

    const whole =
        Math.round(seconds);
    const minutes =
        Math.floor(
            whole / 60,
        );
    const remaining =
        whole % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function buildPreviewUrl(
    storagePath: string,
): string {
    const params =
        new URLSearchParams({
            path: storagePath,
        });

    return `${ENDPOINT}?${params.toString()}`;
}

async function readJsonResponse<T>(
    response: Response,
): Promise<T> {
    try {
        return await response.json() as T;
    } catch {
        throw new Error(
            "Server javobini o‘qib bo‘lmadi.",
        );
    }
}

async function readAudioDuration(
    file: File,
): Promise<number | null> {
    const objectUrl =
        URL.createObjectURL(file);

    try {
        return await new Promise<number | null>(
            (resolve) => {
                const element =
                    document.createElement(
                        "audio",
                    );
                const cleanup = () => {
                    element.removeAttribute(
                        "src",
                    );
                    element.load();
                };

                element.preload =
                    "metadata";
                element.onloadedmetadata =
                    () => {
                        const duration =
                            Number.isFinite(
                                element.duration,
                            ) &&
                            element.duration >= 0
                                ? Math.round(
                                    element.duration *
                                    10,
                                ) / 10
                                : null;

                        cleanup();
                        resolve(
                            duration,
                        );
                    };
                element.onerror =
                    () => {
                        cleanup();
                        resolve(
                            null,
                        );
                    };
                element.src =
                    objectUrl;
            },
        );
    } finally {
        URL.revokeObjectURL(
            objectUrl,
        );
    }
}

export function AdminQuestionAudioUploader({
    draftId,
    questionId,
    audio,
    onChange,
    onQueueStorageRemoval,
    compact = false,
}: AdminQuestionAudioUploaderProps) {
    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);
    const [busy, setBusy] =
        useState(false);
    const [feedback, setFeedback] =
        useState<Feedback | null>(null);

    useEffect(
        () => {
            setSelectedFile(
                null,
            );
            setFeedback(
                null,
            );

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }
        },
        [
            questionId,
        ],
    );

    function selectFile(
        file: File | null,
    ) {
        setFeedback(
            null,
        );

        if (!file) {
            setSelectedFile(
                null,
            );
            return;
        }

        if (
            file.size >
            ADMIN_TEST_AUDIO_MAX_BYTES
        ) {
            setSelectedFile(
                null,
            );
            setFeedback({
                type: "error",
                message:
                    "Audio hajmi 25 MB dan oshmasligi kerak.",
            });

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            return;
        }

        setSelectedFile(
            file,
        );
    }

    async function uploadAudio() {
        if (!selectedFile) {
            setFeedback({
                type: "error",
                message:
                    "Avval audio faylini tanlang.",
            });
            return;
        }

        setBusy(
            true,
        );
        setFeedback(
            null,
        );

        try {
            const fileBuffer =
                await selectedFile
                    .arrayBuffer();
            const inspection =
                inspectAdminTestAudio(
                    new Uint8Array(
                        fileBuffer,
                    ),
                    selectedFile.type,
                    selectedFile.name,
                );
            const durationSeconds =
                await readAudioDuration(
                    selectedFile,
                );

            const createResponse =
                await fetch(
                    ENDPOINT,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            draftId,
                            questionId,
                            fileName:
                                selectedFile.name,
                            mimeType:
                                inspection.mimeType,
                            sizeBytes:
                                selectedFile.size,
                            durationSeconds,
                        }),
                    },
                );
            const result =
                await readJsonResponse<
                    AdminTestAudioUploadResponse
                >(createResponse);

            if (
                !createResponse.ok ||
                result.status === "error"
            ) {
                throw new Error(
                    result.status === "error"
                        ? result.message
                        : "Xavfsiz audio yuklash manzilini yaratib bo‘lmadi.",
                );
            }

            const storage =
                new StorageClient(
                    result.upload.storageUrl,
                    {},
                );
            const uploadBody =
                new Blob(
                    [
                        fileBuffer,
                    ],
                    {
                        type:
                            result.audio.mimeType,
                    },
                );
            const {
                error: uploadError,
            } = await storage
                .from(
                    result.upload.bucket,
                )
                .uploadToSignedUrl(
                    result.upload.path,
                    result.upload.token,
                    uploadBody,
                    {
                        cacheControl:
                            "3600",
                        contentType:
                            result.audio.mimeType,
                    },
                );

            if (uploadError) {
                throw new Error(
                    `Audioni Supabase Storage’ga yuklab bo‘lmadi: ${uploadError.message}`,
                );
            }

            if (
                audio?.storagePath &&
                audio.storagePath !==
                    result.audio.storagePath
            ) {
                onQueueStorageRemoval(
                    audio.storagePath,
                );
            }

            onChange(
                result.audio,
            );
            setSelectedFile(
                null,
            );

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            setFeedback({
                type: "success",
                message:
                    audio?.storagePath
                        ? "Yangi audio yuklandi. Draft saqlangach eski fayl Storage’dan o‘chiriladi."
                        : "Audio yuklandi. Draftni saqlashni unutmang.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Audioni yuklashda xatolik yuz berdi.",
            });
        } finally {
            setBusy(
                false,
            );
        }
    }

    function removeAudio() {
        if (!audio) {
            return;
        }

        if (audio.storagePath) {
            onQueueStorageRemoval(
                audio.storagePath,
            );
        }

        onChange(
            null,
        );
        setSelectedFile(
            null,
        );

        if (fileInputRef.current) {
            fileInputRef.current.value =
                "";
        }

        setFeedback({
            type: "success",
            message:
                audio.storagePath
                    ? "Audio draftdan olib tashlandi. Draft saqlangach fayl Storage’dan o‘chiriladi."
                    : "Audio metama’lumoti olib tashlandi.",
        });
    }

    const previewUrl =
        audio?.storagePath
            ? buildPreviewUrl(
                audio.storagePath,
            )
            : null;

    return (
        <section
            className={[
                styles.uploader,
                compact
                    ? styles.compact
                    : "",
            ].filter(Boolean).join(" ")}
            aria-busy={busy}
        >
            <div
                className={
                    styles.heading
                }
            >
                <div>
                    <span>
                        OVOZLI IZOH
                    </span>
                    <strong>
                        {audio
                            ? "Audio yuklangan"
                            : "Audio yuklash"}
                    </strong>
                </div>

                <small>
                    MP3, M4A yoki WAV · 25 MB gacha
                </small>
            </div>

            {previewUrl && audio && (
                <div
                    className={
                        styles.preview
                    }
                >
                    <div>
                        <strong>
                            {audio.fileName}
                        </strong>
                        <span>
                            {formatBytes(
                                audio.sizeBytes,
                            )}
                            {" · "}
                            {formatDuration(
                                audio.durationSeconds,
                            )}
                        </span>
                    </div>

                    <audio
                        controls
                        preload="metadata"
                        src={previewUrl}
                    />
                </div>
            )}

            <label
                className={
                    styles.fileField
                }
            >
                <span>
                    Audio fayli
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                        ADMIN_TEST_AUDIO_ACCEPT
                    }
                    disabled={busy}
                    onChange={(event) =>
                        selectFile(
                            event.target.files?.[0] ??
                            null,
                        )
                    }
                />
                <small>
                    {selectedFile
                        ? `${selectedFile.name} · ${formatBytes(selectedFile.size)}`
                        : audio
                            ? "Yangi fayl tanlansa, mavjud audio almashtiriladi."
                            : "Ustozning savol bo‘yicha ovozli izohini tanlang."}
                </small>
            </label>

            <div
                className={
                    styles.actions
                }
            >
                <button
                    type="button"
                    onClick={uploadAudio}
                    disabled={
                        busy ||
                        !selectedFile
                    }
                >
                    {busy
                        ? "Bajarilmoqda..."
                        : audio
                            ? "Audioni almashtirish"
                            : "Audioni yuklash"}
                </button>

                {audio && (
                    <button
                        type="button"
                        className={
                            styles.removeButton
                        }
                        onClick={removeAudio}
                        disabled={busy}
                    >
                        Audioni o‘chirish
                    </button>
                )}
            </div>

            {feedback && (
                <p
                    className={
                        feedback.type ===
                        "success"
                            ? styles.success
                            : feedback.type ===
                                "warning"
                                ? styles.warning
                                : styles.error
                    }
                    role="status"
                >
                    {feedback.message}
                </p>
            )}
        </section>
    );
}
