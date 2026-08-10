import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

export const TELEGRAM_ACCESS_COOKIE = "talimot_telegram_access";

const ACCESS_DURATION_SECONDS = 60 * 60 * 24 * 7;

type TelegramAccessPayload = {
    readonly telegramUserId: number;
    readonly issuedAt: number;
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

function encodeBase64Url(value: string): string {
    return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
    return Buffer.from(value, "base64url").toString("utf8");
}

function createSignature(encodedPayload: string): string {
    return createHmac("sha256", getAccessSecret())
        .update(encodedPayload)
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

export function createTelegramAccessToken(telegramUserId: number): string {
    const issuedAt = Date.now();
    const payload: TelegramAccessPayload = {
        telegramUserId,
        issuedAt,
        expiresAt: issuedAt + ACCESS_DURATION_SECONDS * 1000,
    };

    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signature = createSignature(encodedPayload);

    return `${encodedPayload}.${signature}`;
}

export function verifyTelegramAccessToken(
    token: string | undefined,
): TelegramAccessPayload | null {
    if (!token) {
        return null;
    }

    const [encodedPayload, providedSignature] = token.split(".");

    if (!encodedPayload || !providedSignature) {
        return null;
    }

    const expectedSignature = createSignature(encodedPayload);

    if (!signaturesMatch(providedSignature, expectedSignature)) {
        return null;
    }

    try {
        const payload = JSON.parse(
            decodeBase64Url(encodedPayload),
        ) as Partial<TelegramAccessPayload>;

        if (
            typeof payload.telegramUserId !== "number" ||
            !Number.isSafeInteger(payload.telegramUserId) ||
            typeof payload.expiresAt !== "number" ||
            payload.expiresAt <= Date.now()
        ) {
            return null;
        }

        return payload as TelegramAccessPayload;
    } catch {
        return null;
    }
}

export const telegramAccessCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_DURATION_SECONDS,
};
