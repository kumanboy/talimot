const TELEGRAM_CHANNEL_USERNAME = "@sardortoshmuhammad_onatili";

type TelegramMemberResponse = {
    ok: boolean;
    result?: {
        status: string;
    };
};

function getBotToken(): string | null {
    return process.env.TELEGRAM_VERIFICATION_BOT_TOKEN?.trim() || null;
}

export async function isTelegramChannelMember(
    telegramUserId: number,
): Promise<boolean> {
    const botToken = getBotToken();

    if (!botToken) {
        return false;
    }

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/getChatMember`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHANNEL_USERNAME,
                    user_id: telegramUserId,
                }),
                cache: "no-store",
            },
        );

        const payload = (await response.json()) as TelegramMemberResponse;
        const status = payload.result?.status;

        if (!response.ok || !payload.ok || !status) {
            return false;
        }

        return ["creator", "administrator", "member", "restricted"].includes(
            status,
        );
    } catch {
        return false;
    }
}
