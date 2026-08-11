import {
    bigint,
    index,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { essaySubmissions } from "./essay-submissions";

export type EssayReviewerType = "ai" | "teacher";

export const essayReviews = pgTable(
    "essay_reviews",
    {
        id: text("id").primaryKey(),
        submissionId: text("submission_id")
            .notNull()
            .references(() => essaySubmissions.id, { onDelete: "cascade" }),
        reviewerType: text("reviewer_type")
            .$type<EssayReviewerType>()
            .notNull(),
        reviewerId: text("reviewer_id"),
        rubricVersion: text("rubric_version"),
        score: numeric("score", { precision: 6, scale: 2 }),
        rubricResult: jsonb("rubric_result")
            .$type<Record<string, unknown>>()
            .notNull(),
        summary: text("summary"),
        strengths: text("strengths"),
        improvements: text("improvements"),
        writtenFeedback: text("written_feedback"),
        audioStoragePath: text("audio_storage_path"),
        audioOriginalName: text("audio_original_name"),
        audioMimeType: text("audio_mime_type"),
        audioSizeBytes: integer("audio_size_bytes"),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
        completedAt: bigint("completed_at", { mode: "number" }),
    },
    (table) => [
        uniqueIndex("essay_reviews_submission_unique").on(table.submissionId),
        index("essay_reviews_reviewer_idx").on(table.reviewerType, table.completedAt),
    ],
);

export type EssayReviewRow = typeof essayReviews.$inferSelect;
export type NewEssayReviewRow = typeof essayReviews.$inferInsert;
