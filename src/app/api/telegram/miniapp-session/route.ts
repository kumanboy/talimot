import { NextRequest, NextResponse } from "next/server";

import {
    createTelegramAccessToken,
    TELEGRAM_ACCESS_COOKIE,
    telegramAccessCookieOptions,
} from "@/features/auth/model/telegram-access";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";
import { validateTelegramInitData } from "@/features/auth/server/validate-telegram-init-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
    initData?: unknown;
    mode?: unknown;
};

function unauthorized(reason: string, status: number) {
    const response = NextResponse.json(
        {
            ok: false,
            reason,
        },
        { status },
    );

    response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
    return response;
}

export async function POST(request: NextRequest) {
    let body: RequestBody;

    try {
        body = (await request.json()) as RequestBody;
    } catch {
        return unauthorized("invalid-request", 400);
    }

    const initData = typeof body.initData === "string"
        ? body.initData
        : "";
    const mode = body.mode === "refresh"
        ? "refresh"
        : "entry";

    const telegramData = validateTelegramInitData(initData);

    if (!telegramData) {
        return unauthorized("telegram-auth", 401);
    }

    const telegramUserId = telegramData.user.id;
    const subscribed = await isTelegramChannelMember(telegramUserId);

    if (!subscribed) {
        return unauthorized("subscription", 403);
    }

    const accessToken = createTelegramAccessToken(telegramUserId);
    const responsePayload: {
        ok: true;
        redirectTo?: string;
    } = {
        ok: true,
    };

    if (mode === "entry") {
        const user = await getUserByTelegramId(telegramUserId);

        responsePayload.redirectTo = user && user.status === "active"
            ? "/auth/login?next=%2F"
            : "/onboarding";
    }

    const response = NextResponse.json(responsePayload);
    response.cookies.set(
        TELEGRAM_ACCESS_COOKIE,
        accessToken,
        telegramAccessCookieOptions,
    );

    return response;
}
