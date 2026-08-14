import {
    timingSafeEqual,
} from "node:crypto";

import {
    NextResponse,
} from "next/server";

import {
    ADMIN_SESSION_COOKIE,
    adminSessionCookieOptions,
    createAdminSessionToken,
} from "@/features/admin/model/admin-session";

export const runtime = "nodejs";

type LoginBody = {
    readonly accessCode?: unknown;
};

function safeStringsMatch(
    first: string,
    second: string,
): boolean {
    const firstBuffer =
        Buffer.from(first);

    const secondBuffer =
        Buffer.from(second);

    if (
        firstBuffer.length !==
        secondBuffer.length
    ) {
        return false;
    }

    return timingSafeEqual(
        firstBuffer,
        secondBuffer,
    );
}

export async function POST(
    request: Request,
) {
    let body: LoginBody;

    try {
        body =
            await request.json() as LoginBody;
    } catch {
        return NextResponse.json(
            {
                message:
                    "So‘rov ma’lumoti noto‘g‘ri.",
            },
            {
                status: 400,
            },
        );
    }

    const configuredCode =
        process.env.ADMIN_ACCESS_CODE;

    if (!configuredCode) {
        return NextResponse.json(
            {
                message:
                    "Admin access code serverda sozlanmagan.",
            },
            {
                status: 500,
            },
        );
    }

    const submittedCode =
        typeof body.accessCode ===
        "string"
            ? body.accessCode.trim()
            : "";

    if (
        !submittedCode ||
        !safeStringsMatch(
            submittedCode,
            configuredCode,
        )
    ) {
        return NextResponse.json(
            {
                message:
                    "Kirish kodi noto‘g‘ri.",
            },
            {
                status: 401,
            },
        );
    }

    const response =
        NextResponse.json({
            ok: true,
        });

    response.cookies.set(
        ADMIN_SESSION_COOKIE,
        createAdminSessionToken(),
        adminSessionCookieOptions,
    );

    return response;
}
