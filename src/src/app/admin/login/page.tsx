"use client";

import {
    FormEvent,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";

import styles from "../admin.module.css";

function LockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M8 10V7a4 4 0 0 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function AdminLoginPage() {
    const router =
        useRouter();

    const [
        accessCode,
        setAccessCode,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const handleSubmit = async (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (
            !accessCode.trim() ||
            isSubmitting
        ) {
            return;
        }

        setMessage("");
        setIsSubmitting(true);

        try {
            const response =
                await fetch(
                    "/api/admin/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            accessCode,
                        }),
                    },
                );

            const data =
                await response.json() as {
                    message?: string;
                };

            if (!response.ok) {
                setMessage(
                    data.message ??
                        "Kirish amalga oshmadi.",
                );
                return;
            }

            router.replace("/admin");
            router.refresh();
        } catch {
            setMessage(
                "Server bilan bog‘lanib bo‘lmadi.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.loginPage}>
            <section
                className={styles.mobileBlock}
            >
                <div
                    className={
                        styles.mobileBlockIcon
                    }
                    aria-hidden="true"
                >
                    ↗
                </div>

                <span>
                    ADMIN PANEL
                </span>

                <h1>
                    Kompyuterda oching
                </h1>

                <p>
                    Admin panel faqat laptop yoki
                    desktop ekranlarda ishlaydi.
                </p>
            </section>

            <section className={styles.loginCard}>
                <TalimotLogo
                    className={styles.loginLogo}
                />

                <div className={styles.lockIcon}>
                    <LockIcon />
                </div>

                <span className={styles.eyebrow}>
                    HIMOYALANGAN HUDUD
                </span>

                <h1>
                    Admin panelga kirish
                </h1>

                <p>
                    Davom etish uchun serverda
                    belgilangan maxfiy access
                    code’ni kiriting.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className={styles.loginForm}
                >
                    <label>
                        <span>
                            Admin access code
                        </span>

                        <input
                            type="password"
                            value={accessCode}
                            autoComplete="current-password"
                            placeholder="Maxfiy kodni kiriting"
                            disabled={isSubmitting}
                            onChange={(event) => {
                                setAccessCode(
                                    event.target.value,
                                );
                                setMessage("");
                            }}
                        />
                    </label>

                    {message ? (
                        <p
                            className={
                                styles.loginError
                            }
                            role="alert"
                        >
                            {message}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !accessCode.trim()
                        }
                    >
                        {isSubmitting
                            ? "Tekshirilmoqda..."
                            : "Admin panelga kirish"}
                    </button>
                </form>

                <small>
                    Kod browser source’ida
                    saqlanmaydi va server orqali
                    tekshiriladi.
                </small>
            </section>
        </main>
    );
}
