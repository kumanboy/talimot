import "server-only";

import {
    createHash,
    createHmac,
    randomBytes,
    randomInt,
    scryptSync,
    timingSafeEqual,
} from "node:crypto";

export function normalizeUzbekPhone(value: string): string | null {
    const digits = value.replace(/\D/g, "");
    const normalized = digits.startsWith("998") ? digits : `998${digits}`;

    if (!/^998\d{9}$/.test(normalized)) {
        return null;
    }

    return `+${normalized}`;
}

export function hashPassword(password: string): string {
    const salt = randomBytes(16);
    const derived = scryptSync(password, salt, 64);

    return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

function getVerificationSecret(): string {
    const authSecret = process.env.AUTH_SESSION_SECRET?.trim();

    if (authSecret && authSecret.length >= 32) {
        return authSecret;
    }

    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

    if (webhookSecret && webhookSecret.length >= 32) {
        return webhookSecret;
    }

    const botToken = process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim();

    if (botToken) {
        return createHash("sha256")
            .update(`talimot-registration:${botToken}`)
            .digest("hex");
    }

    throw new Error("Telegram registration verification secret topilmadi.");
}

export function createVerificationCode(): string {
    return randomInt(100000, 1000000).toString();
}

export function hashVerificationCode(
    challengeId: string,
    code: string,
): string {
    return createHmac("sha256", getVerificationSecret())
        .update(`${challengeId}:${code}`)
        .digest("base64url");
}

export function verificationCodesMatch(
    challengeId: string,
    code: string,
    expectedHash: string,
): boolean {
    const actualHash = hashVerificationCode(challengeId, code);
    const actual = Buffer.from(actualHash);
    const expected = Buffer.from(expectedHash);

    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
