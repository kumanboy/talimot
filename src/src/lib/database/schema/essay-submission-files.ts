import {
    bigint,
    index,
    integer,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { essaySubmissions } from "./essay-submissions";

export const essaySubmissionFiles = pgTable(
    "essay_submission_files",
    {
        id: text("id").primaryKey(),
        submissionId: text("submission_id")
            .notNull()
            .references(() => essaySubmissions.id, { onDelete: "cascade" }),
        storagePath: text("storage_path").notNull(),
        originalName: text("original_name").notNull(),
        mimeType: text("mime_type").notNull(),
        sizeBytes: integer("size_bytes").notNull(),
        position: integer("position").notNull(),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        index("essay_submission_files_submission_idx").on(table.submissionId, table.position),
        uniqueIndex("essay_submission_files_submission_position_unique").on(
            table.submissionId,
            table.position,
        ),
    ],
);

export type EssaySubmissionFileRow = typeof essaySubmissionFiles.$inferSelect;
export type NewEssaySubmissionFileRow = typeof essaySubmissionFiles.$inferInsert;
