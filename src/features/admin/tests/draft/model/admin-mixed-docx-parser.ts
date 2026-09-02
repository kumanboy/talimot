import {
    normalizeAdminDocxLine,
} from "./admin-standard-mcq-parser";
import type {
    AdminDocxParserConfidence,
    AdminParsedMcqOption,
} from "./admin-docx-parser-types";
import type {
    AdminMixedDocxParseResult,
    AdminParsedMixedComparison,
    AdminParsedMixedMatchingItem,
    AdminParsedMixedMultipartPart,
    AdminParsedMixedQuestion,
    AdminParsedMixedVisual,
} from "./admin-mixed-docx-parser-types";

type FieldMap = ReadonlyMap<string, readonly string[]>;
type ChoiceId = "A" | "B" | "C" | "D" | "E" | "F";

const questionHeadingPattern =
    /^(?:SAVOL|QUESTION)\s+(\d{1,3})(?:\s*[-–—:]\s*(.*))?$/iu;
const fieldPattern =
    /^([A-ZА-ЯOʻGʻQ‘’ʼ' -]+)\s*:\s*(.*)$/u;
const optionPattern =
    /^([A-F])\s*[\)\.\-:]\s*(.*)$/u;
const multipartPartPattern =
    /^([abc])\s*[\)\.\-:]\s*(.*)$/iu;

function normalizeKey(value: string): string {
    return normalizeAdminDocxLine(value)
        .toLocaleUpperCase("uz")
        .replace(/[‘’ʻʼ`´]/gu, "ʻ")
        .replace(/\s+/gu, " ");
}

function splitLines(rawText: string): readonly string[] {
    return rawText
        .replace(/\r\n?/gu, "\n")
        .split("\n")
        .map((line) => line.replace(/\u00a0/gu, " ").trim());
}

function parseNumber(value: string | null, fallback = 0): number {
    if (!value) return fallback;

    const match = /-?\d+(?:[\.,]\d+)?/u.exec(
        value,
    );

    if (!match?.[0]) {
        return fallback;
    }

    const parsed = Number(
        match[0].replace(
            ",",
            ".",
        ),
    );

    return Number.isFinite(
        parsed,
    )
        ? parsed
        : fallback;
}

function first(fields: FieldMap, ...keys: string[]): string | null {
    for (const key of keys) {
        const values = fields.get(normalizeKey(key));
        const value = values?.join("\n").trim();
        if (value) return value;
    }
    return null;
}

function list(fields: FieldMap, ...keys: string[]): readonly string[] {
    const value = first(fields, ...keys);
    return value
        ? value.split(/\s*[;|]\s*/gu).map((item) => item.trim()).filter(Boolean)
        : [];
}

function comparison(fields: FieldMap): AdminParsedMixedComparison {
    const value = normalizeKey(first(fields, "TAQQOSLASH", "COMPARISON") ?? "NORMALIZED");
    if (value === "EXACT") return "exact";
    if (value === "KEYWORDS" || value === "KALIT SOʻZLAR") return "keywords";
    if (value === "MANUAL-REVIEW" || value === "MANUAL REVIEW" || value === "QOʻLDA") return "manual-review";
    return "normalized";
}

function collectFields(lines: readonly string[]): FieldMap {
    const fields = new Map<string, string[]>();
    let activeKey: string | null = null;
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        const match = fieldPattern.exec(line);
        if (match?.[1] !== undefined) {
            activeKey = normalizeKey(match[1]);
            fields.set(activeKey, match[2] ? [match[2].trim()] : []);
            continue;
        }
        if (activeKey) {
            fields.set(activeKey, [...(fields.get(activeKey) ?? []), line]);
        }
    }
    return fields;
}

function confidenceFromIssues(issues: readonly string[], fatal: boolean): {
    confidence: AdminDocxParserConfidence;
    confidenceScore: number;
} {
    if (fatal) return { confidence: "invalid", confidenceScore: Math.max(10, 45 - issues.length * 5) };
    if (issues.length > 0) return { confidence: "review", confidenceScore: Math.max(55, 88 - issues.length * 7) };
    return { confidence: "high", confidenceScore: 100 };
}

function parseVisual(fields: FieldMap): AdminParsedMixedVisual | null {
    const visualType = normalizeKey(first(fields, "VIZUAL", "VISUAL") ?? "");
    if (visualType === "NUMBERED-STATEMENTS" || visualType === "RAQAMLANGAN GAPLAR") {
        const statements = (fields.get(normalizeKey("GAPLAR")) ?? [])
            .flatMap((line) => {
                const match = /^(\d{1,2})\s*[\)\.\-:]\s*(.*)$/u.exec(line);

                return match?.[1] && match[2]
                    ? [{
                        number: Number(match[1]),
                        text: match[2].trim(),
                    }]
                    : [];
            });
        return { type: "numbered-statements", statements };
    }
    if (visualType === "WORD-DIAGRAM" || visualType === "SOʻZ DIAGRAMMASI") {
        const nodes = (fields.get(normalizeKey("TUGUNLAR")) ?? []).flatMap((line) => {
            const match = /^([^|]+)\|([^|]+)\|(root|branch|leaf)$/iu.exec(line);
            return match?.[1] && match[2] && match[3]
                ? [{ id: match[1].trim(), text: match[2].trim(), role: match[3].toLowerCase() as "root" | "branch" | "leaf" }]
                : [];
        });
        const connections = (fields.get(normalizeKey("BOGʻLANISHLAR")) ?? []).flatMap((line) => {
            const match = /^([^>]+)>(.+)$/u.exec(line);
            return match?.[1] && match[2]
                ? [{ from: match[1].trim(), to: match[2].trim() }]
                : [];
        });
        return { type: "word-diagram", nodes, connections };
    }
    return null;
}

function parseMcq(sourceOrder: number, order: number, heading: string, lines: readonly string[]): AdminParsedMixedQuestion {
    const fields = collectFields(lines);
    const question = first(fields, "SAVOL", "QUESTION") ?? heading;
    const rawOptions = lines.flatMap((line) => {
        const match = optionPattern.exec(line);
        return match?.[1] && match[2] && /^[A-D]$/.test(match[1])
            ? [{ id: match[1] as "A" | "B" | "C" | "D", text: match[2].trim() } satisfies AdminParsedMcqOption]
            : [];
    });
    const answer = (first(fields, "JAVOB", "TOʻGʻRI JAVOB") ?? "").toLocaleUpperCase("uz");
    const correctOptionId = /^[A-D]$/.test(answer) ? answer as "A" | "B" | "C" | "D" : null;
    const issues: string[] = [];
    if (!question) issues.push("Savol matni topilmadi.");
    if (rawOptions.length !== 4) issues.push(`4 ta variant kutilgan, ${rawOptions.length} ta topildi.`);
    if (!correctOptionId) issues.push("To‘g‘ri javob topilmadi.");
    const score = parseNumber(first(fields, "BALL", "SCORE"));
    if (score <= 0) issues.push("Savol balli topilmadi yoki noto‘g‘ri.");
    const status = confidenceFromIssues(issues, !question || rawOptions.length !== 4);
    return {
        type: "multiple-choice", id: `mixed-${sourceOrder}`, order, sourceOrder,
        question, context: first(fields, "KONTEKST", "CONTEXT"), maximumScore: score,
        options: rawOptions, correctOptionId, visual: parseVisual(fields), issues, ...status,
    };
}

function parseMatching(sourceOrder: number, order: number, heading: string, lines: readonly string[]): AdminParsedMixedQuestion {
    const fields = collectFields(lines);
    const choices = (fields.get(normalizeKey("VARIANTLAR")) ?? []).flatMap((line) => {
        const match = optionPattern.exec(line);
        return match?.[1] && match[2]
            ? [{ id: match[1] as ChoiceId, text: match[2].trim() }]
            : [];
    });
    const items: AdminParsedMixedMatchingItem[] = (
        fields.get(
            normalizeKey("MOSLASHTIRISH"),
        ) ?? []
    ).flatMap((line, index) => {
        const segments = line
            .split(/\s*\|\s*/u)
            .map((segment) => segment.trim())
            .filter(Boolean);

        const promptMatch = /^(\d{1,3})\s*[\)\.\-:]\s*(.*)$/u.exec(
            segments[0] ?? "",
        );

        if (!promptMatch?.[1] || !promptMatch[2]) {
            return [];
        }

        const answerSegment = segments.find(
            (segment) =>
                /^JAVOB\s*[:=]/iu.test(segment),
        );
        const scoreSegment = segments.find(
            (segment) =>
                /^BALL\s*[:=]/iu.test(segment),
        );

        const answerMatch = answerSegment
            ? /^JAVOB\s*[:=]\s*([A-F])$/iu.exec(answerSegment)
            : null;
        const scoreMatch = scoreSegment
            ? /^BALL\s*[:=]\s*([0-9]+(?:[\.,][0-9]+)?)$/iu.exec(scoreSegment)
            : null;

        return [{
            id: `mixed-${sourceOrder}-item-${index + 1}`,
            order: index + 1,
            sourceOrder: Number(promptMatch[1]),
            prompt: promptMatch[2].trim(),
            correctChoiceId: answerMatch?.[1]
                ? answerMatch[1].toUpperCase() as ChoiceId
                : null,
            maximumScore: parseNumber(
                scoreMatch?.[1] ?? null,
            ),
        }];
    });
    const issues: string[] = [];
    const expectedChoiceIds: readonly ChoiceId[] = ["A", "B", "C", "D", "E", "F"];
    const choiceIds = choices.map((choice) => choice.id);
    const uniqueChoiceIds = new Set(choiceIds);
    const missingChoiceIds = expectedChoiceIds.filter((choiceId) => !uniqueChoiceIds.has(choiceId));
    const duplicateChoiceIds = choiceIds.filter((choiceId, index) => choiceIds.indexOf(choiceId) !== index);
    if (choices.length !== 6) issues.push(`6 ta A–F variant kutilgan, ${choices.length} ta topildi.`);
    if (missingChoiceIds.length > 0) issues.push(`Matching variantlari yetishmaydi: ${missingChoiceIds.join(", ")}.`);
    if (duplicateChoiceIds.length > 0) issues.push(`Matching variantlari takrorlangan: ${[...new Set(duplicateChoiceIds)].join(", ")}.`);
    if (items.length === 0) issues.push("Moslashtirish elementlari topilmadi.");
    if (items.some((item) => !item.correctChoiceId)) issues.push("Ayrim elementlarda javob belgilanmagan.");
    if (items.some((item) => item.maximumScore <= 0)) issues.push("Ayrim elementlarda ball noto‘g‘ri.");
    const maximumScore = items.reduce((total, item) => total + item.maximumScore, 0);
    const status = confidenceFromIssues(
        issues,
        choices.length !== 6 ||
            missingChoiceIds.length > 0 ||
            duplicateChoiceIds.length > 0 ||
            items.length === 0,
    );
    return {
        type: "matching", id: `mixed-${sourceOrder}`, order, sourceOrder,
        question: first(fields, "SAVOL", "QUESTION") ?? heading,
        title: first(fields, "SARLAVHA", "TITLE"), instruction: first(fields, "KOʻRSATMA", "INSTRUCTION"),
        context: first(fields, "KONTEKST", "CONTEXT"), maximumScore, choices, items, issues, ...status,
    };
}

function parseShortAnswer(sourceOrder: number, order: number, heading: string, lines: readonly string[]): AdminParsedMixedQuestion {
    const fields = collectFields(lines);
    const question = first(fields, "SAVOL", "QUESTION") ?? heading;
    const acceptedAnswers = list(fields, "QABUL JAVOBLAR", "ACCEPTED ANSWERS", "JAVOB");
    const score = parseNumber(first(fields, "BALL", "SCORE"));
    const issues: string[] = [];
    if (!question) issues.push("Savol matni topilmadi.");
    if (acceptedAnswers.length === 0) issues.push("Qabul qilinadigan javoblar topilmadi.");
    if (score <= 0) issues.push("Savol balli topilmadi yoki noto‘g‘ri.");
    const status = confidenceFromIssues(issues, !question || acceptedAnswers.length === 0);
    return {
        type: "short-answer", id: `mixed-${sourceOrder}`, order, sourceOrder, question,
        context: first(fields, "KONTEKST", "CONTEXT"), maximumScore: score,
        examples: list(fields, "MISOLLAR", "EXAMPLES"), acceptedAnswers,
        comparison: comparison(fields), requiredKeywords: list(fields, "KALIT SOʻZLAR", "REQUIRED KEYWORDS"),
        issues, ...status,
    };
}

function parseMultipart(sourceOrder: number, order: number, heading: string, lines: readonly string[]): AdminParsedMixedQuestion {
    const fields = collectFields(lines);
    const parts: AdminParsedMixedMultipartPart[] = [];
    let current: { label: "a" | "b" | "c"; lines: string[] } | null = null;
    for (const line of lines) {
        const match = multipartPartPattern.exec(line);
        if (match?.[1] && match[2]) {
            if (current) {
                const partFields = collectFields(current.lines);
                parts.push({
                    id: current.label, label: current.label,
                    question: first(partFields, "SAVOL", "QUESTION") ?? current.lines[0] ?? "",
                    acceptedAnswers: list(partFields, "QABUL JAVOBLAR", "ACCEPTED ANSWERS", "JAVOB"),
                    comparison: comparison(partFields),
                    requiredKeywords: list(partFields, "KALIT SOʻZLAR", "REQUIRED KEYWORDS"),
                    maximumScore: parseNumber(first(partFields, "BALL", "SCORE")),
                });
            }
            current = { label: match[1].toLowerCase() as "a" | "b" | "c", lines: [`SAVOL: ${match[2].trim()}`] };
        } else if (current) current.lines.push(line);
    }
    if (current) {
        const partFields = collectFields(current.lines);
        parts.push({
            id: current.label, label: current.label,
            question: first(partFields, "SAVOL", "QUESTION") ?? current.lines[0] ?? "",
            acceptedAnswers: list(partFields, "QABUL JAVOBLAR", "ACCEPTED ANSWERS", "JAVOB"),
            comparison: comparison(partFields),
            requiredKeywords: list(partFields, "KALIT SOʻZLAR", "REQUIRED KEYWORDS"),
            maximumScore: parseNumber(first(partFields, "BALL", "SCORE")),
        });
    }
    const issues: string[] = [];
    if (parts.length < 2) issues.push("Multipart savolda kamida 2 ta qism kutilgan.");
    if (parts.some((part) => !part.question || part.acceptedAnswers.length === 0 || part.maximumScore <= 0)) issues.push("Ayrim qismlarda savol, javob yoki ball yetishmaydi.");
    const calculatedScore = parts.reduce((total, part) => total + part.maximumScore, 0);
    const declaredScore = parseNumber(first(fields, "UMUMIY BALL", "TOTAL SCORE"), calculatedScore);
    if (declaredScore > 0 && Math.abs(declaredScore - calculatedScore) > 0.01) issues.push("Qismlar ballari umumiy ballga teng emas.");
    const status = confidenceFromIssues(issues, parts.length < 2);
    return {
        type: "multipart", id: `mixed-${sourceOrder}`, order, sourceOrder,
        question: first(fields, "SAVOL", "QUESTION") ?? heading,
        context: first(fields, "KONTEKST", "CONTEXT"), maximumScore: declaredScore,
        parts, issues, ...status,
    };
}

export function parseMixedDocxDocument(rawText: string): AdminMixedDocxParseResult | null {
    const lines = splitLines(rawText);
    const typeDetected = lines.some((line) => /^TEST\s+TURI\s*:\s*(?:ARALASH|MIXED)$/iu.test(normalizeAdminDocxLine(line)));
    if (!typeDetected) return null;

    const metadataLines: string[] = [];
    const sections: { sourceOrder: number; heading: string; lines: string[] }[] = [];
    let current: { sourceOrder: number; heading: string; lines: string[] } | null = null;
    for (const line of lines) {
        const match = questionHeadingPattern.exec(normalizeAdminDocxLine(line));
        if (match?.[1]) {
            if (current) sections.push(current);
            current = { sourceOrder: Number(match[1]), heading: match[2]?.trim() ?? "", lines: [] };
        } else if (current) current.lines.push(line);
        else metadataLines.push(line);
    }
    if (current) sections.push(current);

    const metadataFields = collectFields(metadataLines);
    const questions: AdminParsedMixedQuestion[] = sections.map((section, index) => {
        const fields = collectFields(section.lines);
        const type = normalizeKey(first(fields, "TUR", "TYPE") ?? "");
        if (type === "MATCHING" || type === "MOSLASHTIRISH") return parseMatching(section.sourceOrder, index + 1, section.heading, section.lines);
        if (type === "SHORT-ANSWER" || type === "QISQA JAVOB") return parseShortAnswer(section.sourceOrder, index + 1, section.heading, section.lines);
        if (type === "MULTIPART" || type === "KOʻP QISMLI") return parseMultipart(section.sourceOrder, index + 1, section.heading, section.lines);
        return parseMcq(section.sourceOrder, index + 1, section.heading, section.lines);
    });

    const taskCount = questions.reduce((total, question) => total + (question.type === "matching" ? question.items.length : 1), 0);
    const maximumScore = Math.round(questions.reduce((total, question) => total + question.maximumScore, 0) * 10) / 10;
    const issues: string[] = [];
    if (questions.length === 0) issues.push("Aralash test savollari topilmadi.");
    const declaredTasks = parseNumber(first(metadataFields, "TOPSHIRIQLAR", "TASK COUNT"));
    const declaredScore = parseNumber(first(metadataFields, "MAKSIMAL BALL", "MAXIMUM SCORE"));
    if (declaredTasks > 0 && declaredTasks !== taskCount) issues.push(`Topshiriqlar soni mos emas: hujjatda ${declaredTasks}, parserda ${taskCount}.`);
    if (declaredScore > 0 && Math.abs(declaredScore - maximumScore) > 0.01) issues.push(`Maksimal ball mos emas: hujjatda ${declaredScore}, parserda ${maximumScore}.`);
    const invalidCount = questions.filter((q) => q.confidence === "invalid").length;
    const reviewCount = questions.filter((q) => q.confidence === "review").length;
    const highConfidenceCount = questions.filter((q) => q.confidence === "high").length;
    const confidence: AdminDocxParserConfidence = questions.length === 0 || invalidCount > 0 ? "invalid" : issues.length > 0 || reviewCount > 0 ? "review" : "high";
    const confidenceScore = questions.length === 0 ? 0 : Math.max(0, Math.round(questions.reduce((total, q) => total + q.confidenceScore, 0) / questions.length - issues.length * 4));

    const accessText = normalizeKey(first(metadataFields, "KIRISH", "ACCESS") ?? "");
    return {
        metadata: {
            title: first(metadataFields, "SARLAVHA", "TITLE"),
            description: first(metadataFields, "TAVSIF", "DESCRIPTION"),
            instruction: first(metadataFields, "KOʻRSATMA", "INSTRUCTION"),
            estimatedMinutes: parseNumber(first(metadataFields, "DAQIQA", "ESTIMATED MINUTES")) || null,
            access: accessText === "PREMIUM" ? "premium" : accessText === "FREE" || accessText === "BEPUL" ? "free" : null,
        },
        questions, taskCount, maximumScore, highConfidenceCount, reviewCount, invalidCount,
        confidence, confidenceScore, issues,
    };
}
