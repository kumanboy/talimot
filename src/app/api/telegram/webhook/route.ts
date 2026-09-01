import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    createTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";
import { processManualPaymentStatus } from "@/features/payments/server/process-manual-payment-status";
import { getTelegramAdminUserId } from "@/features/telegram/server/telegram-bot-api";
import { syncTelegramBotCommands } from "@/features/telegram/server/telegram-bot-commands";
import {
    createVerificationCode,
    hashVerificationCode,
    normalizeUzbekPhone,
} from "@/features/auth/server/registration-security";
import { db } from "@/lib/database/db";
import { tangaWallets, telegramAuthChallenges } from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELEGRAM_CHANNEL_USERNAME = "sardortoshmuhammad_onatili";
const TELEGRAM_CHANNEL_URL = "https://t.me/sardortoshmuhammad_onatili";
const INSTAGRAM_URL = "https://www.instagram.com/sardor_toshmuhammadov/";
const CHECK_SUBSCRIPTIONS_CALLBACK = "check_required_subscriptions";
const VERIFICATION_START_PREFIX = "verify_";
const VERIFICATION_CODE_DURATION_MS = 10 * 60 * 1000;

type TelegramUser = {
    id: number;
    username?: string;
};

type TelegramChat = {
    id: number;
    username?: string;
    type?: string;
};

type TelegramContact = {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
};

type TelegramMessage = {
    message_id: number;
    text?: string;
    contact?: TelegramContact;
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
    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

    if (configured) {
        return configured.replace(/\/$/, "");
    }

    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

    if (productionHost) {
        return `https://${productionHost.replace(/\/$/, "")}`;
    }

    const vercelHost = process.env.VERCEL_URL?.trim();

    if (vercelHost) {
        return `https://${vercelHost.replace(/\/$/, "")}`;
    }

    // Final production fallback for the current TA’LIMOT deployment.
    return "https://talimot.vercel.app";
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

async function ensureBotCommandsSafely() {
    try {
        await syncTelegramBotCommands();
    } catch (error) {
        console.error("Telegram bot commands update failed", error);
    }
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

async function resolveDestinationSafely(telegramUserId: number) {
    try {
        const user = await getUserByTelegramId(telegramUserId);

        if (user && user.status === "active") {
            return {
                destination: "/",
                registered: true,
            } as const;
        }
    } catch (error) {
        // Registration is still being wired into production. A temporary
        // database/table problem must never prevent an already verified
        // Telegram subscriber from receiving the website button.
        console.error("Telegram user lookup failed; using onboarding", error);
    }

    return {
        destination: "/onboarding",
        registered: false,
    } as const;
}

async function sendVerifiedAccessMessage(
    chatId: number,
    messageId: number,
    entryUrl: string,
    registered: boolean,
) {
    const text = registered
        ? `✅ Obuna tasdiqlandi!\n\nTA’LIMOTga kirishni davom ettiring.`
        : `✅ Obuna tasdiqlandi!\n\nTA’LIMOT platformasini ochishingiz mumkin.`;

    const buttonText = registered
        ? "🌐 TA’LIMOTni ochish"
        : "🌐 TA’LIMOTni ochish";

    const inlineWebAppMarkup = {
        inline_keyboard: [
            [
                {
                    text: buttonText,
                    web_app: {
                        url: entryUrl,
                    },
                },
            ],
        ],
    };

    const replyKeyboardWebAppMarkup = {
        keyboard: [
            [
                {
                    text: buttonText,
                    web_app: {
                        url: entryUrl,
                    },
                },
            ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
    };

    // First try the cleanest UX: replace the verification message itself.
    try {
        await telegramApi("editMessageText", {
            chat_id: chatId,
            message_id: messageId,
            text,
            reply_markup: inlineWebAppMarkup,
            disable_web_page_preview: true,
        });
        return;
    } catch (editError) {
        console.error(
            "Telegram access message edit failed; trying a new button message",
            editError,
        );
    }

    // Some Telegram messages cannot be edited after a callback. Send a fresh
    // inline Web App button. Because this is `web_app` (not `url`), Telegram
    // opens TA’LIMOT inside its Mini App webview instead of an external browser.
    try {
        await telegramApi("sendMessage", {
            chat_id: chatId,
            text,
            reply_markup: inlineWebAppMarkup,
            disable_web_page_preview: true,
        });
        return;
    } catch (inlineWebAppError) {
        console.error(
            "Telegram inline Web App button failed; trying reply keyboard Web App",
            inlineWebAppError,
        );
    }

    // Final Mini App-only fallback: a reply-keyboard Web App button. This also
    // launches the site inside Telegram and avoids exposing an external URL.
    try {
        await telegramApi("sendMessage", {
            chat_id: chatId,
            text,
            reply_markup: replyKeyboardWebAppMarkup,
            disable_web_page_preview: true,
        });
        return;
    } catch (replyKeyboardError) {
        console.error(
            "Telegram reply keyboard Web App button failed",
            replyKeyboardError,
        );
    }

    await telegramApi("sendMessage", {
        chat_id: chatId,
        text:
            "✅ Obuna tasdiqlandi, ammo Telegram Mini App tugmasini yaratishda xatolik yuz berdi. /start buyrug‘ini qayta yuboring.",
        disable_web_page_preview: true,
    });
}

async function sendContinueMessage(
    chatId: number,
    messageId: number,
    telegramUserId: number,
) {
    const { destination, registered } = await resolveDestinationSafely(
        telegramUserId,
    );
    const entryUrl = createVerifiedEntryUrl(telegramUserId, destination);

    await sendVerifiedAccessMessage(
        chatId,
        messageId,
        entryUrl,
        registered,
    );
}

type PaymentDecisionCallback = {
    readonly action: "confirm" | "reject";
    readonly paymentId: string;
};

function parsePaymentDecisionCallback(
    data: string | undefined,
): PaymentDecisionCallback | null {
    if (!data) return null;

    const match =
        /^payment_(confirm|reject):([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
            data,
        );

    if (!match) return null;

    return {
        action: match[1].toLowerCase() as "confirm" | "reject",
        paymentId: match[2],
    };
}

async function updatePaymentAdminMessage(
    callback: TelegramCallbackQuery,
    statusText: string,
) {
    const chatId = callback.message?.chat.id;
    const messageId = callback.message?.message_id;

    if (!chatId || !messageId) return;

    const originalText = callback.message?.text?.trim() || "💳 TO‘LOV SO‘ROVI";

    try {
        await telegramApi("editMessageText", {
            chat_id: chatId,
            message_id: messageId,
            text: `${originalText}\n\n${statusText}`,
            reply_markup: {
                inline_keyboard: [],
            },
            disable_web_page_preview: true,
        });
    } catch (error) {
        console.error("Telegram payment admin message update failed", error);

        try {
            await telegramApi("editMessageReplyMarkup", {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [],
                },
            });
        } catch (markupError) {
            console.error("Telegram payment buttons cleanup failed", markupError);
        }
    }
}

async function handlePaymentDecisionCallback(
    callback: TelegramCallbackQuery,
    decision: PaymentDecisionCallback,
) {
    const adminUserId = getTelegramAdminUserId();

    if (!adminUserId || callback.from.id !== adminUserId) {
        await answerCallbackQuery(
            callback.id,
            "Bu amal faqat TA’LIMOT adminiga ruxsat etilgan.",
            true,
        );
        return;
    }

    try {
        const result = await processManualPaymentStatus({
            paymentId: decision.paymentId,
            action: decision.action,
            adminNote:
                decision.action === "reject"
                    ? "Telegram bot orqali rad etildi."
                    : "Telegram bot orqali tasdiqlandi.",
            processedBy: `telegram:${callback.from.id}`,
        });

        if (result.outcome === "missing") {
            await answerCallbackQuery(
                callback.id,
                "To‘lov so‘rovi topilmadi.",
                true,
            );
            return;
        }

        if (result.outcome === "already_processed") {
            await answerCallbackQuery(
                callback.id,
                `Bu to‘lov avval qayta ishlangan: ${result.currentStatus}.`,
                true,
            );
            await updatePaymentAdminMessage(
                callback,
                `ℹ️ HOLAT: ${result.currentStatus.toUpperCase()}`,
            );
            return;
        }

        const isConfirmed = result.outcome === "confirmed";
        await answerCallbackQuery(
            callback.id,
            isConfirmed ? "To‘lov tasdiqlandi ✅" : "To‘lov rad etildi ❌",
        );
        await updatePaymentAdminMessage(
            callback,
            isConfirmed ? "✅ TASDIQLANDI" : "❌ RAD ETILDI",
        );
    } catch (error) {
        console.error("Telegram payment decision failed", {
            paymentId: decision.paymentId,
            action: decision.action,
            error,
        });
        await answerCallbackQuery(
            callback.id,
            "To‘lovni qayta ishlashda xatolik yuz berdi.",
            true,
        );
    }
}

async function sendPlatformCommand(message: TelegramMessage) {
    if (!message.from) return;

    const user = await getUserByTelegramId(message.from.id);

    if (!user || user.status !== "active") {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text:
                "🔒 /platforma faqat TA’LIMOTda ro‘yxatdan o‘tgan foydalanuvchilar uchun.\n\n" +
                "Avval /start buyrug‘i orqali ro‘yxatdan o‘tish jarayonini boshlang.",
        });
        return;
    }

    const subscribed = await isTelegramChannelMember(message.from.id);

    if (!subscribed) {
        await sendSubscriptionPrompt(message.chat.id);
        return;
    }

    const entryUrl = createVerifiedEntryUrl(message.from.id, "/");

    await telegramApi("sendMessage", {
        chat_id: message.chat.id,
        text: "🌐 TA’LIMOT platformasi tayyor. Quyidagi tugma orqali oching:",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🌐 TA’LIMOTni ochish",
                        web_app: {
                            url: entryUrl,
                        },
                    },
                ],
            ],
        },
        disable_web_page_preview: true,
    });
}

async function sendBalanceCommand(message: TelegramMessage) {
    if (!message.from) return;

    const user = await getUserByTelegramId(message.from.id);

    if (!user || user.status !== "active") {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text:
                "🔒 /balans faqat TA’LIMOTda ro‘yxatdan o‘tgan foydalanuvchilar uchun.\n\n" +
                "Avval /start buyrug‘i orqali ro‘yxatdan o‘ting.",
        });
        return;
    }

    const [wallet] = await db
        .select({
            balance: tangaWallets.balance,
        })
        .from(tangaWallets)
        .where(eq(tangaWallets.userId, user.id))
        .limit(1);

    const balance = wallet?.balance ?? 0;
    const entryUrl = createVerifiedEntryUrl(message.from.id, "/packages");

    await telegramApi("sendMessage", {
        chat_id: message.chat.id,
        text: `🪙 Tanga balansingiz: ${balance} Tanga`,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "➕ Tanga olish",
                        web_app: {
                            url: entryUrl,
                        },
                    },
                ],
            ],
        },
    });
}

async function sendRegisteredStartMessage(message: TelegramMessage) {
    if (!message.from) return false;

    const user = await getUserByTelegramId(message.from.id);

    if (!user || user.status !== "active") {
        return false;
    }

    const subscribed = await isTelegramChannelMember(message.from.id);

    if (!subscribed) {
        return false;
    }

    await telegramApi("sendMessage", {
        chat_id: message.chat.id,
        text:
            "Assalomu alaykum! 👋\n\n" +
            "TA’LIMOT hisobingiz botga ulangan. Kerakli buyruqni tanlang:\n\n" +
            "🌐 /platforma — platformani ochish\n" +
            "🪙 /balans — Tanga balansini ko‘rish\n" +
            "🔄 /start — botni qayta boshlash",
    });

    return true;
}

async function handleCallbackQuery(callback: TelegramCallbackQuery) {
    const paymentDecision = parsePaymentDecisionCallback(callback.data);

    if (paymentDecision) {
        await handlePaymentDecisionCallback(callback, paymentDecision);
        return;
    }

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

    try {
        await sendContinueMessage(
            chatId,
            callback.message!.message_id,
            callback.from.id,
        );
    } catch (error) {
        console.error("Could not create TA’LIMOT access link", {
            error,
            telegramUserId: callback.from.id,
            appUrl: getAppUrl(),
            hasAuthSessionSecret: Boolean(process.env.AUTH_SESSION_SECRET?.trim()),
            hasWebhookSecret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim()),
            hasBotToken: Boolean(process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim()),
        });
        await answerCallbackQuery(
            callback.id,
            "Sayt havolasini yaratishda xatolik yuz berdi. Qayta urinib ko‘ring.",
            true,
        );
        return;
    }

    // The callback confirmation is best-effort. The actual success state is
    // now visible in the edited bot message itself.
    try {
        await answerCallbackQuery(callback.id, "Obuna tasdiqlandi ✅");
    } catch (error) {
        console.error("Telegram callback confirmation failed", error);
    }
}

function getVerificationChallengeId(text: string): string | null {
    if (!text.startsWith("/start ")) {
        return null;
    }

    const parameter = text.slice("/start ".length).trim();

    if (!parameter.startsWith(VERIFICATION_START_PREFIX)) {
        return null;
    }

    const challengeId = parameter.slice(VERIFICATION_START_PREFIX.length);

    return /^[A-Za-z0-9_-]{16,48}$/.test(challengeId)
        ? challengeId
        : null;
}

async function handleVerificationStart(
    message: TelegramMessage,
    challengeId: string,
) {
    if (!message.from) {
        return;
    }

    const [challenge] = await db
        .select()
        .from(telegramAuthChallenges)
        .where(eq(telegramAuthChallenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Tasdiqlash so‘rovi topilmadi. Saytdagi ro‘yxatdan o‘tish sahifasidan jarayonni qayta boshlang.",
        });
        return;
    }

    const now = Date.now();

    if (challenge.expiresAt <= now || challenge.status === "completed") {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: challenge.status === "completed"
                ? "✅ Bu ro‘yxatdan o‘tish allaqachon yakunlangan."
                : "⌛ Tasdiqlash vaqti tugagan. Saytdagi ro‘yxatdan o‘tish sahifasidan qayta boshlang.",
        });
        return;
    }

    if (challenge.telegramUserId !== message.from.id) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Bu tasdiqlash havolasi boshqa Telegram hisobiga tegishli.",
        });
        return;
    }

    const subscribed = await isTelegramChannelMember(message.from.id);

    if (!subscribed) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Avval TA’LIMOT uchun talab qilinadigan Telegram kanaliga obuna bo‘ling.",
        });
        return;
    }

    await db
        .update(telegramAuthChallenges)
        .set({
            telegramChatId: message.chat.id,
            telegramUsername: message.from.username ?? null,
            status: "awaiting_contact",
            updatedAt: now,
        })
        .where(eq(telegramAuthChallenges.id, challenge.id));

    await telegramApi("sendMessage", {
        chat_id: message.chat.id,
        text:
            "📱 Telefon raqamingizni tasdiqlaymiz.\n\n" +
            "Quyidagi tugma orqali aynan Telegram hisobingizga ulangan telefon raqamingizni yuboring.",
        reply_markup: {
            keyboard: [
                [
                    {
                        text: "📱 Telegram raqamimni ulashish",
                        request_contact: true,
                    },
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}

async function handleVerificationContact(message: TelegramMessage) {
    if (!message.from || !message.contact) {
        return false;
    }

    const [challenge] = await db
        .select()
        .from(telegramAuthChallenges)
        .where(
            and(
                eq(telegramAuthChallenges.telegramUserId, message.from.id),
                eq(telegramAuthChallenges.status, "awaiting_contact"),
            ),
        )
        .orderBy(desc(telegramAuthChallenges.updatedAt))
        .limit(1);

    if (!challenge) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "Tasdiqlash jarayoni topilmadi. Saytdagi “Telegram botni ochish” tugmasini qayta bosing.",
            reply_markup: { remove_keyboard: true },
        });
        return true;
    }

    const now = Date.now();

    if (challenge.expiresAt <= now) {
        await db
            .update(telegramAuthChallenges)
            .set({ status: "expired", updatedAt: now })
            .where(eq(telegramAuthChallenges.id, challenge.id));

        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "⌛ Tasdiqlash vaqti tugagan. Saytdagi ro‘yxatdan o‘tish jarayonini qayta boshlang.",
            reply_markup: { remove_keyboard: true },
        });
        return true;
    }

    if (
        message.contact.user_id !== message.from.id ||
        challenge.telegramChatId !== message.chat.id
    ) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Faqat o‘zingizning Telegram telefon raqamingizni yuborishingiz mumkin.",
        });
        return true;
    }

    const contactPhone = normalizeUzbekPhone(message.contact.phone_number);

    if (!contactPhone || contactPhone !== challenge.phone) {
        await telegramApi("sendMessage", {
            chat_id: message.chat.id,
            text:
                "❌ Telegram hisobingizdagi telefon raqami saytda kiritgan raqamingizga mos kelmadi.\n\n" +
                "Saytga qaytib, Telegram hisobingizga ulangan raqamni kiriting.",
            reply_markup: { remove_keyboard: true },
        });
        return true;
    }

    const code = createVerificationCode();

    await db
        .update(telegramAuthChallenges)
        .set({
            codeHash: hashVerificationCode(challenge.id, code),
            codeExpiresAt: now + VERIFICATION_CODE_DURATION_MS,
            attempts: 0,
            status: "code_sent",
            telegramUsername: message.from.username ?? null,
            updatedAt: now,
        })
        .where(eq(telegramAuthChallenges.id, challenge.id));

    await telegramApi("sendMessage", {
        chat_id: message.chat.id,
        text:
            `🔐 TA’LIMOT tasdiqlash kodi: ${code}\n\n` +
            "Kod 10 daqiqa amal qiladi. Uni TA’LIMOT ro‘yxatdan o‘tish oynasiga kiriting.\n\n" +
            "Bu kodni hech kimga bermang.",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "↩️ TA’LIMOTga qaytish",
                        web_app: {
                            url: `${getAppUrl()}/auth/register`,
                        },
                    },
                ],
            ],
        },
    });

    return true;
}

async function handleMessage(message: TelegramMessage) {
    if (message.contact) {
        const handled = await handleVerificationContact(message);

        if (handled) {
            return;
        }
    }

    const text = message.text?.trim() ?? "";
    const verificationChallengeId = getVerificationChallengeId(text);

    if (verificationChallengeId) {
        await handleVerificationStart(message, verificationChallengeId);
        return;
    }

    if (text === "/platforma" || text.startsWith("/platforma@")) {
        await ensureBotCommandsSafely();
        await sendPlatformCommand(message);
        return;
    }

    if (text === "/balans" || text.startsWith("/balans@")) {
        await ensureBotCommandsSafely();
        await sendBalanceCommand(message);
        return;
    }

    if (text === "/start" || text.startsWith("/start@") || text.startsWith("/start ")) {
        await ensureBotCommandsSafely();
        await ensureDefaultMenuIsCommandsSafely();
        await hideWebsiteMenuButton(message.chat.id);

        if (await sendRegisteredStartMessage(message)) {
            return;
        }

        await sendSubscriptionPrompt(message.chat.id);
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
