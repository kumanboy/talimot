import { ESSAY_CRITERION_IDS, ESSAY_STOP_REASONS } from "./types";

const criterionResultSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        score: { type: "number", enum: [0, 0.5, 1, 1.5, 2] },
        evidence: { type: "string" },
        issueCount: { type: ["integer", "null"], minimum: 0 },
    },
    required: ["score", "evidence", "issueCount"],
} as const;

export const ESSAY_GRADING_JSON_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        stopReason: { type: "string", enum: ESSAY_STOP_REASONS },
        stopExplanation: { type: "string" },
        criteria: {
            type: "object",
            additionalProperties: false,
            properties: Object.fromEntries(
                ESSAY_CRITERION_IDS.map((id) => [id, criterionResultSchema]),
            ),
            required: [...ESSAY_CRITERION_IDS],
        },
        sectionFeedback: {
            type: "object",
            additionalProperties: false,
            properties: {
                introduction: { type: "string" },
                body: { type: "string" },
                conclusion: { type: "string" },
            },
            required: ["introduction", "body", "conclusion"],
        },
        keySpellingErrors: {
            type: "array",
            items: { type: "string" },
            maxItems: 5,
        },
        keyPunctuationErrors: {
            type: "array",
            items: { type: "string" },
            maxItems: 5,
        },
        recommendations: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 5,
        },
        summary: { type: "string" },
    },
    required: [
        "stopReason",
        "stopExplanation",
        "criteria",
        "sectionFeedback",
        "keySpellingErrors",
        "keyPunctuationErrors",
        "recommendations",
        "summary",
    ],
} as const;
