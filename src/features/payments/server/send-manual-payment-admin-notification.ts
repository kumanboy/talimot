import "server-only";

import {
    getTelegramAdminUsername,
    resolveTelegramAdminUserId,
    telegramBotApi,
} from "@/features/telegram/server/telegram-bot-api";

function paymentCode(id: string): string {
    return `PAY-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function kindLabel(kind: "tanga" | "book" | "course"): string {
    if (kind === "tanga") return "Tanga";
    if (kind === "book") return "Kitob";
    return "Kurs";
}

function formatSom(value: number): string {
    return new Intl.NumberFormat("uz-UZ").format(value);
}

export async function sendManualPaymentAdminNotification(input: {
    readonly id: string;
    readonly kind: "tanga" | "book" | "course";
    readonly title: string;
    readonly amountSom: number;
    readonly fullName: string | null;
    readonly phone: string | null;
    readonly telegramUsername: string | null;
}) {
    const adminUserId = await resolveTelegramAdminUserId();

    if (!adminUserId) {
        return {
            sent: false as const,
            reason: "admin_not_reachable" as const,
            adminUsername: getTelegramAdminUsername(),
        };
    }

    const username = input.telegramUsername
        ? `@${input.telegramUsername.replace(/^@/, "")}`
        : "—";

    await telegramBotApi("sendMessage", {
        chat_id: adminUserId,
        text:
            "💳 YANGI TO‘LOV SO‘ROVI\n\n" +
            `🆔 ${paymentCode(input.id)}\n` +
            `👤 ${input.fullName ?? "Noma’lum foydalanuvchi"}\n` +
            `📞 ${input.phone ?? "—"}\n` +
            `✈️ ${username}\n` +
            `📦 Turi: ${kindLabel(input.kind)}\n` +
            `🛍 ${input.title}\n` +
            `💰 ${formatSom(input.amountSom)} so‘m\n\n` +
            "⏳ Holat: Kutilmoqda",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "✅ Tasdiqlash",
                        callback_data: `payment_confirm:${input.id}`,
                    },
                    {
                        text: "❌ Rad etish",
                        callback_data: `payment_reject:${input.id}`,
                    },
                ],
            ],
        },
        disable_web_page_preview: true,
    });

    return { sent: true as const };
}
