import "server-only";

import type {
    AdminDraftOptionId,
} from "../model/admin-question-types";

export class AdminImageOptionBundleError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminImageOptionBundleError";
    }
}

export interface AdminImageOptionBundleOption {
    readonly id:
        Extract<
            AdminDraftOptionId,
            "A" | "B" | "C" | "D"
        >;
    readonly text: string;
    readonly imageFile: string;
    readonly alt: string;
}

export interface AdminImageOptionBundleQuestion {
    readonly number: number;
    readonly question: string;
    readonly instruction:
        string | null;
    readonly correctOptionId:
        Extract<
            AdminDraftOptionId,
            "A" | "B" | "C" | "D"
        >;
    readonly options:
        readonly AdminImageOptionBundleOption[];
}

export interface AdminImageOptionBundleManifest {
    readonly bundleVersion: 1;
    readonly sourceFile:
        string | null;
    readonly title: string;
    readonly category:
        string | null;
    readonly topic:
        string | null;
    readonly questionType:
        "multiple-choice-image-options";
    readonly questionCount: number;
    readonly optionCount: number;
    readonly questions:
        readonly AdminImageOptionBundleQuestion[];
}

export interface ParsedAdminImageOptionBundle {
    readonly manifest:
        AdminImageOptionBundleManifest;
    readonly manifestPath: string;
    readonly manifestBaseDirectory: string;
}

const EXPECTED_OPTION_IDS = [
    "A",
    "B",
    "C",
    "D",
] as const;

function readObject(
    value: unknown,
    label: string,
): Record<string, unknown> {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        throw new AdminImageOptionBundleError(
            `${label} obyekt ko‘rinishida bo‘lishi kerak.`,
        );
    }

    return value as
        Record<string, unknown>;
}

function readRequiredString(
    value: unknown,
    label: string,
    maxLength = 500,
): string {
    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        throw new AdminImageOptionBundleError(
            `${label} bo‘sh bo‘lmasligi kerak.`,
        );
    }

    const normalized =
        value.trim();

    if (
        normalized.length >
        maxLength
    ) {
        throw new AdminImageOptionBundleError(
            `${label} juda uzun.`,
        );
    }

    return normalized;
}

function readOptionalString(
    value: unknown,
    label: string,
    maxLength = 500,
): string | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    return readRequiredString(
        value,
        label,
        maxLength,
    );
}

function readPositiveInteger(
    value: unknown,
    label: string,
    maximum = 10000,
): number {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value <= 0 ||
        value > maximum
    ) {
        throw new AdminImageOptionBundleError(
            `${label} musbat butun son bo‘lishi kerak.`,
        );
    }

    return value;
}

function normalizeZipRelativePath(
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
                    part === ".." ||
                    part === ""
            )
    ) {
        throw new AdminImageOptionBundleError(
            "Manifest ichidagi imageFile manzili xavfsiz emas.",
        );
    }

    return normalized;
}

function readOptionId(
    value: unknown,
    label: string,
): AdminImageOptionBundleOption["id"] {
    if (
        value === "A" ||
        value === "B" ||
        value === "C" ||
        value === "D"
    ) {
        return value;
    }

    throw new AdminImageOptionBundleError(
        `${label} faqat A, B, C yoki D bo‘lishi mumkin.`,
    );
}

function parseManifest(
    value: unknown,
): AdminImageOptionBundleManifest {
    const root =
        readObject(
            value,
            "manifest.json",
        );

    if (
        root.bundleVersion !== 1
    ) {
        throw new AdminImageOptionBundleError(
            "Faqat bundleVersion = 1 format qo‘llab-quvvatlanadi.",
        );
    }

    if (
        root.questionType !==
        "multiple-choice-image-options"
    ) {
        throw new AdminImageOptionBundleError(
            "Bu ZIP image-option multiple-choice import formatida emas.",
        );
    }

    const title =
        readRequiredString(
            root.title,
            "Bundle nomi",
            200,
        );
    const questionCount =
        readPositiveInteger(
            root.questionCount,
            "questionCount",
            100,
        );
    const optionCount =
        readPositiveInteger(
            root.optionCount,
            "optionCount",
            400,
        );

    if (
        !Array.isArray(
            root.questions,
        )
    ) {
        throw new AdminImageOptionBundleError(
            "manifest.json ichida questions ro‘yxati topilmadi.",
        );
    }

    if (
        root.questions.length !==
        questionCount
    ) {
        throw new AdminImageOptionBundleError(
            "questionCount qiymati questions soniga mos emas.",
        );
    }

    if (
        optionCount !==
        questionCount * 4
    ) {
        throw new AdminImageOptionBundleError(
            "Har bir savolda aynan 4 ta A/B/C/D variant bo‘lishi kerak.",
        );
    }

    const usedQuestionNumbers =
        new Set<number>();

    const questions =
        root.questions.map(
            (
                rawQuestion,
                questionIndex,
            ) => {
                const questionObject =
                    readObject(
                        rawQuestion,
                        `${questionIndex + 1}-savol`,
                    );
                const number =
                    readPositiveInteger(
                        questionObject.number,
                        `${questionIndex + 1}-savol raqami`,
                        100,
                    );

                if (
                    usedQuestionNumbers.has(
                        number,
                    )
                ) {
                    throw new AdminImageOptionBundleError(
                        `${number}-savol raqami manifestda takrorlangan.`,
                    );
                }

                usedQuestionNumbers.add(
                    number,
                );

                if (
                    !Array.isArray(
                        questionObject.options,
                    ) ||
                    questionObject.options.length !==
                        4
                ) {
                    throw new AdminImageOptionBundleError(
                        `${number}-savolda aynan 4 ta variant bo‘lishi kerak.`,
                    );
                }

                const usedOptionIds =
                    new Set<string>();
                const options =
                    questionObject.options.map(
                        (
                            rawOption,
                            optionIndex,
                        ) => {
                            const optionObject =
                                readObject(
                                    rawOption,
                                    `${number}-savol ${EXPECTED_OPTION_IDS[optionIndex] ?? "?"} varianti`,
                                );
                            const id =
                                readOptionId(
                                    optionObject.id,
                                    `${number}-savol variant ID`,
                                );

                            if (
                                usedOptionIds.has(
                                    id,
                                )
                            ) {
                                throw new AdminImageOptionBundleError(
                                    `${number}-savolda ${id} varianti takrorlangan.`,
                                );
                            }

                            usedOptionIds.add(
                                id,
                            );

                            const text =
                                typeof optionObject.text ===
                                    "string"
                                    ? optionObject.text.trim()
                                    : "";
                            const imageFile =
                                normalizeZipRelativePath(
                                    readRequiredString(
                                        optionObject.imageFile,
                                        `${number}-${id} imageFile`,
                                        300,
                                    ),
                                );
                            const alt =
                                readRequiredString(
                                    optionObject.alt,
                                    `${number}-${id} alt`,
                                    300,
                                );

                            return {
                                id,
                                text,
                                imageFile,
                                alt,
                            } satisfies
                                AdminImageOptionBundleOption;
                        },
                    )
                    .sort(
                        (first, second) =>
                            EXPECTED_OPTION_IDS.indexOf(
                                first.id,
                            ) -
                            EXPECTED_OPTION_IDS.indexOf(
                                second.id,
                            ),
                    );

                for (
                    const expectedId
                    of EXPECTED_OPTION_IDS
                ) {
                    if (
                        !usedOptionIds.has(
                            expectedId,
                        )
                    ) {
                        throw new AdminImageOptionBundleError(
                            `${number}-savolda ${expectedId} varianti yo‘q.`,
                        );
                    }
                }

                return {
                    number,
                    question:
                        readRequiredString(
                            questionObject.question,
                            `${number}-savol matni`,
                            2000,
                        ),
                    instruction:
                        readOptionalString(
                            questionObject.instruction,
                            `${number}-savol ko‘rsatmasi`,
                            1000,
                        ),
                    correctOptionId:
                        readOptionId(
                            questionObject.correctOptionId,
                            `${number}-savol to‘g‘ri javobi`,
                        ),
                    options,
                } satisfies
                    AdminImageOptionBundleQuestion;
            },
        )
        .sort(
            (first, second) =>
                first.number -
                second.number,
        );

    return {
        bundleVersion: 1,
        sourceFile:
            readOptionalString(
                root.sourceFile,
                "sourceFile",
                300,
            ),
        title,
        category:
            readOptionalString(
                root.category,
                "category",
                200,
            ),
        topic:
            readOptionalString(
                root.topic,
                "topic",
                200,
            ),
        questionType:
            "multiple-choice-image-options",
        questionCount,
        optionCount,
        questions,
    };
}

function decodeJson(
    bytes: Uint8Array,
): unknown {
    try {
        const text =
            new TextDecoder(
                "utf-8",
                {
                    fatal: true,
                },
            ).decode(
                bytes,
            );

        return JSON.parse(
            text,
        ) as unknown;
    } catch {
        throw new AdminImageOptionBundleError(
            "manifest.json UTF-8 JSON sifatida o‘qilmadi.",
        );
    }
}

export function parseAdminImageOptionBundleManifest(
    entries:
        ReadonlyMap<
            string,
            Uint8Array
        >,
): ParsedAdminImageOptionBundle {
    const manifestCandidates =
        [
            ...entries.keys(),
        ].filter(
            (entryName) =>
                entryName ===
                    "manifest.json" ||
                entryName.endsWith(
                    "/manifest.json",
                ),
        );

    if (
        manifestCandidates.length ===
        0
    ) {
        throw new AdminImageOptionBundleError(
            "ZIP ichida manifest.json topilmadi.",
        );
    }

    if (
        manifestCandidates.length >
        1
    ) {
        throw new AdminImageOptionBundleError(
            "ZIP ichida bir nechta manifest.json topildi.",
        );
    }

    const manifestPath =
        manifestCandidates[0];
    const manifestBytes =
        entries.get(
            manifestPath,
        );

    if (!manifestBytes) {
        throw new AdminImageOptionBundleError(
            "manifest.json faylini o‘qib bo‘lmadi.",
        );
    }

    const lastSlash =
        manifestPath.lastIndexOf(
            "/",
        );
    const manifestBaseDirectory =
        lastSlash >= 0
            ? manifestPath.slice(
                0,
                lastSlash + 1,
            )
            : "";

    return {
        manifest:
            parseManifest(
                decodeJson(
                    manifestBytes,
                ),
            ),
        manifestPath,
        manifestBaseDirectory,
    };
}

export function resolveAdminBundleEntryPath({
    baseDirectory,
    relativePath,
}: {
    readonly baseDirectory: string;
    readonly relativePath: string;
}): string {
    return `${baseDirectory}${normalizeZipRelativePath(
        relativePath,
    )}`;
}
