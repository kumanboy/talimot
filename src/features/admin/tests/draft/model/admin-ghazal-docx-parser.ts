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


function splitRawParagraphs(
    rawText: string,
): readonly string[] {
    return rawText
        .replace(/\r\n?/gu, "\n")
        .split(/\n{2,}/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function parseCompactFiveQuestionGhazal(
    rawText: string,
): AdminGhazalDocxParseResult | null {
    const paragraphs =
        splitRawParagraphs(rawText);

    const questionIndexes =
        paragraphs.flatMap(
            (paragraph, index) =>
                /^(?:28|29|30|31|32)\.\s*/u.test(
                    paragraph,
                )
                    ? [index]
                    : [],
        );

    if (questionIndexes.length !== 5) {
        return null;
    }

    const firstQuestionIndex =
        questionIndexes[0] ?? -1;
    const firstBlockEnd =
        questionIndexes[1] ?? paragraphs.length;
    const firstBlock =
        paragraphs.slice(
            firstQuestionIndex,
            firstBlockEnd,
        );
    const firstHeaderParagraph =
        firstBlock[0] ?? "";
    const firstHeaderLines =
        splitAdminDocxRawText(
            firstHeaderParagraph,
        );
    const firstContextParagraph =
        firstHeaderLines.length > 2
            ? firstHeaderParagraph
            : firstBlock.find(
                (paragraph, index) =>
                    index > 0 &&
                    !/^[A-D][\)\.:\-]\s*/u.test(paragraph) &&
                    !/^(?:JAVOB|TOʻGʻRI JAVOB)\s*:/iu.test(paragraph),
            );

    if (!firstContextParagraph) {
        return null;
    }

    const contextLines =
        splitAdminDocxRawText(
            firstContextParagraph,
        ).slice(
            firstHeaderLines.length > 2
                ? 1
                : 0,
        );

    if (contextLines.length < 3) {
        return null;
    }

    const vocabularyHeadingIndex =
        contextLines.findIndex((line) =>
            /^(?:LUGʻAT|LUGAT)\s*:?$/iu.test(
                line,
            ),
        );

    const ghazalLines =
        (
            vocabularyHeadingIndex >= 0
                ? contextLines.slice(
                    0,
                    vocabularyHeadingIndex,
                )
                : contextLines.slice(0, -1)
        ).filter(Boolean);

    const vocabularyLines =
        vocabularyHeadingIndex >= 0
            ? contextLines.slice(
                vocabularyHeadingIndex + 1,
                -1,
            )
            : [];

    const couplets =
        parseCouplets(ghazalLines);

    let vocabulary =
        parseVocabulary(vocabularyLines);

    if (
        vocabulary.length === 0 &&
        vocabularyLines.length >= 2
    ) {
        const pairedVocabulary:
            AdminParsedGhazalVocabularyItem[] = [];

        for (
            let index = 0;
            index + 1 < vocabularyLines.length;
            index += 2
        ) {
            const term =
                vocabularyLines[index]?.trim() ?? "";
            const meaning =
                vocabularyLines[index + 1]?.trim() ?? "";

            if (term && meaning) {
                pairedVocabulary.push({
                    marker: null,
                    term,
                    meaning,
                });
            }
        }

        vocabulary =
            pairedVocabulary;
    }

    const mcqLines: string[] = [];

    questionIndexes.forEach(
        (questionIndex, blockIndex) => {
            const blockEnd =
                questionIndexes[blockIndex + 1] ??
                paragraphs.length;
            const block =
                paragraphs.slice(
                    questionIndex,
                    blockEnd,
                );
            const headerLines =
                splitAdminDocxRawText(
                    block[0] ?? "",
                );
            const header =
                headerLines[0] ?? "";
            const numberMatch =
                /^(28|29|30|31|32)\.\s*/u.exec(
                    header,
                );

            if (!numberMatch) {
                return;
            }

            const sourceNumber =
                Number(numberMatch[1]);
            const contextParagraph =
                headerLines.length > 2
                    ? block[0]
                    : block.find(
                        (paragraph, index) =>
                            index > 0 &&
                            !/^[A-D][\)\.:\-]\s*/u.test(paragraph) &&
                            !/^(?:JAVOB|TOʻGʻRI JAVOB)\s*:/iu.test(paragraph),
                    );
            const contextParagraphLines =
                contextParagraph
                    ? splitAdminDocxRawText(
                        contextParagraph,
                    ).slice(
                        headerLines.length > 2
                            ? 1
                            : 0,
                    )
                    : headerLines;
            const questionText =
                contextParagraphLines.at(-1) ??
                header.replace(
                    /^(28|29|30|31|32)\.\s*/u,
                    "",
                );

            mcqLines.push(
                `${sourceNumber}. ${questionText}`,
            );

            for (const paragraph of block) {
                const firstLine =
                    splitAdminDocxRawText(
                        paragraph,
                    )[0] ?? "";

                if (
                    /^[A-D][\)\.:\-]\s*\S/u.test(
                        firstLine,
                    ) ||
                    /^(?:JAVOB|TOʻGʻRI JAVOB)\s*[:\-]\s*[A-D]\s*$/iu.test(
                        firstLine,
                    )
                ) {
                    mcqLines.push(firstLine);
                }
            }
        },
    );

    const mcq =
        parseStandardMcqDocument(
            mcqLines.join("\n"),
        );

    if (
        couplets.length === 0 ||
        mcq.questions.length !== 5
    ) {
        return null;
    }

    const titleParagraph =
        paragraphs
            .slice(0, firstQuestionIndex)
            .find(Boolean) ?? null;

    const issues: string[] = [];

    if (vocabulary.length === 0) {
        issues.push(
            "Lug‘at topilmadi yoki bu g‘azalda lug‘at berilmagan.",
        );
    }

    if (
        mcq.answerKeyCount !== 5
    ) {
        issues.push(
            "Barcha 5 savol uchun javob kaliti topilmadi.",
        );
    }

    if (mcq.invalidCount > 0) {
        issues.push(
            `${mcq.invalidCount} ta savolda A–D variantlari to‘liq emas.`,
        );
    }

    const confidenceScore =
        Math.max(
            0,
            100 -
                (vocabulary.length === 0 ? 5 : 0) -
                (5 - mcq.answerKeyCount) * 5 -
                mcq.invalidCount * 10,
        );

    const confidence =
        mcq.invalidCount > 0 ||
        mcq.questions.length !== 5
            ? "invalid"
            : issues.length === 0
              ? "high"
              : "review";

    return {
        metadata: {
            title:
                titleParagraph,
            author:
                null,
            instruction:
                "G‘azalni o‘qing va quyidagi topshiriqlarni bajaring.",
            source:
                null,
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
        return parseCompactFiveQuestionGhazal(
            rawText,
        );
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
