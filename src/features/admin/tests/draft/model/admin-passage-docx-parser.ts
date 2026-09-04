import {
    normalizeAdminDocxLine,
    parseStandardMcqDocument,
    splitAdminDocxRawText,
} from "./admin-standard-mcq-parser";
import type {
    AdminParsedPassageBlock,
    AdminParsedPassageMetadata,
    AdminPassageDocxParseResult,
    AdminPassageDocxTopic,
} from "./admin-passage-docx-parser-types";

const metadataPatterns = {
    topic:
        /^(?:test\s*turi|tur|mavzu)\s*:\s*(.+)$/iu,
    title:
        /^(?:sarlavha|title)\s*:\s*(.+)$/iu,
    subtitle:
        /^(?:qo['ʻʼ‘’`´]shimcha\s+sarlavha|subtitle)\s*:\s*(.+)$/iu,
    author:
        /^(?:muallif|author)\s*:\s*(.+)$/iu,
    source:
        /^(?:manba|source)\s*:\s*(.+)$/iu,
    instruction:
        /^(?:ko['ʻʼ‘’`´]rsatma|instruction)\s*:\s*(.+)$/iu,
} as const;

const passageHeadingPattern =
    /^(?:matn|passage)\s*:?\s*$/iu;
const questionsHeadingPattern =
    /^(?:savollar|questions)\s*$/iu;
const answersHeadingPattern =
    /^(?:javoblar|javoblar\s+kaliti|answers)\s*$/iu;
const romanMarkerPattern =
    /^([IVXLCDM]+)\s*[\.\):\-]?\s*(.*)$/u;

const canonicalScientificMarkers =
    ["I", "II", "III", "IV"] as const;
const taggedBlockPattern =
    /^\[(SARLAVHA|PARAGRAF|DIALOG|DIALOGUE)\]\s*(.*)$/iu;
const speakerPattern =
    /^([^:]{2,80})\s*:\s*(\S.*)$/u;

const dashDialoguePattern =
    /^[—–-]\s*(\S.*)$/u;

function topicFromText(
    value: string,
): AdminPassageDocxTopic | null {
    const normalized = value
        .toLocaleLowerCase("uz")
        .replace(/[‘’ʻʼ`´]/gu, "'");

    if (
        normalized.includes("ilmiy") ||
        normalized.includes("scientific")
    ) {
        return "scientific-text";
    }

    if (
        normalized.includes("badiiy") ||
        normalized.includes("literary")
    ) {
        return "literary-text";
    }

    return null;
}

function readMetadata(
    lines: readonly string[],
    passageIndex: number,
): AdminParsedPassageMetadata {
    let topic: AdminPassageDocxTopic | null = null;
    let title: string | null = null;
    let subtitle: string | null = null;
    let author: string | null = null;
    let source: string | null = null;
    let instruction: string | null = null;

    for (const line of lines.slice(0, passageIndex)) {
        const topicMatch = metadataPatterns.topic.exec(line);
        const titleMatch = metadataPatterns.title.exec(line);
        const subtitleMatch = metadataPatterns.subtitle.exec(line);
        const authorMatch = metadataPatterns.author.exec(line);
        const sourceMatch = metadataPatterns.source.exec(line);
        const instructionMatch = metadataPatterns.instruction.exec(line);

        if (topicMatch?.[1]) {
            topic = topicFromText(topicMatch[1]);
        } else if (titleMatch?.[1]) {
            title = titleMatch[1].trim();
        } else if (subtitleMatch?.[1]) {
            subtitle = subtitleMatch[1].trim();
        } else if (authorMatch?.[1]) {
            author = authorMatch[1].trim();
        } else if (sourceMatch?.[1]) {
            source = sourceMatch[1].trim();
        } else if (instructionMatch?.[1]) {
            instruction = instructionMatch[1].trim();
        }
    }

    if (!topic) {
        topic = lines
            .slice(0, Math.max(passageIndex, 8))
            .map(topicFromText)
            .find((value): value is AdminPassageDocxTopic => Boolean(value)) ??
            "scientific-text";
    }

    if (!title) {
        title =
            lines
                .slice(0, passageIndex)
                .find((line) =>
                    !metadataPatterns.topic.test(line) &&
                    !metadataPatterns.author.test(line) &&
                    !metadataPatterns.source.test(line) &&
                    !metadataPatterns.instruction.test(line) &&
                    !/^(?:BADIIY|ILMIY)\s+MATN\b/iu.test(line),
                ) ?? null;
    }

    return {
        topic,
        title,
        subtitle,
        author,
        source,
        instruction,
    };
}

function createBlock({
    blocks,
    type,
    text,
    marker = null,
    speaker = null,
}: {
    readonly blocks: AdminParsedPassageBlock[];
    readonly type: AdminParsedPassageBlock["type"];
    readonly text: string;
    readonly marker?: string | null;
    readonly speaker?: string | null;
}) {
    const normalizedText = normalizeAdminDocxLine(text);

    if (!normalizedText) {
        return;
    }

    blocks.push({
        id: `parsed-passage-${blocks.length + 1}`,
        order: blocks.length + 1,
        type,
        marker,
        speaker,
        text: normalizedText,
    });
}

function parseScientificPassage(
    lines: readonly string[],
): readonly AdminParsedPassageBlock[] {
    const sections:
        string[][] = [];
    let currentParts:
        string[] = [];
    let sawExplicitMarker =
        false;

    function flush() {
        if (
            currentParts.length ===
            0
        ) {
            return;
        }

        sections.push(
            currentParts,
        );
        currentParts = [];
    }

    for (const line of lines) {
        const markerMatch =
            romanMarkerPattern.exec(
                line,
            );

        if (
            markerMatch?.[1] !==
            undefined
        ) {
            /*
             * Real source DOCX files sometimes contain the first scientific
             * section as an unnumbered paragraph and then continue with
             * stale/misaligned Roman labels.  The student format, however,
             * always has exactly four ordered sections: I, II, III, IV.
             * Treat every explicit Roman label as a section boundary and
             * canonicalise the visible markers by section order below.
             */
            flush();
            sawExplicitMarker =
                true;

            if (markerMatch[2]) {
                currentParts.push(
                    markerMatch[2],
                );
            }

            continue;
        }

        currentParts.push(
            line,
        );
    }

    flush();

    if (
        sections.length === 0 &&
        !sawExplicitMarker
    ) {
        return [];
    }

    const normalizedSections =
        sections.length > 4
            ? [
                ...sections.slice(
                    0,
                    3,
                ),
                sections
                    .slice(3)
                    .flat(),
            ]
            : sections;

    const blocks:
        AdminParsedPassageBlock[] = [];

    normalizedSections.forEach(
        (parts, index) => {
            const marker =
                canonicalScientificMarkers[
                    index
                ];

            if (!marker) {
                return;
            }

            createBlock({
                blocks,
                type:
                    "numbered-paragraph",
                marker,
                text:
                    parts.join(
                        " ",
                    ),
            });
        },
    );

    return blocks;
}

function looksLikeHeading(line: string): boolean {
    return line.length <= 90 &&
        line === line.toLocaleUpperCase("uz") &&
        /[A-ZА-ЯOʻGʻQ]/u.test(line);
}

function parseLiteraryPassage(
    lines: readonly string[],
): readonly AdminParsedPassageBlock[] {
    const blocks: AdminParsedPassageBlock[] = [];

    for (const line of lines) {
        const taggedMatch = taggedBlockPattern.exec(line);

        if (taggedMatch?.[1] && taggedMatch[2] !== undefined) {
            const tag = taggedMatch[1].toLocaleUpperCase("uz");
            const content = taggedMatch[2];

            if (tag === "SARLAVHA") {
                createBlock({ blocks, type: "heading", text: content });
                continue;
            }

            if (tag === "DIALOG" || tag === "DIALOGUE") {
                const speakerMatch = speakerPattern.exec(content);
                createBlock({
                    blocks,
                    type: "dialogue",
                    speaker: speakerMatch?.[1]?.trim() ?? null,
                    text: speakerMatch?.[2]?.trim() ?? content,
                });
                continue;
            }

            createBlock({ blocks, type: "paragraph", text: content });
            continue;
        }

        const dashDialogueMatch =
            dashDialoguePattern.exec(
                line,
            );

        if (dashDialogueMatch?.[1]) {
            createBlock({
                blocks,
                type: "dialogue",
                text: dashDialogueMatch[1].trim(),
            });
            continue;
        }

        const speakerMatch = speakerPattern.exec(line);

        if (speakerMatch?.[1] && speakerMatch[2]) {
            createBlock({
                blocks,
                type: "dialogue",
                speaker: speakerMatch[1].trim(),
                text: speakerMatch[2].trim(),
            });
            continue;
        }

        createBlock({
            blocks,
            type: looksLikeHeading(line) ? "heading" : "paragraph",
            text: line,
        });
    }

    return blocks;
}

export function parsePassageDocxDocument(
    rawText: string,
): AdminPassageDocxParseResult | null {
    const lines = splitAdminDocxRawText(rawText);
    const passageIndex = lines.findIndex((line) => passageHeadingPattern.test(line));
    const explicitQuestionsIndex = lines.findIndex((line) => questionsHeadingPattern.test(line));
    const inferredQuestionsIndex =
        passageIndex >= 0
            ? lines.findIndex(
                (line, index) =>
                    index > passageIndex &&
                    /^(?:18|19|20|21|22|23|24|25|26|27)\.\s+\S/u.test(line),
            )
            : -1;
    const questionsIndex =
        explicitQuestionsIndex > passageIndex
            ? explicitQuestionsIndex
            : inferredQuestionsIndex;

    if (passageIndex < 0 || questionsIndex <= passageIndex) {
        return null;
    }

    const answersIndex = lines.findIndex(
        (line, index) => index > questionsIndex && answersHeadingPattern.test(line),
    );
    const metadata = readMetadata(lines, passageIndex);
    const passageLines = lines.slice(passageIndex + 1, questionsIndex);
    const questionEnd = answersIndex >= 0 ? answersIndex : lines.length;
    const questionLines = lines.slice(
        explicitQuestionsIndex === questionsIndex
            ? questionsIndex + 1
            : questionsIndex,
        questionEnd,
    );
    const answerLines = answersIndex >= 0 ? lines.slice(answersIndex) : [];
    const questionDocument = [
        ...questionLines,
        ...(answerLines.length > 0 ? ["JAVOBLAR", ...answerLines.slice(1)] : []),
    ].join("\n");
    const parsedQuestions = parseStandardMcqDocument(questionDocument);
    const passage = metadata.topic === "scientific-text"
        ? parseScientificPassage(passageLines)
        : parseLiteraryPassage(passageLines);
    const issues: string[] = [];

    if (!metadata.title) issues.push("Sarlavha topilmadi.");
    if (passage.length === 0) issues.push("Matn bloklari topilmadi.");
    if (parsedQuestions.questions.length === 0) issues.push("Savollar topilmadi.");
    if (parsedQuestions.questions.length !== 5) {
        issues.push(`Passage-five uchun 5 ta savol kutilgan, ${parsedQuestions.questions.length} ta topildi.`);
    }
    if (parsedQuestions.answerKeyCount !== parsedQuestions.questions.length) {
        issues.push("Barcha savollar uchun javob kaliti topilmadi.");
    }
    if (parsedQuestions.invalidCount > 0) {
        issues.push(`${parsedQuestions.invalidCount} ta savol invalid holatda.`);
    }

    let confidenceScore = 100;
    if (!metadata.title) confidenceScore -= 10;
    if (passage.length === 0) confidenceScore -= 40;
    if (parsedQuestions.questions.length !== 5) confidenceScore -= 20;
    if (parsedQuestions.answerKeyCount !== parsedQuestions.questions.length) confidenceScore -= 15;
    confidenceScore -= parsedQuestions.invalidCount * 10;
    confidenceScore = Math.max(0, confidenceScore);

    const confidence = passage.length === 0 || parsedQuestions.questions.length === 0
        ? "invalid"
        : issues.length === 0
            ? "high"
            : "review";

    return {
        metadata,
        passage,
        questions: parsedQuestions.questions,
        confidence,
        confidenceScore,
        issues,
        answerKeyCount: parsedQuestions.answerKeyCount,
    };
}
