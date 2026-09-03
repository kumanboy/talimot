"use client";

import {
    StorageClient,
} from "@supabase/storage-js";
import {
    useMemo,
    useRef,
    useState,
} from "react";

import {
    readAdminAudioZip,
} from "../bulk-import/admin-client-audio-zip-reader";
import type {
    AdminDraftAudioAsset,
} from "../model/admin-question-types";
import type {
    AdminTestAudioBulkUploadResponse,
} from "../model/admin-test-audio-bulk-upload-types";
import {
    ADMIN_TEST_AUDIO_MAX_BYTES,
    inspectAdminTestAudio,
} from "../model/admin-test-audio-validation";

import styles from "./admin-audio-zip-bulk-importer.module.css";

export interface AdminAudioZipTarget {
    readonly questionId: string;
    readonly label: string;
    readonly audio: AdminDraftAudioAsset | null;
    /**
     * Optional explicit ZIP filename stem (without extension).
     * Mixed tests use the real displayed question/block number. For
     * 33–34–35 matching practice this means q01.mp3 ... q20.mp3, one
     * shared audio per matching block; ordinary mixed questions can still
     * use stems such as q40.mp3 or q44.mp3.
     */
    readonly zipFileStem?: string;
}

interface PreparedAudio {
    readonly clientId: string;
    readonly questionId: string;
    readonly label: string;
    readonly fileName: string;
    readonly bytes: Uint8Array;
    readonly mimeType: string;
    readonly sizeBytes: number;
}

interface Analysis {
    readonly fileName: string;
    readonly prepared: readonly PreparedAudio[];
    readonly totalBytes: number;
    readonly replacementCount: number;
}

interface Feedback {
    readonly type: "success" | "error" | "warning";
    readonly message: string;
}

interface AdminAudioZipBulkImporterProps {
    readonly draftId: string;
    readonly targets: readonly AdminAudioZipTarget[];
    readonly disabled?: boolean;
    readonly disabledReason?: string | null;
    readonly onApply: (
        updates: readonly {
            readonly questionId: string;
            readonly audio: AdminDraftAudioAsset;
        }[],
    ) => void;
    readonly onQueueStorageRemoval: (
        questionId: string,
        storagePath: string,
    ) => void;
}

const BULK_ENDPOINT = "/api/admin/test-drafts/audios/bulk";
const SINGLE_ENDPOINT = "/api/admin/test-drafts/audios";
const MAX_PARALLEL_UPLOADS = 3;

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
}

function parseQuestionNumber(fileName: string): number | null {
    const normalized = fileName.trim();
    const match = normalized.match(
        /^(?:q(?:uestion)?[-_ ]?)?0*([1-9]\d*)\.(?:mp3|m4a|wav)$/iu,
    );

    if (!match) {
        return null;
    }

    const numeric = Number(match[1]);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function normalizeZipAudioStem(fileName: string): string | null {
    const normalized = fileName
        .trim()
        .replace(/\.(?:mp3|m4a|wav)$/iu, "")
        .toLocaleLowerCase("uz")
        .replace(/[ _]+/gu, "-")
        .replace(/-{2,}/gu, "-");

    if (normalized.length === 0) {
        return null;
    }

    // q1.mp3 and q01.mp3 are the same source question.
    // Canonicalising here keeps existing admin ZIPs working while the UI
    // continues to recommend the zero-padded q01.mp3 naming style.
    const plainQuestionStem = normalized.match(/^q0*([1-9]\d*)$/u);

    if (plainQuestionStem?.[1]) {
        return `q${String(Number(plainQuestionStem[1])).padStart(2, "0")}`;
    }

    return normalized;
}

function formatExpectedZipName(stem: string): string {
    return `${stem}.mp3`;
}

async function readJson<T>(response: Response): Promise<T> {
    try {
        return await response.json() as T;
    } catch {
        throw new Error("Server javobini o‘qib bo‘lmadi.");
    }
}

async function cleanupUploaded(
    draftId: string,
    uploaded: readonly {
        readonly questionId: string;
        readonly storagePath: string;
    }[],
): Promise<void> {
    await Promise.allSettled(
        uploaded.map((item) =>
            fetch(SINGLE_ENDPOINT, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    draftId,
                    questionId: item.questionId,
                    storagePath: item.storagePath,
                }),
            }),
        ),
    );
}

async function runWithConcurrency<T>(
    items: readonly T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
    let nextIndex = 0;
    let firstError: unknown = null;

    async function runWorker(): Promise<void> {
        while (firstError === null) {
            const index = nextIndex;
            nextIndex += 1;

            if (index >= items.length) {
                return;
            }

            try {
                await worker(items[index] as T, index);
            } catch (error) {
                firstError = error;
                return;
            }
        }
    }

    await Promise.all(
        Array.from(
            { length: Math.min(concurrency, items.length) },
            () => runWorker(),
        ),
    );

    if (firstError !== null) {
        throw firstError;
    }
}

export function AdminAudioZipBulkImporter({
    draftId,
    targets,
    disabled = false,
    disabledReason = null,
    onApply,
    onQueueStorageRemoval,
}: AdminAudioZipBulkImporterProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [busy, setBusy] = useState(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [progress, setProgress] = useState(0);

    const targetByIndex = useMemo(
        () => new Map(
            targets.map((target, index) => [index + 1, target]),
        ),
        [targets],
    );

    const explicitStemMode = useMemo(
        () => targets.some((target) => Boolean(target.zipFileStem)),
        [targets],
    );

    const targetByStem = useMemo(
        () => {
            const result = new Map<string, AdminAudioZipTarget>();

            targets.forEach((target) => {
                if (!target.zipFileStem) {
                    return;
                }

                const normalizedStem = normalizeZipAudioStem(target.zipFileStem);

                if (!normalizedStem) {
                    return;
                }

                if (!result.has(normalizedStem)) {
                    result.set(normalizedStem, target);
                }
            });

            return result;
        },
        [targets],
    );

    async function analyze(file: File | null) {
        setAnalysis(null);
        setFeedback(null);
        setProgress(0);

        if (!file) {
            return;
        }

        if (disabled) {
            setFeedback({
                type: "error",
                message: disabledReason ?? "Hozir audio ZIP yuklab bo‘lmaydi.",
            });
            return;
        }

        if (targets.length === 0) {
            setFeedback({
                type: "error",
                message: "Avval savollarni import qiling yoki yarating. Audio savollarga keyin bog‘lanadi.",
            });
            return;
        }

        setBusy(true);

        try {
            const entries = await readAdminAudioZip(file);
            const foundNumbers = new Set<number>();
            const foundStems = new Set<string>();
            const prepared: PreparedAudio[] = [];
            const unknownNames: string[] = [];

            for (const entry of entries) {
                let target: AdminAudioZipTarget | null = null;
                let clientId: string | null = null;

                if (explicitStemMode) {
                    const stem = normalizeZipAudioStem(entry.baseName);

                    target = stem
                        ? targetByStem.get(stem) ?? null
                        : null;

                    if (target && stem) {
                        if (foundStems.has(stem)) {
                            throw new Error(
                                `${entry.baseName}: bir audio nomi ZIP ichida takrorlangan.`,
                            );
                        }

                        foundStems.add(stem);
                        clientId = `bulk-${stem}`;
                    }
                } else {
                    const questionNumber = parseQuestionNumber(entry.baseName);

                    target = questionNumber === null
                        ? null
                        : targetByIndex.get(questionNumber) ?? null;

                    if (target && questionNumber !== null) {
                        if (foundNumbers.has(questionNumber)) {
                            throw new Error(
                                `${entry.baseName}: bir savol raqami ZIP ichida takrorlangan.`,
                            );
                        }

                        foundNumbers.add(questionNumber);
                        clientId = `bulk-${questionNumber}`;
                    }
                }

                if (!target || !clientId) {
                    unknownNames.push(entry.baseName);
                    continue;
                }

                if (entry.bytes.byteLength > ADMIN_TEST_AUDIO_MAX_BYTES) {
                    throw new Error(`${entry.baseName}: audio hajmi 25 MB dan oshmasligi kerak.`);
                }

                const inspection = inspectAdminTestAudio(
                    entry.bytes,
                    "",
                    entry.baseName,
                );

                prepared.push({
                    clientId,
                    questionId: target.questionId,
                    label: target.label,
                    fileName: entry.baseName,
                    bytes: entry.bytes,
                    mimeType: inspection.mimeType,
                    sizeBytes: entry.bytes.byteLength,
                });
            }

            const missingNames = explicitStemMode
                ? targets
                    .filter((target) => {
                        const stem = target.zipFileStem
                            ? normalizeZipAudioStem(target.zipFileStem)
                            : null;

                        return !stem || !foundStems.has(stem);
                    })
                    .map((target) =>
                        formatExpectedZipName(
                            target.zipFileStem ?? target.label,
                        ),
                    )
                : targets
                    .map((_target, index) => index + 1)
                    .filter((number) => !foundNumbers.has(number))
                    .map((number) =>
                        `q${String(number).padStart(2, "0")}.mp3`,
                    );

            if (unknownNames.length > 0) {
                const namingHint = explicitStemMode
                    ? targets
                        .slice(0, 4)
                        .map((target) =>
                            formatExpectedZipName(
                                target.zipFileStem ?? "",
                            ),
                        )
                        .join(", ")
                    : "q01.mp3, q02.mp3 ...";

                throw new Error(
                    `ZIP ichida savolga mos kelmagan audio bor: ${unknownNames.slice(0, 5).join(", ")}${unknownNames.length > 5 ? "…" : ""}. Kutilgan nomlar: ${namingHint}.`,
                );
            }

            if (missingNames.length > 0 || prepared.length !== targets.length) {
                throw new Error(
                    `Audio soni kutilgan targetlarga mos emas. Kutilgan: ${targets.length}. Yetishmaydi: ${missingNames.slice(0, 12).join(", ") || "yo‘q"}${missingNames.length > 12 ? "…" : ""}.`,
                );
            }

            prepared.sort((left, right) => {
                const leftIndex = targets.findIndex((target) => target.questionId === left.questionId);
                const rightIndex = targets.findIndex((target) => target.questionId === right.questionId);
                return leftIndex - rightIndex;
            });

            setAnalysis({
                fileName: file.name,
                prepared,
                totalBytes: prepared.reduce((sum, item) => sum + item.sizeBytes, 0),
                replacementCount: targets.filter((target) => Boolean(target.audio?.storagePath)).length,
            });
            setFeedback({
                type: "success",
                message: `${prepared.length}/${targets.length} audio to‘g‘ri moslandi. Endi Supabase Storage’ga bir martada yuklash mumkin.`,
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error instanceof Error ? error.message : "Audio ZIP’ni tekshirib bo‘lmadi.",
            });

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } finally {
            setBusy(false);
        }
    }

    async function uploadAll() {
        if (!analysis || disabled) {
            return;
        }

        setBusy(true);
        setProgress(0);
        setFeedback(null);

        const uploadedObjects: {
            questionId: string;
            storagePath: string;
        }[] = [];

        try {
            const response = await fetch(BULK_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    draftId,
                    files: analysis.prepared.map((item) => ({
                        clientId: item.clientId,
                        questionId: item.questionId,
                        fileName: item.fileName,
                        mimeType: item.mimeType,
                        sizeBytes: item.sizeBytes,
                        durationSeconds: null,
                    })),
                }),
            });
            const result = await readJson<AdminTestAudioBulkUploadResponse>(response);

            if (!response.ok || result.status === "error") {
                throw new Error(
                    result.status === "error"
                        ? result.message
                        : "Bulk audio uchun xavfsiz yuklash manzillari yaratilmadi.",
                );
            }

            const preparedByClientId = new Map(
                analysis.prepared.map((item) => [item.clientId, item]),
            );

            await runWithConcurrency(
                result.items,
                MAX_PARALLEL_UPLOADS,
                async (signedItem) => {
                    const source = preparedByClientId.get(signedItem.clientId);
                    if (!source) {
                        throw new Error("Bulk audio mapping server javobida buzildi.");
                    }

                    const storage = new StorageClient(
                        signedItem.upload.storageUrl,
                        {},
                    );
                    const uploadBytes = new Uint8Array(source.bytes.byteLength);
                    uploadBytes.set(source.bytes);
                    const body = new Blob(
                        [uploadBytes.buffer],
                        { type: signedItem.audio.mimeType },
                    );
                    const { error } = await storage
                        .from(signedItem.upload.bucket)
                        .uploadToSignedUrl(
                            signedItem.upload.path,
                            signedItem.upload.token,
                            body,
                            {
                                cacheControl: "3600",
                                contentType: signedItem.audio.mimeType,
                            },
                        );

                    if (error) {
                        throw new Error(`${source.fileName}: Storage upload xatosi — ${error.message}`);
                    }

                    uploadedObjects.push({
                        questionId: signedItem.questionId,
                        storagePath: signedItem.upload.path,
                    });
                    setProgress((current) => current + 1);
                },
            );

            const updates = result.items.map((item) => ({
                questionId: item.questionId,
                audio: item.audio,
            }));

            targets.forEach((target) => {
                const replacement = updates.find((item) => item.questionId === target.questionId);
                if (
                    replacement &&
                    target.audio?.storagePath &&
                    target.audio.storagePath !== replacement.audio.storagePath
                ) {
                    onQueueStorageRemoval(
                        target.questionId,
                        target.audio.storagePath,
                    );
                }
            });

            onApply(updates);
            setAnalysis(null);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
            setFeedback({
                type: "success",
                message: `${updates.length} ta audio yuklandi va savollarga bog‘landi. Endi “Draftni saqlash”ni bosing.`,
            });
        } catch (error) {
            if (uploadedObjects.length > 0) {
                await cleanupUploaded(draftId, uploadedObjects);
            }

            setFeedback({
                type: "error",
                message: error instanceof Error
                    ? `${error.message} Yuklangan yangi audio fayllar rollback qilindi.`
                    : "Bulk audio yuklashda xatolik yuz berdi.",
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className={styles.importer} aria-labelledby="audio-zip-import-title">
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>AUDIO ZIP BULK IMPORT</span>
                    <h2 id="audio-zip-import-title">Savol izohlarini bitta ZIP bilan yuklash</h2>
                    <p>
                        {explicitStemMode ? (
                            <>
                                <strong>1 SAVOL / MATCHING BLOK = 1 AUDIO.</strong>{" "}Aralash testda audio fayl savolning barcha a/b/c qismlari yoki bitta 33–34–35 matching blokining uchala bandi uchun umumiy ishlatiladi:
                                {" "}
                                <strong>
                                    {targets
                                        .slice(0, 4)
                                        .map((target) =>
                                            formatExpectedZipName(
                                                target.zipFileStem ?? "",
                                            ),
                                        )
                                        .join(", ")}
                                    {targets.length > 4 ? " ..." : ""}
                                </strong>
                                . 33–34–35 matching testida 20 blok bo‘lsa q01.mp3 ... q20.mp3 yuklanadi. Masalan, 40-savol uchun faqat q40.mp3 yuklanadi; q40-a.mp3 va q40-b.mp3 qabul qilinmaydi. q1.mp3 va q01.mp3 bir xil savol sifatida qabul qilinadi.
                            </>
                        ) : (
                            <>
                                Audio nomlari <strong>q01.mp3, q02.mp3 ...</strong> bo‘lsin. Diagnostikada q01–q44 aynan 1–44-savollarga moslanadi; 45-esse uchun audio kutilmaydi.
                            </>
                        )}
                        {" "}
                        ZIP brauzerda ochiladi va fayllar bevosita Supabase Storage’ga yuklanadi.
                    </p>
                </div>
                <div className={styles.badge}>{targets.length || 0} AUDIO</div>
            </div>

            <div className={styles.controls}>
                <label className={styles.fileField}>
                    <span>Audio ZIP</span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed"
                        disabled={busy || disabled || targets.length === 0}
                        onChange={(event) => {
                            void analyze(event.target.files?.[0] ?? null);
                        }}
                    />
                </label>

                <button
                    type="button"
                    className={styles.uploadButton}
                    disabled={busy || disabled || !analysis}
                    onClick={() => {
                        void uploadAll();
                    }}
                >
                    {busy && analysis
                        ? `Yuklanmoqda ${progress}/${analysis.prepared.length}`
                        : analysis
                          ? `${analysis.prepared.length} ta audioni yuklash`
                          : "Avval ZIP’ni tekshiring"}
                </button>
            </div>

            {disabled && disabledReason && (
                <div className={styles.warning} role="status">{disabledReason}</div>
            )}

            {analysis && (
                <div className={styles.analysisCard}>
                    <div className={styles.analysisSummary}>
                        <div>
                            <span>ZIP</span>
                            <strong>{analysis.fileName}</strong>
                        </div>
                        <div>
                            <span>Moslandi</span>
                            <strong>{analysis.prepared.length}/{targets.length}</strong>
                        </div>
                        <div>
                            <span>Umumiy hajm</span>
                            <strong>{formatBytes(analysis.totalBytes)}</strong>
                        </div>
                        <div>
                            <span>Almashtiriladi</span>
                            <strong>{analysis.replacementCount}</strong>
                        </div>
                    </div>

                    <div className={styles.mappingList}>
                        {analysis.prepared.map((item) => (
                            <div className={styles.mappingRow} key={item.questionId}>
                                <span className={styles.ok}>✓</span>
                                <strong>{item.fileName}</strong>
                                <span>→</span>
                                <span>{item.label}</span>
                                <small>{formatBytes(item.sizeBytes)}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {feedback && (
                <div
                    className={
                        feedback.type === "error"
                            ? styles.error
                            : feedback.type === "warning"
                              ? styles.warning
                              : styles.success
                    }
                    role="status"
                    aria-live="polite"
                >
                    {feedback.message}
                </div>
            )}

            <p className={styles.note}>
                MP3, M4A yoki WAV · har audio 25 MB gacha · ZIP 250 MB gacha.
                {" "}
                {explicitStemMode
                    ? "Aralash testda ZIP ichidagi har bir ko‘rsatilgan savol uchun bitta audio bo‘lishi kerak."
                    : "Diagnostika uchun 44 ta audio to‘liq bo‘lishi kerak."}
                {" "}
                Audio yuklangach “Draftni saqlash” majburiy.
            </p>
        </section>
    );
}
