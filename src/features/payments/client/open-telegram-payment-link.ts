"use client";

/**
 * Opens a Telegram chat correctly from both normal browsers and Telegram Mini Apps.
 * Telegram WebApp.openTelegramLink() keeps the Mini App alive in the background,
 * so callers must not keep their local loading state locked waiting for navigation.
 */
export function openTelegramPaymentLink(url: string): void {
    const webApp = window.Telegram?.WebApp;

    if (typeof webApp?.openTelegramLink === "function") {
        webApp.openTelegramLink(url);
        return;
    }

    window.location.href = url;
}
