"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";
import {
    DiagnosticCertificatePreview,
} from "@/features/national-certificate/components/diagnostic-certificate-preview";
import {
    readDiagnosticCertificates,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import {
    defaultUserProfile,
    getProfileFullName,
    readUserProfile,
    saveUserProfile,
} from "@/features/profile/model/profile-storage";
import type {
    UserProfile,
} from "@/features/profile/model/profile-storage";
import {
    useTangaWallet,
} from "@/features/tanga/hooks/use-tanga-wallet";

import styles from "./profile-page.module.css";

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function WalletIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M15.5 12.5H20v3h-4.5a1.5 1.5 0 0 1 0-3Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
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

function getLevel(
    percentage: number,
): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";

    return "—";
}

export function ProfilePage() {
    const router = useRouter();
    const {
        balance: tangaBalance,
        user: walletUser,
        isLoading: isTangaLoading,
    } = useTangaWallet();

    const [values, setValues] =
        useState<UserProfile>(defaultUserProfile);

    const [savedValues, setSavedValues] =
        useState<UserProfile>(defaultUserProfile);

    const [certificates, setCertificates] =
        useState<
            readonly DiagnosticCertificateRecord[]
        >([]);

    const [selectedCertificate, setSelectedCertificate] =
        useState<DiagnosticCertificateRecord | null>(null);

    const [isEditing, setIsEditing] =
        useState(false);

    const [notice, setNotice] =
        useState("");

    useEffect(() => {
        const profile = readUserProfile();

        setValues(profile);
        setSavedValues(profile);
        setCertificates(
            readDiagnosticCertificates(),
        );
    }, []);

    const fullName =
        getProfileFullName(values);

    const initials = [
        values.firstName,
        values.lastName,
    ]
        .map((part) =>
            part.trim()[0]?.toUpperCase(),
        )
        .filter(Boolean)
        .join("");

    const updateField = (
        field: keyof UserProfile,
        value: string,
    ) => {
        setValues((current) => ({
            ...current,
            [field]: value,
        }));
        setNotice("");
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const normalized: UserProfile = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            fatherName: values.fatherName.trim(),
            phone: values.phone.trim(),
            telegramUsername:
                values.telegramUsername.trim(),
        };

        saveUserProfile(normalized);
        setValues(normalized);
        setSavedValues(normalized);
        setIsEditing(false);
        setNotice(
            "Profil ma’lumotlari ushbu qurilmada saqlandi.",
        );
    };

    const cancelEditing = () => {
        setValues(savedValues);
        setIsEditing(false);
        setNotice("");
    };

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Bosh sahifaga qaytish"
                        onClick={() => router.push("/")}
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>TA’LIMOT HISOBI</span>
                        <strong>Profil</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <div className={styles.avatar}>
                        {initials || "T"}
                    </div>

                    <div className={styles.heroCopy}>
                        <span>FOYDALANUVCHI</span>
                        <h1>
                            {fullName || "Foydalanuvchi"}
                        </h1>
                        <p>
                            {values.telegramUsername}
                            {walletUser ? ` · ID ${walletUser.userNumber}` : ""}
                        </p>
                    </div>
                </section>

                <section className={styles.statsGrid}>
                    <article>
                        <strong>
                            {certificates.length}
                        </strong>
                        <span>Sertifikat</span>
                    </article>
                    <article>
                        <strong>0</strong>
                        <span>Esse tekshiruvi</span>
                    </article>
                    <article>
                        <strong>
                            {certificates[0]
                                ?.result.percentage ?? 0}
                            %
                        </strong>
                        <span>So‘nggi natija</span>
                    </article>
                </section>

                <section className={styles.walletCard}>
                    <span className={styles.cardIcon}>
                        <WalletIcon />
                    </span>

                    <div>
                        <span>TANGA BALANSI</span>
                        <strong>{isTangaLoading ? "… Tanga" : `${tangaBalance} Tanga`}</strong>
                        <p>
                            Xizmatlardan foydalanish uchun
                            Tanga kerak bo‘ladi.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/packages")
                        }
                    >
                        To‘ldirish
                    </button>
                </section>

                <form
                    className={styles.section}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.sectionHeaderRow}>
                        <div className={styles.sectionHeading}>
                            <span>SHAXSIY MA’LUMOTLAR</span>
                            <h2>Profil ma’lumotlari</h2>
                        </div>

                        <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => {
                                setIsEditing(
                                    (current) => !current,
                                );
                                setNotice("");
                            }}
                        >
                            {isEditing
                                ? "Yopish"
                                : "Tahrirlash"}
                        </button>
                    </div>

                    <div className={styles.fields}>
                        <label>
                            <span>Ismi</span>
                            <input
                                type="text"
                                value={values.firstName}
                                disabled={!isEditing}
                                onChange={(event) =>
                                    updateField(
                                        "firstName",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>Familiyasi</span>
                            <input
                                type="text"
                                value={values.lastName}
                                disabled={!isEditing}
                                onChange={(event) =>
                                    updateField(
                                        "lastName",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>Otasining ismi</span>
                            <input
                                type="text"
                                value={values.fatherName}
                                disabled={!isEditing}
                                placeholder={
                                    isEditing
                                        ? "Masalan: Alisher o‘g‘li"
                                        : "Kiritilmagan"
                                }
                                onChange={(event) =>
                                    updateField(
                                        "fatherName",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>Telefon raqami</span>
                            <input
                                type="tel"
                                value={values.phone}
                                disabled={!isEditing}
                                onChange={(event) =>
                                    updateField(
                                        "phone",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>Telegram username</span>
                            <input
                                type="text"
                                value={values.telegramUsername}
                                disabled={!isEditing}
                                onChange={(event) =>
                                    updateField(
                                        "telegramUsername",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                    </div>

                    {isEditing ? (
                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={cancelEditing}
                            >
                                Bekor qilish
                            </button>

                            <button
                                type="submit"
                                className={styles.primaryButton}
                            >
                                Saqlash
                            </button>
                        </div>
                    ) : null}

                    {notice ? (
                        <p
                            className={styles.notice}
                            role="status"
                        >
                            {notice}
                        </p>
                    ) : null}
                </form>

                <section className={styles.certificatesSection}>
                    <div className={styles.sectionHeading}>
                        <span>SERTIFIKATLAR</span>
                        <h2>Sertifikatlarim</h2>
                    </div>

                    {certificates.length > 0 ? (
                        <div className={styles.certificateList}>
                            {certificates.map(
                                (certificate) => (
                                    <article
                                        key={
                                            certificate.attemptId
                                        }
                                        className={
                                            styles.certificateCard
                                        }
                                    >
                                        <div>
                                            <span>
                                                {
                                                    certificate
                                                        .result
                                                        .testTitle
                                                }
                                            </span>
                                            <strong>
                                                {
                                                    certificate
                                                        .result.score
                                                }{" "}
                                                /{" "}
                                                {
                                                    certificate
                                                        .result
                                                        .maximumScore
                                                }
                                            </strong>
                                            <small>
                                                {formatDate(
                                                    certificate.issuedAt,
                                                )}
                                                {" · "}
                                                Daraja{" "}
                                                {getLevel(
                                                    certificate
                                                        .result
                                                        .percentage,
                                                )}
                                            </small>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCertificate(
                                                    certificate,
                                                )
                                            }
                                        >
                                            Ko‘rish
                                        </button>
                                    </article>
                                ),
                            )}
                        </div>
                    ) : (
                        <div className={styles.emptyCertificates}>
                            <strong>
                                Hozircha sertifikat yo‘q
                            </strong>
                            <p>
                                To‘liq diagnostika imtihonini
                                yakunlaganingizdan keyin
                                sertifikat shu yerda saqlanadi.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/tests/milliy-sertifikat/diagnostika",
                                    )
                                }
                            >
                                Diagnostikaga o‘tish
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <MobileNavigation />

            {selectedCertificate ? (
                <DiagnosticCertificatePreview
                    record={selectedCertificate}
                    onClose={() =>
                        setSelectedCertificate(null)
                    }
                />
            ) : null}
        </main>
    );
}
