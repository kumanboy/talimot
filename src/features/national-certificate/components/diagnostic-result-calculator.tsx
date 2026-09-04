"use client";

import { useMemo, useState } from "react";
import {
    calculateDiagnosticFinalResult,
} from "@/features/national-certificate/model/diagnostic-test-scoring";
import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import styles from "./diagnostic-result-calculator.module.css";

function parseScore(value: string): number | null {
    if (!value.trim()) return null;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 75 ? parsed : null;
}

export function DiagnosticResultCalculator() {
    const [testValue, setTestValue] = useState("");
    const [essayValue, setEssayValue] = useState("");

    const testScore = parseScore(testValue);
    const essayScore = parseScore(essayValue);
    const invalidTest = Boolean(testValue.trim()) && testScore === null;
    const invalidEssay = Boolean(essayValue.trim()) && essayScore === null;

    const result = useMemo(() => {
        if (testScore === null || essayScore === null) return null;
        return calculateDiagnosticFinalResult(testScore, essayScore);
    }, [testScore, essayScore]);

    return (
        <main className={styles.page}>
            <div className={styles.shell}>
                <header className={styles.header}>
                    <PendingNavigationButton mode="back" aria-label="Orqaga" pendingText="">
                        ←
                    </PendingNavigationButton>
                    <div>
                        <span>TA’LIMOT</span>
                        <h1>Natija hisoblagich</h1>
                    </div>
                </header>

                <section className={styles.card}>
                    <label>
                        <span>Test qismi</span>
                        <div>
                            <input
                                value={testValue}
                                onChange={(event) => setTestValue(event.target.value)}
                                inputMode="decimal"
                                placeholder="Masalan: 61.88"
                                aria-invalid={invalidTest}
                            />
                            <strong>/ 75</strong>
                        </div>
                        {invalidTest ? <small>0 dan 75 gacha ball kiriting.</small> : null}
                    </label>

                    <span className={styles.plus}>+</span>

                    <label>
                        <span>Esse qismi</span>
                        <div>
                            <input
                                value={essayValue}
                                onChange={(event) => setEssayValue(event.target.value)}
                                inputMode="decimal"
                                placeholder="Masalan: 67"
                                aria-invalid={invalidEssay}
                            />
                            <strong>/ 75</strong>
                        </div>
                        {invalidEssay ? <small>0 dan 75 gacha ball kiriting.</small> : null}
                    </label>
                </section>

                <section className={styles.resultCard} aria-live="polite">
                    <span>YAKUNIY NATIJA</span>
                    {result?.finalScore !== null && result ? (
                        <>
                            <strong>{result.finalScore.toFixed(2)} <small>/ 75</small></strong>
                            <div className={styles.gradeRow}>
                                <div>
                                    <span>Daraja</span>
                                    <strong>{result.grade ?? "—"}</strong>
                                </div>
                                <div>
                                    <span>Foiz ko‘rsatkichi</span>
                                    <strong>{result.finalPercentage?.toFixed(2) ?? "—"}%</strong>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Natijani ko‘rish uchun ikkala qism ballini kiriting.</p>
                    )}
                </section>

            </div>
            <MobileNavigation />
        </main>
    );
}
