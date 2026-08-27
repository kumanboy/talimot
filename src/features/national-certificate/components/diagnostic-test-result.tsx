"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    DiagnosticResultView,
} from "@/features/national-certificate/components/diagnostic-test-runner";
import {
    fetchDiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import {
    calculateDiagnosticTestScore,
} from "@/features/national-certificate/model/diagnostic-test-scoring";
import type {
    DiagnosticAnswers,
    DiagnosticTestDefinition,
    DiagnosticTestScoreResult,
} from "@/features/national-certificate/model/diagnostic-test-types";
import {
    readCompletedTest,
    removeCompletedTest,
    removeTestProgress,
} from "@/features/tests/model/test-progress-storage";

import styles from "./diagnostic-test-runner.module.css";

type DiagnosticTestResultProps = {
    readonly test: DiagnosticTestDefinition;
};

function getEssayScore(test: DiagnosticTestDefinition, answers: DiagnosticAnswers): number | null {
    const essayQuestion = test.questions.find((question) => question.type === "essay");
    if (!essayQuestion) return null;
    const value = answers[essayQuestion.id];
    if (typeof value !== "string" || value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 75 ? parsed : null;
}

export function DiagnosticTestResult({
    test,
}: DiagnosticTestResultProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attempt");

    const [answers, setAnswers] = useState<DiagnosticAnswers | null>(null);
    const [result, setResult] = useState<DiagnosticTestScoreResult | null>(null);
    const [certificateRecord, setCertificateRecord] = useState<DiagnosticCertificateRecord | null>(null);
    const [openCertificateInitially, setOpenCertificateInitially] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let cancelled = false;

        if (!attemptId) {
            router.replace(`/tests/milliy-sertifikat/diagnostika/${test.slug}`);
            return () => { cancelled = true; };
        }

        const completed = readCompletedTest(attemptId);
        const hasLocalDetails = Boolean(completed && completed.testId === test.id);
        const restoredAnswers = hasLocalDetails
            ? completed!.answers as DiagnosticAnswers
            : {};
        const localDetailedResult = hasLocalDetails
            ? calculateDiagnosticTestScore(
                test,
                restoredAnswers,
                getEssayScore(test, restoredAnswers),
            )
            : null;

        void fetchDiagnosticCertificateRecord(attemptId)
            .then((certificate) => {
                if (cancelled) return;
                if (!certificate) {
                    throw new Error("Sertifikat topilmadi.");
                }

                // The database certificate is the authoritative snapshot for all summary
                // scores/level data. LocalStorage is used only to restore detailed answers
                // on the same device; it can never override the persisted certificate.
                const databaseResult: DiagnosticTestScoreResult = {
                    rawTestScore: localDetailedResult?.rawTestScore ?? certificate.result.testScore,
                    rawTestMaximumScore: localDetailedResult?.rawTestMaximumScore ?? 75,
                    testScore: certificate.result.testScore,
                    essayScore: certificate.result.essayScore,
                    finalScore: certificate.result.finalScore,
                    grade: certificate.result.grade,
                    finalPercentage: certificate.result.finalScore === null
                        ? null
                        : certificate.result.percentage,
                    score: certificate.result.score,
                    maximumScore: 75,
                    percentage: certificate.result.percentage,
                    correctCount: certificate.result.correctCount,
                    incorrectCount: certificate.result.incorrectCount,
                    unansweredCount: certificate.result.unansweredCount,
                    pendingCount: 0,
                    questionResults: localDetailedResult?.questionResults ?? [],
                    sectionResults: localDetailedResult?.sectionResults ?? [],
                };

                setAnswers(restoredAnswers);
                setResult(databaseResult);
                setCertificateRecord(certificate);
                setOpenCertificateInitially(true);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setLoadError(error instanceof Error ? error.message : "Natijani yuklab bo‘lmadi.");
            });

        return () => {
            cancelled = true;
        };
    }, [attemptId, router, test]);

    if (!attemptId || !answers || !result || !certificateRecord) {
        return (
            <main className={styles.page}>
                <div className={styles.content}>
                    <section className={styles.resultHero}>
                        <span>TA’LIMOT</span>
                        <h1>{loadError || "Natija yuklanmoqda..."}</h1>
                        {loadError ? (
                            <button type="button" onClick={() => router.replace("/natijalar")}>
                                Natijalarga qaytish
                            </button>
                        ) : null}
                    </section>
                </div>
            </main>
        );
    }

    const restart = () => {
        removeTestProgress(test.id);
        removeCompletedTest(attemptId);
        router.replace(`/tests/milliy-sertifikat/diagnostika/${test.slug}/imtihon`);
    };

    return (
        <DiagnosticResultView
            test={test}
            result={result}
            answers={answers}
            certificateRecord={certificateRecord}
            openCertificateInitially={openCertificateInitially}
            onInitialCertificateClose={() => setOpenCertificateInitially(false)}
            onRestart={restart}
        />
    );
}
