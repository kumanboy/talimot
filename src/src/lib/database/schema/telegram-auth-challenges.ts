import {
    bigint,
    index,
    integer,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

export const telegramAuthChallenges = pgTable(
    "telegram_auth_challenges",
    {
        id: text("id").primaryKey(),
        telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
        telegramChatId: bigint("telegram_chat_id", { mode: "number" }),
        telegramUsername: text("telegram_username"),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        fatherName: text("father_name").notNull(),
        phone: text("phone").notNull(),
        passwordHash: text("password_hash").notNull(),
        destination: text("destination").notNull(),
        roadmapMode: text("roadmap_mode").notNull().default("from-zero"),
        status: text("status").notNull().default("pending_bot"),
        codeHash: text("code_hash"),
        codeExpiresAt: bigint("code_expires_at", { mode: "number" }),
        attempts: integer("attempts").notNull().default(0),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
        expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
        completedAt: bigint("completed_at", { mode: "number" }),
    },
    (table) => [
        index("telegram_auth_challenges_user_idx").on(table.telegramUserId),
        index("telegram_auth_challenges_status_idx").on(table.status),
        index("telegram_auth_challenges_expires_idx").on(table.expiresAt),
    ],
);

export type TelegramAuthChallengeRow =
    typeof telegramAuthChallenges.$inferSelect;
export type NewTelegramAuthChallengeRow =
    typeof telegramAuthChallenges.$inferInsert;
