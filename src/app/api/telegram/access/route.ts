import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
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
        return response;
    }

    // Re-check membership when the Mini App/menu button is opened. A token
    // created earlier must not grant access after the user leaves the channel.
    const subscribed = await isTelegramChannelMember(access.telegramUserId);

    if (!subscribed) {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=subscription", request.url),
        );
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        return response;
    }

    const requestedDestination = getSafeDestination(
        request.nextUrl.searchParams.get("next"),
    );

    // Keep an already authenticated student signed in when the Telegram
    // Mini App is closed and reopened. The student session cookie is
    // persistent, but the bot entry URL may still point to /auth/login.
    // Only skip login when the stored student session belongs to the same
    // Telegram account that opened this signed Mini App entry URL.
    const registeredUser = await getUserByTelegramId(access.telegramUserId);
    const studentSession = verifyStudentSessionToken(
        request.cookies.get(STUDENT_SESSION_COOKIE)?.value,
    );

    const canResumeSession = Boolean(
        registeredUser &&
        registeredUser.status === "active" &&
        studentSession &&
        studentSession.userId === registeredUser.id,
    );

    const destination = canResumeSession ? "/" : requestedDestination;

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
