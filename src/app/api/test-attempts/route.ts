import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptInput = {
    attemptId?: unknown;
    testId?: unknown;
    metadata?: {
        title?: unknown;
        category?: unknown;
        href?: unknown;
        format?: unknown;
    };
    correctCount?: unknown;
    incorrectCount?: unknown;
    unansweredCount?: unknown;
    needsReviewCount?: unknown;
    percentage?: unknown;
    durationSeconds?: unknown;
    completedAt?: unknown;
    score?: unknown;
    maximumScore?: unknown;
};

function cleanText(value: unknown, max: number): string | null {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, max)
        : null;
}

function safeInteger(value: unknown, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): number | null {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
        ? parsed
        : null;
}

function scoreText(value: unknown): string | null {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? String(parsed).slice(0, 40) : null;
}

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

function normalizeAttempt(input: AttemptInput, userId: string) {
    const id = cleanText(input.attemptId, 180);
    const testId = cleanText(input.testId, 180);
    const title = cleanText(input.metadata?.title, 180);
    const category = cleanText(input.metadata?.category, 120);
    const href = cleanText(input.metadata?.href, 300);
    const percentage = safeInteger(input.percentage, 0, 100);
    const completedAt = safeInteger(input.completedAt, 1);

    if (!id || !testId || !title || !category || !href || percentage === null || completedAt === null) {
        return null;
    }

    return {
        id,
        userId,
        testId,
        title,
        category,
        href,
        format: cleanText(input.metadata?.format, 40),
        correctCount: safeInteger(input.correctCount, 0) ?? 0,
        incorrectCount: safeInteger(input.incorrectCount, 0) ?? 0,
        unansweredCount: safeInteger(input.unansweredCount, 0) ?? 0,
        needsReviewCount: safeInteger(input.needsReviewCount, 0) ?? 0,
        percentage,
        score: scoreText(input.score),
        maximumScore: scoreText(input.maximumScore),
        durationSeconds: safeInteger(input.durationSeconds, 0, 60 * 60 * 24) ?? 0,
        completedAt,
        createdAt: Date.now(),
    };
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getActiveUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        }

        const body = await request.json() as AttemptInput | { attempts?: AttemptInput[] };
        const rawAttempts = Array.isArray((body as { attempts?: AttemptInput[] }).attempts)
            ? (body as { attempts: AttemptInput[] }).attempts.slice(0, 100)
            : [body as AttemptInput];

        const attempts = rawAttempts
            .map((item) => normalizeAttempt(item, userId))
            .filter((item): item is NonNullable<typeof item> => item !== null);

        if (attempts.length === 0) {
            return NextResponse.json({ error: "Natija ma’lumoti noto‘g‘ri." }, { status: 400 });
        }

        const inserted = await db
            .insert(studentTestAttempts)
            .values(attempts)
            .onConflictDoNothing({ target: studentTestAttempts.id })
            .returning({ id: studentTestAttempts.id });

        return NextResponse.json({ ok: true, inserted: inserted.length });
    } catch (error) {
        console.error("Test attempt persistence failed", error);
        return NextResponse.json({ error: "Natijani saqlab bo‘lmadi." }, { status: 500 });
    }
}
