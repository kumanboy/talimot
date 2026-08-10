import {
    bigint,
    index,
    integer,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const tangaTransactions = pgTable(
    "tanga_transactions",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        direction: text("direction")
            .$type<"credit" | "debit">()
            .notNull(),
        amount: integer("amount").notNull(),
        balanceBefore: integer("balance_before").notNull(),
        balanceAfter: integer("balance_after").notNull(),
        source: text("source").notNull(),
        referenceType: text("reference_type"),
        referenceId: text("reference_id"),
        note: text("note"),
        createdBy: text("created_by"),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        index("tanga_transactions_user_created_idx").on(
            table.userId,
            table.createdAt,
        ),
        index("tanga_transactions_source_idx").on(table.source),
        index("tanga_transactions_reference_idx").on(
            table.referenceType,
            table.referenceId,
        ),
    ],
);

export type TangaTransactionRow = typeof tangaTransactions.$inferSelect;
export type NewTangaTransactionRow = typeof tangaTransactions.$inferInsert;
