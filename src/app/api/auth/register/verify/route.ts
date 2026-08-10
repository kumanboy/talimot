import { randomUUID } from "node:crypto";

import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    createStudentSessionToken,
    studentSessionCookieOptions,
} from "@/features/auth/model/student-session";
import {
    TELEGRAM_ACCESS_COOKIE,
    verifyTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";
import { verificationCodesMatch } from "@/features/auth/server/registration-security";
import { db } from "@/lib/database/db";
import {
    telegramAuthChallenges,
    users,
} from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CODE_ATTEMPTS = 5;

type VerifyRegistrationBody = {
    challengeId?: unknown;
    code?: unknown;
};

export async function POST(request: NextRequest) {
    try {
        const accessToken = request.cookies.get(TELEGRAM_ACCESS_COOKIE)?.value;
        const access = verifyTelegramAccessToken(accessToken);

        if (!access) {
            return NextResponse.json(
                { error: "Telegram orqali kirish tasdiqlanmagan." },
                { status: 401 },
            );
        }

        const body = (await request.json()) as VerifyRegistrationBody;
        const challengeId = typeof body.challengeId === "string"
            ? body.challengeId.trim()
            : "";
        const code = typeof body.code === "string"
            ? body.code.replace(/\D/g, "")
            : "";

        if (!challengeId || !/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "6 xonali tasdiqlash kodini kiriting." },
                { status: 400 },
            );
        }

        const [challenge] = await db
            .select()
            .from(telegramAuthChallenges)
            .where(eq(telegramAuthChallenges.id, challengeId))
            .limit(1);

        if (!challenge || challenge.telegramUserId !== access.telegramUserId) {
            return NextResponse.json(
                { error: "Tasdiqlash so‘rovi topilmadi." },
                { status: 404 },
            );
        }

        const now = Date.now();

        if (challenge.expiresAt <= now) {
            return NextResponse.json(
                { error: "Tasdiqlash vaqti tugagan. Ro‘yxatdan o‘tishni qayta boshlang." },
                { status: 410 },
            );
        }

        if (
            challenge.status !== "code_sent" ||
            !challenge.codeHash ||
            !challenge.codeExpiresAt
        ) {
            return NextResponse.json(
                {
                    error:
                        "Avval Telegram botda telefon raqamingizni tasdiqlang va kodni oling.",
                },
                { status: 409 },
            );
        }

        if (challenge.codeExpiresAt <= now) {
            return NextResponse.json(
                { error: "Tasdiqlash kodi eskirgan. Telegram botda jarayonni qayta boshlang." },
                { status: 410 },
            );
        }

        if (challenge.attempts >= MAX_CODE_ATTEMPTS) {
            return NextResponse.json(
                { error: "Kod juda ko‘p marta noto‘g‘ri kiritildi. Jarayonni qayta boshlang." },
                { status: 429 },
            );
        }

        const codeMatches = verificationCodesMatch(
            challenge.id,
            code,
            challenge.codeHash,
        );

        if (!codeMatches) {
            const attempts = challenge.attempts + 1;

            await db
                .update(telegramAuthChallenges)
                .set({
                    attempts,
                    updatedAt: now,
                })
                .where(eq(telegramAuthChallenges.id, challenge.id));

            return NextResponse.json(
                {
                    error: "Tasdiqlash kodi noto‘g‘ri.",
                    attemptsRemaining: Math.max(0, MAX_CODE_ATTEMPTS - attempts),
                },
                { status: 400 },
            );
        }

        const subscribed = await isTelegramChannelMember(access.telegramUserId);

        if (!subscribed) {
            return NextResponse.json(
                { error: "Telegram kanal obunasi topilmadi." },
                { status: 403 },
            );
        }

        const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(
                or(
                    eq(users.phone, challenge.phone),
                    eq(users.telegramUserId, access.telegramUserId),
                ),
            )
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { error: "Bu foydalanuvchi allaqachon ro‘yxatdan o‘tgan." },
                { status: 409 },
            );
        }

        const userId = randomUUID();

        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                id: userId,
                firstName: challenge.firstName,
                lastName: challenge.lastName,
                fatherName: challenge.fatherName,
                phone: challenge.phone,
                passwordHash: challenge.passwordHash,
                role: "student",
                status: "active",
                telegramUserId: access.telegramUserId,
                telegramChatId: challenge.telegramChatId ?? access.telegramUserId,
                telegramUsername: challenge.telegramUsername,
                phoneVerifiedAt: now,
                createdAt: now,
                updatedAt: now,
            });

            await tx
                .update(telegramAuthChallenges)
                .set({
                    status: "completed",
                    completedAt: now,
                    updatedAt: now,
                    codeHash: null,
                    codeExpiresAt: null,
                })
                .where(eq(telegramAuthChallenges.id, challenge.id));
        });

        const response = NextResponse.json({
            ok: true,
            destination: challenge.destination,
        });

        response.cookies.set(
            STUDENT_SESSION_COOKIE,
            createStudentSessionToken(userId),
            studentSessionCookieOptions,
        );

        return response;
    } catch (error) {
        console.error("Registration verification failed", error);

        return NextResponse.json(
            {
                error:
                    "Tasdiqlashda xatolik yuz berdi. Qayta urinib ko‘ring.",
            },
            { status: 500 },
        );
    }
}
