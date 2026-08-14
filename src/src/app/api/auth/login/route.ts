import { eq } from "drizzle-orm";
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
import {
    normalizeUzbekPhone,
    verifyPassword,
} from "@/features/auth/server/registration-security";
import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginRequestBody = {
    phone?: unknown;
    password?: unknown;
};

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as LoginRequestBody;
        const phone = typeof body.phone === "string"
            ? normalizeUzbekPhone(body.phone)
            : null;
        const password = typeof body.password === "string"
            ? body.password
            : "";

        if (!phone || password.length < 8 || password.length > 200) {
            return NextResponse.json(
                { error: "Telefon raqami yoki parol noto‘g‘ri." },
                { status: 400 },
            );
        }

        const accessToken = request.cookies.get(TELEGRAM_ACCESS_COOKIE)?.value;
        const telegramAccess = verifyTelegramAccessToken(accessToken);

        if (!telegramAccess) {
            return NextResponse.json(
                { error: "Telegram orqali kirish tasdiqlanmagan." },
                { status: 401 },
            );
        }

        const [user] = await db
            .select({
                id: users.id,
                passwordHash: users.passwordHash,
                status: users.status,
                telegramUserId: users.telegramUserId,
            })
            .from(users)
            .where(eq(users.phone, phone))
            .limit(1);

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return NextResponse.json(
                { error: "Telefon raqami yoki parol noto‘g‘ri." },
                { status: 401 },
            );
        }

        if (user.status !== "active") {
            return NextResponse.json(
                { error: "Foydalanuvchi hisobi faol emas." },
                { status: 403 },
            );
        }

        if (
            user.telegramUserId !== null &&
            user.telegramUserId !== telegramAccess.telegramUserId
        ) {
            return NextResponse.json(
                { error: "Bu hisob boshqa Telegram akkauntiga ulangan." },
                { status: 403 },
            );
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(
            STUDENT_SESSION_COOKIE,
            createStudentSessionToken(user.id),
            studentSessionCookieOptions,
        );

        return response;
    } catch (error) {
        console.error("Student login failed", error);

        return NextResponse.json(
            { error: "Kirishda xatolik yuz berdi. Qayta urinib ko‘ring." },
            { status: 500 },
        );
    }
}
