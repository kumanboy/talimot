"use client";

import {
    useId,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./login-form.module.css";

type LoginFormProps = {
    destination: string;
};

type LoginValues = {
    phone: string;
    password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
    phone: "+998 ",
    password: "",
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

function validateLogin(values: LoginValues): LoginErrors {
    const errors: LoginErrors = {};
    const phoneDigits = values.phone.replace(/\D/g, "");

    if (
        phoneDigits.length !== 12 ||
        !phoneDigits.startsWith("998")
    ) {
        errors.phone = "Telefon raqamini to‘liq kiriting.";
    }

    if (values.password.length < 8) {
        errors.password =
            "Parol kamida 8 ta belgidan iborat bo‘lishi kerak.";
    }

    return errors;
}

export function LoginForm({
                              destination,
                          }: LoginFormProps) {
    const router = useRouter();
    const headingId = useId();
    const descriptionId = useId();

    const [values, setValues] =
        useState<LoginValues>(initialValues);
    const [errors, setErrors] =
        useState<LoginErrors>({});
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

    const submitLogin = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const validationErrors = validateLogin(values);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        // Frontend-only temporary behavior.
        // Real authentication and session creation will replace this later.
        router.push(destination);
    };

    const openRegistration = () => {
        const encodedDestination =
            encodeURIComponent(destination);

        router.push(
            `/auth/register?next=${encodedDestination}`,
        );
    };

    const openPasswordRecovery = () => {
        const encodedDestination =
            encodeURIComponent(destination);

        router.push(
            `/auth/forgot-password?next=${encodedDestination}`,
        );
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
                    <h1 id={headingId}>Kirish</h1>

                    <p id={descriptionId}>
                        Telefon raqamingiz va parolingiz orqali
                        hisobingizga kiring.
                    </p>
                </section>

                <form
                    className={styles.formCard}
                    onSubmit={submitLogin}
                    noValidate
                >
                    <div className={styles.field}>
                        <label htmlFor="login-phone">
                            Telefon raqami
                        </label>

                        <input
                            id="login-phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+998 90 123 45 67"
                            value={values.phone}
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={
                                errors.phone
                                    ? "login-phone-error"
                                    : "login-phone-helper"
                            }
                            onChange={updatePhone}
                        />

                        {errors.phone ? (
                            <p
                                id="login-phone-error"
                                className={styles.errorText}
                            >
                                {errors.phone}
                            </p>
                        ) : (
                            <p
                                id="login-phone-helper"
                                className={styles.helperText}
                            >
                                Ro‘yxatdan o‘tishda ishlatgan raqamingizni
                                kiriting.
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <div className={styles.passwordHeading}>
                            <label htmlFor="login-password">
                                Parol
                            </label>

                            <button
                                className={styles.recoveryButton}
                                type="button"
                                onClick={openPasswordRecovery}
                            >
                                Parolni unutdingizmi?
                            </button>
                        </div>

                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Parolingizni kiriting"
                            value={values.password}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? "login-password-error"
                                    : undefined
                            }
                            onChange={updatePassword}
                        />

                        {errors.password ? (
                            <p
                                id="login-password-error"
                                className={styles.errorText}
                            >
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Kirilmoqda..."
                            : "Kirish"}
                    </button>
                </form>

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