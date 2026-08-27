import {
    bigint,
    index,
    integer,
    numeric,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { studentTestAttempts } from "./student-test-attempts";
import { users } from "./users";

export const diagnosticCertificates = pgTable(
    "diagnostic_certificates",
    {
        id: text("id").primaryKey(),
        certificateCode: text("certificate_code").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        attemptId: text("attempt_id")
            .notNull()
            .references(() => studentTestAttempts.id, { onDelete: "cascade" }),
        testId: text("test_id").notNull(),
        testTitle: text("test_title").notNull(),
        subject: text("subject").notNull().default("Ona tili va adabiyot"),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        fatherName: text("father_name").notNull().default(""),
        testScore: numeric("test_score", { precision: 7, scale: 2 }).notNull(),
        essayScore: numeric("essay_score", { precision: 7, scale: 2 }),
        finalScore: numeric("final_score", { precision: 7, scale: 2 }),
        percentage: numeric("percentage", { precision: 7, scale: 2 }),
        grade: text("grade"),
        correctCount: integer("correct_count").notNull().default(0),
        incorrectCount: integer("incorrect_count").notNull().default(0),
        unansweredCount: integer("unanswered_count").notNull().default(0),
        issuedAt: bigint("issued_at", { mode: "number" }).notNull(),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        uniqueIndex("diagnostic_certificates_code_unique").on(table.certificateCode),
        uniqueIndex("diagnostic_certificates_attempt_unique").on(table.attemptId),
        index("diagnostic_certificates_user_issued_idx").on(table.userId, table.issuedAt),
        index("diagnostic_certificates_test_idx").on(table.testId),
    ],
);

export type DiagnosticCertificateRow = typeof diagnosticCertificates.$inferSelect;
export type NewDiagnosticCertificateRow = typeof diagnosticCertificates.$inferInsert;
