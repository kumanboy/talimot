import "server-only";

import { createVerifiedTelegramEntryUrl } from "@/features/telegram/server/create-verified-entry-url";

export type PaymentNotificationResult = "sent" | "unavailable" | "failed";

function getBotToken(): string | null {
    const value = process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim();
    return value || null;
}

export async function sendPaymentStatusNotification(input: {
    readonly chatId: number | null;
    readonly telegramUserId?: number | null;
    readonly destination?: string;
    readonly firstName: string;
    readonly paymentCode: string;
    readonly title: string;
    readonly amountSom: number;
    readonly status: "confirmed" | "rejected";
}): Promise<PaymentNotificationResult> {
    const token = getBotToken();

    if (!token || !input.chatId) {
        return "unavailable";
    }

    const amount = new Intl.NumberFormat("uz-UZ").format(input.amountSom);
    const lines = input.status === "confirmed"
        ? [
            `Assalomu alaykum, ${input.firstName}!`,
            "",
            "✅ To‘lovingiz tasdiqlandi.",
            `To‘lov ID: ${input.paymentCode}`,
            `Buyurtma: ${input.title}`,
            `Summa: ${amount} so‘m`,
            "",
            "TA’LIMOT",
        ]
        : [
            `Assalomu alaykum, ${input.firstName}!`,
            "",
            "❌ To‘lov so‘rovingiz tasdiqlanmadi.",
            `To‘lov ID: ${input.paymentCode}`,
            `Buyurtma: ${input.title}`,
            "Iltimos, chek va to‘lov ma’lumotlarini qayta tekshirib administratorga murojaat qiling.",
            "",
            "TA’LIMOT",
        ];

    const entryUrl = createVerifiedTelegramEntryUrl(
        input.telegramUserId ?? input.chatId,
        input.destination ?? "/",
    );

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                chat_id: input.chatId,
                text: lines.join("\n"),
                ...(entryUrl
                    ? {
                        reply_markup: {
                            inline_keyboard: [[{
                                text: "🌐 TA’LIMOTni ochish",
                                web_app: { url: entryUrl },
                            }]],
                        },
                    }
                    : {}),
            }),
            cache: "no-store",
        });
        const body = (await response.json()) as { ok?: boolean; description?: string };

        if (!response.ok || !body.ok) {
            console.error("Payment Telegram notification rejected", {
                paymentCode: input.paymentCode,
                status: response.status,
                description: body.description,
            });
            return "failed";
        }

        return "sent";
    } catch (error) {
        console.error("Payment Telegram notification failed", {
            paymentCode: input.paymentCode,
            error,
        });
        return "failed";
    }
}
