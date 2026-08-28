"use client";

import { useEffect } from "react";

/**
 * Telegram Mini App presentation only.
 *
 * The Telegram SDK is intentionally loaded after the first render so an
 * external script cannot block TA’LIMOT's initial paint. This setup retries
 * briefly until the SDK is ready, then applies the Mini App presentation.
 */
export function TelegramWebAppSetup() {
    useEffect(() => {
        let cancelled = false;
        let retryTimer: number | undefined;
        let attempts = 0;

        const setup = () => {
            if (cancelled) return;

            const telegramWebApp = window.Telegram?.WebApp;

            if (!telegramWebApp) {
                attempts += 1;
                if (attempts <= 40) {
                    retryTimer = window.setTimeout(setup, 50);
                }
                return;
            }

            telegramWebApp.ready();
            telegramWebApp.expand();

            if (typeof telegramWebApp.disableVerticalSwipes === "function") {
                telegramWebApp.disableVerticalSwipes();
            }
        };

        setup();

        return () => {
            cancelled = true;
            if (retryTimer !== undefined) {
                window.clearTimeout(retryTimer);
            }
        };
    }, []);

    return null;
}
