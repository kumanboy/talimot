import "server-only";

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
