import { NextRequest, NextResponse } from "next/server";

import { createTelegramAccessToken } from "@/features/auth/model/telegram-access";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELEGRAM_CHANNEL_URL = "https://t.me/sardortoshmuhammad_onatili";
const INSTAGRAM_URL = "https://www.instagram.com/sardor_toshmuhammadov/";
const CHECK_SUBSCRIPTIONS_CALLBACK = "check_required_subscriptions";

type TelegramUser = {
    id: number;
    username?: string;
};

type TelegramChat = {
    id: number;
};

type TelegramMessage = {
    message_id: number;
    text?: string;
    chat: TelegramChat;
    from?: TelegramUser;
};

type TelegramCallbackQuery = {
    id: string;
    from: TelegramUser;
    data?: string;
    message?: TelegramMessage;
};

type TelegramUpdate = {
    message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
};

function requireEnvironment(key: string): string {
    const value = process.env[key]?.trim();

    if (!value) {
        throw new Error(`${key} environment variable is not configured.`);
    }

    return value;
}

function getBotToken() {
    return requireEnvironment("TELEGRAM_VERIFICATION_BOT_TOKEN");
}

function getAppUrl() {
    return requireEnvironment("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

async function telegramApi<T>(method: string, body: Record<string, unknown>) {
    const response = await fetch(
        `https://api.telegram.org/bot${getBotToken()}/${method}`,
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

function subscriptionKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: "1️⃣ Instagramga obuna bo‘lish",
                    url: INSTAGRAM_URL,
                },
            ],
            [
                {
                    text: "2️⃣ Telegram kanalga obuna bo‘lish",
                    url: TELEGRAM_CHANNEL_URL,
                },
            ],
            [
                {
                    text: "✅ Obunani tekshirish",
                    callback_data: CHECK_SUBSCRIPTIONS_CALLBACK,
                },
            ],
        ],
    };
}

async function setWebsiteMenuButtonSafely(
    chatId: number,
    url: string,
) {
    try {
        await telegramApi("setChatMenuButton", {
            chat_id: chatId,
            menu_button: {
                type: "web_app",
                text: "Web Site",
                web_app: {
                    url,
                },
            },
        });
    } catch (error) {
        // The menu button is a convenience only. A temporary Telegram API
        // failure must never stop /start or the subscription flow itself.
        console.error("Telegram menu button update failed", error);
    }
}

async function resetWebsiteMenuButton(chatId: number) {
    const appUrl = getAppUrl();

    await setWebsiteMenuButtonSafely(
        chatId,
        `${appUrl}/access-required`,
    );
}

async function sendSubscriptionPrompt(chatId: number) {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text:
      "Assalomu alaykum! 👋\n\n" +
      "TA’LIMOT platformasidan foydalanish uchun avval quyidagi sahifalarga obuna bo‘ling!",
    reply_markup: subscriptionKeyboard(),
    disable_web_page_preview: true,
  });
}

async function answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false,
) {
    await telegramApi("answerCallbackQuery", {
        callback_query_id: callbackQueryId,
        ...(text ? { text } : {}),
        show_alert: showAlert,
    });
}

async function sendContinueMessage(chatId: number, telegramUserId: number) {
    const user = await getUserByTelegramId(telegramUserId);
    const appUrl = getAppUrl();
    const accessToken = createTelegramAccessToken(telegramUserId);

    const createAccessUrl = (destination: string) => {
        const params = new URLSearchParams({
            token: accessToken,
            next: destination,
        });

        return `${appUrl}/api/telegram/access?${params.toString()}`;
    };

    await setWebsiteMenuButtonSafely(
        chatId,
        createAccessUrl("/"),
    );

    if (user && user.status === "active") {
        await telegramApi("sendMessage", {
            chat_id: chatId,
            text:
                "✅ Obuna tasdiqlandi.\n\n" +
                "Hisobingiz mavjud. TA’LIMOTga kirishni davom ettiring.",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔐 TA’LIMOTga kirish",
                            url: createAccessUrl("/auth/login?next=%2F"),
                        },
                    ],
                ],
            },
        });
        return;
    }

    await telegramApi("sendMessage", {
        chat_id: chatId,
        text:
            "✅ Obuna tasdiqlandi.\n\n" +
            "TA’LIMOTga birinchi marta kirayotganingiz uchun onboardingdan boshlaymiz.",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🚀 Onboardingni boshlash",
                        url: createAccessUrl("/onboarding"),
                    },
                ],
            ],
        },
    });
}

async function handleCallbackQuery(callback: TelegramCallbackQuery) {
    if (callback.data !== CHECK_SUBSCRIPTIONS_CALLBACK) {
        await answerCallbackQuery(callback.id);
        return;
    }

    const chatId = callback.message?.chat.id;

    if (!chatId) {
        await answerCallbackQuery(
            callback.id,
            "Chat topilmadi. /start buyrug‘ini qayta yuboring.",
            true,
        );
        return;
    }

    const subscribed = await isTelegramChannelMember(callback.from.id);

    if (!subscribed) {
        await answerCallbackQuery(
            callback.id,
            "Telegram kanalga hali obuna bo‘lmagansiz.",
            true,
        );

        // Keep the Website menu blocked for users who are not subscribed.
        await resetWebsiteMenuButton(chatId);

        await telegramApi("sendMessage", {
            chat_id: chatId,
            text:
                "❌ Telegram kanalga obuna aniqlanmadi.\n\n" +
                "Avval Instagramga, keyin Telegram kanalga obuna bo‘ling va yana tekshiring.",
            reply_markup: subscriptionKeyboard(),
            disable_web_page_preview: true,
        });
        return;
    }

    await answerCallbackQuery(callback.id, "Obuna tasdiqlandi ✅");
    await sendContinueMessage(chatId, callback.from.id);
}

async function handleMessage(message: TelegramMessage) {
    const text = message.text?.trim() ?? "";

    if (text === "/start" || text.startsWith("/start ")) {
        // Send the visible reply first. If Telegram rejects a per-chat menu
        // button update for any reason, /start must still always respond.
        await sendSubscriptionPrompt(message.chat.id);
        await resetWebsiteMenuButton(message.chat.id);
        return;
    }
}

export async function POST(request: NextRequest) {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    const receivedSecret = request.headers.get(
        "x-telegram-bot-api-secret-token",
    );

    if (!expectedSecret || receivedSecret !== expectedSecret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    try {
        const update = (await request.json()) as TelegramUpdate;

        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        } else if (update.message) {
            await handleMessage(update.message);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error", error);

        // Telegram retries non-2xx webhook responses. Returning 200 prevents
        // repeated delivery loops while the server log keeps the error visible.
        return NextResponse.json({ ok: true });
    }
}

export async function GET() {
    return NextResponse.json({
        ok: true,
        service: "talimot-telegram-webhook",
    });
}
