export const ADMIN_TEST_AUDIO_MAX_BYTES =
    25 * 1024 * 1024;

export const ADMIN_TEST_AUDIO_ACCEPT =
    "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/wav,audio/x-wav,audio/wave,audio/vnd.wave,.mp3,.m4a,.wav";

export const ADMIN_TEST_AUDIO_STORAGE_MIME_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/vnd.wave",
] as const;

export type AdminTestAudioMimeType =
    | "audio/mpeg"
    | "audio/mp4"
    | "audio/wav";

export interface AdminTestAudioInspection {
    readonly mimeType:
        AdminTestAudioMimeType;
    readonly extension:
        "mp3" | "m4a" | "wav";
}

const OWNER_ID_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;

const STORAGE_FILE_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:mp3|m4a|wav)$/i;

export class AdminTestAudioValidationError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminTestAudioValidationError";
    }
}

function hasAscii(
    bytes: Uint8Array,
    value: string,
    offset: number,
): boolean {
    return Array.from(value).every(
        (character, index) =>
            bytes[offset + index] ===
            character.charCodeAt(0),
    );
}

function detectAudioMimeType(
    bytes: Uint8Array,
): AdminTestAudioMimeType | null {
    if (
        bytes.length >= 12 &&
        hasAscii(
            bytes,
            "RIFF",
            0,
        ) &&
        hasAscii(
            bytes,
            "WAVE",
            8,
        )
    ) {
        return "audio/wav";
    }

    if (
        bytes.length >= 12 &&
        hasAscii(
            bytes,
            "ftyp",
            4,
        )
    ) {
        return "audio/mp4";
    }

    if (
        bytes.length >= 3 &&
        hasAscii(
            bytes,
            "ID3",
            0,
        )
    ) {
        return "audio/mpeg";
    }

    if (
        bytes.length >= 2 &&
        bytes[0] === 0xff &&
        (bytes[1] & 0xe0) === 0xe0
    ) {
        return "audio/mpeg";
    }

    return null;
}

function tryNormalizeAdminTestAudioMimeType(
    value: string,
): AdminTestAudioMimeType | null {
    const normalized =
        value.trim().toLowerCase();

    if (!normalized) {
        return null;
    }

    if (
        normalized === "audio/mpeg" ||
        normalized === "audio/mp3"
    ) {
        return "audio/mpeg";
    }

    if (
        normalized === "audio/mp4" ||
        normalized === "audio/x-m4a" ||
        normalized === "audio/m4a"
    ) {
        return "audio/mp4";
    }

    if (
        normalized === "audio/wav" ||
        normalized === "audio/x-wav" ||
        normalized === "audio/wave" ||
        normalized === "audio/vnd.wave"
    ) {
        return "audio/wav";
    }

    if (
        normalized === "application/octet-stream" ||
        normalized === "binary/octet-stream"
    ) {
        return null;
    }

    return null;
}

function getMimeTypeFromFileName(
    fileName: string,
): AdminTestAudioMimeType | null {
    const normalized =
        fileName.trim().toLowerCase();

    if (normalized.endsWith(".mp3")) {
        return "audio/mpeg";
    }

    if (normalized.endsWith(".m4a")) {
        return "audio/mp4";
    }

    if (normalized.endsWith(".wav")) {
        return "audio/wav";
    }

    return null;
}

export function normalizeAdminTestAudioMimeType(
    value: string,
): AdminTestAudioMimeType {
    const normalized =
        tryNormalizeAdminTestAudioMimeType(
            value,
        );

    if (normalized) {
        return normalized;
    }

    throw new AdminTestAudioValidationError(
        "Faqat MP3, M4A yoki WAV audio yuklash mumkin.",
    );
}

export function validateAdminTestAudioSize(
    sizeBytes: number,
): number {
    if (
        !Number.isInteger(sizeBytes) ||
        sizeBytes <= 0 ||
        sizeBytes >
            ADMIN_TEST_AUDIO_MAX_BYTES
    ) {
        throw new AdminTestAudioValidationError(
            "Audio hajmi 0 dan katta va 25 MB dan oshmagan bo‘lishi kerak.",
        );
    }

    return sizeBytes;
}

export function normalizeAdminTestAudioDuration(
    value: unknown,
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const numeric =
        typeof value === "number"
            ? value
            : Number(value);

    if (
        !Number.isFinite(numeric) ||
        numeric < 0 ||
        numeric > 6 * 60 * 60
    ) {
        throw new AdminTestAudioValidationError(
            "Audio davomiyligi noto‘g‘ri yuborildi.",
        );
    }

    return Math.round(
        numeric * 10,
    ) / 10;
}

export function getAdminTestAudioExtension(
    mimeType: AdminTestAudioMimeType,
): AdminTestAudioInspection["extension"] {
    if (mimeType === "audio/mpeg") {
        return "mp3";
    }

    if (mimeType === "audio/mp4") {
        return "m4a";
    }

    return "wav";
}

export function inspectAdminTestAudio(
    bytes: Uint8Array,
    declaredMimeType: string,
    fileName = "",
): AdminTestAudioInspection {
    const detected =
        detectAudioMimeType(
            bytes,
        );
    const declared =
        tryNormalizeAdminTestAudioMimeType(
            declaredMimeType,
        );
    const fromFileName =
        getMimeTypeFromFileName(
            fileName,
        );

    if (detected) {
        if (
            declared &&
            detected !== declared
        ) {
            throw new AdminTestAudioValidationError(
                "Audio fayl tarkibi tanlangan MIME turiga mos emas.",
            );
        }

        if (
            fromFileName &&
            detected !== fromFileName
        ) {
            throw new AdminTestAudioValidationError(
                "Audio fayl tarkibi fayl kengaytmasiga mos emas.",
            );
        }

        return {
            mimeType:
                detected,
            extension:
                getAdminTestAudioExtension(
                    detected,
                ),
        };
    }

    if (
        declared &&
        fromFileName &&
        declared !== fromFileName
    ) {
        throw new AdminTestAudioValidationError(
            "Audio MIME turi fayl kengaytmasiga mos emas.",
        );
    }

    const fallback =
        declared ??
        fromFileName;

    if (!fallback) {
        throw new AdminTestAudioValidationError(
            "Audio fayl formati aniqlanmadi. MP3, M4A yoki WAV fayl tanlang.",
        );
    }

    return {
        mimeType:
            fallback,
        extension:
            getAdminTestAudioExtension(
                fallback,
            ),
    };
}

export function assertAdminTestAudioOwnerId(
    value: string,
    label: string,
): void {
    if (!OWNER_ID_PATTERN.test(value)) {
        throw new AdminTestAudioValidationError(
            `${label} noto‘g‘ri yuborildi.`,
        );
    }
}

export function sanitizeAdminTestAudioFileName(
    originalName: string,
    fallbackExtension:
        AdminTestAudioInspection["extension"],
): string {
    const lastSegment =
        originalName
            .split(/[\\/]/)
            .pop()
            ?.replace(/[\u0000-\u001f\u007f]/g, "")
            .trim()
            .slice(0, 180);

    return lastSegment ||
        `audio.${fallbackExtension}`;
}

export function createAdminTestAudioStoragePath({
    draftId,
    questionId,
    fileId,
    extension,
}: {
    readonly draftId: string;
    readonly questionId: string;
    readonly fileId: string;
    readonly extension:
        AdminTestAudioInspection["extension"];
}): string {
    assertAdminTestAudioOwnerId(
        draftId,
        "Draft ID",
    );
    assertAdminTestAudioOwnerId(
        questionId,
        "Savol ID",
    );

    if (
        !STORAGE_FILE_PATTERN.test(
            `${fileId}.${extension}`,
        )
    ) {
        throw new AdminTestAudioValidationError(
            "Audio fayl ID noto‘g‘ri.",
        );
    }

    return `drafts/${draftId}/${questionId}/audio/${fileId}.${extension}`;
}

export function isAdminTestAudioStoragePath(
    storagePath: string,
    owner?: {
        readonly draftId?: string;
        readonly questionId?: string;
    },
): boolean {
    const parts =
        storagePath.split("/");

    if (
        parts.length !== 5 ||
        parts[0] !== "drafts" ||
        parts[3] !== "audio" ||
        !OWNER_ID_PATTERN.test(
            parts[1] ?? "",
        ) ||
        !OWNER_ID_PATTERN.test(
            parts[2] ?? "",
        ) ||
        !STORAGE_FILE_PATTERN.test(
            parts[4] ?? "",
        )
    ) {
        return false;
    }

    if (
        owner?.draftId &&
        parts[1] !== owner.draftId
    ) {
        return false;
    }

    if (
        owner?.questionId &&
        parts[2] !== owner.questionId
    ) {
        return false;
    }

    return true;
}
