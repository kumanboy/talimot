"use client";

import {
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
};

type RegistrationValues = {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
};

type RegistrationErrors = Partial<
    Record<keyof RegistrationValues, string>
>;

const initialValues: RegistrationValues = {
    firstName: "",
    lastName: "",
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

export function RegistrationForm({
                                     destination,
                                 }: RegistrationFormProps) {
    const router = useRouter();
    const headingId = useId();
    const descriptionId = useId();

    const [values, setValues] =
        useState<RegistrationValues>(initialValues);
    const [errors, setErrors] =
        useState<RegistrationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const submitRegistration = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const validationErrors =
            validateRegistration(values);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        // Frontend-only temporary behavior.
        // Real registration and session creation will replace this later.
        router.push(destination);
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
                    <h1 id={headingId}>Ro‘yxatdan o‘tish</h1>
                    <p id={descriptionId}>
                        Ma’lumotlaringizni kiriting va tayyorgarlikni davom
                        ettiring.
                    </p>
                </section>

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
                        <label htmlFor="registration-phone">
                            Telefon raqami
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
                                Tasdiqlash uchun faol raqam kiriting.
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
                            <span>
                Foydalanish shartlariga roziman
              </span>
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

                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Davom etilmoqda..."
                            : "Davom etish"}
                    </button>
                </form>

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
            </div>
        </main>
    );
}