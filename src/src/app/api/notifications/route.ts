import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import { notifications } from "@/lib/database/schema/notifications";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getActiveUserId(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);
    if (!session) return null;

    const [user] = await db
        .select({ id: users.id, status: users.status })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    return user?.status === "active" ? user.id : null;
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getActiveUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        }

        const rows = await db
            .select({
                id: notifications.id,
                kind: notifications.kind,
                title: notifications.title,
                message: notifications.message,
                href: notifications.href,
                isRead: notifications.isRead,
                createdAt: notifications.createdAt,
            })
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(30);

        return NextResponse.json({
            ok: true,
            notifications: rows,
            unreadCount: rows.filter((item) => !item.isRead).length,
        });
    } catch (error) {
        console.error("Notifications fetch failed", error);
        return NextResponse.json({ error: "Bildirishnomalarni yuklab bo‘lmadi." }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const userId = await getActiveUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        }

        const body = await request.json() as { id?: unknown; markAll?: unknown };

        if (body.markAll === true) {
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false),
                ));
            return NextResponse.json({ ok: true });
        }

        const id = typeof body.id === "string" ? body.id.trim() : "";
        if (!id) {
            return NextResponse.json({ error: "Bildirishnoma ID kerak." }, { status: 400 });
        }

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, id),
                eq(notifications.userId, userId),
            ));

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Notification update failed", error);
        return NextResponse.json({ error: "Bildirishnomani yangilab bo‘lmadi." }, { status: 500 });
    }
}
