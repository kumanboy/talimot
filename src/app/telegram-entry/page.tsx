"use client";

import { useEffect, useState } from "react";

import styles from "./page.module.css";

type SessionResponse = {
    ok: boolean;
    reason?: string;
    redirectTo?: string;
};

export default function TelegramEntryPage() {
    const [message, setMessage] = useState("Obuna tekshirilmoqda...");

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const telegramWebApp = window.Telegram?.WebApp;

            if (!telegramWebApp?.initData) {
                window.location.replace("/access-required?reason=telegram");
                return;
            }

            telegramWebApp.ready();
            telegramWebApp.expand();

            if (typeof telegramWebApp.disableVerticalSwipes === "function") {
                telegramWebApp.disableVerticalSwipes();
            }

            try {
                const response = await fetch("/api/telegram/miniapp-session", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        initData: telegramWebApp.initData,
                        mode: "entry",
                    }),
                    cache: "no-store",
                });

                const payload = await response.json() as SessionResponse;

                if (cancelled) {
                    return;
                }

                if (!response.ok || !payload.ok) {
                    if (payload.reason === "subscription") {
                        window.location.replace(
                            "/access-required?reason=subscription",
                        );
                        return;
                    }

                    window.location.replace(
                        "/access-required?reason=telegram",
                    );
                    return;
                }

                setMessage("Tasdiqlandi. TA’LIMOT ochilmoqda...");
                window.location.replace(payload.redirectTo || "/");
            } catch {
                window.location.replace("/access-required?reason=network");
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className={styles.screen}>
            <div className={styles.loader} aria-hidden="true" />
            <p>{message}</p>
        </main>
    );
}
