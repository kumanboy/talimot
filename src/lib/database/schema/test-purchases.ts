import {
    bigint,
    index,
    integer,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { adminTestDrafts } from "./admin-test-drafts";
import { tangaTransactions } from "./tanga-transactions";
import { users } from "./users";

export const testPurchases = pgTable(
    "test_purchases",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        testId: text("test_id")
            .notNull()
            .references(() => adminTestDrafts.id, {
                onDelete: "cascade",
            }),
        pricePaid: integer("price_paid").notNull(),
        tangaTransactionId: text("tanga_transaction_id")
            .references(() => tangaTransactions.id, {
                onDelete: "set null",
            }),
        purchasedAt: bigint("purchased_at", {
            mode: "number",
        }).notNull(),
    },
    (table) => [
        uniqueIndex("test_purchases_user_test_unique").on(
            table.userId,
            table.testId,
        ),
        uniqueIndex("test_purchases_tanga_transaction_unique").on(
            table.tangaTransactionId,
        ),
        index("test_purchases_user_created_idx").on(
            table.userId,
            table.purchasedAt,
        ),
        index("test_purchases_test_idx").on(table.testId),
    ],
);

export type TestPurchaseRow = typeof testPurchases.$inferSelect;
export type NewTestPurchaseRow = typeof testPurchases.$inferInsert;
