import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";

export async function getUserByTelegramId(telegramUserId: number) {
    const [user] = await db
        .select({
            id: users.id,
            status: users.status,
        })
        .from(users)
        .where(eq(users.telegramUserId, telegramUserId))
        .limit(1);

    return user ?? null;
}
