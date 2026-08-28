import "server-only";

import { createTelegramAccessToken } from "@/features/auth/model/telegram-access";

function getAppUrl(): string {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configured) return configured.replace(/\/$/, "");

    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (productionHost) return `https://${productionHost.replace(/\/$/, "")}`;

    const vercelHost = process.env.VERCEL_URL?.trim();
    if (vercelHost) return `https://${vercelHost.replace(/\/$/, "")}`;

    return "https://talimot.vercel.app";
}

function safeDestination(destination: string): string {
    if (!destination.startsWith("/") || destination.startsWith("//")) return "/";
    return destination;
}

/**
 * Creates a signed Telegram Mini App entry URL for a verified/registered user.
 * Opening this URL refreshes the Telegram access cookie before redirecting to
 * the requested TA'LIMOT page, so the button also works after an old session
 * expires or when the user's chat menu still points at registration.
 */
export function createVerifiedTelegramEntryUrl(
    telegramUserId: number | null | undefined,
    destination = "/",
): string | null {
    if (!telegramUserId || !Number.isSafeInteger(telegramUserId) || telegramUserId < 1) {
        return null;
    }

    const token = createTelegramAccessToken(telegramUserId);
    const params = new URLSearchParams({
        token,
        next: safeDestination(destination),
    });

    return `${getAppUrl()}/api/telegram/access?${params.toString()}`;
}
