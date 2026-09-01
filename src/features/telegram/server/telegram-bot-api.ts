import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

const DEFAULT_TELEGRAM_ADMIN_USERNAME = "husan_davronov";

function requireEnvironment(key: string): string {
    const value = process.env[key]?.trim();

    if (!value) {
        throw new Error(`${key} environment variable is not configured.`);
    }

    return value;
}

export function getTelegramBotToken(): string {
    return requireEnvironment("TELEGRAM_VERIFICATION_BOT_TOKEN");
}

export function getTelegramAdminUserId(): number | null {
    const raw =
        process.env.TELEGRAM_ADMIN_USER_ID?.trim() ||
        process.env.ADMIN_ID?.trim() ||
        "";
    const parsed = Number(raw);

    return Number.isSafeInteger(parsed) && parsed > 0
        ? parsed
        : null;
}

export function getTelegramAdminUsername(): string {
    return (
        process.env.TELEGRAM_ADMIN_USERNAME?.trim() ||
        DEFAULT_TELEGRAM_ADMIN_USERNAME
    )
        .replace(/^@/, "")
        .toLowerCase();
}

/**
 * Telegram Bot API cannot proactively address a private user by @username.
 * Resolve @husan_davronov to the chat/user ID already stored by TA’LIMOT
 * after that account has used the bot. A numeric env ID remains a fallback.
 */
export async function resolveTelegramAdminUserId(): Promise<number | null> {
    const username = getTelegramAdminUsername();

    try {
        // Prefer the live chat ID belonging to @husan_davronov in TA’LIMOT.
        // This avoids making payment alerts depend on remembering a numeric ID.
        const [adminUser] = await db
            .select({
                telegramChatId: users.telegramChatId,
                telegramUserId: users.telegramUserId,
            })
            .from(users)
            .where(
                sql`lower(ltrim(${users.telegramUsername}, '@')) = ${username}`,
            )
            .limit(1);

        const resolved = adminUser?.telegramChatId ?? adminUser?.telegramUserId ?? null;

        if (typeof resolved === "number" && Number.isSafeInteger(resolved) && resolved > 0) {
            return resolved;
        }
    } catch (error) {
        console.error("Telegram admin username lookup failed", {
            username,
            error,
        });
    }

    // Numeric env remains a safe fallback for deployments where the admin
    // account is not represented in the users table yet.
    return getTelegramAdminUserId();
}

export function isTelegramAdminIdentity(input: {
    readonly id: number;
    readonly username?: string;
}): boolean {
    const configuredId = getTelegramAdminUserId();
    const normalizedUsername = input.username?.replace(/^@/, "").toLowerCase();
    const usernameMatches = normalizedUsername === getTelegramAdminUsername();

    return (configuredId !== null && input.id === configuredId) || usernameMatches;
}

export async function telegramBotApi<T>(
    method: string,
    body: Record<string, unknown>,
): Promise<T> {
    const response = await fetch(
        `https://api.telegram.org/bot${getTelegramBotToken()}/${method}`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        },
    );

    const payload = (await response.json()) as {
        ok: boolean;
        result?: T;
        description?: string;
    };

    if (!response.ok || !payload.ok) {
        throw new Error(
            payload.description ?? `Telegram API ${method} request failed.`,
        );
    }

    return payload.result as T;
}

export async function telegramBotApiFormData<T>(
    method: string,
    formData: FormData,
): Promise<T> {
    const response = await fetch(
        `https://api.telegram.org/bot${getTelegramBotToken()}/${method}`,
        {
            method: "POST",
            body: formData,
            cache: "no-store",
        },
    );

    const payload = (await response.json()) as {
        ok: boolean;
        result?: T;
        description?: string;
    };

    if (!response.ok || !payload.ok) {
        throw new Error(
            payload.description ?? `Telegram API ${method} request failed.`,
        );
    }

    return payload.result as T;
}
