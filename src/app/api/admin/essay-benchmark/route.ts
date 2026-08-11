import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { getEssayBenchmarkCase } from "@/features/essay-check/benchmark/benchmark-cases";
import { gradeEssayWithOpenAIModel } from "@/features/essay-check/grading";
import { ESSAY_CRITERION_IDS } from "@/features/essay-check/grading/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ALLOWED_MODELS = new Set([
    "gpt-5.6-terra",
    "gpt-5.6-sol",
]);

type BenchmarkRequest = {
    readonly caseId?: unknown;
    readonly model?: unknown;
};

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

    const benchmarkCase = getEssayBenchmarkCase(caseId);
    if (!benchmarkCase) {
        return NextResponse.json({ error: "Benchmark essay was not found." }, { status: 404 });
    }

    try {
        const grade = await gradeEssayWithOpenAIModel(
            {
                topic: benchmarkCase.topic,
                situationText: benchmarkCase.situationText ?? null,
                essayText: benchmarkCase.essayText,
            },
            model,
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
            model,
            topicWasInferred: Boolean(benchmarkCase.topicWasInferred),
            teacher: {
                rawScore: benchmarkCase.teacherRawScore,
                scaledScore: benchmarkCase.teacherScaledScore,
                criteria: benchmarkCase.teacherCriteria,
            },
            ai: grade,
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
            model,
            error,
        });

        const message = error instanceof Error ? error.message : "Unknown benchmark error.";
        return NextResponse.json(
            { error: message.slice(0, 900) },
            { status: 500 },
        );
    }
}
