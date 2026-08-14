import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { getEssayBenchmarkCase } from "@/features/essay-check/benchmark/benchmark-cases";
import {
    gradeEssayWithOpenAIModelDetailed,
    type EssayOpenAIUsage,
} from "@/features/essay-check/grading";
import { ESSAY_CRITERION_IDS } from "@/features/essay-check/grading/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ALLOWED_MODELS = new Set([
    "gpt-5.6-luna",
    "gpt-5.6-terra",
    "gpt-5.6-sol",
]);

const MODEL_PRICING = {
    "gpt-5.6-luna": { input: 0.20, cachedInput: 0.02, output: 1.20 },
    "gpt-5.6-terra": { input: 2.00, cachedInput: 0.20, output: 12.00 },
    "gpt-5.6-sol": { input: 5.00, cachedInput: 0.50, output: 30.00 },
} as const;

type ModelId = keyof typeof MODEL_PRICING;

type BenchmarkRequest = {
    readonly caseId?: unknown;
    readonly model?: unknown;
};

function estimateCostUsd(model: ModelId, usage: EssayOpenAIUsage | null): number | null {
    if (!usage) return null;
    const price = MODEL_PRICING[model];
    const cached = Math.min(usage.cachedInputTokens, usage.inputTokens);
    const cacheWrite = Math.min(
        usage.cacheWriteTokens,
        Math.max(usage.inputTokens - cached, 0),
    );
    const uncached = Math.max(usage.inputTokens - cached - cacheWrite, 0);

    // GPT-5.6 cache writes are billed at 1.25x the uncached input rate.
    return (
        uncached * price.input
        + cached * price.cachedInput
        + cacheWrite * price.input * 1.25
        + usage.outputTokens * price.output
    ) / 1_000_000;
}

export async function POST(request: Request) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: BenchmarkRequest;
    try {
        body = await request.json() as BenchmarkRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const caseId = typeof body.caseId === "string" ? body.caseId.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";

    if (!ALLOWED_MODELS.has(model)) {
        return NextResponse.json({ error: "Benchmark model is not allowed." }, { status: 400 });
    }

    const typedModel = model as ModelId;
    const benchmarkCase = getEssayBenchmarkCase(caseId);
    if (!benchmarkCase) {
        return NextResponse.json({ error: "Benchmark essay was not found." }, { status: 404 });
    }

    try {
        const { grade, usage } = await gradeEssayWithOpenAIModelDetailed(
            {
                topic: benchmarkCase.topic,
                situationText: benchmarkCase.situationText ?? null,
                essayText: benchmarkCase.essayText,
            },
            typedModel,
        );

        const criterionDeltas = grade.criteria
            ? Object.fromEntries(
                ESSAY_CRITERION_IDS.map((id) => [
                    id,
                    grade.criteria![id].score - benchmarkCase.teacherCriteria[id],
                ]),
            )
            : null;

        return NextResponse.json({
            caseId: benchmarkCase.id,
            label: benchmarkCase.label,
            model: typedModel,
            topicWasInferred: Boolean(benchmarkCase.topicWasInferred),
            teacher: {
                rawScore: benchmarkCase.teacherRawScore,
                scaledScore: benchmarkCase.teacherScaledScore,
                criteria: benchmarkCase.teacherCriteria,
            },
            ai: grade,
            usage,
            estimatedCostUsd: estimateCostUsd(typedModel, usage),
            pricingUsdPerMillionTokens: MODEL_PRICING[typedModel],
            delta: {
                rawScore:
                    grade.rawScore === null
                        ? null
                        : grade.rawScore - benchmarkCase.teacherRawScore,
                scaledScore:
                    grade.scaledScore === null
                        ? null
                        : grade.scaledScore - benchmarkCase.teacherScaledScore,
                criteria: criterionDeltas,
            },
        });
    } catch (error) {
        console.error("Essay benchmark failed", {
            caseId,
            model: typedModel,
            error,
        });

        const message = error instanceof Error ? error.message : "Unknown benchmark error.";
        return NextResponse.json(
            { error: message.slice(0, 900) },
            { status: 500 },
        );
    }
}
