import "server-only";

import {
    inflateRawSync,
} from "node:zlib";

const EOCD_SIGNATURE =
    0x06054b50;
const CENTRAL_FILE_HEADER_SIGNATURE =
    0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE =
    0x04034b50;
const MAX_EOCD_SEARCH_BYTES =
    65557;

export class AdminZipReaderError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminZipReaderError";
    }
}

export interface AdminZipEntry {
    readonly name: string;
    readonly bytes: Uint8Array;
}

interface CentralDirectoryEntry {
    readonly name: string;
    readonly compressionMethod: number;
    readonly compressedSize: number;
    readonly uncompressedSize: number;
    readonly localHeaderOffset: number;
}

function readUInt16LE(
    buffer: Buffer,
    offset: number,
): number {
    if (
        offset < 0 ||
        offset + 2 > buffer.length
    ) {
        throw new AdminZipReaderError(
            "ZIP fayl tuzilmasi shikastlangan.",
        );
    }

    return buffer.readUInt16LE(
        offset,
    );
}

function readUInt32LE(
    buffer: Buffer,
    offset: number,
): number {
    if (
        offset < 0 ||
        offset + 4 > buffer.length
    ) {
        throw new AdminZipReaderError(
            "ZIP fayl tuzilmasi shikastlangan.",
        );
    }

    return buffer.readUInt32LE(
        offset,
    );
}

function findEndOfCentralDirectory(
    buffer: Buffer,
): number {
    if (
        buffer.length < 22
    ) {
        throw new AdminZipReaderError(
            "ZIP fayl juda qisqa yoki noto‘g‘ri.",
        );
    }

    const minimumOffset =
        Math.max(
            0,
            buffer.length -
                MAX_EOCD_SEARCH_BYTES,
        );

    for (
        let offset =
            buffer.length - 22;
        offset >= minimumOffset;
        offset -= 1
    ) {
        if (
            readUInt32LE(
                buffer,
                offset,
            ) ===
            EOCD_SIGNATURE
        ) {
            return offset;
        }
    }

    throw new AdminZipReaderError(
        "ZIP fayl markaziy katalogi topilmadi.",
    );
}

function normalizeEntryName(
    value: string,
): string {
    const normalized =
        value
            .replace(/\\/gu, "/")
            .replace(/^\.\//u, "")
            .replace(/\/{2,}/gu, "/");

    if (
        !normalized ||
        normalized.startsWith("/") ||
        /^[A-Za-z]:\//u.test(
            normalized,
        ) ||
        normalized
            .split("/")
            .some(
                (part) =>
                    part === "..",
            )
    ) {
        throw new AdminZipReaderError(
            "ZIP ichida xavfsiz bo‘lmagan fayl manzili mavjud.",
        );
    }

    return normalized;
}

function readCentralDirectoryEntries({
    buffer,
    maxEntries,
    maxTotalUncompressedBytes,
}: {
    readonly buffer: Buffer;
    readonly maxEntries: number;
    readonly maxTotalUncompressedBytes: number;
}): readonly CentralDirectoryEntry[] {
    const eocdOffset =
        findEndOfCentralDirectory(
            buffer,
        );

    const diskNumber =
        readUInt16LE(
            buffer,
            eocdOffset + 4,
        );
    const centralDirectoryDisk =
        readUInt16LE(
            buffer,
            eocdOffset + 6,
        );
    const entriesOnDisk =
        readUInt16LE(
            buffer,
            eocdOffset + 8,
        );
    const totalEntries =
        readUInt16LE(
            buffer,
            eocdOffset + 10,
        );
    const centralDirectorySize =
        readUInt32LE(
            buffer,
            eocdOffset + 12,
        );
    const centralDirectoryOffset =
        readUInt32LE(
            buffer,
            eocdOffset + 16,
        );

    if (
        diskNumber !== 0 ||
        centralDirectoryDisk !== 0 ||
        entriesOnDisk !== totalEntries
    ) {
        throw new AdminZipReaderError(
            "Ko‘p diskli ZIP fayllar qo‘llab-quvvatlanmaydi.",
        );
    }

    if (
        totalEntries === 0 ||
        totalEntries > maxEntries
    ) {
        throw new AdminZipReaderError(
            `ZIP ichidagi fayllar soni 1–${maxEntries} oralig‘ida bo‘lishi kerak.`,
        );
    }

    if (
        centralDirectoryOffset ===
            0xffffffff ||
        centralDirectorySize ===
            0xffffffff ||
        totalEntries === 0xffff
    ) {
        throw new AdminZipReaderError(
            "ZIP64 format hozircha qo‘llab-quvvatlanmaydi.",
        );
    }

    const centralDirectoryEnd =
        centralDirectoryOffset +
        centralDirectorySize;

    if (
        centralDirectoryOffset < 0 ||
        centralDirectoryEnd >
            buffer.length ||
        centralDirectoryEnd >
            eocdOffset
    ) {
        throw new AdminZipReaderError(
            "ZIP markaziy katalog o‘lchami noto‘g‘ri.",
        );
    }

    const entries:
        CentralDirectoryEntry[] =
        [];
    let offset =
        centralDirectoryOffset;
    let totalUncompressedBytes =
        0;

    for (
        let index = 0;
        index < totalEntries;
        index += 1
    ) {
        if (
            readUInt32LE(
                buffer,
                offset,
            ) !==
            CENTRAL_FILE_HEADER_SIGNATURE
        ) {
            throw new AdminZipReaderError(
                "ZIP markaziy katalog yozuvi noto‘g‘ri.",
            );
        }

        const compressionMethod =
            readUInt16LE(
                buffer,
                offset + 10,
            );
        const compressedSize =
            readUInt32LE(
                buffer,
                offset + 20,
            );
        const uncompressedSize =
            readUInt32LE(
                buffer,
                offset + 24,
            );
        const fileNameLength =
            readUInt16LE(
                buffer,
                offset + 28,
            );
        const extraLength =
            readUInt16LE(
                buffer,
                offset + 30,
            );
        const commentLength =
            readUInt16LE(
                buffer,
                offset + 32,
            );
        const localHeaderOffset =
            readUInt32LE(
                buffer,
                offset + 42,
            );

        if (
            compressedSize ===
                0xffffffff ||
            uncompressedSize ===
                0xffffffff ||
            localHeaderOffset ===
                0xffffffff
        ) {
            throw new AdminZipReaderError(
                "ZIP64 fayl yozuvi qo‘llab-quvvatlanmaydi.",
            );
        }

        const fileNameStart =
            offset + 46;
        const fileNameEnd =
            fileNameStart +
            fileNameLength;
        const nextOffset =
            fileNameEnd +
            extraLength +
            commentLength;

        if (
            fileNameEnd >
                buffer.length ||
            nextOffset >
                centralDirectoryEnd
        ) {
            throw new AdminZipReaderError(
                "ZIP fayl nomi yoki meta qismi shikastlangan.",
            );
        }

        const rawName =
            buffer
                .subarray(
                    fileNameStart,
                    fileNameEnd,
                )
                .toString("utf8");
        const name =
            normalizeEntryName(
                rawName,
            );

        if (
            !name.endsWith("/")
        ) {
            totalUncompressedBytes +=
                uncompressedSize;

            if (
                totalUncompressedBytes >
                maxTotalUncompressedBytes
            ) {
                throw new AdminZipReaderError(
                    "ZIP ochilgandagi umumiy hajm ruxsat etilgan limitdan oshadi.",
                );
            }

            entries.push({
                name,
                compressionMethod,
                compressedSize,
                uncompressedSize,
                localHeaderOffset,
            });
        }

        offset =
            nextOffset;
    }

    return entries;
}

function extractEntry(
    buffer: Buffer,
    entry:
        CentralDirectoryEntry,
): Uint8Array {
    const localHeaderOffset =
        entry.localHeaderOffset;

    if (
        readUInt32LE(
            buffer,
            localHeaderOffset,
        ) !==
        LOCAL_FILE_HEADER_SIGNATURE
    ) {
        throw new AdminZipReaderError(
            `ZIP ichidagi ${entry.name} faylining local header qismi noto‘g‘ri.`,
        );
    }

    const localFileNameLength =
        readUInt16LE(
            buffer,
            localHeaderOffset + 26,
        );
    const localExtraLength =
        readUInt16LE(
            buffer,
            localHeaderOffset + 28,
        );
    const dataStart =
        localHeaderOffset +
        30 +
        localFileNameLength +
        localExtraLength;
    const dataEnd =
        dataStart +
        entry.compressedSize;

    if (
        dataStart < 0 ||
        dataEnd > buffer.length
    ) {
        throw new AdminZipReaderError(
            `ZIP ichidagi ${entry.name} fayl ma’lumoti to‘liq emas.`,
        );
    }

    const compressed =
        buffer.subarray(
            dataStart,
            dataEnd,
        );

    let extracted: Buffer;

    if (
        entry.compressionMethod ===
        0
    ) {
        extracted =
            Buffer.from(
                compressed,
            );
    } else if (
        entry.compressionMethod ===
        8
    ) {
        try {
            extracted =
                inflateRawSync(
                    compressed,
                );
        } catch {
            throw new AdminZipReaderError(
                `ZIP ichidagi ${entry.name} faylini ochib bo‘lmadi.`,
            );
        }
    } else {
        throw new AdminZipReaderError(
            `ZIP siqish usuli qo‘llab-quvvatlanmaydi: ${entry.name}.`,
        );
    }

    if (
        extracted.length !==
        entry.uncompressedSize
    ) {
        throw new AdminZipReaderError(
            `ZIP ichidagi ${entry.name} fayl hajmi kutilgan qiymatga mos emas.`,
        );
    }

    return new Uint8Array(
        extracted,
    );
}

export function readAdminZipEntries({
    bytes,
    maxEntries = 500,
    maxTotalUncompressedBytes =
        100 * 1024 * 1024,
}: {
    readonly bytes: Uint8Array;
    readonly maxEntries?: number;
    readonly maxTotalUncompressedBytes?: number;
}): ReadonlyMap<string, Uint8Array> {
    const buffer =
        Buffer.from(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength,
        );
    const entries =
        readCentralDirectoryEntries({
            buffer,
            maxEntries,
            maxTotalUncompressedBytes,
        });
    const extracted =
        new Map<
            string,
            Uint8Array
        >();

    for (
        const entry of entries
    ) {
        if (
            extracted.has(
                entry.name,
            )
        ) {
            throw new AdminZipReaderError(
                `ZIP ichida takroriy fayl bor: ${entry.name}.`,
            );
        }

        extracted.set(
            entry.name,
            extractEntry(
                buffer,
                entry,
            ),
        );
    }

    return extracted;
}
