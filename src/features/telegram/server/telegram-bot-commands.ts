import "server-only";

import { telegramBotApi } from "@/features/telegram/server/telegram-bot-api";

export const TELEGRAM_BOT_COMMANDS = [
    {
        command: "platforma",
        description: "TA’LIMOT platformasini ochish",
    },
    {
        command: "start",
        description: "Botni qayta boshlash",
    },
    {
        command: "balans",
        description: "Tanga balansini ko‘rish",
    },
] as const;

export async function syncTelegramBotCommands() {
    await telegramBotApi("setMyCommands", {
        commands: TELEGRAM_BOT_COMMANDS,
        scope: {
            type: "all_private_chats",
        },
    });
}
