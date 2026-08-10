import {
    bigint,
    integer,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const tangaWallets = pgTable(
    "tanga_wallets",
    {
        userId: text("user_id")
            .primaryKey()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        balance: integer("balance").notNull().default(0),
        lifetimeCredited: integer("lifetime_credited")
            .notNull()
            .default(0),
        lifetimeSpent: integer("lifetime_spent")
            .notNull()
            .default(0),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    },
);

export type TangaWalletRow = typeof tangaWallets.$inferSelect;
export type NewTangaWalletRow = typeof tangaWallets.$inferInsert;
