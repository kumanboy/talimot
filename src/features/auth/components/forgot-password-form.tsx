"use client";

import {
    useId,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./forgot-password-form.module.css";

type ForgotPasswordFormProps = {
    destination: string;
};

type ForgotPasswordStep =
    | "phone"
    | "verification"
    | "new-password"
    | "success";

type ForgotPasswordValues = {
    phone: string;
    verificationCode: string;
    password: string;
    confirmPassword: string;
};

type ForgotPasswordErrors = Partial<
    Record<keyof ForgotPasswordValues, string>
>;

const initialValues: ForgotPasswordValues = {
    phone: "+998 ",
    verificationCode: "",
    password: "",
    confirmPassword: "",
};

function formatUzbekPhone(value: string): string {
    const digits = value
        .replace(/\D/g, "")
        .replace(/^998/, "")
        .slice(0, 9);

    const operatorCode = digits.slice(0, 2);
    const firstPart = digits.slice(2, 5);
    const secondPart = digits.slice(5, 7);
    const thirdPart = digits.slice(7, 9);

    return [
        "+998",
        operatorCode,
        firstPart,
        secondPart,
        thirdPart,
    ]
        .filter(Boolean)
        .join(" ");
}

function validatePhone(phone: string): string | undefined {
    const phoneDigits = phone.replace(/\D/g, "");

    if (
        phoneDigits.length !== 12 ||
        !phoneDigits.startsWith("998")
    ) {
        return "Telefon raqamini to‘liq kiriting.";
    }

    return undefined;
}

function validateVerificationCode(
    verificationCode: string,
): string | undefined {
    if (!/^\d{6}$/.test(verificationCode)) {
        return "6 xonali tasdiqlash kodini kiriting.";
    }

    return undefined;
}

function validatePasswords(
    password: string,
    confirmPassword: string,
): ForgotPasswordErrors {
    const errors: ForgotPasswordErrors = {};

    if (password.length < 8) {
        errors.password =
            "Parol kamida 8 ta belgidan iborat bo‘lsin.";
    }

    if (confirmPassword !== password) {
        errors.confirmPassword =
            "Parollar bir-biriga mos emas.";
    }

    return errors;
}

export function ForgotPasswordForm({
                                       destination,
                                   }: ForgotPasswordFormProps) {
    const router = useRouter();
    const headingId = useId();
    const descriptionId = useId();

    const [step, setStep] =
        useState<ForgotPasswordStep>("phone");
    const [values, setValues] =
        useState<ForgotPasswordValues>(initialValues);
    const [errors, setErrors] =
        useState<ForgotPasswordErrors>({});
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const updatePhone = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const phone = formatUzbekPhone(
            event.currentTarget.value,
        );

        setValues((currentValues) => ({
            ...currentValues,
            phone,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            phone: undefined,
        }));
    };

    const updateVerificationCode = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const verificationCode = event.currentTarget.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setValues((currentValues) => ({
            ...currentValues,
            verificationCode,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            verificationCode: undefined,
        }));
    };

    const updatePassword = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const password = event.currentTarget.value;

        setValues((currentValues) => ({
            ...currentValues,
            password,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            password: undefined,
        }));
    };

    const updateConfirmPassword = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const confirmPassword = event.currentTarget.value;

        setValues((currentValues) => ({
            ...currentValues,
            confirmPassword,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            confirmPassword: undefined,
        }));
    };

    const submitPhone = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const phoneError = validatePhone(values.phone);

        if (phoneError) {
            setErrors({
                phone: phoneError,
            });
            return;
        }

        setIsSubmitting(true);

        // Frontend-only vaqtinchalik oqim.
        // Haqiqiy SMS yuborish backend bosqichida qo‘shiladi.
        setTimeout(() => {
            setIsSubmitting(false);
            setStep("verification");
        }, 300);
    };

    const submitVerificationCode = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const codeError = validateVerificationCode(
            values.verificationCode,
        );

        if (codeError) {
            setErrors({
                verificationCode: codeError,
            });
            return;
        }

        setIsSubmitting(true);

        // Hozircha frontend-only:
        // istalgan 6 xonali kod qabul qilinadi.
        setTimeout(() => {
            setIsSubmitting(false);
            setStep("new-password");
        }, 300);
    };

    const submitNewPassword = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const validationErrors = validatePasswords(
            values.password,
            values.confirmPassword,
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        // Haqiqiy parol yangilash backend bosqichida qo‘shiladi.
        setTimeout(() => {
            setIsSubmitting(false);
            setStep("success");
        }, 300);
    };

    const openLogin = () => {
        const encodedDestination =
            encodeURIComponent(destination);

        router.push(
            `/auth/login?next=${encodedDestination}`,
        );
    };

    const openRegistration = () => {
        const encodedDestination =
            encodeURIComponent(destination);

        router.push(
            `/auth/register?next=${encodedDestination}`,
        );
    };

    const getHeading = () => {
        if (step === "phone") {
            return "Parolni tiklash";
        }

        if (step === "verification") {
            return "Tasdiqlash kodi";
        }

        if (step === "new-password") {
            return "Yangi parol";
        }

        return "Parol yangilandi";
    };

    const getDescription = () => {
        if (step === "phone") {
            return "Hisobingizga biriktirilgan telefon raqamini kiriting.";
        }

        if (step === "verification") {
            return `${values.phone} raqamiga yuborilgan 6 xonali kodni kiriting.`;
        }

        if (step === "new-password") {
            return "Hisobingiz uchun yangi xavfsiz parol yarating.";
        }

        return "Endi yangi parolingiz orqali hisobingizga kirishingiz mumkin.";
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
          <span className={styles.stepLabel}>
            {step === "phone"
                ? "1-qadam"
                : step === "verification"
                    ? "2-qadam"
                    : step === "new-password"
                        ? "3-qadam"
                        : "Tayyor"}
          </span>

                    <h1 id={headingId}>{getHeading()}</h1>

                    <p id={descriptionId}>{getDescription()}</p>
                </section>

                {step === "phone" ? (
                    <form
                        className={styles.formCard}
                        onSubmit={submitPhone}
                        noValidate
                    >
                        <div className={styles.field}>
                            <label htmlFor="forgot-password-phone">
                                Telefon raqami
                            </label>

                            <input
                                id="forgot-password-phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="+998 90 123 45 67"
                                value={values.phone}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                    errors.phone
                                        ? "forgot-password-phone-error"
                                        : "forgot-password-phone-helper"
                                }
                                onChange={updatePhone}
                            />

                            {errors.phone ? (
                                <p
                                    id="forgot-password-phone-error"
                                    className={styles.errorText}
                                >
                                    {errors.phone}
                                </p>
                            ) : (
                                <p
                                    id="forgot-password-phone-helper"
                                    className={styles.helperText}
                                >
                                    Ro‘yxatdan o‘tishda ishlatgan
                                    raqamingizni kiriting.
                                </p>
                            )}
                        </div>

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Yuborilmoqda..."
                                : "Tasdiqlash kodini yuborish"}
                        </button>
                    </form>
                ) : null}

                {step === "verification" ? (
                    <form
                        className={styles.formCard}
                        onSubmit={submitVerificationCode}
                        noValidate
                    >
                        <div className={styles.field}>
                            <label htmlFor="forgot-password-code">
                                Tasdiqlash kodi
                            </label>

                            <input
                                id="forgot-password-code"
                                className={styles.codeInput}
                                name="verificationCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="000000"
                                value={values.verificationCode}
                                maxLength={6}
                                aria-invalid={Boolean(
                                    errors.verificationCode,
                                )}
                                aria-describedby={
                                    errors.verificationCode
                                        ? "forgot-password-code-error"
                                        : "forgot-password-code-helper"
                                }
                                onChange={updateVerificationCode}
                            />

                            {errors.verificationCode ? (
                                <p
                                    id="forgot-password-code-error"
                                    className={styles.errorText}
                                >
                                    {errors.verificationCode}
                                </p>
                            ) : (
                                <p
                                    id="forgot-password-code-helper"
                                    className={styles.helperText}
                                >
                                    Hozircha istalgan 6 xonali kodni
                                    kiriting.
                                </p>
                            )}
                        </div>

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Tekshirilmoqda..."
                                : "Kodni tasdiqlash"}
                        </button>

                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={() => {
                                setErrors({});
                                setValues((currentValues) => ({
                                    ...currentValues,
                                    verificationCode: "",
                                }));
                                setStep("phone");
                            }}
                        >
                            Telefon raqamini o‘zgartirish
                        </button>
                    </form>
                ) : null}

                {step === "new-password" ? (
                    <form
                        className={styles.formCard}
                        onSubmit={submitNewPassword}
                        noValidate
                    >
                        <div className={styles.field}>
                            <label htmlFor="forgot-password-new-password">
                                Yangi parol
                            </label>

                            <input
                                id="forgot-password-new-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Yangi parol kiriting"
                                value={values.password}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password
                                        ? "forgot-password-new-password-error"
                                        : "forgot-password-new-password-helper"
                                }
                                onChange={updatePassword}
                            />

                            {errors.password ? (
                                <p
                                    id="forgot-password-new-password-error"
                                    className={styles.errorText}
                                >
                                    {errors.password}
                                </p>
                            ) : (
                                <p
                                    id="forgot-password-new-password-helper"
                                    className={styles.helperText}
                                >
                                    Kamida 8 ta belgidan foydalaning.
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="forgot-password-confirm-password">
                                Yangi parolni tasdiqlang
                            </label>

                            <input
                                id="forgot-password-confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Yangi parolni qayta kiriting"
                                value={values.confirmPassword}
                                aria-invalid={Boolean(
                                    errors.confirmPassword,
                                )}
                                aria-describedby={
                                    errors.confirmPassword
                                        ? "forgot-password-confirm-password-error"
                                        : undefined
                                }
                                onChange={updateConfirmPassword}
                            />

                            {errors.confirmPassword ? (
                                <p
                                    id="forgot-password-confirm-password-error"
                                    className={styles.errorText}
                                >
                                    {errors.confirmPassword}
                                </p>
                            ) : null}
                        </div>

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Yangilanmoqda..."
                                : "Parolni yangilash"}
                        </button>
                    </form>
                ) : null}

                {step === "success" ? (
                    <section
                        className={styles.successCard}
                        aria-live="polite"
                    >
                        <div
                            className={styles.successIcon}
                            aria-hidden="true"
                        >
                            ✓
                        </div>

                        <h2>Parolingiz muvaffaqiyatli yangilandi</h2>

                        <p>
                            Yangi parolingiz orqali hisobingizga
                            kirishingiz mumkin.
                        </p>

                        <button
                            className={styles.submitButton}
                            type="button"
                            onClick={openLogin}
                        >
                            Kirish sahifasiga o‘tish
                        </button>
                    </section>
                ) : null}

                {step !== "success" ? (
                    <p className={styles.loginPrompt}>
                        Parolingizni esladingizmi?{" "}
                        <button
                            type="button"
                            onClick={openLogin}
                        >
                            Kirish
                        </button>
                    </p>
                ) : null}

                <p className={styles.registrationPrompt}>
                    Hisobingiz yo‘qmi?{" "}
                    <button
                        type="button"
                        onClick={openRegistration}
                    >
                        Ro‘yxatdan o‘tish
                    </button>
                </p>
            </div>
        </main>
    );
}