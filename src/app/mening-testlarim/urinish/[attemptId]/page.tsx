import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { getMyTestAttempt } from "@/features/my-tests/server/get-my-test-attempt";

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Urinish natijasi | TA’LIMOT",
    description: "Saqlangan test urinishining natijasi.",
};

export const dynamic = "force-dynamic";

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat("uz-UZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

function formatDuration(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hours > 0) return `${hours} soat ${minutes} daqiqa`;
    if (minutes > 0) return `${minutes} daqiqa ${secs} soniya`;
    return `${secs} soniya`;
}

export default async function MyTestAttemptRoute({
    params,
}: {
    readonly params: Promise<{ attemptId: string }>;
}) {
    const { attemptId } = await params;
    const data = await getMyTestAttempt(attemptId);

    if (!data.authenticated) {
        redirect(`/auth/login?next=${encodeURIComponent(`/mening-testlarim/urinish/${attemptId}`)}`);
    }

    if (!data.attempt) notFound();

    const attempt = data.attempt;
    const totalQuestions = attempt.correctCount + attempt.incorrectCount + attempt.unansweredCount;
    const isDiagnostic = attempt.format === "diagnostic" || attempt.href.includes("/diagnostika/");
    const scoreLabel = attempt.score !== null && attempt.maximumScore !== null
        ? `${attempt.score.toFixed(2).replace(/\.00$/, "")} / ${attempt.maximumScore.toFixed(2).replace(/\.00$/, "")}`
        : totalQuestions > 0
            ? `${attempt.correctCount} / ${totalQuestions}`
            : `${attempt.percentage}%`;
    const diagnosticResultHref = isDiagnostic
        ? `${attempt.href}/natija?attempt=${encodeURIComponent(attempt.id)}`
        : null;

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <Link href="/mening-testlarim" aria-label="Mening testlarimga qaytish">←</Link>
                    <div>
                        <span>URINISH NATIJASI</span>
                        <h1>{attempt.title}</h1>
                        <p>{attempt.category}</p>
                    </div>
                </header>

                <section className={styles.hero}>
                    <div>
                        <span>Natija</span>
                        <strong>{scoreLabel}</strong>
                        <small>{attempt.percentage}%</small>
                    </div>
                    {attempt.grade ? (
                        <div className={styles.gradeBox}>
                            <span>Daraja</span>
                            <strong>{attempt.grade}</strong>
                        </div>
                    ) : null}
                </section>

                <section className={styles.stats}>
                    <article>
                        <span>To‘g‘ri</span>
                        <strong>{attempt.correctCount}</strong>
                    </article>
                    <article>
                        <span>Noto‘g‘ri</span>
                        <strong>{attempt.incorrectCount}</strong>
                    </article>
                    <article>
                        <span>Javobsiz</span>
                        <strong>{attempt.unansweredCount}</strong>
                    </article>
                </section>

                <section className={styles.infoCard}>
                    <div>
                        <span>Yakunlangan vaqt</span>
                        <strong>{formatDate(attempt.completedAt)}</strong>
                    </div>
                    <div>
                        <span>Sarflangan vaqt</span>
                        <strong>{formatDuration(attempt.durationSeconds)}</strong>
                    </div>
                    {attempt.certificateCode ? (
                        <div>
                            <span>Sertifikat ID</span>
                            <strong>{attempt.certificateCode}</strong>
                        </div>
                    ) : null}
                </section>

                <div className={styles.actions}>
                    <Link className={styles.primary} href={attempt.href}>
                        Yana ishlash
                    </Link>
                    {diagnosticResultHref ? (
                        <Link className={styles.secondary} href={diagnosticResultHref}>
                            Diagnostika natijasi
                        </Link>
                    ) : null}
                </div>

                <p className={styles.note}>
                    Bu sahifadagi urinish tarixi hisobingizdagi ma’lumotlardan yuklandi va boshqa qurilmada ham ko‘rinadi.
                </p>
            </div>
            <MobileNavigation />
        </main>
    );
}
