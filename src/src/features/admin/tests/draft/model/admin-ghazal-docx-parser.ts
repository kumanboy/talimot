import {
    parseStandardMcqDocument,
    splitAdminDocxRawText,
} from "./admin-standard-mcq-parser";
import type {
    AdminGhazalDocxParseResult,
    AdminParsedGhazalCouplet,
    AdminParsedGhazalVocabularyItem,
} from "./admin-ghazal-docx-parser-types";

const metadataPattern =
    /^(?:SARLAVHA|MUALLIF|KO['ʻʼ‘’`´]RSATMA|MANBA)\s*:\s*(.*)$/iu;

const coupletStartPattern =
    /^(?:BAYT\s*)?(\d{1,2})\s*[\.\):\-]\s*(.*)$/iu;

const vocabularyPattern =
    /^(?:(\d{1,2})\s*[\.\):\-]\s*)?(.+?)\s*(?:—|–|-|:)\s*(.+)$/u;

function normalizeHeading(
    value: string,
): string {
    return value
        .trim()
        .toLocaleUpperCase(
            "uz",
        )
        .replace(
            /[‘’ʻʼ`´]/gu,
            "ʻ",
        );
}

function metadataValue(
    lines:
        readonly string[],
    key:
        "SARLAVHA"
        | "MUALLIF"
        | "KOʻRSATMA"
        | "MANBA",
): string | null {
    for (
        const line
        of lines
    ) {
        const match =
            metadataPattern.exec(
                line,
            );

        if (!match) {
            continue;
        }

        const normalizedKey =
            normalizeHeading(
                line.split(
                    ":",
                )[0] ??
                "",
            );

        if (
            normalizedKey ===
            key
        ) {
            return (
                match[1]?.trim() ||
                null
            );
        }
    }

    return null;
}

function findSectionIndex(
    lines:
        readonly string[],
    headings:
        readonly string[],
): number {
    return lines.findIndex(
        (line) =>
            headings.includes(
                normalizeHeading(
                    line,
                ),
            ),
    );
}

function parseCouplets(
    lines:
        readonly string[],
): readonly AdminParsedGhazalCouplet[] {
    const couplets:
        AdminParsedGhazalCouplet[] = [];

    let index = 0;

    while (
        index <
        lines.length
    ) {
        const line =
            lines[index] ??
            "";

        const match =
            coupletStartPattern.exec(
                line,
            );

        if (!match) {
            index += 1;
            continue;
        }

        const order =
            Number(
                match[1],
            );

        const inlineFirst =
            match[2]?.trim() ??
            "";

        const firstLine =
            inlineFirst ||
            lines[index + 1] ||
            "";

        const secondLineIndex =
            inlineFirst
                ? index + 1
                : index + 2;

        const secondLine =
            lines[
                secondLineIndex
            ] ??
            "";

        if (
            Number.isInteger(
                order,
            ) &&
            firstLine &&
            secondLine &&
            !coupletStartPattern.test(
                secondLine,
            )
        ) {
            couplets.push({
                order,
                firstLine,
                secondLine,
            });

            index =
                secondLineIndex +
                1;
            continue;
        }

        index += 1;
    }

    return couplets;
}

function parseVocabulary(
    lines:
        readonly string[],
): readonly AdminParsedGhazalVocabularyItem[] {
    const vocabulary:
        AdminParsedGhazalVocabularyItem[] = [];

    for (
        const line
        of lines
    ) {
        const match =
            vocabularyPattern.exec(
                line,
            );

        if (!match) {
            continue;
        }

        const term =
            match[2]?.trim() ??
            "";

        const meaning =
            match[3]?.trim() ??
            "";

        if (
            !term ||
            !meaning
        ) {
            continue;
        }

        vocabulary.push({
            marker:
                match[1] ??
                null,
            term,
            meaning,
        });
    }

    return vocabulary;
}

export function parseGhazalDocxDocument(
    rawText:
        string,
): AdminGhazalDocxParseResult | null {
    const lines =
        splitAdminDocxRawText(
            rawText,
        );

    const typeIndex =
        lines.findIndex(
            (line) =>
                /^TEST\s+TURI\s*:\s*G['ʻʼ‘’`´]?AZAL$/iu.test(
                    line,
                ),
        );

    const ghazalIndex =
        findSectionIndex(
            lines,
            [
                "GʻAZAL",
                "GAZAL",
                "MATN",
            ],
        );

    if (
        typeIndex < 0 &&
        ghazalIndex < 0
    ) {
        return null;
    }

    const vocabularyIndex =
        findSectionIndex(
            lines,
            [
                "LUGʻAT",
                "LUGAT",
                "LUGʻATLAR",
            ],
        );

    const questionsIndex =
        findSectionIndex(
            lines,
            [
                "SAVOLLAR",
                "TOPSHIRIQLAR",
            ],
        );

    const answersIndex =
        findSectionIndex(
            lines,
            [
                "JAVOBLAR",
                "JAVOBLAR KALITI",
            ],
        );

    const ghazalStart =
        ghazalIndex >=
        0
            ? ghazalIndex +
                1
            : typeIndex +
                1;

    const ghazalEndCandidates =
        [
            vocabularyIndex,
            questionsIndex,
            answersIndex,
        ].filter(
            (value) =>
                value >=
                ghazalStart,
        );

    const ghazalEnd =
        ghazalEndCandidates.length >
        0
            ? Math.min(
                ...ghazalEndCandidates,
            )
            : lines.length;

    const vocabularyStart =
        vocabularyIndex >=
        0
            ? vocabularyIndex +
                1
            : -1;

    const vocabularyEndCandidates =
        [
            questionsIndex,
            answersIndex,
        ].filter(
            (value) =>
                value >=
                vocabularyStart &&
                vocabularyStart >=
                0,
        );

    const vocabularyEnd =
        vocabularyStart >=
        0
            ? (
                vocabularyEndCandidates.length >
                0
                    ? Math.min(
                        ...vocabularyEndCandidates,
                    )
                    : lines.length
            )
            : -1;

    const couplets =
        parseCouplets(
            lines.slice(
                ghazalStart,
                ghazalEnd,
            ),
        );

    const vocabulary =
        vocabularyStart >=
        0
            ? parseVocabulary(
                lines.slice(
                    vocabularyStart,
                    vocabularyEnd,
                ),
            )
            : [];

    const questionSectionStart =
        questionsIndex >=
        0
            ? questionsIndex +
                1
            : -1;

    const questionSectionEnd =
        answersIndex >=
            questionSectionStart &&
        questionSectionStart >=
            0
            ? answersIndex
            : lines.length;

    const answerSection =
        answersIndex >=
        0
            ? lines.slice(
                answersIndex,
            )
            : [];

    const mcqRawText =
        questionSectionStart >=
        0
            ? [
                ...lines.slice(
                    questionSectionStart,
                    questionSectionEnd,
                ),
                ...answerSection,
            ].join(
                "\n",
            )
            : "";

    const mcq =
        parseStandardMcqDocument(
            mcqRawText,
        );

    const issues:
        string[] = [];

    const title =
        metadataValue(
            lines,
            "SARLAVHA",
        );

    const author =
        metadataValue(
            lines,
            "MUALLIF",
        );

    const instruction =
        metadataValue(
            lines,
            "KOʻRSATMA",
        );

    const source =
        metadataValue(
            lines,
            "MANBA",
        );

    if (!title) {
        issues.push(
            "G‘azal sarlavhasi topilmadi.",
        );
    }

    if (!author) {
        issues.push(
            "Muallif topilmadi.",
        );
    }

    if (
        couplets.length ===
        0
    ) {
        issues.push(
            "Baytlar topilmadi.",
        );
    }

    if (
        mcq.questions.length !==
        5
    ) {
        issues.push(
            `5 ta savol kutilgan edi, ${mcq.questions.length} ta topildi.`,
        );
    }

    if (
        mcq.invalidCount >
        0
    ) {
        issues.push(
            `${mcq.invalidCount} ta savolda A–D variantlari to‘liq emas.`,
        );
    }

    if (
        mcq.answerKeyCount <
        mcq.questions.length
    ) {
        issues.push(
            "Barcha savollar uchun javob kaliti topilmadi.",
        );
    }

    let confidenceScore =
        100;

    if (!title) {
        confidenceScore -=
            10;
    }

    if (!author) {
        confidenceScore -=
            12;
    }

    if (
        couplets.length ===
        0
    ) {
        confidenceScore -=
            35;
    }

    if (
        vocabulary.length ===
        0
    ) {
        confidenceScore -=
            7;
    }

    confidenceScore -=
        Math.min(
            25,
            Math.abs(
                5 -
                mcq.questions.length,
            ) *
                5,
        );

    confidenceScore -=
        mcq.invalidCount *
        8;

    confidenceScore -=
        Math.max(
            0,
            mcq.questions.length -
                mcq.answerKeyCount,
        ) *
        3;

    confidenceScore =
        Math.max(
            0,
            confidenceScore,
        );

    const confidence =
        couplets.length ===
            0 ||
        mcq.questions.length ===
            0 ||
        mcq.invalidCount >
            0
            ? "invalid"
            : confidenceScore >=
                90
                ? "high"
                : "review";

    return {
        metadata: {
            title,
            author,
            instruction,
            source,
        },
        couplets,
        vocabulary,
        questions:
            mcq.questions,
        answerKeyCount:
            mcq.answerKeyCount,
        confidence,
        confidenceScore,
        issues,
    };
}
