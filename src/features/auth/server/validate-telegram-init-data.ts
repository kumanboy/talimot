import "server-only";

import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

type TelegramMiniAppUser = {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
};

type TelegramInitDataResult = {
    user: TelegramMiniAppUser;
    authDate: number;
};

const MAX_INIT_DATA_AGE_SECONDS = 60 * 60 * 24;

function getBotToken(): string | null {
    return process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim() || null;
}

function safeHexEqual(first: string, second: string): boolean {
    if (!/^[a-f0-9]{64}$/i.test(first) || !/^[a-f0-9]{64}$/i.test(second)) {
        return false;
    }

    const firstBuffer = Buffer.from(first, "hex");
    const secondBuffer = Buffer.from(second, "hex");

    if (firstBuffer.length !== secondBuffer.length) {
        return false;
    }

    return timingSafeEqual(firstBuffer, secondBuffer);
}

export function validateTelegramInitData(
    initData: string,
): TelegramInitDataResult | null {
    const botToken = getBotToken();

    if (!botToken || !initData) {
        return null;
    }

    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");

    if (!receivedHash) {
        return null;
    }

    params.delete("hash");

    const dataCheckString = Array.from(params.entries())
        .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    const secretKey = createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();

    const expectedHash = createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    if (!safeHexEqual(receivedHash, expectedHash)) {
        return null;
    }

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);

    if (
        !Number.isSafeInteger(authDate) ||
        authDate <= 0 ||
        authDate > now + 30 ||
        now - authDate > MAX_INIT_DATA_AGE_SECONDS
    ) {
        return null;
    }

    const rawUser = params.get("user");

    if (!rawUser) {
        return null;
    }

    try {
        const user = JSON.parse(rawUser) as Partial<TelegramMiniAppUser>;

        if (
            typeof user.id !== "number" ||
            !Number.isSafeInteger(user.id) ||
            user.id <= 0
        ) {
            return null;
        }

        return {
            user: user as TelegramMiniAppUser,
            authDate,
        };
    } catch {
        return null;
    }
}
