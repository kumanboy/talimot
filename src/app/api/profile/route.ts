import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanName(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const cleaned = value.trim().replace(/\s+/g, " ");
    return cleaned.length >= 2 && cleaned.length <= 80 ? cleaned : null;
}

async function sessionUser(request: NextRequest) {
    const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);
    if (!session) return null;

    const [user] = await db
        .select({
            id: users.id,
            userNumber: users.userNumber,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            telegramUsername: users.telegramUsername,
            role: users.role,
            status: users.status,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    return user ?? null;
}

export async function GET(request: NextRequest) {
    try {
        const user = await sessionUser(request);
        if (!user) return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        if (user.status !== "active") return NextResponse.json({ error: "Hisob faol emas." }, { status: 403 });
        return NextResponse.json({ ok: true, user });
    } catch (error) {
        console.error("Profile fetch failed", error);
        return NextResponse.json({ error: "Profilni yuklab bo‘lmadi." }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await sessionUser(request);
        if (!user) return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        if (user.status !== "active") return NextResponse.json({ error: "Hisob faol emas." }, { status: 403 });

        const body = await request.json() as {
            firstName?: unknown;
            lastName?: unknown;
            fatherName?: unknown;
        };
        const firstName = cleanName(body.firstName);
        const lastName = cleanName(body.lastName);
        const fatherName = cleanName(body.fatherName);

        if (!firstName || !lastName || !fatherName) {
            return NextResponse.json({ error: "Ism, familiya va otasining ismini to‘liq kiriting." }, { status: 400 });
        }

        const now = Date.now();
        await db
            .update(users)
            .set({ firstName, lastName, fatherName, updatedAt: now })
            .where(eq(users.id, user.id));

        return NextResponse.json({
            ok: true,
            user: {
                ...user,
                firstName,
                lastName,
                fatherName,
            },
        });
    } catch (error) {
        console.error("Profile update failed", error);
        return NextResponse.json({ error: "Profilni saqlab bo‘lmadi." }, { status: 500 });
    }
}
