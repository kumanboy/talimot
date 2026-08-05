"use client";

import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";

import styles from "./diagnostic-certificate-preview.module.css";

type DiagnosticCertificatePreviewProps = {
    readonly record: DiagnosticCertificateRecord;
    readonly onClose: () => void;
};

function safeNumber(
    value: unknown,
): number {
    return typeof value === "number" &&
        Number.isFinite(value)
        ? value
        : 0;
}

function formatScore(
    value: unknown,
): string {
    const number = safeNumber(value);

    return Number.isInteger(number)
        ? String(number)
        : number.toFixed(1);
}

function getPlatformLevel(
    percentageValue: unknown,
): string {
    const percentage =
        safeNumber(percentageValue);

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";

    return "Darajaga erishilmadi";
}

function getResultStatus(
    percentageValue: unknown,
): string {
    const percentage =
        safeNumber(percentageValue);

    if (percentage >= 90) {
        return "Juda yuqori diagnostika natijasi";
    }

    if (percentage >= 80) {
        return "Yuqori diagnostika natijasi";
    }

    if (percentage >= 70) {
        return "Yaxshi diagnostika natijasi";
    }

    if (percentage >= 60) {
        return "O‘rta-yuqori diagnostika natijasi";
    }

    if (percentage >= 50) {
        return "O‘rta diagnostika natijasi";
    }

    if (percentage >= 40) {
        return "Boshlang‘ich diagnostika darajasi";
    }

    return "Sertifikat darajasiga hali erishilmadi";
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

export function DiagnosticCertificatePreview({
    record,
    onClose,
}: DiagnosticCertificatePreviewProps) {
    const {
        result,
        owner,
    } = record;

    const percentage =
        safeNumber(result.percentage);

    const handleDownload = () => {
        window.print();
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
                    <div className={styles.content}>
                        <header className={styles.certificateHeader}>
                            <TalimotLogo className={styles.logo} />

                            <p>TA’LIMOT TA’LIM PLATFORMASI</p>

                            <div className={styles.headingRule} />

                            <h1 id="diagnostic-certificate-title">
                                ONA TILI BO‘YICHA
                                <br />
                                DIAGNOSTIKA NATIJASI
                                <br />
                                SERTIFIKATI
                            </h1>
                        </header>

                        <section className={styles.metaRow}>
                            <div>
                                <span>Sertifikat raqami:</span>
                                <strong>
                                    {record.certificateId}
                                </strong>
                            </div>

                            <div>
                                <span>Berilgan sana:</span>
                                <strong>
                                    {formatDate(record.issuedAt)}
                                </strong>
                            </div>
                        </section>

                        <section className={styles.identityArea}>
                            <div className={styles.identityRows}>
                                <div>
                                    <span>Familiyasi:</span>
                                    <strong>{owner.lastName}</strong>
                                </div>

                                <div>
                                    <span>Ismi:</span>
                                    <strong>{owner.firstName}</strong>
                                </div>

                                <div>
                                    <span>Otasining ismi:</span>
                                    <strong>{owner.fatherName}</strong>
                                </div>
                            </div>

                            <div
                                className={styles.profileMark}
                                aria-hidden="true"
                            >
                                <span />
                                <strong />
                            </div>
                        </section>

                        <div className={styles.divider} />

                        <section className={styles.examDetails}>
                            <div>
                                <span>Umumta’lim fani:</span>
                                <strong>{result.subject}</strong>
                            </div>

                            <div>
                                <span>Imtihon turi:</span>
                                <strong>{result.testTitle}</strong>
                            </div>

                            <div>
                                <span>Umumiy to‘plagan bali:</span>
                                <strong>{formatScore(result.score)}</strong>
                            </div>

                            <div>
                                <span>Maksimal ball:</span>
                                <strong>
                                    {formatScore(result.maximumScore)}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Umumiy ballga nisbatan foiz:
                                </span>
                                <strong>{percentage}%</strong>
                            </div>

                            <div>
                                <span>Sertifikat darajasi:</span>
                                <strong>
                                    {getPlatformLevel(percentage)}
                                </strong>
                            </div>

                            <div>
                                <span>Natija holati:</span>
                                <strong>
                                    {getResultStatus(percentage)}
                                </strong>
                            </div>
                        </section>

                        <section className={styles.results}>
                            <h2>Test sinovi natijasi</h2>

                            <div>
                                <span>To‘g‘ri javoblar:</span>
                                <strong>{result.correctCount}</strong>
                            </div>

                            <div>
                                <span>Noto‘g‘ri javoblar:</span>
                                <strong>{result.incorrectCount}</strong>
                            </div>

                            <div>
                                <span>Javobsiz savollar:</span>
                                <strong>{result.unansweredCount}</strong>
                            </div>

                            <div>
                                <span>Umumiy ball:</span>
                                <strong>
                                    {formatScore(result.score)} /{" "}
                                    {formatScore(result.maximumScore)}
                                </strong>
                            </div>
                        </section>

                        <footer className={styles.footer}>
                            <div className={styles.footerDate}>
                                <span>Berilgan sana:</span>
                                <strong>
                                    {formatDate(record.issuedAt)}
                                </strong>
                            </div>

                            <div className={styles.verification}>
                                <div className={styles.qrPlaceholder}>
                                    {Array.from(
                                        { length: 9 },
                                        (_, index) => (
                                            <span key={index} />
                                        ),
                                    )}
                                </div>
                                <small>
                                    QR tekshirish keyingi
                                    bosqichda ulanadi
                                </small>
                            </div>

                            <div className={styles.seal}>
                                <span>TA’LIMOT</span>
                                <strong>SERTIFIKAT</strong>
                                <small>DIAGNOSTIKA NATIJASI</small>
                            </div>
                        </footer>

                        <p className={styles.disclaimer}>
                            Ushbu hujjat TA’LIMOT platformasi
                            diagnostika natijasi bo‘lib,
                            rasmiy davlat sertifikati hisoblanmaydi.
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
}
