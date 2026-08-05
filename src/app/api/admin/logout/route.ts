import {
    NextResponse,
} from "next/server";

import {
    ADMIN_SESSION_COOKIE,
} from "@/features/admin/model/admin-session";

export async function POST(
    request: Request,
) {
    const response =
        NextResponse.redirect(
            new URL(
                "/admin/login",
                request.url,
            ),
            {
                status: 303,
            },
        );

    response.cookies.set(
        ADMIN_SESSION_COOKIE,
        "",
        {
            httpOnly: true,
            sameSite: "strict",
            secure:
                process.env.NODE_ENV ===
                "production",
            path: "/",
            maxAge: 0,
        },
    );

    return response;
}
