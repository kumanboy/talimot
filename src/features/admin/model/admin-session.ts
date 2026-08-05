import "server-only";

import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

import {
    cookies,
} from "next/headers";

export const ADMIN_SESSION_COOKIE =
    "talimot_admin_session";

const SESSION_DURATION_SECONDS =
    60 * 60 * 8;

type AdminSessionPayload = {
    readonly role: "admin";
    readonly issuedAt: number;
    readonly expiresAt: number;
};

function getSessionSecret(): string {
    const value =
        process.env.ADMIN_SESSION_SECRET;

    if (!value || value.length < 32) {
        throw new Error(
            "ADMIN_SESSION_SECRET kamida 32 belgidan iborat bo‘lishi kerak.",
        );
    }

    return value;
}

function encodeBase64Url(
    value: string,
): string {
    return Buffer.from(
        value,
        "utf8",
    ).toString("base64url");
}

function decodeBase64Url(
    value: string,
): string {
    return Buffer.from(
        value,
        "base64url",
    ).toString("utf8");
}

function createSignature(
    payload: string,
): string {
    return createHmac(
        "sha256",
        getSessionSecret(),
    )
        .update(payload)
        .digest("base64url");
}

function signaturesMatch(
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

export function createAdminSessionToken():
    string {
    const issuedAt =
        Date.now();

    const payload:
        AdminSessionPayload = {
            role: "admin",
            issuedAt,
            expiresAt:
                issuedAt +
                SESSION_DURATION_SECONDS *
                    1000,
        };

    const encodedPayload =
        encodeBase64Url(
            JSON.stringify(payload),
        );

    const signature =
        createSignature(encodedPayload);

    return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
    token: string | undefined,
): boolean {
    if (!token) {
        return false;
    }

    const [
        encodedPayload,
        providedSignature,
    ] = token.split(".");

    if (
        !encodedPayload ||
        !providedSignature
    ) {
        return false;
    }

    const expectedSignature =
        createSignature(encodedPayload);

    if (
        !signaturesMatch(
            providedSignature,
            expectedSignature,
        )
    ) {
        return false;
    }

    try {
        const payload =
            JSON.parse(
                decodeBase64Url(
                    encodedPayload,
                ),
            ) as Partial<AdminSessionPayload>;

        return (
            payload.role === "admin" &&
            typeof payload.expiresAt ===
                "number" &&
            payload.expiresAt > Date.now()
        );
    } catch {
        return false;
    }
}

export async function hasValidAdminSession():
    Promise<boolean> {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            ADMIN_SESSION_COOKIE,
        )?.value;

    return verifyAdminSessionToken(token);
}

export const adminSessionCookieOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure:
        process.env.NODE_ENV ===
        "production",
    path: "/",
    maxAge:
        SESSION_DURATION_SECONDS,
};
