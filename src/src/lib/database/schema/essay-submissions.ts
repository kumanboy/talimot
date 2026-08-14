import {
    bigint,
    index,
    integer,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { studentTestAttempts } from "./student-test-attempts";
import { users } from "./users";

export type EssayReviewType = "ai" | "teacher";
export type EssaySubmissionType = "text" | "images";
export type EssaySourceType = "standalone" | "diagnostic";
export type EssaySubmissionStatus =
    | "pending"
    | "processing"
    | "in_review"
    | "completed"
    | "failed"
    | "cancelled";

export const essaySubmissions = pgTable(
    "essay_submissions",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        sourceType: text("source_type")
            .$type<EssaySourceType>()
            .notNull()
            .default("standalone"),
        diagnosticAttemptId: text("diagnostic_attempt_id")
            .references(() => studentTestAttempts.id, { onDelete: "set null" }),
        reviewType: text("review_type")
            .$type<EssayReviewType>()
            .notNull(),
        submissionType: text("submission_type")
            .$type<EssaySubmissionType>()
            .notNull(),
        topic: text("topic").notNull(),
        essayText: text("essay_text"),
        tangaCost: integer("tanga_cost").notNull(),
        status: text("status")
            .$type<EssaySubmissionStatus>()
            .notNull()
            .default("pending"),
        assignedReviewerId: text("assigned_reviewer_id"),
        tangaTransactionId: text("tanga_transaction_id"),
        submittedAt: bigint("submitted_at", { mode: "number" }).notNull(),
        startedAt: bigint("started_at", { mode: "number" }),
        completedAt: bigint("completed_at", { mode: "number" }),
        cancelledAt: bigint("cancelled_at", { mode: "number" }),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    },
    (table) => [
        index("essay_submissions_user_created_idx").on(table.userId, table.createdAt),
        index("essay_submissions_status_created_idx").on(table.status, table.createdAt),
        index("essay_submissions_review_status_idx").on(table.reviewType, table.status, table.createdAt),
        index("essay_submissions_diagnostic_idx").on(table.diagnosticAttemptId),
    ],
);

export type EssaySubmissionRow = typeof essaySubmissions.$inferSelect;
export type NewEssaySubmissionRow = typeof essaySubmissions.$inferInsert;
