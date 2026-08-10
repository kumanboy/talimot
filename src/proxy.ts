import {
    NextResponse,
} from "next/server";
import type {
    NextRequest,
} from "next/server";

import {
    ADMIN_SESSION_COOKIE,
    verifyAdminSessionToken,
} from "@/features/admin/model/admin-session";
import {
    TELEGRAM_ACCESS_COOKIE,
    verifyTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";

export async function proxy(
    request: NextRequest,
) {
    const {
        pathname,
    } = request.nextUrl;

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
        return response;
    }

    // IMPORTANT: a valid signed cookie alone is not enough. The user may have
    // left the required Telegram channel after an earlier verification.
    // Re-check current membership before every protected request.
    const subscribed = await isTelegramChannelMember(
        telegramAccess.telegramUserId,
    );

    if (!subscribed) {
        const url = new URL("/access-required", request.url);
        url.searchParams.set("reason", "subscription");
        url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

        const response = NextResponse.redirect(url);
        response.cookies.delete(TELEGRAM_ACCESS_COOKIE);
        return response;
    }

    return NextResponse.next();
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
