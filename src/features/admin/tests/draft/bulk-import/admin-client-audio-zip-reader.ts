"use client";

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const MAX_EOCD_SEARCH_BYTES = 65557;

export const ADMIN_AUDIO_ZIP_MAX_BYTES = 250 * 1024 * 1024;
export const ADMIN_AUDIO_ZIP_MAX_ENTRIES = 120;
export const ADMIN_AUDIO_ZIP_MAX_UNCOMPRESSED_BYTES = 400 * 1024 * 1024;

export class AdminClientAudioZipError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AdminClientAudioZipError";
    }
}

interface CentralDirectoryEntry {
    readonly name: string;
    readonly compressionMethod: number;
    readonly compressedSize: number;
    readonly uncompressedSize: number;
    readonly localHeaderOffset: number;
}

export interface AdminAudioZipEntry {
    readonly name: string;
    readonly baseName: string;
    readonly bytes: Uint8Array;
}

function readUInt16LE(view: DataView, offset: number): number {
    if (offset < 0 || offset + 2 > view.byteLength) {
        throw new AdminClientAudioZipError("ZIP fayl tuzilmasi shikastlangan.");
    }

    return view.getUint16(offset, true);
}

function readUInt32LE(view: DataView, offset: number): number {
    if (offset < 0 || offset + 4 > view.byteLength) {
        throw new AdminClientAudioZipError("ZIP fayl tuzilmasi shikastlangan.");
    }

    return view.getUint32(offset, true);
}

function findEndOfCentralDirectory(view: DataView): number {
    if (view.byteLength < 22) {
        throw new AdminClientAudioZipError("ZIP fayl juda qisqa yoki noto‘g‘ri.");
    }

    const minimumOffset = Math.max(0, view.byteLength - MAX_EOCD_SEARCH_BYTES);

    for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
        if (readUInt32LE(view, offset) === EOCD_SIGNATURE) {
            return offset;
        }
    }

    throw new AdminClientAudioZipError("ZIP markaziy katalogi topilmadi.");
}

function normalizeEntryName(value: string): string {
    const normalized = value
        .replace(/\\/gu, "/")
        .replace(/^\.\//u, "")
        .replace(/\/{2,}/gu, "/");

    if (
        !normalized ||
        normalized.startsWith("/") ||
        /^[A-Za-z]:\//u.test(normalized) ||
        normalized.split("/").some((part) => part === "..")
    ) {
        throw new AdminClientAudioZipError("ZIP ichida xavfsiz bo‘lmagan fayl manzili mavjud.");
    }

    return normalized;
}

function readCentralDirectoryEntries(bytes: Uint8Array): readonly CentralDirectoryEntry[] {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const eocdOffset = findEndOfCentralDirectory(view);
    const diskNumber = readUInt16LE(view, eocdOffset + 4);
    const centralDirectoryDisk = readUInt16LE(view, eocdOffset + 6);
    const entriesOnDisk = readUInt16LE(view, eocdOffset + 8);
    const totalEntries = readUInt16LE(view, eocdOffset + 10);
    const centralDirectorySize = readUInt32LE(view, eocdOffset + 12);
    const centralDirectoryOffset = readUInt32LE(view, eocdOffset + 16);

    if (diskNumber !== 0 || centralDirectoryDisk !== 0 || entriesOnDisk !== totalEntries) {
        throw new AdminClientAudioZipError("Ko‘p diskli ZIP fayllar qo‘llab-quvvatlanmaydi.");
    }

    if (totalEntries === 0 || totalEntries > ADMIN_AUDIO_ZIP_MAX_ENTRIES) {
        throw new AdminClientAudioZipError(
            `ZIP ichidagi fayllar soni 1–${ADMIN_AUDIO_ZIP_MAX_ENTRIES} oralig‘ida bo‘lishi kerak.`,
        );
    }

    if (
        centralDirectoryOffset === 0xffffffff ||
        centralDirectorySize === 0xffffffff ||
        totalEntries === 0xffff
    ) {
        throw new AdminClientAudioZipError("ZIP64 format hozircha qo‘llab-quvvatlanmaydi.");
    }

    const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;

    if (centralDirectoryEnd > bytes.byteLength || centralDirectoryEnd > eocdOffset) {
        throw new AdminClientAudioZipError("ZIP markaziy katalog o‘lchami noto‘g‘ri.");
    }

    const decoder = new TextDecoder("utf-8");
    const entries: CentralDirectoryEntry[] = [];
    let offset = centralDirectoryOffset;
    let totalUncompressedBytes = 0;

    for (let index = 0; index < totalEntries; index += 1) {
        if (readUInt32LE(view, offset) !== CENTRAL_FILE_HEADER_SIGNATURE) {
            throw new AdminClientAudioZipError("ZIP markaziy katalog yozuvi noto‘g‘ri.");
        }

        const compressionMethod = readUInt16LE(view, offset + 10);
        const compressedSize = readUInt32LE(view, offset + 20);
        const uncompressedSize = readUInt32LE(view, offset + 24);
        const fileNameLength = readUInt16LE(view, offset + 28);
        const extraLength = readUInt16LE(view, offset + 30);
        const commentLength = readUInt16LE(view, offset + 32);
        const localHeaderOffset = readUInt32LE(view, offset + 42);
        const fileNameStart = offset + 46;
        const fileNameEnd = fileNameStart + fileNameLength;
        const nextOffset = fileNameEnd + extraLength + commentLength;

        if (fileNameEnd > bytes.byteLength || nextOffset > centralDirectoryEnd) {
            throw new AdminClientAudioZipError("ZIP fayl nomi yoki meta qismi shikastlangan.");
        }

        const name = normalizeEntryName(decoder.decode(bytes.subarray(fileNameStart, fileNameEnd)));
        offset = nextOffset;

        if (name.endsWith("/")) {
            continue;
        }

        if (compressionMethod !== 0 && compressionMethod !== 8) {
            throw new AdminClientAudioZipError(
                `ZIP ichidagi “${name}” fayli qo‘llab-quvvatlanmaydigan siqish usulidan foydalanadi.`,
            );
        }

        totalUncompressedBytes += uncompressedSize;

        if (totalUncompressedBytes > ADMIN_AUDIO_ZIP_MAX_UNCOMPRESSED_BYTES) {
            throw new AdminClientAudioZipError("ZIP ochilgandagi umumiy hajm 400 MB dan oshmasligi kerak.");
        }

        entries.push({
            name,
            compressionMethod,
            compressedSize,
            uncompressedSize,
            localHeaderOffset,
        });
    }

    return entries;
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
    if (typeof DecompressionStream === "undefined") {
        throw new AdminClientAudioZipError(
            "Brauzer ZIP ichidagi siqilgan fayllarni ochishni qo‘llab-quvvatlamaydi. Chrome/Edge’ning yangi versiyasidan foydalaning.",
        );
    }

    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const stream = new Blob([copy.buffer])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
}

async function extractEntry(
    archiveBytes: Uint8Array,
    entry: CentralDirectoryEntry,
): Promise<Uint8Array> {
    const view = new DataView(
        archiveBytes.buffer,
        archiveBytes.byteOffset,
        archiveBytes.byteLength,
    );
    const offset = entry.localHeaderOffset;

    if (readUInt32LE(view, offset) !== LOCAL_FILE_HEADER_SIGNATURE) {
        throw new AdminClientAudioZipError(`“${entry.name}” lokal ZIP yozuvi noto‘g‘ri.`);
    }

    const fileNameLength = readUInt16LE(view, offset + 26);
    const extraLength = readUInt16LE(view, offset + 28);
    const dataStart = offset + 30 + fileNameLength + extraLength;
    const dataEnd = dataStart + entry.compressedSize;

    if (dataEnd > archiveBytes.byteLength) {
        throw new AdminClientAudioZipError(`“${entry.name}” ZIP ma’lumoti to‘liq emas.`);
    }

    const compressedBytes = archiveBytes.subarray(dataStart, dataEnd);
    const extracted = entry.compressionMethod === 0
        ? new Uint8Array(compressedBytes)
        : await inflateRaw(compressedBytes);

    if (extracted.byteLength !== entry.uncompressedSize) {
        throw new AdminClientAudioZipError(`“${entry.name}” fayli to‘liq ochilmadi.`);
    }

    return extracted;
}

function getBaseName(path: string): string {
    return path.split("/").pop() ?? path;
}

function isSupportedAudioName(name: string): boolean {
    return /\.(?:mp3|m4a|wav)$/iu.test(name);
}

export async function readAdminAudioZip(file: File): Promise<readonly AdminAudioZipEntry[]> {
    if (!file.name.toLowerCase().endsWith(".zip")) {
        throw new AdminClientAudioZipError("Faqat .zip audio bundle tanlang.");
    }

    if (file.size <= 0 || file.size > ADMIN_AUDIO_ZIP_MAX_BYTES) {
        throw new AdminClientAudioZipError("Audio ZIP hajmi 250 MB dan oshmasligi kerak.");
    }

    const archiveBytes = new Uint8Array(await file.arrayBuffer());
    const entries = readCentralDirectoryEntries(archiveBytes)
        .filter((entry) => !entry.name.startsWith("__MACOSX/"))
        .filter((entry) => !getBaseName(entry.name).startsWith("."))
        .filter((entry) => isSupportedAudioName(entry.name));

    if (entries.length === 0) {
        throw new AdminClientAudioZipError("ZIP ichidan MP3, M4A yoki WAV audio topilmadi.");
    }

    const result: AdminAudioZipEntry[] = [];

    for (const entry of entries) {
        result.push({
            name: entry.name,
            baseName: getBaseName(entry.name),
            bytes: await extractEntry(archiveBytes, entry),
        });
    }

    return result;
}
