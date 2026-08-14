import "server-only";

import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";

export type AdminUserStatusFilter =
    | "all"
    | "active"
    | "blocked";

export type AdminUserRoleFilter =
    | "all"
    | "student"
    | "admin";

export type AdminUserListItem = {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
    readonly phone: string;
    readonly role: string;
    readonly status: string;
    readonly telegramUserId: number | null;
    readonly telegramUsername: string | null;
    readonly phoneVerifiedAt: number | null;
    readonly createdAt: number;
    readonly updatedAt: number;
};

export type AdminUsersOverview = {
    readonly records: readonly AdminUserListItem[];
    readonly totalCount: number;
    readonly activeCount: number;
    readonly blockedCount: number;
    readonly verifiedCount: number;
};

function cleanSearch(value: string): string {
    return value
        .trim()
        .toLocaleLowerCase("uz-UZ")
        .slice(0, 80);
}

/**
 * Admin users currently fit comfortably in a single lightweight query.
 *
 * The previous implementation opened two DB operations at the same time
 * (stats + records). With a serverless Transaction Pooler and a one-
 * connection postgres.js client that could queue unnecessarily when the
 * pool was under pressure. We fetch the small user directory once and
 * derive counters + filters in memory.
 *
 * When the platform reaches thousands of users this should be replaced by
 * cursor pagination + a dedicated aggregate query/API endpoint.
 */
export async function getAdminUsersOverview(options?: {
    search?: string;
    status?: AdminUserStatusFilter;
    role?: AdminUserRoleFilter;
}): Promise<AdminUsersOverview> {
    const search = cleanSearch(options?.search ?? "");
    const status = options?.status ?? "all";
    const role = options?.role ?? "all";

    const queryStartedAt = Date.now();
    console.info("[admin/users] directory query started");

    const allUsers = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            role: users.role,
            status: users.status,
            telegramUserId: users.telegramUserId,
            telegramUsername: users.telegramUsername,
            phoneVerifiedAt: users.phoneVerifiedAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(1000);

    console.info(
        "[admin/users] directory query completed",
        {
            durationMs: Date.now() - queryStartedAt,
            rowCount: allUsers.length,
        },
    );

    const records = allUsers.filter((user) => {
        if (status !== "all" && user.status !== status) {
            return false;
        }

        if (role !== "all" && user.role !== role) {
            return false;
        }

        if (!search) {
            return true;
        }

        const haystack = [
            user.id,
            user.firstName,
            user.lastName,
            user.fatherName,
            user.phone,
            user.telegramUsername ?? "",
            user.telegramUserId ? String(user.telegramUserId) : "",
        ]
            .join(" ")
            .toLocaleLowerCase("uz-UZ");

        return haystack.includes(search);
    });

    return {
        records,
        totalCount: allUsers.length,
        activeCount: allUsers.filter(
            (user) => user.status === "active",
        ).length,
        blockedCount: allUsers.filter(
            (user) => user.status === "blocked",
        ).length,
        verifiedCount: allUsers.filter(
            (user) => Boolean(user.phoneVerifiedAt),
        ).length,
    };
}

export async function getAdminUserById(userId: string) {
    const [user] = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            role: users.role,
            status: users.status,
            telegramUserId: users.telegramUserId,
            telegramChatId: users.telegramChatId,
            telegramUsername: users.telegramUsername,
            phoneVerifiedAt: users.phoneVerifiedAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user ?? null;
}
