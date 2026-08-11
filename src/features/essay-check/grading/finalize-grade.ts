import { ESSAY_CRITERION_IDS, ESSAY_STOP_REASONS } from "./types";
import type {
    EssayCriterionId,
    EssayCriterionModelResult,
    EssayModelGrade,
    EssayStopReason,
    FinalEssayGrade,
} from "./types";
import { isAllowedCriterionScore, toEssayScaledScore } from "./score-matrix";

const STOP_RAW_SCORE: Readonly<Record<Exclude<EssayStopReason, "none">, 0 | 2>> = {
    topic_mismatch: 2,
    copied: 2,
    only_introduction: 0,
    fully_cyrillic: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown): readonly string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

export function parseAndValidateModelGrade(value: unknown): EssayModelGrade {
    if (!isRecord(value)) throw new Error("Essay model response is not an object.");

    const stopReason = value.stopReason;
    if (typeof stopReason !== "string" || !ESSAY_STOP_REASONS.includes(stopReason as EssayStopReason)) {
        throw new Error("Essay model returned an invalid stopReason.");
    }

    if (!isRecord(value.criteria)) throw new Error("Essay model criteria are missing.");
    const criteria = {} as Record<EssayCriterionId, EssayCriterionModelResult>;

    for (const id of ESSAY_CRITERION_IDS) {
        const rawCriterion = value.criteria[id];
        if (!isRecord(rawCriterion) || !isAllowedCriterionScore(rawCriterion.score)) {
            throw new Error(`Essay model returned an invalid score for ${id}.`);
        }

        const issueCount = rawCriterion.issueCount;
        if (!(issueCount === null || (Number.isInteger(issueCount) && Number(issueCount) >= 0))) {
            throw new Error(`Essay model returned an invalid issueCount for ${id}.`);
        }

        criteria[id] = {
            score: rawCriterion.score,
            evidence: stringValue(rawCriterion.evidence),
            issueCount: issueCount === null ? null : Number(issueCount),
        };
    }

    if (!isRecord(value.sectionFeedback)) throw new Error("Essay section feedback is missing.");

    return {
        stopReason: stopReason as EssayStopReason,
        stopExplanation: stringValue(value.stopExplanation),
        criteria,
        sectionFeedback: {
            introduction: stringValue(value.sectionFeedback.introduction),
            body: stringValue(value.sectionFeedback.body),
            conclusion: stringValue(value.sectionFeedback.conclusion),
        },
        keySpellingErrors: stringArray(value.keySpellingErrors).slice(0, 5),
        keyPunctuationErrors: stringArray(value.keyPunctuationErrors).slice(0, 5),
        recommendations: stringArray(value.recommendations).slice(0, 5),
        summary: stringValue(value.summary),
    };
}

export function finalizeModelGrade(args: {
    readonly model: string;
    readonly wordCount: number;
    readonly modelGrade: EssayModelGrade;
}): FinalEssayGrade {
    const { model, wordCount, modelGrade } = args;

    if (modelGrade.stopReason !== "none") {
        const rawScore = STOP_RAW_SCORE[modelGrade.stopReason];
        return {
            rubricVersion: "uzbmb-essay-v3",
            model,
            wordCount,
            stopReason: modelGrade.stopReason,
            rawScore,
            scaledScore: toEssayScaledScore(rawScore),
            criteria: null,
            sectionFeedback: modelGrade.sectionFeedback,
            keySpellingErrors: modelGrade.keySpellingErrors,
            keyPunctuationErrors: modelGrade.keyPunctuationErrors,
            recommendations: modelGrade.recommendations,
            summary: modelGrade.stopExplanation || modelGrade.summary,
        };
    }

    const rawScore = ESSAY_CRITERION_IDS.reduce(
        (total, id) => total + modelGrade.criteria[id].score,
        0,
    );

    return {
        rubricVersion: "uzbmb-essay-v3",
        model,
        wordCount,
        stopReason: "none",
        rawScore,
        scaledScore: toEssayScaledScore(rawScore),
        criteria: modelGrade.criteria,
        sectionFeedback: modelGrade.sectionFeedback,
        keySpellingErrors: modelGrade.keySpellingErrors,
        keyPunctuationErrors: modelGrade.keyPunctuationErrors,
        recommendations: modelGrade.recommendations,
        summary: modelGrade.summary,
    };
}
