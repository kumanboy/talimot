import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/database/db";
import { essaySubmissions, users } from "@/lib/database/schema";
import type {
    EssayReviewType,
    EssaySubmissionStatus,
    EssaySubmissionType,
} from "@/lib/database/schema/essay-submissions";

export type AdminEssayQueueRecord = {
    readonly id: string;
    readonly userId: string;
    readonly userNumber: number;
    readonly fullName: string;
    readonly phone: string;
    readonly telegramUsername: string | null;
    readonly reviewType: EssayReviewType;
    readonly submissionType: EssaySubmissionType;
    readonly topic: string;
    readonly status: EssaySubmissionStatus;
    readonly sourceType: "standalone" | "diagnostic";
    readonly tangaCost: number;
    readonly createdAt: number;
    readonly submittedAt: number;
};

export type AdminEssayQueueOverview = {
    readonly records: readonly AdminEssayQueueRecord[];
    readonly totalCount: number;
    readonly pendingCount: number;
    readonly inReviewCount: number;
    readonly completedCount: number;
    readonly teacherPendingCount: number;
};

function normalizeSearch(value: string): string {
    return value.trim().toLocaleLowerCase("uz-UZ").slice(0, 80);
}

export async function getAdminEssayQueue(options?: {
    search?: string;
    status?: string;
    reviewType?: string;
}): Promise<AdminEssayQueueOverview> {
    const rows = await db
        .select({
            id: essaySubmissions.id,
            userId: essaySubmissions.userId,
            userNumber: users.userNumber,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            telegramUsername: users.telegramUsername,
            reviewType: essaySubmissions.reviewType,
            submissionType: essaySubmissions.submissionType,
            topic: essaySubmissions.topic,
            status: essaySubmissions.status,
            sourceType: essaySubmissions.sourceType,
            tangaCost: essaySubmissions.tangaCost,
            createdAt: essaySubmissions.createdAt,
            submittedAt: essaySubmissions.submittedAt,
        })
        .from(essaySubmissions)
        .innerJoin(users, eq(users.id, essaySubmissions.userId))
        .orderBy(desc(essaySubmissions.createdAt))
        .limit(500);

    const allRecords: AdminEssayQueueRecord[] = rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userNumber: row.userNumber,
        fullName: `${row.firstName} ${row.lastName}`,
        phone: row.phone,
        telegramUsername: row.telegramUsername,
        reviewType: row.reviewType,
        submissionType: row.submissionType,
        topic: row.topic,
        status: row.status,
        sourceType: row.sourceType,
        tangaCost: row.tangaCost,
        createdAt: row.createdAt,
        submittedAt: row.submittedAt,
    }));

    const search = normalizeSearch(options?.search ?? "");
    const status = options?.status?.trim() ?? "";
    const reviewType = options?.reviewType?.trim() ?? "";

    const records = allRecords.filter((record) => {
        if (status && record.status !== status) return false;
        if (reviewType && record.reviewType !== reviewType) return false;
        if (!search) return true;

        return [
            record.id,
            String(record.userNumber),
            record.fullName,
            record.phone,
            record.telegramUsername ?? "",
            record.topic,
        ].join(" ").toLocaleLowerCase("uz-UZ").includes(search);
    });

    return {
        records,
        totalCount: allRecords.length,
        pendingCount: allRecords.filter((record) => record.status === "pending").length,
        inReviewCount: allRecords.filter((record) => record.status === "in_review").length,
        completedCount: allRecords.filter((record) => record.status === "completed").length,
        teacherPendingCount: allRecords.filter(
            (record) => record.reviewType === "teacher" && record.status === "pending",
        ).length,
    };
}
