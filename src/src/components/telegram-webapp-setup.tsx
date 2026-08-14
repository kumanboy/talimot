"use client";

import { useEffect } from "react";

/**
 * Telegram Mini App presentation only.
 *
 * Access control is intentionally NOT performed here. The bot creates a
 * per-user signed entry URL only after getChatMember succeeds, and protected
 * server routes re-check membership. Keeping auth out of this client component
 * avoids initData compatibility problems across Telegram client versions.
 */
export function TelegramWebAppSetup() {
    useEffect(() => {
        const telegramWebApp = window.Telegram?.WebApp;

        if (!telegramWebApp) {
            return;
        }

        telegramWebApp.ready();
        telegramWebApp.expand();

        if (typeof telegramWebApp.disableVerticalSwipes === "function") {
            telegramWebApp.disableVerticalSwipes();
        }
    }, []);

    return null;
}
