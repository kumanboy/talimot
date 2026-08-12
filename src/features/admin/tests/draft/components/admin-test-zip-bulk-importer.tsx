"use client";

import {
    useRef,
    useState,
} from "react";

import type {
    AdminTestBulkImportResponse,
} from "../model/admin-test-bulk-import-types";
import type {
    AdminTestDraft,
} from "../model/admin-test-draft-types";

import styles from "./admin-test-zip-bulk-importer.module.css";

interface AdminTestZipBulkImporterProps {
    readonly draftId: string;
    readonly expectedUpdatedAt: number;
    readonly currentQuestionCount: number;
    readonly disabled?: boolean;
    readonly disabledReason?: string | null;
    readonly onImported: (
        savedDraft:
            AdminTestDraft,
        message: string,
    ) => void;
}

type Feedback = {
    readonly type:
        | "success"
        | "error";
    readonly message: string;
};

const ENDPOINT =
    "/api/admin/test-drafts/bulk-import";
const MAX_ZIP_BYTES =
    4 * 1024 * 1024;

async function readJsonResponse(
    response: Response,
): Promise<AdminTestBulkImportResponse> {
    try {
        return await response.json() as
            AdminTestBulkImportResponse;
    } catch {
        throw new Error(
            "Server javobini o‘qib bo‘lmadi.",
        );
    }
}

function formatMegabytes(
    bytes: number,
): string {
    return `${(
        bytes /
        1024 /
        1024
    ).toFixed(2)} MB`;
}

export function AdminTestZipBulkImporter({
    draftId,
    expectedUpdatedAt,
    currentQuestionCount,
    disabled = false,
    disabledReason = null,
    onImported,
}: AdminTestZipBulkImporterProps) {
    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );
    const [selectedFile, setSelectedFile] =
        useState<File | null>(
            null,
        );
    const [busy, setBusy] =
        useState(false);
    const [feedback, setFeedback] =
        useState<Feedback | null>(
            null,
        );

    function selectFile(
        file: File | null,
    ) {
        setFeedback(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (
            !file.name
                .toLowerCase()
                .endsWith(".zip")
        ) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message:
                    "Faqat .zip import bundle tanlang.",
            });
            return;
        }

        if (
            file.size <= 0 ||
            file.size >
                MAX_ZIP_BYTES
        ) {
            setSelectedFile(null);
            setFeedback({
                type: "error",
                message:
                    "ZIP fayl hajmi 4 MB dan oshmasligi kerak.",
            });
            return;
        }

        setSelectedFile(file);
    }

    async function importBundle() {
        if (disabled) {
            setFeedback({
                type: "error",
                message:
                    disabledReason ??
                    "Hozir bulk import qilib bo‘lmaydi.",
            });
            return;
        }

        if (!selectedFile) {
            setFeedback({
                type: "error",
                message:
                    "Avval import ZIP faylini tanlang.",
            });
            return;
        }

        if (
            currentQuestionCount > 0
        ) {
            const confirmed =
                window.confirm(
                    `Bulk import hozirgi ${currentQuestionCount} ta savolni to‘liq almashtiradi. Davom etilsinmi?`,
                );

            if (!confirmed) {
                return;
            }
        }

        setBusy(true);
        setFeedback(null);

        try {
            const formData =
                new FormData();
            formData.set(
                "draftId",
                draftId,
            );
            formData.set(
                "expectedUpdatedAt",
                String(
                    expectedUpdatedAt,
                ),
            );
            formData.set(
                "bundle",
                selectedFile,
            );

            const response =
                await fetch(
                    ENDPOINT,
                    {
                        method: "POST",
                        body:
                            formData,
                    },
                );
            const result =
                await readJsonResponse(
                    response,
                );

            if (
                !response.ok ||
                result.status ===
                    "error"
            ) {
                throw new Error(
                    result.status ===
                        "error"
                        ? result.message
                        : "Bulk import bajarilmadi.",
                );
            }

            setSelectedFile(null);

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            setFeedback({
                type: "success",
                message:
                    result.message,
            });
            onImported(
                result.savedDraft,
                result.message,
            );
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "ZIP importda xatolik yuz berdi.",
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <section
            className={
                styles.importer
            }
            aria-labelledby="zip-bulk-import-title"
        >
            <div
                className={
                    styles.header
                }
            >
                <div>
                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        IMAGE-OPTION BULK IMPORT
                    </span>
                    <h2
                        id="zip-bulk-import-title"
                    >
                        20 ta savolni ZIP orqali bir martada yuklash
                    </h2>
                    <p>
                        manifest.json va option-images papkasi bor bundle’ni tanlang. Tizim 20 ta savol, 80 ta A/B/C/D rasmini va to‘g‘ri javoblarni avtomatik import qiladi.
                    </p>
                </div>

                <div
                    className={
                        styles.badge
                    }
                >
                    20 SAVOL · 80 RASM
                </div>
            </div>

            <div
                className={
                    styles.controls
                }
            >
                <label
                    className={
                        styles.fileField
                    }
                >
                    <span>
                        Import ZIP
                    </span>
                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed"
                        disabled={
                            busy ||
                            disabled
                        }
                        onChange={(
                            event,
                        ) =>
                            selectFile(
                                event.target.files?.[0] ??
                                null,
                            )
                        }
                    />
                </label>

                <button
                    type="button"
                    className={
                        styles.importButton
                    }
                    disabled={
                        busy ||
                        disabled ||
                        !selectedFile
                    }
                    onClick={() => {
                        void importBundle();
                    }}
                >
                    {busy
                        ? "20 savol import qilinmoqda…"
                        : "ZIP’ni import qilish"}
                </button>
            </div>

            {selectedFile && (
                <div
                    className={
                        styles.selectedFile
                    }
                >
                    <strong>
                        {selectedFile.name}
                    </strong>
                    <span>
                        {formatMegabytes(
                            selectedFile.size,
                        )}
                    </span>
                </div>
            )}

            {disabled &&
                disabledReason && (
                <div
                    className={
                        styles.warning
                    }
                    role="status"
                >
                    {disabledReason}
                </div>
            )}

            {feedback && (
                <div
                    className={
                        feedback.type ===
                        "success"
                            ? styles.success
                            : styles.error
                    }
                    role="status"
                    aria-live="polite"
                >
                    {feedback.message}
                </div>
            )}

            <p
                className={
                    styles.note
                }
            >
                Import mavjud savollarni almashtiradi va muvaffaqiyatli tugagach draftni avtomatik saqlaydi. ZIP limiti: 4 MB.
            </p>
        </section>
    );
}
