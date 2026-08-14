import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import {
    tangaWallets,
    users,
} from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
        const session = verifyStudentSessionToken(token);

        if (!session) {
            return NextResponse.json(
                { error: "Foydalanuvchi sessiyasi topilmadi." },
                { status: 401 },
            );
        }

        const [record] = await db
            .select({
                balance: tangaWallets.balance,
                lifetimeCredited: tangaWallets.lifetimeCredited,
                lifetimeSpent: tangaWallets.lifetimeSpent,
                updatedAt: tangaWallets.updatedAt,
                userNumber: users.userNumber,
                firstName: users.firstName,
                lastName: users.lastName,
                phone: users.phone,
            })
            .from(tangaWallets)
            .innerJoin(
                users,
                and(
                    eq(users.id, tangaWallets.userId),
                    eq(users.status, "active"),
                ),
            )
            .where(eq(tangaWallets.userId, session.userId))
            .limit(1);

        if (!record) {
            return NextResponse.json(
                { error: "Tanga hamyoni topilmadi." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            ok: true,
            wallet: {
                balance: record.balance,
                lifetimeCredited: record.lifetimeCredited,
                lifetimeSpent: record.lifetimeSpent,
                updatedAt: record.updatedAt,
            },
            user: {
                userNumber: record.userNumber,
                firstName: record.firstName,
                lastName: record.lastName,
                phone: record.phone,
            },
        });
    } catch (error) {
        console.error("Tanga wallet fetch failed", error);

        return NextResponse.json(
            { error: "Tanga balansini yuklab bo‘lmadi." },
            { status: 500 },
        );
    }
}
