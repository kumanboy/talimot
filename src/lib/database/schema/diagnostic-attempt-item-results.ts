import {
    bigint,
    boolean,
    index,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { studentTestAttempts } from "./student-test-attempts";
import { users } from "./users";

/**
 * Immutable item-level diagnostic outcome snapshots.
 *
 * These rows are written from the server-authoritative diagnostic scoring
 * result at completion time. They are the source for aggregate item analysis
 * (correct-rate, unanswered-rate and Rasch/1PL calibration) and must never be
 * populated from browser-calculated correctness values.
 */
export const diagnosticAttemptItemResults = pgTable(
    "diagnostic_attempt_item_results",
    {
        id: text("id").primaryKey(),
        attemptId: text("attempt_id")
            .notNull()
            .references(() => studentTestAttempts.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        testId: text("test_id").notNull(),
        questionId: text("question_id").notNull(),
        questionOrder: integer("question_order").notNull(),
        itemKey: text("item_key").notNull(),
        partId: text("part_id"),
        section: text("section").notNull(),
        verdict: text("verdict").notNull(),
        isCorrect: boolean("is_correct").notNull(),
        isAnswered: boolean("is_answered").notNull(),
        awardedScore: numeric("awarded_score", { precision: 7, scale: 2 }).notNull(),
        maximumScore: numeric("maximum_score", { precision: 7, scale: 2 }).notNull(),
        answerPayload: jsonb("answer_payload"),
        completedAt: bigint("completed_at", { mode: "number" }).notNull(),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        uniqueIndex("diagnostic_item_results_attempt_item_unique").on(
            table.attemptId,
            table.itemKey,
        ),
        index("diagnostic_item_results_test_item_idx").on(
            table.testId,
            table.itemKey,
        ),
        index("diagnostic_item_results_test_user_idx").on(
            table.testId,
            table.userId,
        ),
        index("diagnostic_item_results_attempt_idx").on(table.attemptId),
        index("diagnostic_item_results_completed_idx").on(
            table.testId,
            table.completedAt,
        ),
    ],
);

export type DiagnosticAttemptItemResultRow =
    typeof diagnosticAttemptItemResults.$inferSelect;
export type NewDiagnosticAttemptItemResultRow =
    typeof diagnosticAttemptItemResults.$inferInsert;
