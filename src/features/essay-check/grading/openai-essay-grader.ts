import "server-only";

import { ESSAY_GRADING_JSON_SCHEMA } from "./grading-schema";
import { buildEssayGradingUserInput, ESSAY_GRADING_SYSTEM_PROMPT } from "./grading-prompt";
import { finalizeModelGrade, parseAndValidateModelGrade } from "./finalize-grade";
import { countEssayWords } from "./word-count";
import type { EssayGradingInput, FinalEssayGrade } from "./types";

const DEFAULT_MODEL = "gpt-5.6-terra";
const MIN_WORDS = 100;
const MAX_WORDS = 350;

function getApiKey(): string {
    const value = process.env.OPENAI_API_KEY?.trim();
    if (!value) throw new Error("OPENAI_API_KEY is not configured.");
    return value;
}

export function getEssayModel(): string {
    return process.env.OPENAI_ESSAY_MODEL?.trim() || DEFAULT_MODEL;
}

function extractOutputText(response: unknown): string {
    if (!response || typeof response !== "object") return "";
    const root = response as Record<string, unknown>;

    if (typeof root.output_text === "string" && root.output_text.trim()) {
        return root.output_text.trim();
    }

    if (!Array.isArray(root.output)) return "";
    const parts: string[] = [];

    for (const item of root.output) {
        if (!item || typeof item !== "object") continue;
        const message = item as Record<string, unknown>;
        if (!Array.isArray(message.content)) continue;

        for (const content of message.content) {
            if (!content || typeof content !== "object") continue;
            const block = content as Record<string, unknown>;
            if ((block.type === "output_text" || block.type === "text") && typeof block.text === "string") {
                parts.push(block.text);
            }
        }
    }

    return parts.join("\n").trim();
}

function deterministicValidation(input: EssayGradingInput, wordCount: number): FinalEssayGrade | null {
    if (!input.essayText.trim()) {
        return {
            rubricVersion: "uzbmb-essay-v3",
            model: null,
            wordCount: 0,
            stopReason: "empty",
            rawScore: 0,
            scaledScore: 0,
            criteria: null,
            sectionFeedback: null,
            keySpellingErrors: [],
            keyPunctuationErrors: [],
            recommendations: [],
            summary: "Esse matni kiritilmagan.",
        };
    }

    if (wordCount < MIN_WORDS) {
        return {
            rubricVersion: "uzbmb-essay-v3",
            model: null,
            wordCount,
            stopReason: "under_100_words",
            rawScore: 2,
            scaledScore: 31,
            criteria: null,
            sectionFeedback: null,
            keySpellingErrors: [],
            keyPunctuationErrors: [],
            recommendations: ["Esse hajmini kamida 100 so‘zga yetkazing."],
            summary: "Esse 100 so‘zdan kam.",
        };
    }

    if (wordCount > MAX_WORDS) {
        return {
            rubricVersion: "uzbmb-essay-v3",
            model: null,
            wordCount,
            stopReason: "over_350_words",
            rawScore: null,
            scaledScore: null,
            criteria: null,
            sectionFeedback: null,
            keySpellingErrors: [],
            keyPunctuationErrors: [],
            recommendations: ["Esse hajmini 350 so‘zdan oshirmang."],
            summary: "Esse 350 so‘zdan oshgan; tekshiruv boshlanmaydi va Tanga yechilmasligi kerak.",
        };
    }

    return null;
}

export async function gradeEssayWithOpenAIModel(
    input: EssayGradingInput,
    model: string,
): Promise<FinalEssayGrade> {
    const wordCount = countEssayWords(input.essayText);
    const validation = deterministicValidation(input, wordCount);
    if (validation) return validation;

    const normalizedModel = model.trim();
    if (!normalizedModel) throw new Error("Essay grading model is required.");

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getApiKey()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: normalizedModel,
            reasoning: { effort: "medium" },
            input: [
                { role: "system", content: ESSAY_GRADING_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: buildEssayGradingUserInput({
                        ...input,
                        wordCount,
                    }),
                },
            ],
            text: {
                format: {
                    type: "json_schema",
                    name: "talimot_essay_grade_v3",
                    strict: true,
                    schema: ESSAY_GRADING_JSON_SCHEMA,
                },
            },
            max_output_tokens: 5000,
            store: false,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        const detail = (await response.text()).slice(0, 1200);
        throw new Error(`OpenAI essay grading failed (${response.status}): ${detail}`);
    }

    const payload: unknown = await response.json();
    const outputText = extractOutputText(payload);
    if (!outputText) throw new Error("OpenAI essay grading response did not contain output text.");

    let parsed: unknown;
    try {
        parsed = JSON.parse(outputText);
    } catch {
        throw new Error("OpenAI essay grading response was not valid JSON.");
    }

    const modelGrade = parseAndValidateModelGrade(parsed);
    return finalizeModelGrade({ model: normalizedModel, wordCount, modelGrade });
}

export async function gradeEssayWithOpenAI(input: EssayGradingInput): Promise<FinalEssayGrade> {
    return gradeEssayWithOpenAIModel(input, getEssayModel());
}
