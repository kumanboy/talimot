import "server-only";

import { desc, eq } from "drizzle-orm";

import { getActiveStudentUserId } from "@/features/auth/server/get-active-student-user";
import { db } from "@/lib/database/db";
import { adminTestDrafts } from "@/lib/database/schema/admin-test-drafts";
import { diagnosticCertificates } from "@/lib/database/schema/diagnostic-certificates";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";
import { testPurchases } from "@/lib/database/schema/test-purchases";

import type {
    MyTestAttempt,
    MyTestLibraryItem,
    MyTestsLibraryData,
} from "@/features/my-tests/model/types";

function parseOptionalNumber(value: string | null): number | null {
    if (value === null || value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function buildDraftHref(
    groupName: string,
    topicSlug: string,
    slug: string,
): string {
    if (groupName === "national-certificate") {
        return `/tests/milliy-sertifikat/${topicSlug}/${slug}`;
    }

    if (groupName === "morphology") {
        return `/tests/grammatika/morfologiya/${topicSlug}/${slug}`;
    }

    return `/tests/grammatika/${topicSlug}/${slug}`;
}

function scoreRatio(attempt: MyTestAttempt): number {
    if (
        attempt.score !== null &&
        attempt.maximumScore !== null &&
        attempt.maximumScore > 0
    ) {
        return attempt.score / attempt.maximumScore;
    }

    return attempt.percentage / 100;
}

export async function getMyTestsLibrary(): Promise<MyTestsLibraryData> {
    const userId = await getActiveStudentUserId();

    if (!userId) {
        return {
            authenticated: false,
            purchasedCount: 0,
            completedTestCount: 0,
            totalAttempts: 0,
            bestPercentage: null,
            items: [],
        };
    }

    const [purchaseRows, attemptRows, certificateRows] = await Promise.all([
        db
            .select({
                testId: testPurchases.testId,
                purchasedAt: testPurchases.purchasedAt,
                pricePaid: testPurchases.pricePaid,
                title: adminTestDrafts.title,
                category: adminTestDrafts.category,
                groupName: adminTestDrafts.groupName,
                topicSlug: adminTestDrafts.topicSlug,
                slug: adminTestDrafts.slug,
                format: adminTestDrafts.format,
                status: adminTestDrafts.status,
            })
            .from(testPurchases)
            .innerJoin(
                adminTestDrafts,
                eq(testPurchases.testId, adminTestDrafts.id),
            )
            .where(eq(testPurchases.userId, userId))
            .orderBy(desc(testPurchases.purchasedAt)),
        db
            .select({
                id: studentTestAttempts.id,
                testId: studentTestAttempts.testId,
                title: studentTestAttempts.title,
                category: studentTestAttempts.category,
                href: studentTestAttempts.href,
                format: studentTestAttempts.format,
                correctCount: studentTestAttempts.correctCount,
                incorrectCount: studentTestAttempts.incorrectCount,
                unansweredCount: studentTestAttempts.unansweredCount,
                percentage: studentTestAttempts.percentage,
                score: studentTestAttempts.score,
                maximumScore: studentTestAttempts.maximumScore,
                durationSeconds: studentTestAttempts.durationSeconds,
                completedAt: studentTestAttempts.completedAt,
            })
            .from(studentTestAttempts)
            .where(eq(studentTestAttempts.userId, userId))
            .orderBy(desc(studentTestAttempts.completedAt))
            .limit(500),
        db
            .select({
                attemptId: diagnosticCertificates.attemptId,
                grade: diagnosticCertificates.grade,
                certificateCode: diagnosticCertificates.certificateCode,
            })
            .from(diagnosticCertificates)
            .where(eq(diagnosticCertificates.userId, userId))
            .orderBy(desc(diagnosticCertificates.issuedAt))
            .limit(250),
    ]);

    type MutableItem = {
        testId: string;
        title: string;
        category: string;
        href: string;
        format: string | null;
        purchased: boolean;
        purchasedAt: number | null;
        tangaPrice: number;
        available: boolean;
        attempts: MyTestAttempt[];
        lastActivityAt: number;
    };

    const itemsByTestId = new Map<string, MutableItem>();

    const certificateByAttemptId = new Map(
        certificateRows.map((row) => [row.attemptId, row] as const),
    );

    for (const purchase of purchaseRows) {
        const href = buildDraftHref(
            purchase.groupName,
            purchase.topicSlug,
            purchase.slug,
        );

        itemsByTestId.set(purchase.testId, {
            testId: purchase.testId,
            title: purchase.title,
            category: purchase.category || "TA’LIMOT testi",
            href,
            format: purchase.format,
            purchased: true,
            purchasedAt: purchase.purchasedAt,
            tangaPrice: purchase.pricePaid,
            available: purchase.status === "published",
            attempts: [],
            lastActivityAt: purchase.purchasedAt,
        });
    }

    for (const row of attemptRows) {
        const certificate = certificateByAttemptId.get(row.id);
        const attempt: MyTestAttempt = {
            id: row.id,
            percentage: row.percentage,
            score: parseOptionalNumber(row.score),
            maximumScore: parseOptionalNumber(row.maximumScore),
            correctCount: row.correctCount,
            incorrectCount: row.incorrectCount,
            unansweredCount: row.unansweredCount,
            durationSeconds: row.durationSeconds,
            completedAt: row.completedAt,
            grade: certificate?.grade ?? null,
            certificateCode: certificate?.certificateCode ?? null,
        };

        const current = itemsByTestId.get(row.testId);

        if (current) {
            current.attempts.push(attempt);
            current.lastActivityAt = Math.max(
                current.lastActivityAt,
                row.completedAt,
            );
            // Attempt metadata is the best fallback if a route/title was changed after purchase.
            if (row.href) current.href = row.href;
            if (row.title) current.title = row.title;
            if (row.category) current.category = row.category;
            if (row.format) current.format = row.format;
            continue;
        }

        itemsByTestId.set(row.testId, {
            testId: row.testId,
            title: row.title,
            category: row.category,
            href: row.href,
            format: row.format,
            purchased: false,
            purchasedAt: null,
            tangaPrice: 0,
            available: true,
            attempts: [attempt],
            lastActivityAt: row.completedAt,
        });
    }

    const items: MyTestLibraryItem[] = [...itemsByTestId.values()]
        .map((item) => {
            const attempts = [...item.attempts].sort(
                (first, second) => second.completedAt - first.completedAt,
            );

            const latestAttempt = attempts[0] ?? null;
            const firstAttempt = attempts.length > 0
                ? attempts[attempts.length - 1]
                : null;
            const bestAttempt = attempts.length > 0
                ? attempts.reduce((best, candidate) =>
                    scoreRatio(candidate) > scoreRatio(best)
                        ? candidate
                        : best,
                )
                : null;

            return {
                testId: item.testId,
                title: item.title,
                category: item.category,
                href: item.href,
                format: item.format,
                purchased: item.purchased,
                purchasedAt: item.purchasedAt,
                tangaPrice: item.tangaPrice,
                available: item.available,
                attemptCount: attempts.length,
                firstAttempt,
                latestAttempt,
                bestAttempt,
                attempts,
                lastActivityAt: item.lastActivityAt,
            };
        })
        .sort((first, second) => second.lastActivityAt - first.lastActivityAt);

    const bestPercentage = attemptRows.length > 0
        ? Math.max(...attemptRows.map((attempt) => attempt.percentage))
        : null;

    return {
        authenticated: true,
        purchasedCount: items.filter((item) => item.purchased).length,
        completedTestCount: items.filter((item) => item.attemptCount > 0).length,
        totalAttempts: attemptRows.length,
        bestPercentage,
        items,
    };
}
