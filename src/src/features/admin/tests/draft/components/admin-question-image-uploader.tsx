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
    AdminDraftImageAsset,
} from "../model/admin-question-types";
import {
    ADMIN_TEST_IMAGE_ACCEPT,
    ADMIN_TEST_IMAGE_MAX_BYTES,
    inspectAdminTestImage,
} from "../model/admin-test-image-validation";
import type {
    AdminTestImageUploadResponse,
} from "../model/admin-test-image-upload-types";

import styles from "./admin-question-image-uploader.module.css";

interface AdminQuestionImageUploaderProps {
    readonly draftId: string;
    readonly questionId: string;
    readonly image:
        AdminDraftImageAsset | null;
    readonly eyebrow?: string;
    readonly defaultAlt?: string;
    readonly previewAltFallback?: string;
    readonly onChange: (
        image:
            AdminDraftImageAsset | null,
    ) => void;
    readonly onQueueStorageRemoval: (
        storagePath: string,
    ) => void;
}

type Feedback = {
    readonly type:
        | "success"
        | "error"
        | "warning";
    readonly message: string;
};

const ENDPOINT =
    "/api/admin/test-drafts/images";

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

export function AdminQuestionImageUploader({
    draftId,
    questionId,
    image,
    eyebrow = "SAVOL RASMI",
    defaultAlt = "",
    previewAltFallback = "Savol rasmi",
    onChange,
    onQueueStorageRemoval,
}: AdminQuestionImageUploaderProps) {
    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);
    const [alt, setAlt] =
        useState(
            image?.alt ?? defaultAlt,
        );
    const [caption, setCaption] =
        useState(image?.caption ?? "");
    const [busy, setBusy] =
        useState(false);
    const [feedback, setFeedback] =
        useState<Feedback | null>(null);

    useEffect(() => {
        setAlt(
            image?.alt ?? defaultAlt,
        );
        setCaption(
            image?.caption ?? "",
        );
    }, [
        image?.id,
        image?.alt,
        image?.caption,
        defaultAlt,
    ]);

    function updateAlt(
        nextAlt: string,
    ) {
        setAlt(nextAlt);

        if (image) {
            onChange({
                ...image,
                alt: nextAlt,
            });
        }
    }

    function updateCaption(
        nextCaption: string,
    ) {
        setCaption(nextCaption);

        if (image) {
            onChange({
                ...image,
                caption:
                    nextCaption || null,
            });
        }
    }

    function selectFile(
        file: File | null,
    ) {
        setFeedback(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (
            file.size >
            ADMIN_TEST_IMAGE_MAX_BYTES
        ) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message:
                    "Rasm hajmi 5 MB dan oshmasligi kerak.",
            });

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            return;
        }

        setSelectedFile(file);
    }

    async function uploadImage() {
        if (!selectedFile) {
            setFeedback({
                type: "error",
                message:
                    "Avval rasm faylini tanlang.",
            });
            return;
        }

        if (!alt.trim()) {
            setFeedback({
                type: "error",
                message:
                    "Rasm uchun alt matn kiritilishi kerak.",
            });
            return;
        }

        setBusy(true);
        setFeedback(null);

        try {
            const fileBuffer =
                await selectedFile
                    .arrayBuffer();
            const inspection =
                inspectAdminTestImage(
                    new Uint8Array(
                        fileBuffer,
                    ),
                    selectedFile.type,
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
                            width:
                                inspection.width,
                            height:
                                inspection.height,
                            alt,
                            caption,
                        }),
                    },
                );
            const result =
                await readJsonResponse<
                    AdminTestImageUploadResponse
                >(createResponse);

            if (
                !createResponse.ok ||
                result.status === "error"
            ) {
                throw new Error(
                    result.status === "error"
                        ? result.message
                        : "Xavfsiz yuklash manzilini yaratib bo‘lmadi.",
                );
            }

            const storage =
                new StorageClient(
                    result.upload.storageUrl,
                    {},
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
                    selectedFile,
                    {
                        cacheControl:
                            "3600",
                        contentType:
                            result.image.mimeType,
                    },
                );

            if (uploadError) {
                throw new Error(
                    `Rasmni Supabase Storage’ga yuklab bo‘lmadi: ${uploadError.message}`,
                );
            }

            if (
                image?.storagePath &&
                image.storagePath !==
                    result.image.storagePath
            ) {
                onQueueStorageRemoval(
                    image.storagePath,
                );
            }

            onChange(result.image);
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            setFeedback({
                type: "success",
                message:
                    image?.storagePath
                        ? "Yangi rasm yuklandi. Draft saqlangach eski fayl Storage’dan o‘chiriladi."
                        : "Rasm yuklandi. Draftni saqlashni unutmang.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Rasmni yuklashda xatolik yuz berdi.",
            });
        } finally {
            setBusy(false);
        }
    }

    function removeImage() {
        if (!image) {
            return;
        }

        if (image.storagePath) {
            onQueueStorageRemoval(
                image.storagePath,
            );
        }

        onChange(null);
        setSelectedFile(null);
        setAlt(defaultAlt);
        setCaption("");

        if (fileInputRef.current) {
            fileInputRef.current.value =
                "";
        }

        setFeedback({
            type: "success",
            message:
                image.storagePath
                    ? "Rasm draftdan olib tashlandi. Draft saqlangach fayl Storage’dan o‘chiriladi."
                    : "Rasm metama’lumoti olib tashlandi.",
        });
    }

    const previewUrl =
        image?.storagePath
            ? buildPreviewUrl(
                image.storagePath,
            )
            : null;

    return (
        <section
            className={
                styles.uploader
            }
            aria-busy={busy}
        >
            <div
                className={
                    styles.heading
                }
            >
                <div>
                    <span>
                        {eyebrow}
                    </span>
                    <strong>
                        {image
                            ? "Rasm yuklangan"
                            : "Rasm yuklash"}
                    </strong>
                </div>

                <small>
                    JPEG, PNG yoki WebP · 5 MB gacha
                </small>
            </div>

            {previewUrl && image && (
                <figure
                    className={
                        styles.preview
                    }
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewUrl}
                        alt={
                            image.alt ||
                            previewAltFallback
                        }
                    />

                    <figcaption>
                        <strong>
                            {image.fileName}
                        </strong>
                        <span>
                            {formatBytes(
                                image.sizeBytes,
                            )}
                            {image.width &&
                            image.height
                                ? ` · ${image.width} × ${image.height}`
                                : ""}
                        </span>
                    </figcaption>
                </figure>
            )}

            <div
                className={
                    styles.fieldGrid
                }
            >
                <label
                    className={
                        styles.fileField
                    }
                >
                    <span>
                        Rasm fayli
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                            ADMIN_TEST_IMAGE_ACCEPT
                        }
                        disabled={busy}
                        onChange={(event) =>
                            selectFile(
                                event.target
                                    .files?.[0] ??
                                null,
                            )
                        }
                    />
                    <small>
                        {selectedFile
                            ? `${selectedFile.name} · ${formatBytes(selectedFile.size)}`
                            : image
                                ? "Yangi fayl tanlansa, mavjud rasm almashtiriladi."
                                : "Yuklash uchun fayl tanlang."}
                    </small>
                </label>

                <label>
                    <span>
                        Alt matn *
                    </span>
                    <input
                        value={alt}
                        maxLength={300}
                        disabled={busy}
                        onChange={(event) =>
                            updateAlt(
                                event.target.value,
                            )
                        }
                        placeholder="Rasmda nima tasvirlanganini yozing..."
                    />
                </label>

                <label
                    className={
                        styles.fullWidth
                    }
                >
                    <span>
                        Rasm izohi
                    </span>
                    <input
                        value={caption}
                        maxLength={500}
                        disabled={busy}
                        onChange={(event) =>
                            updateCaption(
                                event.target.value,
                            )
                        }
                        placeholder="Ixtiyoriy izoh..."
                    />
                </label>
            </div>

            <div
                className={
                    styles.actions
                }
            >
                <button
                    type="button"
                    onClick={uploadImage}
                    disabled={
                        busy ||
                        !selectedFile ||
                        !alt.trim()
                    }
                >
                    {busy
                        ? "Bajarilmoqda..."
                        : image
                            ? "Rasmni almashtirish"
                            : "Rasmni yuklash"}
                </button>

                {image && (
                    <button
                        type="button"
                        className={
                            styles.removeButton
                        }
                        onClick={removeImage}
                        disabled={busy}
                    >
                        Rasmni o‘chirish
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
