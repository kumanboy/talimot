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
    readDiagnosticCertificateRecord,
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

export function DiagnosticTestResult({
    test,
}: DiagnosticTestResultProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attempt");

    const [answers, setAnswers] =
        useState<DiagnosticAnswers | null>(null);
    const [result, setResult] =
        useState<DiagnosticTestScoreResult | null>(null);
    const [certificateRecord, setCertificateRecord] =
        useState<DiagnosticCertificateRecord | null>(null);
    const [openCertificateInitially, setOpenCertificateInitially] =
        useState(true);

    useEffect(() => {
        if (!attemptId) {
            router.replace(
                `/tests/milliy-sertifikat/diagnostika/${test.slug}`,
            );
            return;
        }

        const completed = readCompletedTest(attemptId);

        if (!completed || completed.testId !== test.id) {
            router.replace("/natijalar");
            return;
        }

        const restoredAnswers =
            completed.answers as DiagnosticAnswers;

        setAnswers(restoredAnswers);
        setResult(
            calculateDiagnosticTestScore(
                test,
                restoredAnswers,
            ),
        );
        setCertificateRecord(
            readDiagnosticCertificateRecord(attemptId),
        );
        setOpenCertificateInitially(true);
    }, [attemptId, router, test]);

    if (!attemptId || !answers || !result) {
        return (
            <main className={styles.page}>
                <div className={styles.content}>
                    <section className={styles.resultHero}>
                        <span>TA’LIMOT</span>
                        <h1>Natija yuklanmoqda...</h1>
                    </section>
                </div>
            </main>
        );
    }

    const restart = () => {
        removeTestProgress(test.id);
        removeCompletedTest(attemptId);

        router.replace(
            `/tests/milliy-sertifikat/diagnostika/${test.slug}/imtihon`,
        );
    };

    return (
        <DiagnosticResultView
            test={test}
            result={result}
            answers={answers}
            certificateRecord={certificateRecord}
            openCertificateInitially={openCertificateInitially}
            onInitialCertificateClose={() =>
                setOpenCertificateInitially(false)
            }
            onRestart={restart}
        />
    );
}
