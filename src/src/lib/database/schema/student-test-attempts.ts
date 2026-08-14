import {
    bigint,
    index,
    integer,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const studentTestAttempts = pgTable(
    "student_test_attempts",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        testId: text("test_id").notNull(),
        title: text("title").notNull(),
        category: text("category").notNull(),
        href: text("href").notNull(),
        format: text("format"),
        correctCount: integer("correct_count").notNull().default(0),
        incorrectCount: integer("incorrect_count").notNull().default(0),
        unansweredCount: integer("unanswered_count").notNull().default(0),
        needsReviewCount: integer("needs_review_count").notNull().default(0),
        percentage: integer("percentage").notNull(),
        score: text("score"),
        maximumScore: text("maximum_score"),
        durationSeconds: integer("duration_seconds").notNull().default(0),
        completedAt: bigint("completed_at", { mode: "number" }).notNull(),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        index("student_test_attempts_user_completed_idx").on(
            table.userId,
            table.completedAt,
        ),
        index("student_test_attempts_user_href_idx").on(
            table.userId,
            table.href,
        ),
        index("student_test_attempts_test_idx").on(table.testId),
    ],
);

export type StudentTestAttemptRow = typeof studentTestAttempts.$inferSelect;
export type NewStudentTestAttemptRow = typeof studentTestAttempts.$inferInsert;
