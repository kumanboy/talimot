import "server-only";

import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

export const STUDENT_SESSION_COOKIE = "talimot_student_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

type StudentSessionPayload = {
    readonly userId: string;
    readonly role: "student";
    readonly issuedAt: number;
    readonly expiresAt: number;
};

function getSessionSecret(): string {
    const value = process.env.AUTH_SESSION_SECRET?.trim();

    if (!value || value.length < 32) {
        throw new Error(
            "AUTH_SESSION_SECRET kamida 32 belgidan iborat bo‘lishi kerak.",
        );
    }

    return value;
}

function sign(value: string): string {
    return createHmac("sha256", getSessionSecret())
        .update(value)
        .digest("base64url");
}

function signaturesMatch(first: string, second: string): boolean {
    const firstBuffer = Buffer.from(first);
    const secondBuffer = Buffer.from(second);

    return firstBuffer.length === secondBuffer.length &&
        timingSafeEqual(firstBuffer, secondBuffer);
}

export function createStudentSessionToken(userId: string): string {
    const issuedAt = Date.now();
    const payload: StudentSessionPayload = {
        userId,
        role: "student",
        issuedAt,
        expiresAt: issuedAt + SESSION_DURATION_SECONDS * 1000,
    };
    const encoded = Buffer.from(JSON.stringify(payload), "utf8")
        .toString("base64url");

    return `${encoded}.${sign(encoded)}`;
}

export function verifyStudentSessionToken(
    token: string | undefined,
): StudentSessionPayload | null {
    if (!token) {
        return null;
    }

    const [encoded, providedSignature] = token.split(".");

    if (!encoded || !providedSignature) {
        return null;
    }

    const expectedSignature = sign(encoded);

    if (!signaturesMatch(providedSignature, expectedSignature)) {
        return null;
    }

    try {
        const payload = JSON.parse(
            Buffer.from(encoded, "base64url").toString("utf8"),
        ) as Partial<StudentSessionPayload>;

        if (
            payload.role !== "student" ||
            typeof payload.userId !== "string" ||
            !payload.userId ||
            typeof payload.expiresAt !== "number" ||
            payload.expiresAt <= Date.now()
        ) {
            return null;
        }

        return payload as StudentSessionPayload;
    } catch {
        return null;
    }
}

export const studentSessionCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
};
