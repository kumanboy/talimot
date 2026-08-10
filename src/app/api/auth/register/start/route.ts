import { randomBytes } from "node:crypto";

import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    TELEGRAM_ACCESS_COOKIE,
    verifyTelegramAccessToken,
} from "@/features/auth/model/telegram-access";
import { isTelegramChannelMember } from "@/features/auth/server/is-telegram-channel-member";
import {
    hashPassword,
    normalizeUzbekPhone,
} from "@/features/auth/server/registration-security";
import { db } from "@/lib/database/db";
import {
    telegramAuthChallenges,
    users,
} from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHALLENGE_DURATION_MS = 20 * 60 * 1000;

type StartRegistrationBody = {
    firstName?: unknown;
    lastName?: unknown;
    fatherName?: unknown;
    phone?: unknown;
    password?: unknown;
    destination?: unknown;
};

function cleanName(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const cleaned = value.trim().replace(/\s+/g, " ");

    if (cleaned.length < 2 || cleaned.length > 80) {
        return null;
    }

    return cleaned;
}

function getSafeDestination(value: unknown): string {
    if (
        typeof value !== "string" ||
        !value.startsWith("/") ||
        value.startsWith("//")
    ) {
        return "/";
    }

    return value;
}

function getBotUsername(): string {
    const username = process.env.TELEGRAM_VERIFICATION_BOT_USERNAME
        ?.trim()
        .replace(/^@/, "");

    if (!username) {
        throw new Error(
            "TELEGRAM_VERIFICATION_BOT_USERNAME environment variable is not configured.",
        );
    }

    return username;
}

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

        const subscribed = await isTelegramChannelMember(access.telegramUserId);

        if (!subscribed) {
            return NextResponse.json(
                { error: "Telegram kanal obunasi topilmadi." },
                { status: 403 },
            );
        }

        const body = (await request.json()) as StartRegistrationBody;
        const firstName = cleanName(body.firstName);
        const lastName = cleanName(body.lastName);
        const fatherName = cleanName(body.fatherName);
        const phone = typeof body.phone === "string"
            ? normalizeUzbekPhone(body.phone)
            : null;
        const password = typeof body.password === "string"
            ? body.password
            : "";
        const destination = getSafeDestination(body.destination);

        if (!firstName || !lastName || !fatherName) {
            return NextResponse.json(
                { error: "Ism, familiya va otasining ismini to‘liq kiriting." },
                { status: 400 },
            );
        }

        if (!phone) {
            return NextResponse.json(
                { error: "Telegram telefon raqamini to‘liq kiriting." },
                { status: 400 },
            );
        }

        if (password.length < 8 || password.length > 128) {
            return NextResponse.json(
                { error: "Parol 8–128 ta belgidan iborat bo‘lishi kerak." },
                { status: 400 },
            );
        }

        const [existingUser] = await db
            .select({
                id: users.id,
                phone: users.phone,
                telegramUserId: users.telegramUserId,
            })
            .from(users)
            .where(
                or(
                    eq(users.phone, phone),
                    eq(users.telegramUserId, access.telegramUserId),
                ),
            )
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        existingUser.phone === phone
                            ? "Bu telefon raqami bilan hisob allaqachon mavjud. Kirish sahifasidan foydalaning."
                            : "Bu Telegram hisobiga TA’LIMOT akkaunti allaqachon biriktirilgan.",
                },
                { status: 409 },
            );
        }

        const now = Date.now();
        const challengeId = randomBytes(18).toString("base64url");

        await db.insert(telegramAuthChallenges).values({
            id: challengeId,
            telegramUserId: access.telegramUserId,
            firstName,
            lastName,
            fatherName,
            phone,
            passwordHash: hashPassword(password),
            destination,
            status: "pending_bot",
            attempts: 0,
            createdAt: now,
            updatedAt: now,
            expiresAt: now + CHALLENGE_DURATION_MS,
        });

        const botUsername = getBotUsername();
        const startParameter = `verify_${challengeId}`;

        return NextResponse.json({
            ok: true,
            challengeId,
            botUrl: `https://t.me/${botUsername}?start=${startParameter}`,
        });
    } catch (error) {
        console.error("Registration start failed", error);

        return NextResponse.json(
            {
                error:
                    "Ro‘yxatdan o‘tishni boshlashda xatolik yuz berdi. Qayta urinib ko‘ring.",
            },
            { status: 500 },
        );
    }
}
