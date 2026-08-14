"use client";

import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";
import type {
    DiagnosticTestScoreResult,
} from "@/features/national-certificate/model/diagnostic-test-types";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";

import styles from "./diagnostic-certificate-preview.module.css";

type DiagnosticCertificatePreviewProps = {
    readonly testTitle?: string;
    readonly result?: DiagnosticTestScoreResult;
    readonly record: DiagnosticCertificateRecord;
    readonly onClose: () => void;
};

function getPlatformLevel(
    percentage: number,
): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";

    return "Darajaga erishilmadi";
}

function formatDate(
    timestamp: number,
): string {
    return new Intl.DateTimeFormat(
        "uz-UZ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    ).format(new Date(timestamp));
}

function DownloadIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function QrPlaceholder() {
    return (
        <div
            className={styles.qrPlaceholder}
            aria-label="QR tekshiruv kodi keyingi bosqichda ulanadi"
        >
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
        </div>
    );
}

export function DiagnosticCertificatePreview({
    testTitle,
    result,
    record,
    onClose,
}: DiagnosticCertificatePreviewProps) {
    const resolvedTestTitle =
        testTitle ??
        record.result.testTitle;

    const resolvedResult =
        result ?? {
            score:
                record.result.score,
            maximumScore:
                record.result.maximumScore,
            percentage:
                record.result.percentage,
            correctCount:
                record.result.correctCount,
            incorrectCount:
                record.result.incorrectCount,
            unansweredCount:
                record.result.unansweredCount,
            pendingCount:
                record.result.pendingCount,
        };

    const level =
        getPlatformLevel(
            resolvedResult.percentage,
        );

    const handleDownload = () => {
        const body = document.body;
        body.classList.add(styles.printMode);

        const cleanupPrintMode = () => {
            body.classList.remove(styles.printMode);
            window.removeEventListener(
                "afterprint",
                cleanupPrintMode,
            );
        };

        window.addEventListener(
            "afterprint",
            cleanupPrintMode,
        );

        try {
            window.print();
        } catch (error) {
            cleanupPrintMode();
            throw error;
        }
    };

    return (
        <div className={styles.layer}>
            <button
                type="button"
                className={styles.overlay}
                aria-label="Sertifikat oynasini yopish"
                onClick={onClose}
            />

            <section
                className={styles.viewer}
                role="dialog"
                aria-modal="true"
                aria-labelledby="diagnostic-certificate-title"
            >
                <div className={styles.viewerActions}>
                    <button
                        type="button"
                        aria-label="Sertifikatni PDF sifatida saqlash"
                        title="PDF sifatida saqlash"
                        onClick={handleDownload}
                    >
                        <DownloadIcon />
                    </button>

                    <button
                        type="button"
                        aria-label="Sertifikat oynasini yopish"
                        title="Yopish"
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <article className={styles.certificate}>
                    <div className={styles.pattern} aria-hidden="true" />
                    <div className={styles.cornerTop} aria-hidden="true" />
                    <div className={styles.cornerBottom} aria-hidden="true" />

                    <div className={styles.content}>
                        <header className={styles.certificateHeader}>
                        <TalimotLogo className={styles.logo} />

                        <p>
                            TA’LIMOT TA’LIM PLATFORMASI
                        </p>

                        <div className={styles.headingRule} />

                        <h1 id="diagnostic-certificate-title">
                            ONA TILI BO‘YICHA
                            <br />
                            DIAGNOSTIKA NATIJASI SERTIFIKATI
                        </h1>
                    </header>

                    <section className={styles.metaRow}>
                        <div>
                            <span>Sertifikat raqami:</span>
                            <strong>{record.certificateId}</strong>
                        </div>

                        <div>
                            <span>Berilgan sana:</span>
                            <strong>{formatDate(record.issuedAt)}</strong>
                        </div>
                    </section>

                    <section className={styles.identityArea}>
                        <div className={styles.identityRows}>
                            <div>
                                <span>Familiyasi:</span>
                                <strong>{record.owner.lastName}</strong>
                            </div>

                            <div>
                                <span>Ismi:</span>
                                <strong>{record.owner.firstName}</strong>
                            </div>

                            <div>
                                <span>Otasining ismi:</span>
                                <strong>{record.owner.fatherName}</strong>
                            </div>
                        </div>

                        <div className={styles.profileMark} aria-hidden="true">
                            <span />
                            <strong />
                        </div>
                    </section>

                    <div className={styles.divider} />

                    <section className={styles.examDetails}>
                        <div>
                            <span>Umumta’lim fani:</span>
                            <strong>Ona tili va adabiyot</strong>
                        </div>

                        <div>
                            <span>Imtihon turi:</span>
                            <strong>{resolvedTestTitle}</strong>
                        </div>

                        <div>
                            <span>Umumiy to‘plagan bali:</span>
                            <strong>{resolvedResult.score}</strong>
                        </div>

                        <div>
                            <span>Maksimal ball:</span>
                            <strong>{resolvedResult.maximumScore}</strong>
                        </div>

                        <div>
                            <span>Umumiy ballga nisbatan foiz:</span>
                            <strong>{resolvedResult.percentage}%</strong>
                        </div>

                        <div>
                            <span>Sertifikat darajasi:</span>
                            <strong>{level}</strong>
                        </div>
                    </section>

                    <section className={styles.results}>
                        <h2>Test sinovi natijasi</h2>

                        <div>
                            <span>To‘g‘ri javoblar:</span>
                            <strong>{resolvedResult.correctCount}</strong>
                        </div>

                        <div>
                            <span>Noto‘g‘ri javoblar:</span>
                            <strong>{resolvedResult.incorrectCount}</strong>
                        </div>

                        <div>
                            <span>Javobsiz savollar:</span>
                            <strong>{resolvedResult.unansweredCount}</strong>
                        </div>

                        <div>
                            <span>Umumiy ball:</span>
                            <strong>
                                {resolvedResult.score} / {resolvedResult.maximumScore}
                            </strong>
                        </div>
                    </section>

                    <footer className={styles.footer}>
                        <div className={styles.footerDate}>
                            <span>Berilgan sana:</span>
                            <strong>{formatDate(record.issuedAt)}</strong>
                        </div>

                        <div className={styles.verification}>
                            <QrPlaceholder />
                            <small>QR tekshirish keyingi bosqichda</small>
                        </div>

                        <div className={styles.seal}>
                            <span>TA’LIMOT</span>
                            <strong>SERTIFIKAT</strong>
                            <small>DIAGNOSTIKA NATIJASI</small>
                        </div>
                    </footer>

                        <p className={styles.disclaimer}>
                            Ushbu hujjat TA’LIMOT platformasi diagnostika natijasi bo‘lib,
                            rasmiy davlat sertifikati hisoblanmaydi.
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
}
