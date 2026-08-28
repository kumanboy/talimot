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
import { TalimotLoadingScreen } from "@/components/loading/talimot-loading-screen";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";
import {
    DiagnosticCertificatePreview,
} from "@/features/national-certificate/components/diagnostic-certificate-preview";
import {
    fetchDiagnosticCertificates,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import type {
    DiagnosticCertificateRecord,
} from "@/features/national-certificate/model/diagnostic-certificate-storage";
import {
    defaultUserProfile,
    getProfileFullName,
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

    const [isProfileLoading, setIsProfileLoading] =
        useState(true);

    const [profileError, setProfileError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        void fetchDiagnosticCertificates()
            .then((items) => {
                if (!cancelled) setCertificates(items);
            })
            .catch(() => {
                if (!cancelled) setCertificates([]);
            });

        void fetch("/api/profile", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        })
            .then(async (response) => {
                const payload = await response.json() as {
                    user?: {
                        firstName: string;
                        lastName: string;
                        fatherName: string;
                        phone: string;
                        telegramUsername: string | null;
                    };
                    error?: string;
                };

                if (!response.ok || !payload.user) {
                    throw new Error(payload.error || "Profilni yuklab bo‘lmadi.");
                }

                return payload.user;
            })
            .then((user) => {
                if (cancelled) return;

                const profile: UserProfile = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fatherName: user.fatherName,
                    phone: user.phone,
                    telegramUsername: user.telegramUsername
                        ? `@${user.telegramUsername.replace(/^@/, "")}`
                        : "",
                };

                saveUserProfile(profile);
                setValues(profile);
                setSavedValues(profile);
                setProfileError("");
            })
            .catch((error: unknown) => {
                if (cancelled) return;

                const message = error instanceof Error
                    ? error.message
                    : "Profilni yuklab bo‘lmadi.";

                if (message === "Hisobga kirish talab qilinadi.") {
                    router.replace("/auth/login?next=%2Fprofil");
                    return;
                }

                setProfileError(message);
            })
            .finally(() => {
                if (!cancelled) setIsProfileLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [router]);

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

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setNotice("");

        const normalized: UserProfile = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            fatherName: values.fatherName.trim(),
            phone: savedValues.phone,
            telegramUsername: savedValues.telegramUsername,
        };

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: normalized.firstName,
                    lastName: normalized.lastName,
                    fatherName: normalized.fatherName,
                }),
            });

            const payload = await response.json() as { error?: string };
            if (!response.ok) {
                throw new Error(payload.error || "Profilni saqlab bo‘lmadi.");
            }

            saveUserProfile(normalized);
            setValues(normalized);
            setSavedValues(normalized);
            setIsEditing(false);
            setNotice("Profil ma’lumotlari hisobingizga saqlandi.");
        } catch (error) {
            setNotice(
                error instanceof Error
                    ? error.message
                    : "Profilni saqlab bo‘lmadi.",
            );
        }
    };

    const cancelEditing = () => {
        setValues(savedValues);
        setIsEditing(false);
        setNotice("");
    };

    if (isProfileLoading) {
        return <TalimotLoadingScreen compact />;
    }

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <PendingNavigationButton
                        href="/"
                        aria-label="Bosh sahifaga qaytish"
                        pendingText=""
                    >
                        <BackIcon />
                    </PendingNavigationButton>

                    <div>
                        <span>TA’LIMOT HISOBI</span>
                        <strong>Profil</strong>
                    </div>
                </header>

                {profileError ? (
                    <p className={styles.notice} role="alert">{profileError}</p>
                ) : null}

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
                                ? `${(certificates[0].result.finalScore ?? certificates[0].result.testScore).toFixed(2)} / 75`
                                : "—"}
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

                    <PendingNavigationButton
                        href="/packages"
                        pendingText="Ochilmoqda..."
                    >
                        To‘ldirish
                    </PendingNavigationButton>
                </section>

                <section className={styles.myTestsCard}>
                    <div>
                        <span>NATIJALAR VA TESTLARIM</span>
                        <strong>Barcha testlar va urinishlar tarixi</strong>
                        <p>Sotib olingan testlar, birinchi, oxirgi va eng yaxshi natijalaringizni ko‘ring.</p>
                    </div>
                    <PendingNavigationButton
                        href="/natijalar"
                        pendingText="Ochilmoqda..."
                    >
                        Ochish
                    </PendingNavigationButton>
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
                                disabled
                                readOnly
                            />
                        </label>

                        <label>
                            <span>Telegram username</span>
                            <input
                                type="text"
                                value={values.telegramUsername}
                                disabled
                                readOnly
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
                                                {certificate.result.finalScore === null
                                                    ? `Test: ${certificate.result.testScore.toFixed(2)} / 75`
                                                    : `${certificate.result.finalScore.toFixed(2)} / 75`}
                                            </strong>
                                            <small>
                                                {formatDate(certificate.issuedAt)}
                                                {" · "}
                                                Daraja {certificate.result.grade ?? "—"}
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
