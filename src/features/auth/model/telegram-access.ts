import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

export const TELEGRAM_ACCESS_COOKIE = "talimot_telegram_access";

const ACCESS_DURATION_SECONDS = 60 * 60 * 24 * 7;

type TelegramAccessPayload = {
    readonly telegramUserId: number;
    readonly expiresAt: number;
};

function getAccessSecret(): string {
    const value = process.env.AUTH_SESSION_SECRET?.trim();

    if (!value || value.length < 32) {
        throw new Error(
            "AUTH_SESSION_SECRET kamida 32 belgidan iborat bo‘lishi kerak.",
        );
    }

    return value;
}

function createSignature(value: string): string {
    return createHmac("sha256", getAccessSecret())
        .update(value)
        .digest("base64url");
}

function signaturesMatch(first: string, second: string): boolean {
    const firstBuffer = Buffer.from(first);
    const secondBuffer = Buffer.from(second);

    if (firstBuffer.length !== secondBuffer.length) {
        return false;
    }

    return timingSafeEqual(firstBuffer, secondBuffer);
}

/**
 * Compact signed token used in Telegram inline URLs.
 * Format: telegramUserId.expiresAtSeconds.signature
 *
 * Keeping the token compact makes Telegram URL buttons more reliable while
 * the HMAC signature prevents a user from changing the Telegram id/expiry.
 */
export function createTelegramAccessToken(telegramUserId: number): string {
    if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) {
        throw new Error("Telegram user ID noto‘g‘ri.");
    }

    const expiresAtSeconds = Math.floor(Date.now() / 1000) +
        ACCESS_DURATION_SECONDS;
    const unsigned = `${telegramUserId}.${expiresAtSeconds}`;
    const signature = createSignature(unsigned);

    return `${unsigned}.${signature}`;
}

export function verifyTelegramAccessToken(
    token: string | undefined,
): TelegramAccessPayload | null {
    if (!token) {
        return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    const [telegramUserIdValue, expiresAtValue, providedSignature] = parts;
    const telegramUserId = Number(telegramUserIdValue);
    const expiresAtSeconds = Number(expiresAtValue);

    if (
        !Number.isSafeInteger(telegramUserId) ||
        telegramUserId <= 0 ||
        !Number.isSafeInteger(expiresAtSeconds) ||
        expiresAtSeconds <= Math.floor(Date.now() / 1000) ||
        !providedSignature
    ) {
        return null;
    }

    const unsigned = `${telegramUserId}.${expiresAtSeconds}`;
    const expectedSignature = createSignature(unsigned);

    if (!signaturesMatch(providedSignature, expectedSignature)) {
        return null;
    }

    return {
        telegramUserId,
        expiresAt: expiresAtSeconds * 1000,
    };
}

export const telegramAccessCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_DURATION_SECONDS,
};
