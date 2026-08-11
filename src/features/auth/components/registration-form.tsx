"use client";

import {
    useEffect,
    useId,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./registration-form.module.css";

type RegistrationFormProps = {
    destination: string;
    roadmapMode: "from-zero" | "boost";
};

type RegistrationValues = {
    firstName: string;
    lastName: string;
    fatherName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
};

type RegistrationErrors = Partial<
    Record<keyof RegistrationValues, string>
>;

type VerificationState = {
    challengeId: string;
    botUrl: string;
};

type ApiErrorResponse = {
    error?: string;
};

const PENDING_REGISTRATION_KEY = "talimot_pending_registration";
const PENDING_REGISTRATION_MAX_AGE_MS = 20 * 60 * 1000;

const initialValues: RegistrationValues = {
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "+998 ",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
};

function formatUzbekPhone(value: string) {
    const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);

    const firstPart = digits.slice(0, 2);
    const secondPart = digits.slice(2, 5);
    const thirdPart = digits.slice(5, 7);
    const fourthPart = digits.slice(7, 9);

    return [
        "+998",
        firstPart,
        secondPart,
        thirdPart,
        fourthPart,
    ]
        .filter(Boolean)
        .join(" ");
}

function validateRegistration(
    values: RegistrationValues,
): RegistrationErrors {
    const errors: RegistrationErrors = {};
    const phoneDigits = values.phone.replace(/\D/g, "");

    if (values.firstName.trim().length < 2) {
        errors.firstName = "Ismingizni to‘liq kiriting.";
    }

    if (values.lastName.trim().length < 2) {
        errors.lastName = "Familiyangizni to‘liq kiriting.";
    }

    if (values.fatherName.trim().length < 2) {
        errors.fatherName = "Otangizning ismini to‘liq kiriting.";
    }

    if (phoneDigits.length !== 12 || !phoneDigits.startsWith("998")) {
        errors.phone = "Telefon raqamini to‘liq kiriting.";
    }

    if (values.password.length < 8) {
        errors.password = "Parol kamida 8 ta belgidan iborat bo‘lsin.";
    }

    if (values.confirmPassword !== values.password) {
        errors.confirmPassword = "Parollar bir-biriga mos emas.";
    }

    if (!values.acceptedTerms) {
        errors.acceptedTerms =
            "Davom etish uchun foydalanish shartlariga rozilik bildiring.";
    }

    return errors;
}

function openTelegramLink(url: string) {
    const telegramWindow = window as typeof window & {
        Telegram?: {
            WebApp?: {
                openTelegramLink?: (link: string) => void;
            };
        };
    };

    const openInTelegram = telegramWindow.Telegram?.WebApp?.openTelegramLink;

    if (typeof openInTelegram === "function") {
        openInTelegram(url);
        return;
    }

    window.location.href = url;
}

export function RegistrationForm({
    destination,
    roadmapMode,
}: RegistrationFormProps) {
    const router = useRouter();
    const headingId = useId();
    const descriptionId = useId();

    const [values, setValues] =
        useState<RegistrationValues>(initialValues);
    const [errors, setErrors] =
        useState<RegistrationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verification, setVerification] =
        useState<VerificationState | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(PENDING_REGISTRATION_KEY);

            if (!stored) {
                return;
            }

            const pending = JSON.parse(stored) as VerificationState & {
                createdAt?: number;
            };

            if (
                !pending.challengeId ||
                !pending.botUrl ||
                typeof pending.createdAt !== "number" ||
                Date.now() - pending.createdAt > PENDING_REGISTRATION_MAX_AGE_MS
            ) {
                window.localStorage.removeItem(PENDING_REGISTRATION_KEY);
                return;
            }

            setVerification({
                challengeId: pending.challengeId,
                botUrl: pending.botUrl,
            });
        } catch {
            window.localStorage.removeItem(PENDING_REGISTRATION_KEY);
        }
    }, []);

    const updateTextField =
        (
            field: Exclude<
                keyof RegistrationValues,
                "acceptedTerms"
            >,
        ) =>
            (event: ChangeEvent<HTMLInputElement>) => {
                const nextValue =
                    field === "phone"
                        ? formatUzbekPhone(event.currentTarget.value)
                        : event.currentTarget.value;

                setValues((currentValues) => ({
                    ...currentValues,
                    [field]: nextValue,
                }));

                setErrors((currentErrors) => ({
                    ...currentErrors,
                    [field]: undefined,
                }));
            };

    const updateTerms = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const isChecked = event.currentTarget.checked;

        setValues((currentValues) => ({
            ...currentValues,
            acceptedTerms: isChecked,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            acceptedTerms: undefined,
        }));
    };

    const submitRegistration = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const validationErrors = validateRegistration(values);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setVerificationError(null);

        try {
            const response = await fetch("/api/auth/register/start", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fatherName: values.fatherName,
                    phone: values.phone,
                    password: values.password,
                    destination,
                    roadmapMode,
                }),
            });

            const payload = (await response.json()) as ApiErrorResponse &
                Partial<VerificationState>;

            if (
                !response.ok ||
                !payload.challengeId ||
                !payload.botUrl
            ) {
                setVerificationError(
                    payload.error ??
                        "Ro‘yxatdan o‘tishni boshlashda xatolik yuz berdi.",
                );
                return;
            }

            const nextVerification = {
                challengeId: payload.challengeId,
                botUrl: payload.botUrl,
            };

            setVerification(nextVerification);
            setVerificationCode("");

            window.localStorage.setItem(
                PENDING_REGISTRATION_KEY,
                JSON.stringify({
                    ...nextVerification,
                    createdAt: Date.now(),
                }),
            );
        } catch {
            setVerificationError(
                "Internet aloqasini tekshirib, qayta urinib ko‘ring.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitVerification = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!verification || verificationCode.length !== 6) {
            setVerificationError("6 xonali tasdiqlash kodini kiriting.");
            return;
        }

        setIsVerifying(true);
        setVerificationError(null);

        try {
            const response = await fetch("/api/auth/register/verify", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    challengeId: verification.challengeId,
                    code: verificationCode,
                }),
            });

            const payload = (await response.json()) as ApiErrorResponse & {
                ok?: boolean;
                destination?: string;
            };

            if (!response.ok || !payload.ok) {
                setVerificationError(
                    payload.error ?? "Tasdiqlash kodi qabul qilinmadi.",
                );
                return;
            }

            window.localStorage.removeItem(PENDING_REGISTRATION_KEY);
            router.replace(payload.destination ?? destination);
            router.refresh();
        } catch {
            setVerificationError(
                "Internet aloqasini tekshirib, qayta urinib ko‘ring.",
            );
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <main
            className={styles.screen}
            aria-labelledby={headingId}
            aria-describedby={descriptionId}
        >
            <div
                className={`${styles.decorativeShape} ${styles.topShape}`}
                aria-hidden="true"
            />
            <div
                className={`${styles.decorativeShape} ${styles.leftShape}`}
                aria-hidden="true"
            />
            <div
                className={`${styles.decorativeShape} ${styles.bottomShape}`}
                aria-hidden="true"
            />

            <div className={styles.shell}>
                <header className={styles.header}>
                    <TalimotLogo />
                </header>

                <section className={styles.introduction}>
                    <h1 id={headingId}>
                        {verification
                            ? "Telegram orqali tasdiqlash"
                            : "Ro‘yxatdan o‘tish"}
                    </h1>
                    <p id={descriptionId}>
                        {verification
                            ? "Telefon raqamingizni Telegram bot orqali tasdiqlang."
                            : "Ma’lumotlaringizni kiriting va tayyorgarlikni davom ettiring."}
                    </p>
                </section>

                {verification ? (
                    <form
                        className={`${styles.formCard} ${styles.verificationCard}`}
                        onSubmit={submitVerification}
                        noValidate
                    >
                        <div className={styles.verificationIcon} aria-hidden="true">
                            🔐
                        </div>

                        <div className={styles.verificationCopy}>
                            <h2>Telegram raqamingizni tasdiqlang</h2>
                            <p>
                                Botni oching va <strong>“📱 Telegram raqamimni ulashish”</strong>
                                tugmasini bosing. Bot sizga 6 xonali kod yuboradi.
                            </p>
                        </div>

                        <button
                            className={styles.telegramButton}
                            type="button"
                            onClick={() => openTelegramLink(verification.botUrl)}
                        >
                            Telegram botni ochish
                        </button>

                        <div className={styles.field}>
                            <label htmlFor="registration-verification-code">
                                Tasdiqlash kodi
                            </label>
                            <input
                                id="registration-verification-code"
                                className={styles.codeInput}
                                name="verificationCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                aria-invalid={Boolean(verificationError)}
                                onChange={(event) => {
                                    setVerificationCode(
                                        event.currentTarget.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6),
                                    );
                                    setVerificationError(null);
                                }}
                            />
                            <p className={styles.helperText}>
                                Telegram bot yuborgan 6 xonali kodni kiriting.
                            </p>
                        </div>

                        {verificationError ? (
                            <div className={styles.formError} role="alert">
                                {verificationError}
                            </div>
                        ) : null}

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isVerifying || verificationCode.length !== 6}
                        >
                            {isVerifying
                                ? "Tasdiqlanmoqda..."
                                : "Tasdiqlash va ro‘yxatdan o‘tish"}
                        </button>

                        <button
                            className={styles.secondaryButton}
                            type="button"
                            disabled={isVerifying}
                            onClick={() => {
                                setVerification(null);
                                setVerificationCode("");
                                setVerificationError(null);
                                window.localStorage.removeItem(
                                    PENDING_REGISTRATION_KEY,
                                );
                            }}
                        >
                            Ma’lumotlarni o‘zgartirish
                        </button>
                    </form>
                ) : (
                    <form
                        className={styles.formCard}
                        onSubmit={submitRegistration}
                        noValidate
                    >
                        <div className={styles.field}>
                            <label htmlFor="registration-first-name">
                                Ism
                            </label>
                            <input
                                id="registration-first-name"
                                name="firstName"
                                type="text"
                                autoComplete="given-name"
                                placeholder="Ismingizni kiriting"
                                value={values.firstName}
                                aria-invalid={Boolean(errors.firstName)}
                                aria-describedby={
                                    errors.firstName
                                        ? "registration-first-name-error"
                                        : undefined
                                }
                                onChange={updateTextField("firstName")}
                            />
                            {errors.firstName ? (
                                <p
                                    id="registration-first-name-error"
                                    className={styles.errorText}
                                >
                                    {errors.firstName}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Ismingiz hujjatlardagidek yozilsin.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="registration-last-name">
                                Familiya
                            </label>
                            <input
                                id="registration-last-name"
                                name="lastName"
                                type="text"
                                autoComplete="family-name"
                                placeholder="Familiyangizni kiriting"
                                value={values.lastName}
                                aria-invalid={Boolean(errors.lastName)}
                                aria-describedby={
                                    errors.lastName
                                        ? "registration-last-name-error"
                                        : undefined
                                }
                                onChange={updateTextField("lastName")}
                            />
                            {errors.lastName ? (
                                <p
                                    id="registration-last-name-error"
                                    className={styles.errorText}
                                >
                                    {errors.lastName}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Familiyangizni to‘liq kiriting.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="registration-father-name">
                                Otasining ismi
                            </label>
                            <input
                                id="registration-father-name"
                                name="fatherName"
                                type="text"
                                autoComplete="additional-name"
                                placeholder="Otangizning ismini kiriting"
                                value={values.fatherName}
                                aria-invalid={Boolean(errors.fatherName)}
                                aria-describedby={
                                    errors.fatherName
                                        ? "registration-father-name-error"
                                        : undefined
                                }
                                onChange={updateTextField("fatherName")}
                            />
                            {errors.fatherName ? (
                                <p
                                    id="registration-father-name-error"
                                    className={styles.errorText}
                                >
                                    {errors.fatherName}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Sertifikat va profilingiz uchun hujjatlardagidek kiriting.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="registration-phone">
                                Telegram telefon raqami
                            </label>
                            <input
                                id="registration-phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="+998 90 123 45 67"
                                value={values.phone}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                    errors.phone
                                        ? "registration-phone-error"
                                        : undefined
                                }
                                onChange={updateTextField("phone")}
                            />
                            {errors.phone ? (
                                <p
                                    id="registration-phone-error"
                                    className={styles.errorText}
                                >
                                    {errors.phone}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Telegram hisobingizga ulangan faol raqamni kiriting.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="registration-password">
                                Parol
                            </label>
                            <input
                                id="registration-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Parol yarating"
                                value={values.password}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password
                                        ? "registration-password-error"
                                        : undefined
                                }
                                onChange={updateTextField("password")}
                            />
                            {errors.password ? (
                                <p
                                    id="registration-password-error"
                                    className={styles.errorText}
                                >
                                    {errors.password}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Kamida 8 ta belgidan foydalaning.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="registration-confirm-password">
                                Parolni tasdiqlang
                            </label>
                            <input
                                id="registration-confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Parolni qayta kiriting"
                                value={values.confirmPassword}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={
                                    errors.confirmPassword
                                        ? "registration-confirm-password-error"
                                        : undefined
                                }
                                onChange={updateTextField("confirmPassword")}
                            />
                            {errors.confirmPassword ? (
                                <p
                                    id="registration-confirm-password-error"
                                    className={styles.errorText}
                                >
                                    {errors.confirmPassword}
                                </p>
                            ) : (
                                <p className={styles.helperText}>
                                    Yuqoridagi parolni takrorlang.
                                </p>
                            )}
                        </div>

                        <div className={styles.termsField}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="acceptedTerms"
                                    checked={values.acceptedTerms}
                                    aria-invalid={Boolean(errors.acceptedTerms)}
                                    aria-describedby={
                                        errors.acceptedTerms
                                            ? "registration-terms-error"
                                            : undefined
                                    }
                                    onChange={updateTerms}
                                />
                                <span>Foydalanish shartlariga roziman</span>
                            </label>

                            {errors.acceptedTerms ? (
                                <p
                                    id="registration-terms-error"
                                    className={styles.errorText}
                                >
                                    {errors.acceptedTerms}
                                </p>
                            ) : null}
                        </div>

                        {verificationError ? (
                            <div className={styles.formError} role="alert">
                                {verificationError}
                            </div>
                        ) : null}

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Tayyorlanmoqda..."
                                : "Telegram orqali tasdiqlash"}
                        </button>
                    </form>
                )}

                {!verification ? (
                    <p className={styles.loginPrompt}>
                        Hisobingiz bormi?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                const encodedDestination =
                                    encodeURIComponent(destination);

                                router.push(
                                    `/auth/login?next=${encodedDestination}`,
                                );
                            }}
                        >
                            Kirish
                        </button>
                    </p>
                ) : null}
            </div>
        </main>
    );
}
