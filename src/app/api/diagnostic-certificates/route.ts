import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import { diagnosticCertificates } from "@/lib/database/schema/diagnostic-certificates";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getActiveUser(request: NextRequest) {
    const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);
    if (!session) return null;

    const [user] = await db
        .select({
            id: users.id,
            status: users.status,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    return user?.status === "active" ? user : null;
}

function toNumber(value: string | null): number | null {
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function mapCertificate(
    row: typeof diagnosticCertificates.$inferSelect,
) {
    const testScore = toNumber(row.testScore) ?? 0;
    const essayScore = toNumber(row.essayScore);
    const finalScore = toNumber(row.finalScore);
    const percentage = toNumber(row.percentage) ?? 0;

    return {
        attemptId: row.attemptId,
        certificateId: row.certificateCode,
        issuedAt: row.issuedAt,
        owner: {
            firstName: row.firstName,
            lastName: row.lastName,
            fatherName: row.fatherName,
        },
        result: {
            testTitle: row.testTitle,
            subject: row.subject,
            testScore,
            essayScore,
            finalScore,
            grade: row.grade,
            score: finalScore ?? testScore,
            maximumScore: 75 as const,
            percentage,
            correctCount: Number(row.correctCount) || 0,
            incorrectCount: Number(row.incorrectCount) || 0,
            unansweredCount: Number(row.unansweredCount) || 0,
            pendingCount: 0,
        },
    };
}

export async function GET(request: NextRequest) {
    try {
        const user = await getActiveUser(request);
        if (!user) {
            return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        }

        const attemptId = request.nextUrl.searchParams.get("attempt")?.trim();

        if (attemptId) {
            const [row] = await db
                .select()
                .from(diagnosticCertificates)
                .where(
                    and(
                        eq(diagnosticCertificates.userId, user.id),
                        eq(diagnosticCertificates.attemptId, attemptId),
                    ),
                )
                .limit(1);

            if (!row) return NextResponse.json({ error: "Sertifikat topilmadi." }, { status: 404 });
            return NextResponse.json({ certificate: mapCertificate(row) });
        }

        const rows = await db
            .select()
            .from(diagnosticCertificates)
            .where(eq(diagnosticCertificates.userId, user.id))
            .orderBy(desc(diagnosticCertificates.issuedAt))
            .limit(100);

        return NextResponse.json({
            certificates: rows.map((row) => mapCertificate(row)),
        });
    } catch (error) {
        console.error("Diagnostic certificate read failed", error);
        return NextResponse.json({ error: "Sertifikatlarni yuklab bo‘lmadi." }, { status: 500 });
    }
}
