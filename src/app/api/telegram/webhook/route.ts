import { NextRequest, NextResponse } from "next/server";

import {
    createTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELEGRAM_CHANNEL_USERNAME = "sardortoshmuhammad_onatili";
const TELEGRAM_CHANNEL_URL = "https://t.me/sardortoshmuhammad_onatili";
const INSTAGRAM_URL = "https://www.instagram.com/sardor_toshmuhammadov/";
const CHECK_SUBSCRIPTIONS_CALLBACK = "check_required_subscriptions";

type TelegramUser = {
    id: number;
    username?: string;
};

type TelegramChat = {
    id: number;
    username?: string;
    type?: string;
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

type TelegramChatMember = {
    status: string;
    user: TelegramUser;
};

type TelegramChatMemberUpdated = {
    chat: TelegramChat;
    from: TelegramUser;
    old_chat_member: TelegramChatMember;
    new_chat_member: TelegramChatMember;
};

type TelegramUpdate = {
    message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
    chat_member?: TelegramChatMemberUpdated;
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

async function setMenuButtonSafely(
    chatId: number,
    menuButton: Record<string, unknown>,
) {
    try {
        await telegramApi("setChatMenuButton", {
            chat_id: chatId,
            menu_button: menuButton,
        });
    } catch (error) {
        // A Telegram menu-button failure must never break /start or callback
        // processing. The website itself is still protected server-side.
        console.error("Telegram menu button update failed", error);
    }
}

async function hideWebsiteMenuButton(chatId: number) {
    // Do NOT use `default` here. A global Web App menu may still be configured
    // in BotFather/API; `commands` explicitly overrides it for this private chat.
    await setMenuButtonSafely(chatId, {
        type: "commands",
    });
}

async function ensureDefaultMenuIsCommandsSafely() {
    try {
        // The project previously configured a global Web Site menu button.
        // Reset the global fallback to commands. Existing verified per-chat
        // Web App buttons are not affected because per-chat settings override
        // the default menu button.
        await telegramApi("setChatMenuButton", {
            menu_button: {
                type: "commands",
            },
        });
    } catch (error) {
        console.error("Telegram default menu reset failed", error);
    }
}

function createVerifiedEntryUrl(
    telegramUserId: number,
    destination: string,
) {
    const appUrl = getAppUrl();
    const token = createTelegramAccessToken(telegramUserId);
    const params = new URLSearchParams({
        token,
        next: destination,
    });

    return `${appUrl}/api/telegram/access?${params.toString()}`;
}

async function showWebsiteMenuButton(
    chatId: number,
    telegramUserId: number,
    destination: string,
) {
    const entryUrl = createVerifiedEntryUrl(telegramUserId, destination);

    await setMenuButtonSafely(chatId, {
        type: "web_app",
        text: "Web Site",
        web_app: {
            url: entryUrl,
        },
    });

    return entryUrl;
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
    const destination = user && user.status === "active"
        ? "/auth/login?next=%2F"
        : "/onboarding";

    const entryUrl = await showWebsiteMenuButton(
        chatId,
        telegramUserId,
        destination,
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
                            web_app: {
                                url: entryUrl,
                            },
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
                        web_app: {
                            url: entryUrl,
                        },
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
        // Explicitly remove the Website button for this private chat.
        await hideWebsiteMenuButton(chatId);

        await answerCallbackQuery(
            callback.id,
            "Telegram kanalga hali obuna bo‘lmagansiz.",
            true,
        );

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
        // Visible reply first. Then remove both the old global Website fallback
        // and this user's per-chat Website button until verification succeeds.
        await sendSubscriptionPrompt(message.chat.id);
        await ensureDefaultMenuIsCommandsSafely();
        await hideWebsiteMenuButton(message.chat.id);
    }
}

function isRequiredChannel(chat: TelegramChat) {
    return chat.username?.replace(/^@/, "").toLowerCase() ===
        TELEGRAM_CHANNEL_USERNAME.toLowerCase();
}

async function handleChatMemberUpdate(update: TelegramChatMemberUpdated) {
    if (!isRequiredChannel(update.chat)) {
        return;
    }

    const newStatus = update.new_chat_member.status;

    // If a verified user leaves/is removed from the required channel, remove
    // their per-user Website menu immediately. In a private bot chat, the
    // user's Telegram ID is also the chat ID.
    if (newStatus === "left" || newStatus === "kicked") {
        await hideWebsiteMenuButton(update.new_chat_member.user.id);
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
        } else if (update.chat_member) {
            await handleChatMemberUpdate(update.chat_member);
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
