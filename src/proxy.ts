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

export function proxy(
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

        return NextResponse.redirect(url);
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
