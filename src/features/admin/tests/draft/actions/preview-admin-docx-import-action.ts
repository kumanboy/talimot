"use server";

import {
    redirect,
} from "next/navigation";
import * as mammoth from "mammoth";

import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import type {
    AdminDocxImportPreviewActionState,
    AdminDocxPreviewBlock,
    AdminDocxPreviewBlockKind,
} from "@/features/admin/tests/draft/model/admin-docx-import-preview-action-state";
import {
    parseStandardMcqDocument,
} from "@/features/admin/tests/draft/model/admin-standard-mcq-parser";
import {
    parsePassageDocxDocument,
} from "@/features/admin/tests/draft/model/admin-passage-docx-parser";
import {
    parseGhazalDocxDocument,
} from "@/features/admin/tests/draft/model/admin-ghazal-docx-parser";
import {
    parseLiteraryWorksDocxDocument,
} from "@/features/admin/tests/draft/model/admin-literary-works-docx-parser";
import {
    parseMixedDocxDocument,
} from "@/features/admin/tests/draft/model/admin-mixed-docx-parser";
import {
    parseDiagnosticDocxDocument,
} from "@/features/admin/tests/draft/model/admin-diagnostic-docx-parser";

const maximumDocxBytes =
    10 * 1024 * 1024;

const maximumPreviewBlocks =
    250;

const maximumRawPreviewCharacters =
    12_000;

const docxMimeTypes =
    new Set([
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
        "",
    ]);

const parserTargets =
    new Set([
        "auto",
        "standard",
        "literary-works",
        "scientific-text",
        "literary-text",
        "ghazal",
        "mixed",
        "diagnostic",
    ]);

function decodeHtmlEntities(
    value: string,
): string {
    const namedEntities:
        Readonly<Record<string, string>> = {
            amp:
                "&",
            lt:
                "<",
            gt:
                ">",
            quot:
                '"',
            apos:
                "'",
            nbsp:
                " ",
        };

    return value.replace(
        /&(#x?[0-9a-f]+|[a-z]+);/gi,
        (
            match,
            entity:
                string,
        ) => {
            if (
                entity.startsWith(
                    "#x",
                )
            ) {
                const code =
                    Number.parseInt(
                        entity.slice(
                            2,
                        ),
                        16,
                    );

                return Number.isFinite(
                    code,
                )
                    ? String.fromCodePoint(
                        code,
                    )
                    : match;
            }

            if (
                entity.startsWith(
                    "#",
                )
            ) {
                const code =
                    Number.parseInt(
                        entity.slice(
                            1,
                        ),
                        10,
                    );

                return Number.isFinite(
                    code,
                )
                    ? String.fromCodePoint(
                        code,
                    )
                    : match;
            }

            return (
                namedEntities[
                    entity.toLowerCase()
                ] ??
                match
            );
        },
    );
}

function htmlFragmentToText(
    html:
        string,
): string {
    return decodeHtmlEntities(
        html
            .replace(
                /<br\s*\/?>/gi,
                "\n",
            )
            .replace(
                /<\/(?:p|div|li|td|th)>/gi,
                " ",
            )
            .replace(
                /<[^>]+>/g,
                "",
            )
            .replace(
                /\s+/g,
                " ",
            )
            .trim(),
    );
}

function blockKindFromTag(
    tag: string,
): AdminDocxPreviewBlockKind {
    if (
        /^h[1-6]$/i.test(
            tag,
        )
    ) {
        return "heading";
    }

    if (
        tag.toLowerCase() ===
        "li"
    ) {
        return "list-item";
    }

    if (
        tag.toLowerCase() ===
        "tr"
    ) {
        return "table-row";
    }

    return "paragraph";
}

function extractPreviewBlocks(
    html:
        string,
): readonly AdminDocxPreviewBlock[] {
    const blocks:
        AdminDocxPreviewBlock[] = [];

    const blockPattern =
        /<(h[1-6]|p|li|tr)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

    let match:
        RegExpExecArray | null;

    while (
        (
            match =
                blockPattern.exec(
                    html,
                )
        ) !== null &&
        blocks.length <
            maximumPreviewBlocks
    ) {
        const tag =
            match[1];

        const content =
            match[2];

        if (
            !tag ||
            content ===
                undefined
        ) {
            continue;
        }

        const text =
            htmlFragmentToText(
                content,
            );

        if (!text) {
            continue;
        }

        blocks.push({
            id:
                `docx-block-${blocks.length + 1}`,
            kind:
                blockKindFromTag(
                    tag,
                ),
            text,
        });
    }

    return blocks;
}

function countQuestionStarts(
    blocks:
        readonly AdminDocxPreviewBlock[],
): number {
    return blocks.filter(
        (block) =>
            /^(?:savol\s*)?\d{1,3}\s*[\.\):-]\s+\S/i.test(
                block.text,
            ),
    ).length;
}

export async function previewAdminDocxImportAction(
    _previousState:
        AdminDocxImportPreviewActionState,
    formData:
        FormData,
): Promise<AdminDocxImportPreviewActionState> {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    const input =
        formData.get(
            "docxFile",
        );

    const rawParserTarget =
        formData.get(
            "parserTarget",
        );

    const parserTarget =
        typeof rawParserTarget ===
            "string" &&
        parserTargets.has(
            rawParserTarget,
        )
            ? rawParserTarget
            : "auto";

    const rawDiagnosticSectionTarget =
        formData.get(
            "diagnosticSectionTarget",
        );

    const diagnosticSectionTarget =
        typeof rawDiagnosticSectionTarget ===
        "string"
            ? rawDiagnosticSectionTarget
            : null;

    if (
        !(input instanceof File)
    ) {
        return {
            ..._previousState,
            status:
                "error",
            message:
                "DOCX fayl tanlanmagan.",
        };
    }

    const fileName =
        input.name.trim();

    if (
        !fileName
            .toLowerCase()
            .endsWith(
                ".docx",
            ) ||
        !docxMimeTypes.has(
            input.type,
        )
    ) {
        return {
            ..._previousState,
            status:
                "error",
            message:
                "Faqat .docx formatidagi Microsoft Word faylini yuklang.",
            fileName:
                fileName ||
                null,
            fileSizeBytes:
                input.size,
        };
    }

    if (
        input.size <= 0 ||
        input.size >
            maximumDocxBytes
    ) {
        return {
            ..._previousState,
            status:
                "error",
            message:
                "DOCX fayl hajmi 10 MB dan oshmasligi kerak.",
            fileName,
            fileSizeBytes:
                input.size,
        };
    }

    try {
        const buffer =
            Buffer.from(
                await input.arrayBuffer(),
            );

        const [
            htmlResult,
            rawTextResult,
        ] =
            await Promise.all([
                mammoth.convertToHtml({
                    buffer,
                }),
                mammoth.extractRawText({
                    buffer,
                }),
            ]);

        const warnings = [
            ...htmlResult.messages,
            ...rawTextResult.messages,
        ].map(
            (
                item,
                index,
            ) =>
                `${index + 1}. ${item.message}`,
        );

        let blocks =
            extractPreviewBlocks(
                htmlResult.value,
            );

        if (
            blocks.length ===
            0
        ) {
            blocks =
                rawTextResult.value
                    .split(
                        /\n{2,}/,
                    )
                    .map(
                        (text) =>
                            text.trim(),
                    )
                    .filter(
                        Boolean,
                    )
                    .slice(
                        0,
                        maximumPreviewBlocks,
                    )
                    .map(
                        (
                            text,
                            index,
                        ) => ({
                            id:
                                `docx-block-${index + 1}`,
                            kind:
                                "paragraph" as const,
                            text,
                        }),
                    );
        }

        const headingCount =
            blocks.filter(
                (block) =>
                    block.kind ===
                    "heading",
            ).length;

        const paragraphCount =
            blocks.filter(
                (block) =>
                    block.kind ===
                    "paragraph",
            ).length;

        const listItemCount =
            blocks.filter(
                (block) =>
                    block.kind ===
                    "list-item",
            ).length;

        const tableRowCount =
            blocks.filter(
                (block) =>
                    block.kind ===
                    "table-row",
            ).length;

        let parsedDiagnostic:
            ReturnType<
                typeof parseDiagnosticDocxDocument
            > = null;

        let parsedMixed:
            ReturnType<
                typeof parseMixedDocxDocument
            > = null;

        let parsedLiteraryWorks:
            ReturnType<
                typeof parseLiteraryWorksDocxDocument
            > = null;

        let parsedGhazal:
            ReturnType<
                typeof parseGhazalDocxDocument
            > = null;

        let parsedPassage:
            ReturnType<
                typeof parsePassageDocxDocument
            > = null;

        let parsedMcq:
            ReturnType<
                typeof parseStandardMcqDocument
            > | null = null;

        const rawText =
            rawTextResult.value;

        if (
            diagnosticSectionTarget ===
                "multiple-choice" ||
            diagnosticSectionTarget ===
                "essay"
        ) {
            parsedDiagnostic =
                parseDiagnosticDocxDocument(
                    rawText,
                );
        } else if (
            diagnosticSectionTarget ===
                "scientific-text" ||
            diagnosticSectionTarget ===
                "literary-text"
        ) {
            parsedPassage =
                parsePassageDocxDocument(
                    rawText,
                );
        } else if (
            diagnosticSectionTarget ===
            "ghazal"
        ) {
            parsedGhazal =
                parseGhazalDocxDocument(
                    rawText,
                );
        } else if (
            diagnosticSectionTarget ===
            "structured"
        ) {
            parsedMixed =
                parseMixedDocxDocument(
                    rawText,
                );
        } else if (
            parserTarget ===
            "diagnostic"
        ) {
            parsedDiagnostic =
                parseDiagnosticDocxDocument(
                    rawText,
                );
        } else if (
            parserTarget ===
            "mixed"
        ) {
            parsedMixed =
                parseMixedDocxDocument(
                    rawText,
                );
        } else if (
            parserTarget ===
            "literary-works"
        ) {
            parsedLiteraryWorks =
                parseLiteraryWorksDocxDocument(
                    rawText,
                );
        } else if (
            parserTarget ===
            "ghazal"
        ) {
            parsedGhazal =
                parseGhazalDocxDocument(
                    rawText,
                );
        } else if (
            parserTarget ===
                "scientific-text" ||
            parserTarget ===
                "literary-text"
        ) {
            parsedPassage =
                parsePassageDocxDocument(
                    rawText,
                );

            if (
                parsedPassage &&
                parsedPassage.metadata.topic !==
                    parserTarget
            ) {
                parsedPassage =
                    null;
            }
        } else if (
            parserTarget ===
            "standard"
        ) {
            parsedMcq =
                parseStandardMcqDocument(
                    rawText,
                );
        } else {
            parsedDiagnostic =
                parseDiagnosticDocxDocument(
                    rawText,
                );

            parsedMixed =
                parsedDiagnostic
                    ? null
                    : parseMixedDocxDocument(
                        rawText,
                    );

            parsedLiteraryWorks =
                parsedDiagnostic ||
                parsedMixed
                    ? null
                    : parseLiteraryWorksDocxDocument(
                        rawText,
                    );

            parsedGhazal =
                parsedLiteraryWorks
                    ? null
                    : parseGhazalDocxDocument(
                        rawText,
                    );

            parsedPassage =
                parsedLiteraryWorks ||
                parsedGhazal
                    ? null
                    : parsePassageDocxDocument(
                        rawText,
                    );

            parsedMcq =
                parsedDiagnostic ||
                parsedMixed ||
                parsedLiteraryWorks ||
                parsedGhazal ||
                parsedPassage
                    ? null
                    : parseStandardMcqDocument(
                        rawText,
                    );
        }

        return {
            status:
                "success",
            message:
                "DOCX muvaffaqiyatli o‘qildi. Hozircha faqat xavfsiz preview ko‘rsatilmoqda.",
            fileName,
            fileSizeBytes:
                input.size,
            summary: {
                blockCount:
                    blocks.length,
                headingCount,
                paragraphCount,
                listItemCount,
                tableRowCount,
                detectedQuestionStarts:
                    countQuestionStarts(
                        blocks,
                    ),
                warningCount:
                    warnings.length,
            },
            blocks,
            rawTextPreview:
                rawTextResult.value
                    .slice(
                        0,
                        maximumRawPreviewCharacters,
                    )
                    .trim(),
            warnings,
            parsedDiagnostic,
            parsedMixed,
            parsedMcq,
            parsedPassage,
            parsedGhazal,
            parsedLiteraryWorks,
        };
    } catch (error) {
        console.error(
            "DOCX preview failed",
            error,
        );

        return {
            status:
                "error",
            message:
                "DOCX faylni o‘qib bo‘lmadi. Fayl buzilmaganini va haqiqiy Word hujjati ekanini tekshiring.",
            fileName,
            fileSizeBytes:
                input.size,
            summary:
                null,
            blocks:
                [],
            rawTextPreview:
                "",
            warnings:
                [],
            parsedDiagnostic:
                null,
            parsedMixed:
                null,
            parsedMcq:
                null,
            parsedPassage:
                null,
            parsedGhazal:
                null,
            parsedLiteraryWorks:
                null,
        };
    }
}
