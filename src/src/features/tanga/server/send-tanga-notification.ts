import "server-only";

type TangaNotificationInput = {
    readonly chatId: number | null;
    readonly firstName: string;
    readonly userNumber: number;
    readonly direction: "credit" | "debit";
    readonly amount: number;
    readonly balanceAfter: number;
    readonly note?: string | null;
};

export type TangaNotificationResult =
    | "sent"
    | "unavailable"
    | "failed";

function getBotToken(): string | null {
    const value = process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim();
    return value || null;
}

export async function sendTangaNotification(
    input: TangaNotificationInput,
): Promise<TangaNotificationResult> {
    const token = getBotToken();

    if (!token || !input.chatId) {
        return "unavailable";
    }

    const actionLine = input.direction === "credit"
        ? `✅ Hisobingizga ${input.amount} Tanga qo‘shildi.`
        : `➖ Hisobingizdan ${input.amount} Tanga ayirildi.`;

    const lines = [
        `Assalomu alaykum, ${input.firstName}!`,
        "",
        actionLine,
        `Yangi balans: ${input.balanceAfter} Tanga`,
        `Foydalanuvchi ID: ${input.userNumber}`,
    ];

    if (input.note) {
        lines.push(`Izoh: ${input.note}`);
    }

    lines.push("", "TA’LIMOT");

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: input.chatId,
                    text: lines.join("\n"),
                }),
                cache: "no-store",
            },
        );

        const payload = (await response.json()) as {
            ok?: boolean;
            description?: string;
        };

        if (!response.ok || !payload.ok) {
            console.error("Tanga Telegram notification rejected", {
                userNumber: input.userNumber,
                status: response.status,
                description: payload.description,
            });
            return "failed";
        }

        return "sent";
    } catch (error) {
        console.error("Tanga Telegram notification failed", {
            userNumber: input.userNumber,
            error,
        });
        return "failed";
    }
}
