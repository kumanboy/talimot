export const ADMIN_TEST_IMAGE_MAX_BYTES =
    5 * 1024 * 1024;

export const ADMIN_TEST_IMAGE_ACCEPT =
    "image/jpeg,image/png,image/webp";

export type AdminTestImageMimeType =
    | "image/jpeg"
    | "image/png"
    | "image/webp";

export interface AdminTestImageInspection {
    readonly mimeType:
        AdminTestImageMimeType;
    readonly extension:
        "jpg" | "png" | "webp";
    readonly width:
        number | null;
    readonly height:
        number | null;
}

const MIME_EXTENSIONS:
    Record<
        AdminTestImageMimeType,
        AdminTestImageInspection["extension"]
    > = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };

const OWNER_ID_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;

const STORAGE_FILE_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i;

export class AdminTestImageValidationError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminTestImageValidationError";
    }
}

export function normalizeAdminTestImageMimeType(
    value: string,
): AdminTestImageMimeType {
    if (
        value !== "image/jpeg" &&
        value !== "image/png" &&
        value !== "image/webp"
    ) {
        throw new AdminTestImageValidationError(
            "Faqat JPEG, PNG yoki WebP rasm yuklash mumkin.",
        );
    }

    return value;
}

export function validateAdminTestImageSize(
    sizeBytes: number,
): number {
    if (
        !Number.isInteger(sizeBytes) ||
        sizeBytes <= 0 ||
        sizeBytes >
            ADMIN_TEST_IMAGE_MAX_BYTES
    ) {
        throw new AdminTestImageValidationError(
            "Rasm hajmi 0 dan katta va 5 MB dan oshmagan bo‘lishi kerak.",
        );
    }

    return sizeBytes;
}

export function normalizeAdminTestImageDimension(
    value: unknown,
): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value <= 0 ||
        value > 100000
    ) {
        throw new AdminTestImageValidationError(
            "Rasm o‘lchami noto‘g‘ri yuborildi.",
        );
    }

    return value;
}

export function getAdminTestImageExtension(
    mimeType: AdminTestImageMimeType,
): AdminTestImageInspection["extension"] {
    return MIME_EXTENSIONS[mimeType];
}

export function assertAdminTestImageOwnerId(
    value: string,
    label: string,
): void {
    if (!OWNER_ID_PATTERN.test(value)) {
        throw new AdminTestImageValidationError(
            `${label} noto‘g‘ri yuborildi.`,
        );
    }
}

export function normalizeAdminTestImageAlt(
    value: string,
): string {
    const normalized =
        value.trim();

    if (!normalized) {
        throw new AdminTestImageValidationError(
            "Rasm uchun alt matn kiritilishi kerak.",
        );
    }

    if (normalized.length > 300) {
        throw new AdminTestImageValidationError(
            "Rasm alt matni 300 belgidan oshmasligi kerak.",
        );
    }

    return normalized;
}

export function normalizeAdminTestImageCaption(
    value: string,
): string | null {
    const normalized =
        value.trim();

    if (!normalized) {
        return null;
    }

    if (normalized.length > 500) {
        throw new AdminTestImageValidationError(
            "Rasm izohi 500 belgidan oshmasligi kerak.",
        );
    }

    return normalized;
}

export function sanitizeAdminTestImageFileName(
    originalName: string,
    fallbackExtension:
        AdminTestImageInspection["extension"],
): string {
    const lastSegment =
        originalName
            .split(/[\\/]/)
            .pop()
            ?.replace(/[\u0000-\u001f\u007f]/g, "")
            .trim()
            .slice(0, 180);

    return lastSegment ||
        `image.${fallbackExtension}`;
}

function hasBytes(
    bytes: Uint8Array,
    values:
        readonly number[],
    offset = 0,
): boolean {
    return values.every(
        (value, index) =>
            bytes[offset + index] ===
            value,
    );
}

function detectMimeType(
    bytes: Uint8Array,
): AdminTestImageMimeType | null {
    if (
        bytes.length >= 8 &&
        hasBytes(
            bytes,
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
        )
    ) {
        return "image/png";
    }

    if (
        bytes.length >= 3 &&
        hasBytes(
            bytes,
            [0xff, 0xd8, 0xff],
        )
    ) {
        return "image/jpeg";
    }

    if (
        bytes.length >= 12 &&
        hasBytes(
            bytes,
            [0x52, 0x49, 0x46, 0x46],
        ) &&
        hasBytes(
            bytes,
            [0x57, 0x45, 0x42, 0x50],
            8,
        )
    ) {
        return "image/webp";
    }

    return null;
}

function readUint32BigEndian(
    bytes: Uint8Array,
    offset: number,
): number {
    return (
        bytes[offset] * 0x1000000 +
        bytes[offset + 1] * 0x10000 +
        bytes[offset + 2] * 0x100 +
        bytes[offset + 3]
    );
}

function readUint24LittleEndian(
    bytes: Uint8Array,
    offset: number,
): number {
    return (
        bytes[offset] +
        bytes[offset + 1] * 0x100 +
        bytes[offset + 2] * 0x10000
    );
}

function readUint16BigEndian(
    bytes: Uint8Array,
    offset: number,
): number {
    return (
        bytes[offset] * 0x100 +
        bytes[offset + 1]
    );
}

function readUint16LittleEndian(
    bytes: Uint8Array,
    offset: number,
): number {
    return (
        bytes[offset] +
        bytes[offset + 1] * 0x100
    );
}

function readPngDimensions(
    bytes: Uint8Array,
): readonly [number, number] | null {
    if (bytes.length < 24) {
        return null;
    }

    const width =
        readUint32BigEndian(
            bytes,
            16,
        );
    const height =
        readUint32BigEndian(
            bytes,
            20,
        );

    return width > 0 && height > 0
        ? [width, height]
        : null;
}

const JPEG_START_OF_FRAME_MARKERS =
    new Set([
        0xc0,
        0xc1,
        0xc2,
        0xc3,
        0xc5,
        0xc6,
        0xc7,
        0xc9,
        0xca,
        0xcb,
        0xcd,
        0xce,
        0xcf,
    ]);

function readJpegDimensions(
    bytes: Uint8Array,
): readonly [number, number] | null {
    let offset = 2;

    while (offset + 8 < bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        while (
            offset < bytes.length &&
            bytes[offset] === 0xff
        ) {
            offset += 1;
        }

        if (offset >= bytes.length) {
            break;
        }

        const marker =
            bytes[offset];
        offset += 1;

        if (
            marker === 0xd8 ||
            marker === 0xd9 ||
            marker === 0x01 ||
            (
                marker >= 0xd0 &&
                marker <= 0xd7
            )
        ) {
            continue;
        }

        if (offset + 1 >= bytes.length) {
            break;
        }

        const segmentLength =
            readUint16BigEndian(
                bytes,
                offset,
            );

        if (
            segmentLength < 2 ||
            offset + segmentLength >
                bytes.length
        ) {
            break;
        }

        if (
            JPEG_START_OF_FRAME_MARKERS
                .has(marker) &&
            segmentLength >= 7
        ) {
            const height =
                readUint16BigEndian(
                    bytes,
                    offset + 3,
                );
            const width =
                readUint16BigEndian(
                    bytes,
                    offset + 5,
                );

            return width > 0 && height > 0
                ? [width, height]
                : null;
        }

        offset += segmentLength;
    }

    return null;
}

function readWebpDimensions(
    bytes: Uint8Array,
): readonly [number, number] | null {
    if (bytes.length < 30) {
        return null;
    }

    const chunkType =
        String.fromCharCode(
            bytes[12],
            bytes[13],
            bytes[14],
            bytes[15],
        );

    if (chunkType === "VP8X") {
        const width =
            readUint24LittleEndian(
                bytes,
                24,
            ) + 1;
        const height =
            readUint24LittleEndian(
                bytes,
                27,
            ) + 1;

        return [width, height];
    }

    if (
        chunkType === "VP8L" &&
        bytes[20] === 0x2f
    ) {
        const b1 = bytes[21];
        const b2 = bytes[22];
        const b3 = bytes[23];
        const b4 = bytes[24];

        const width =
            1 +
            (
                ((b2 & 0x3f) << 8) |
                b1
            );
        const height =
            1 +
            (
                ((b4 & 0x0f) << 10) |
                (b3 << 2) |
                ((b2 & 0xc0) >> 6)
            );

        return [width, height];
    }

    if (
        chunkType === "VP8 " &&
        hasBytes(
            bytes,
            [0x9d, 0x01, 0x2a],
            23,
        )
    ) {
        const width =
            readUint16LittleEndian(
                bytes,
                26,
            ) & 0x3fff;
        const height =
            readUint16LittleEndian(
                bytes,
                28,
            ) & 0x3fff;

        return width > 0 && height > 0
            ? [width, height]
            : null;
    }

    return null;
}

export function inspectAdminTestImage(
    bytes: Uint8Array,
    declaredMimeType: string,
): AdminTestImageInspection {
    validateAdminTestImageSize(
        bytes.length,
    );

    const detectedMimeType =
        detectMimeType(bytes);

    if (!detectedMimeType) {
        throw new AdminTestImageValidationError(
            "Faqat JPEG, PNG yoki WebP rasm yuklash mumkin.",
        );
    }

    if (declaredMimeType) {
        const normalizedDeclaredMimeType =
            normalizeAdminTestImageMimeType(
                declaredMimeType,
            );

        if (
            normalizedDeclaredMimeType !==
            detectedMimeType
        ) {
            throw new AdminTestImageValidationError(
                "Rasm MIME turi fayl tarkibiga mos kelmaydi.",
            );
        }
    }

    const dimensions =
        detectedMimeType === "image/png"
            ? readPngDimensions(bytes)
            : detectedMimeType ===
                "image/jpeg"
                ? readJpegDimensions(bytes)
                : readWebpDimensions(bytes);

    return {
        mimeType:
            detectedMimeType,
        extension:
            MIME_EXTENSIONS[
                detectedMimeType
            ],
        width:
            dimensions?.[0] ?? null,
        height:
            dimensions?.[1] ?? null,
    };
}

export function createAdminTestImageStoragePath({
    draftId,
    questionId,
    fileId,
    extension,
}: {
    readonly draftId: string;
    readonly questionId: string;
    readonly fileId: string;
    readonly extension:
        AdminTestImageInspection["extension"];
}): string {
    assertAdminTestImageOwnerId(
        draftId,
        "Draft ID",
    );
    assertAdminTestImageOwnerId(
        questionId,
        "Savol ID",
    );

    if (!STORAGE_FILE_PATTERN.test(
        `${fileId}.${extension}`,
    )) {
        throw new AdminTestImageValidationError(
            "Rasm fayl ID qiymati noto‘g‘ri.",
        );
    }

    return `drafts/${draftId}/${questionId}/${fileId}.${extension}`;
}

export function isAdminTestImageStoragePath(
    storagePath: string,
    expected?: {
        readonly draftId?: string;
        readonly questionId?: string;
    },
): boolean {
    const segments =
        storagePath.split("/");

    if (
        segments.length !== 4 ||
        segments[0] !== "drafts" ||
        !OWNER_ID_PATTERN.test(
            segments[1],
        ) ||
        !OWNER_ID_PATTERN.test(
            segments[2],
        ) ||
        !STORAGE_FILE_PATTERN.test(
            segments[3],
        )
    ) {
        return false;
    }

    if (
        expected?.draftId &&
        segments[1] !==
            expected.draftId
    ) {
        return false;
    }

    if (
        expected?.questionId &&
        segments[2] !==
            expected.questionId
    ) {
        return false;
    }

    return true;
}
