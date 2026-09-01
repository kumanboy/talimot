import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";

import {
    telegramBotApi,
    telegramBotApiFormData,
} from "@/features/telegram/server/telegram-bot-api";
import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

type TelegramPhoto = {
    file_id: string;
    width: number;
    height: number;
};

type TelegramSentMessage = {
    message_id: number;
    photo?: TelegramPhoto[];
};

async function sendUploadedPhoto(
    chatId: number,
    image: File,
    caption: string,
): Promise<TelegramSentMessage> {
    const form = new FormData();
    form.set("chat_id", String(chatId));
    form.set("caption", caption);
    form.set("photo", image, image.name || "broadcast-image");

    return telegramBotApiFormData<TelegramSentMessage>("sendPhoto", form);
}

async function sendPhotoByFileId(
    chatId: number,
    fileId: string,
    caption: string,
) {
    await telegramBotApi("sendPhoto", {
        chat_id: chatId,
        photo: fileId,
        caption,
    });
}

export async function sendTelegramBroadcast(input: {
    readonly image: File;
    readonly caption: string;
}) {
    const rows = await db
        .select({
            chatId: users.telegramChatId,
        })
        .from(users)
        .where(
            and(
                eq(users.status, "active"),
                isNotNull(users.telegramChatId),
            ),
        );

    const chatIds = [
        ...new Set(
            rows
                .map((row) => row.chatId)
                .filter((value): value is number => Number.isSafeInteger(value)),
        ),
    ];

    if (chatIds.length === 0) {
        return {
            total: 0,
            sent: 0,
            failed: 0,
        };
    }

    let firstSuccessfulIndex = -1;
    let telegramFileId: string | null = null;
    let sent = 0;
    let failed = 0;

    for (let index = 0; index < chatIds.length; index += 1) {
        try {
            const result = await sendUploadedPhoto(
                chatIds[index],
                input.image,
                input.caption,
            );
            telegramFileId = result.photo?.at(-1)?.file_id ?? null;
            firstSuccessfulIndex = index;
            sent += 1;
            break;
        } catch (error) {
            failed += 1;
            console.error("Telegram broadcast initial photo delivery failed", {
                chatId: chatIds[index],
                error,
            });
        }
    }

    if (!telegramFileId || firstSuccessfulIndex < 0) {
        return {
            total: chatIds.length,
            sent,
            failed,
        };
    }

    const remaining = chatIds.slice(firstSuccessfulIndex + 1);
    const batchSize = 8;

    for (let start = 0; start < remaining.length; start += batchSize) {
        const batch = remaining.slice(start, start + batchSize);
        const results = await Promise.allSettled(
            batch.map((chatId) =>
                sendPhotoByFileId(chatId, telegramFileId!, input.caption),
            ),
        );

        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                sent += 1;
            } else {
                failed += 1;
                console.error("Telegram broadcast delivery failed", {
                    chatId: batch[index],
                    error: result.reason,
                });
            }
        });
    }

    return {
        total: chatIds.length,
        sent,
        failed,
    };
}
