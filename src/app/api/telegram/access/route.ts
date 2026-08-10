import { NextRequest, NextResponse } from "next/server";

import {
    TELEGRAM_ACCESS_COOKIE,
    telegramAccessCookieOptions,
    verifyTelegramAccessToken,
} from "@/features/auth/model/telegram-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSafeDestination(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return "/";
    }

    return value;
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token") ?? undefined;
    const access = verifyTelegramAccessToken(token);

    if (!access || !token) {
        return NextResponse.redirect(
            new URL("/access-required?reason=invalid", request.url),
        );
    }

    const destination = getSafeDestination(
        request.nextUrl.searchParams.get("next"),
    );

    const response = NextResponse.redirect(
        new URL(destination, request.url),
    );

    response.cookies.set(
        TELEGRAM_ACCESS_COOKIE,
        token,
        telegramAccessCookieOptions,
    );

    return response;
}
