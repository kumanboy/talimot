"use client";

import { useEffect } from "react";

type TelegramWebApp = {
    ready: () => void;
    expand: () => void;
    disableVerticalSwipes?: () => void;
};

declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}

export function TelegramWebAppSetup() {
    useEffect(() => {
        const telegramWebApp = window.Telegram?.WebApp;

        // When the website is opened in a normal browser there is no
        // Telegram WebApp object, so nothing needs to be changed.
        if (!telegramWebApp) {
            return;
        }

        // Tell Telegram that the Mini App UI is ready to be displayed.
        telegramWebApp.ready();

        // Open the Mini App at the maximum available height.
        telegramWebApp.expand();

        // Prevent vertical swipe gestures from collapsing/closing the
        // Telegram Mini App while the user is scrolling the website.
        if (typeof telegramWebApp.disableVerticalSwipes === "function") {
            telegramWebApp.disableVerticalSwipes();
        }
    }, []);

    return null;
}
