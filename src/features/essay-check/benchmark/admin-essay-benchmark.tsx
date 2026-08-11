"use client";

import { useMemo, useState } from "react";

import styles from "./admin-essay-benchmark.module.css";

type CriterionId =
    | "publicistic_style"
    | "views_and_opinion"
    | "argumentation"
    | "composition"
    | "paragraph_structure"
    | "coherence_and_repetition"
    | "spelling"
    | "punctuation"
    | "suffix_usage"
    | "word_usage_style"
    | "lexical_richness"
    | "speech_purity";

type CriterionScores = Record<CriterionId, number>;

type BenchmarkCaseView = {
    readonly id: string;
    readonly label: string;
    readonly topic: string;
    readonly topicWasInferred: boolean;
    readonly teacherRawScore: number;
    readonly teacherScaledScore: number;
    readonly teacherCriteria: Readonly<CriterionScores>;
};

type ApiGrade = {
    readonly wordCount: number;
    readonly stopReason: string;
    readonly rawScore: number | null;
    readonly scaledScore: number | null;
    readonly criteria: Record<CriterionId, {
        readonly score: number;
        readonly evidence: string;
        readonly issueCount: number | null;
    }> | null;
    readonly summary: string;
    readonly recommendations: readonly string[];
};

type BenchmarkResult = {
    readonly caseId: string;
    readonly label: string;
    readonly model: string;
    readonly topicWasInferred: boolean;
    readonly teacher: {
        readonly rawScore: number;
        readonly scaledScore: number;
        readonly criteria: Readonly<CriterionScores>;
    };
    readonly ai: ApiGrade;
    readonly usage: {
        readonly inputTokens: number;
        readonly cachedInputTokens: number;
        readonly cacheWriteTokens: number;
        readonly outputTokens: number;
        readonly reasoningTokens: number;
        readonly totalTokens: number;
    } | null;
    readonly estimatedCostUsd: number | null;
    readonly pricingUsdPerMillionTokens: {
        readonly input: number;
        readonly cachedInput: number;
        readonly output: number;
    };
    readonly delta: {
        readonly rawScore: number | null;
        readonly scaledScore: number | null;
        readonly criteria: Partial<Record<CriterionId, number>> | null;
    };
};

type ModelId = "gpt-5.6-luna" | "gpt-5.6-terra" | "gpt-5.6-sol";

type RunState = "idle" | "running" | "done" | "error";

const CRITERIA: readonly { id: CriterionId; label: string }[] = [
    { id: "publicistic_style", label: "Publitsistik uslub" },
    { id: "views_and_opinion", label: "Qarashlar va shaxsiy fikr" },
    { id: "argumentation", label: "Dalillash" },
    { id: "composition", label: "Kirish–asosiy qism–xulosa" },
    { id: "paragraph_structure", label: "Matn qurilishi va xatboshilar" },
    { id: "coherence_and_repetition", label: "Izchillik va takror" },
    { id: "spelling", label: "Imlo" },
    { id: "punctuation", label: "Punktuatsiya" },
    { id: "suffix_usage", label: "Qo‘shimcha qo‘llash" },
    { id: "word_usage_style", label: "So‘z qo‘llash uslubiyati" },
    { id: "lexical_richness", label: "Leksik boylik" },
    { id: "speech_purity", label: "Nutq sofligi" },
];

const MODELS: readonly ModelId[] = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];

const MODEL_META: Record<ModelId, { label: string; eyebrow: string }> = {
    "gpt-5.6-luna": { label: "GPT-5.6 Luna", eyebrow: "COST CANDIDATE" },
    "gpt-5.6-terra": { label: "GPT-5.6 Terra", eyebrow: "BALANCED CANDIDATE" },
    "gpt-5.6-sol": { label: "GPT-5.6 Sol", eyebrow: "QUALITY REFERENCE" },
};

function key(model: ModelId, caseId: string) {
    return `${model}:${caseId}`;
}

function signed(value: number | null): string {
    if (value === null) return "—";
    if (value > 0) return `+${value}`;
    return String(value);
}

function deltaClass(value: number | null): string {
    if (value === null) return styles.neutral;
    if (value > 0) return styles.high;
    if (value < 0) return styles.low;
    return styles.exact;
}

export function AdminEssayBenchmark({ cases }: { readonly cases: readonly BenchmarkCaseView[] }) {
    const [results, setResults] = useState<Record<string, BenchmarkResult>>({});
    const [runStates, setRunStates] = useState<Record<ModelId, RunState>>({
        "gpt-5.6-luna": "idle",
        "gpt-5.6-terra": "idle",
        "gpt-5.6-sol": "idle",
    });
    const [errors, setErrors] = useState<Partial<Record<ModelId, string>>>({});

    async function runModel(model: ModelId) {
        if (runStates[model] === "running") return;
        setRunStates((current) => ({ ...current, [model]: "running" }));
        setErrors((current) => ({ ...current, [model]: undefined }));

        try {
            for (const benchmarkCase of cases) {
                const response = await fetch("/api/admin/essay-benchmark", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ caseId: benchmarkCase.id, model }),
                });
                const payload = await response.json() as BenchmarkResult | { error?: string };

                if (!response.ok || !("caseId" in payload)) {
                    throw new Error("error" in payload && payload.error ? payload.error : `HTTP ${response.status}`);
                }

                setResults((current) => ({
                    ...current,
                    [key(model, benchmarkCase.id)]: payload,
                }));
            }

            setRunStates((current) => ({ ...current, [model]: "done" }));
        } catch (error) {
            setRunStates((current) => ({ ...current, [model]: "error" }));
            setErrors((current) => ({
                ...current,
                [model]: error instanceof Error ? error.message : "Benchmark xatosi",
            }));
        }
    }

    const summaries = useMemo(() => {
        const output: Partial<Record<ModelId, {
            mae75: number;
            bias75: number;
            mae24: number;
            completed: number;
            averageCostUsd: number | null;
            costPer1000Usd: number | null;
            averageInputTokens: number | null;
            averageOutputTokens: number | null;
        }>> = {};
        for (const model of MODELS) {
            const modelResults = cases
                .map((item) => results[key(model, item.id)])
                .filter((item): item is BenchmarkResult => Boolean(item && item.ai.rawScore !== null && item.ai.scaledScore !== null));
            if (!modelResults.length) continue;
            const costs = modelResults
                .map((item) => item.estimatedCostUsd)
                .filter((value): value is number => typeof value === "number");
            const usages = modelResults
                .map((item) => item.usage)
                .filter((value): value is NonNullable<BenchmarkResult["usage"]> => Boolean(value));
            const averageCostUsd = costs.length
                ? costs.reduce((sum, value) => sum + value, 0) / costs.length
                : null;
            output[model] = {
                completed: modelResults.length,
                mae75: modelResults.reduce((sum, item) => sum + Math.abs(item.delta.scaledScore ?? 0), 0) / modelResults.length,
                bias75: modelResults.reduce((sum, item) => sum + (item.delta.scaledScore ?? 0), 0) / modelResults.length,
                mae24: modelResults.reduce((sum, item) => sum + Math.abs(item.delta.rawScore ?? 0), 0) / modelResults.length,
                averageCostUsd,
                costPer1000Usd: averageCostUsd === null ? null : averageCostUsd * 1000,
                averageInputTokens: usages.length
                    ? usages.reduce((sum, value) => sum + value.inputTokens, 0) / usages.length
                    : null,
                averageOutputTokens: usages.length
                    ? usages.reduce((sum, value) => sum + value.outputTokens, 0) / usages.length
                    : null,
            };
        }
        return output;
    }, [cases, results]);

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span>TA’LIMOT · INTERNAL EVAL</span>
                    <h1>AI esse benchmark</h1>
                    <p>Rubric v3 · Luna, Terra va Sol’ni bir xil 3 ta teacher-baholangan esse bilan sifat + real API token/cost bo‘yicha solishtiramiz. Bu sahifa student flow, Tanga va database’ga tegmaydi.</p>
                </div>
                <a href="/admin">Admin bosh sahifa</a>
            </header>

            <section className={styles.modelGrid}>
                {MODELS.map((model) => {
                    const summary = summaries[model];
                    const running = runStates[model] === "running";
                    return (
                        <article className={styles.modelCard} key={model}>
                            <div className={styles.modelTitle}>
                                <div>
                                    <small>{MODEL_META[model].eyebrow}</small>
                                    <h2>{MODEL_META[model].label}</h2>
                                </div>
                                <button type="button" disabled={running} onClick={() => void runModel(model)}>
                                    {running ? "Tekshirilmoqda…" : "3 esseni tekshirish"}
                                </button>
                            </div>

                            {summary ? (
                                <div className={styles.metrics}>
                                    <div><span>Tekshirildi</span><strong>{summary.completed}/3</strong></div>
                                    <div><span>MAE /75</span><strong>{summary.mae75.toFixed(2)}</strong></div>
                                    <div><span>Bias /75</span><strong className={deltaClass(summary.bias75)}>{signed(Number(summary.bias75.toFixed(2)))}</strong></div>
                                    <div><span>MAE /24</span><strong>{summary.mae24.toFixed(2)}</strong></div>
                                    <div><span>Avg API cost</span><strong>{summary.averageCostUsd === null ? "—" : `$${summary.averageCostUsd.toFixed(4)}`}</strong></div>
                                    <div><span>1,000 esse</span><strong>{summary.costPer1000Usd === null ? "—" : `$${summary.costPer1000Usd.toFixed(2)}`}</strong></div>
                                    <div><span>Avg input</span><strong>{summary.averageInputTokens === null ? "—" : Math.round(summary.averageInputTokens).toLocaleString()}</strong></div>
                                    <div><span>Avg output</span><strong>{summary.averageOutputTokens === null ? "—" : Math.round(summary.averageOutputTokens).toLocaleString()}</strong></div>
                                </div>
                            ) : (
                                <p className={styles.waiting}>Hali benchmark ishga tushirilmagan.</p>
                            )}

                            {errors[model] ? <p className={styles.error}>{errors[model]}</p> : null}
                        </article>
                    );
                })}
            </section>

            <section className={styles.legend}>
                <strong>Bias qanday o‘qiladi?</strong>
                <span><b className={styles.high}>+</b> AI teacher’dan yuqori baholayapti</span>
                <span><b className={styles.exact}>0</b> kalibratsiya mos</span>
                <span><b className={styles.low}>−</b> AI teacher’dan past baholayapti</span>
            </section>

            <div className={styles.cases}>
                {cases.map((benchmarkCase) => (
                    <article className={styles.caseCard} key={benchmarkCase.id}>
                        <div className={styles.caseHeader}>
                            <div>
                                <span>{benchmarkCase.label}</span>
                                <h2>{benchmarkCase.topic}</h2>
                                {benchmarkCase.topicWasInferred ? <small>⚠ Original topshiriq matni berilmagan; topic esse mazmunidan tiklangan.</small> : null}
                            </div>
                            <div className={styles.teacherScore}>
                                <span>TEACHER</span>
                                <strong>{benchmarkCase.teacherRawScore}/24</strong>
                                <b>{benchmarkCase.teacherScaledScore}/75</b>
                            </div>
                        </div>

                        <div className={styles.resultGrid}>
                            {MODELS.map((model) => {
                                const result = results[key(model, benchmarkCase.id)];
                                return (
                                    <section className={styles.resultCard} key={model}>
                                        <div className={styles.resultHeader}>
                                            <strong>{MODEL_META[model].label.replace("GPT-5.6 ", "")}</strong>
                                            {result ? (
                                                <div>
                                                    <b>{result.ai.rawScore ?? "—"}/24</b>
                                                    <b>{result.ai.scaledScore ?? "—"}/75</b>
                                                    <span className={deltaClass(result.delta.scaledScore)}>Δ {signed(result.delta.scaledScore)}</span>
                                                </div>
                                            ) : <span>Natija yo‘q</span>}
                                        </div>

                                        {result?.usage ? (
                                            <div className={styles.usageLine}>
                                                <span>Input {result.usage.inputTokens.toLocaleString()}</span>
                                                <span>Output {result.usage.outputTokens.toLocaleString()}</span>
                                                <span>Reasoning {result.usage.reasoningTokens.toLocaleString()}</span>
                                                <strong>{result.estimatedCostUsd === null ? "Cost —" : `Cost $${result.estimatedCostUsd.toFixed(4)}`}</strong>
                                            </div>
                                        ) : null}

                                        {result?.ai.criteria ? (
                                            <div className={styles.criteria}>
                                                {CRITERIA.map((criterion, index) => {
                                                    const ai = result.ai.criteria![criterion.id];
                                                    const teacher = benchmarkCase.teacherCriteria[criterion.id];
                                                    const delta = ai.score - teacher;
                                                    return (
                                                        <details key={criterion.id}>
                                                            <summary>
                                                                <span>{index + 1}. {criterion.label}</span>
                                                                <div>
                                                                    <small>T {teacher}</small>
                                                                    <strong>AI {ai.score}</strong>
                                                                    <b className={deltaClass(delta)}>{signed(delta)}</b>
                                                                </div>
                                                            </summary>
                                                            <p>{ai.evidence}</p>
                                                        </details>
                                                    );
                                                })}
                                            </div>
                                        ) : result ? (
                                            <p className={styles.stop}>Stop: {result.ai.stopReason}</p>
                                        ) : (
                                            <p className={styles.empty}>Model benchmark tugmasini bosing.</p>
                                        )}

                                        {result ? (
                                            <div className={styles.feedback}>
                                                <strong>AI xulosasi</strong>
                                                <p>{result.ai.summary}</p>
                                            </div>
                                        ) : null}
                                    </section>
                                );
                            })}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
