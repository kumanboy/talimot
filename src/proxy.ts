import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
} from "@/features/admin/model/admin-session";
import {
    TELEGRAM_ACCESS_COOKIE,
    TELEGRAM_GATE_COOKIE,
    createTelegramGateToken,
    telegramGateCookieOptions,
    verifyTelegramAccessToken,
    verifyTelegramGateToken,
} from "@/features/auth/model/telegram-access";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";
import { getUserByTelegramId } from "@/features/auth/server/get-user-by-telegram-id";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/admin")) {
        const isLoginRoute = pathname === "/admin/login";
        const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        const authenticated = verifyAdminSessionToken(token);

        if (!isLoginRoute && !authenticated) {
            return NextResponse.redirect(
                new URL("/admin/login", request.url),
            );
        }

        if (isLoginRoute && authenticated) {
            return NextResponse.redirect(
                new URL("/admin", request.url),
            );
        }

        return NextResponse.next();
    }

    const accessToken = request.cookies.get(TELEGRAM_ACCESS_COOKIE)?.value;
    const telegramAccess = verifyTelegramAccessToken(accessToken);

    if (!telegramAccess) {
        const url = new URL("/access-required", request.url);
        url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

        const response = NextResponse.redirect(url);
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(TELEGRAM_GATE_COOKIE);
        return response;
    }

    // Avoid the old expensive behavior: every navigation previously waited
    // for Telegram getChatMember and then a Postgres user lookup. A signed
    // short-lived gate proves those checks were completed recently.
    const gateToken = request.cookies.get(TELEGRAM_GATE_COOKIE)?.value;
    const recentGate = verifyTelegramGateToken(gateToken);

    if (recentGate?.telegramUserId === telegramAccess.telegramUserId) {
        return NextResponse.next();
    }

    // Refresh both independent checks in parallel once the 10-minute gate
    // expires. This keeps subscription/block enforcement reasonably fresh.
    const [subscribed, registeredUser] = await Promise.all([
        isTelegramChannelMember(telegramAccess.telegramUserId),
        getUserByTelegramId(telegramAccess.telegramUserId),
    ]);

    if (!subscribed) {
        const url = new URL("/access-required", request.url);
        url.searchParams.set("reason", "subscription");
        url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

        const response = NextResponse.redirect(url);
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(TELEGRAM_GATE_COOKIE);
        return response;
    }

    if (registeredUser?.status === "blocked") {
        const url = new URL("/access-required", request.url);
        url.searchParams.set("reason", "blocked");

        const response = NextResponse.redirect(url);
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        response.cookies.delete(TELEGRAM_GATE_COOKIE);
        return response;
    }

    const response = NextResponse.next();
    response.cookies.set(
        TELEGRAM_GATE_COOKIE,
        createTelegramGateToken(telegramAccess.telegramUserId),
        telegramGateCookieOptions,
    );
    return response;
}

export const config = {
    matcher: [
        "/",
        "/onboarding/:path*",
        "/auth/:path*",
        "/tests/:path*",
        "/yol-xaritasi/:path*",
        "/natijalar/:path*",
        "/profil/:path*",
        "/kurslar/:path*",
        "/kitoblar/:path*",
        "/esse-tekshirish/:path*",
        "/packages/:path*",
        "/admin/:path*",
    ],
};
