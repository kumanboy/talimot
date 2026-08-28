import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    createStudentSessionToken,
    studentSessionCookieOptions,
} from "@/features/auth/model/student-session";
import {
    TELEGRAM_ACCESS_COOKIE,
    TELEGRAM_GATE_COOKIE,
    createTelegramGateToken,
    telegramAccessCookieOptions,
    telegramGateCookieOptions,
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

function clearAccessCookies(response: NextResponse) {
    response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
    response.cookies.delete(TELEGRAM_GATE_COOKIE);
    response.cookies.delete(STUDENT_SESSION_COOKIE);
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token") ?? undefined;
    const access = verifyTelegramAccessToken(token);

    if (!access || !token) {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=invalid", request.url),
        );
        clearAccessCookies(response);
        return response;
    }

    // These two operations do not depend on each other, so do not serialize
    // them. This path is the first server hop when the Telegram Mini App opens.
    const [subscribed, registeredUser] = await Promise.all([
        isTelegramChannelMember(access.telegramUserId),
        getUserByTelegramId(access.telegramUserId),
    ]);

    if (!subscribed) {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=subscription", request.url),
        );
        clearAccessCookies(response);
        return response;
    }

    if (registeredUser?.status === "blocked") {
        const response = NextResponse.redirect(
            new URL("/access-required?reason=blocked", request.url),
        );
        clearAccessCookies(response);
        return response;
    }

    const requestedDestination = getSafeDestination(
        request.nextUrl.searchParams.get("next"),
    );
    const destination = registeredUser?.status === "active"
        ? requestedDestination
        : "/onboarding";

    const response = NextResponse.redirect(
        new URL(destination, request.url),
    );

    response.cookies.set(
        TELEGRAM_ACCESS_COOKIE,
        token,
        telegramAccessCookieOptions,
    );
    response.cookies.set(
        TELEGRAM_GATE_COOKIE,
        createTelegramGateToken(access.telegramUserId),
        telegramGateCookieOptions,
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
