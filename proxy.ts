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

export function proxy(
    request: NextRequest,
) {
    const {
        pathname,
    } = request.nextUrl;

    const isLoginRoute =
        pathname === "/admin/login";

    const token =
        request.cookies.get(
            ADMIN_SESSION_COOKIE,
        )?.value;

    const authenticated =
        verifyAdminSessionToken(token);

    if (
        pathname.startsWith("/admin") &&
        !isLoginRoute &&
        !authenticated
    ) {
        return NextResponse.redirect(
            new URL(
                "/admin/login",
                request.url,
            ),
        );
    }

    if (
        isLoginRoute &&
        authenticated
    ) {
        return NextResponse.redirect(
            new URL(
                "/admin",
                request.url,
            ),
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
    ],
};
