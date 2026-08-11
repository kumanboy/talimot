import { sql } from "drizzle-orm";

import {
    bigint,
    index,
    integer,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: text("id").primaryKey(),
        userNumber: integer("user_number")
            .notNull()
            .default(sql`nextval('public.talimot_user_number_seq')`),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        fatherName: text("father_name").notNull(),
        phone: text("phone").notNull(),
        passwordHash: text("password_hash").notNull(),
        role: text("role").notNull().default("student"),
        status: text("status").notNull().default("active"),
        telegramUserId: bigint("telegram_user_id", { mode: "number" }),
        telegramChatId: bigint("telegram_chat_id", { mode: "number" }),
        telegramUsername: text("telegram_username"),
        phoneVerifiedAt: bigint("phone_verified_at", { mode: "number" }),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    },
    (table) => [
        uniqueIndex("users_user_number_unique").on(table.userNumber),
        uniqueIndex("users_phone_unique").on(table.phone),
        uniqueIndex("users_telegram_user_id_unique").on(table.telegramUserId),
        index("users_status_idx").on(table.status),
        index("users_created_at_idx").on(table.createdAt),
    ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
