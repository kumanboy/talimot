import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    createStudentSessionToken,
    studentSessionCookieOptions,
} from "@/features/auth/model/student-session";
import {
    TELEGRAM_ACCESS_COOKIE,
    telegramAccessCookieOptions,
    verifyTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";

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
        const response = NextResponse.redirect(
            new URL("/access-required?reason=invalid", request.url),
        );
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(STUDENT_SESSION_COOKIE);
        return response;
    }

    // A signed bot entry token is never trusted on its own: membership is
    // checked again every time the Mini App is opened.
    const subscribed = await isTelegramChannelMember(access.telegramUserId);

    if (!subscribed) {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=subscription", request.url),
        );
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(STUDENT_SESSION_COOKIE);
        return response;
    }

    const requestedDestination = getSafeDestination(
        request.nextUrl.searchParams.get("next"),
    );
    const registeredUser = await getUserByTelegramId(access.telegramUserId);

    if (registeredUser?.status === "blocked") {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=blocked", request.url),
        );
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(STUDENT_SESSION_COOKIE);
        return response;
    }

    // Telegram itself already authenticated this Mini App entry through the
    // signed per-user URL created by our bot. For an existing active account,
    // create/refresh the normal student session here. This makes reopening the
    // Mini App passwordless while profile/wallet APIs still use an HttpOnly
    // server session cookie rather than localStorage.
    const destination = registeredUser?.status === "active"
        ? "/"
        : requestedDestination;

    const response = NextResponse.redirect(
        new URL(destination, request.url),
    );

    response.cookies.set(
        TELEGRAM_ACCESS_COOKIE,
        token,
        telegramAccessCookieOptions,
    );

    if (registeredUser?.status === "active") {
        response.cookies.set(
            STUDENT_SESSION_COOKIE,
            createStudentSessionToken(registeredUser.id),
            studentSessionCookieOptions,
        );
    }

    return response;
}
