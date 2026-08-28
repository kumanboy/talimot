import "server-only";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

const getCachedUserStatus = unstable_cache(
    async (userId: string) => {
        const [user] = await db
            .select({
                id: users.id,
                status: users.status,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return user ?? null;
    },
    ["active-student-user-status-v1"],
    { revalidate: 30 },
);

export async function getActiveStudentUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);

    if (!session) {
        return null;
    }

    const user = await getCachedUserStatus(session.userId);

    return user?.status === "active"
        ? user.id
        : null;
}
