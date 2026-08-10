import "server-only";

import {
    and,
    desc,
    eq,
    ilike,
    or,
    type SQL,
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
        .replace(/[%_]/g, "")
        .slice(0, 80);
}

export async function getAdminUsersOverview(options?: {
    search?: string;
    status?: AdminUserStatusFilter;
    role?: AdminUserRoleFilter;
}): Promise<AdminUsersOverview> {
    const search = cleanSearch(options?.search ?? "");
    const status = options?.status ?? "all";
    const role = options?.role ?? "all";

    const conditions: SQL[] = [];

    if (search) {
        const pattern = `%${search}%`;
        const searchCondition = or(
            ilike(users.firstName, pattern),
            ilike(users.lastName, pattern),
            ilike(users.fatherName, pattern),
            ilike(users.phone, pattern),
            ilike(users.telegramUsername, pattern),
            ilike(users.id, pattern),
        );

        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }

    if (status !== "all") {
        conditions.push(eq(users.status, status));
    }

    if (role !== "all") {
        conditions.push(eq(users.role, role));
    }

    const whereCondition =
        conditions.length > 0
            ? and(...conditions)
            : undefined;

    const [allUsers, records] = await Promise.all([
        db
            .select({
                status: users.status,
                phoneVerifiedAt: users.phoneVerifiedAt,
            })
            .from(users),
        db
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
            .where(whereCondition)
            .orderBy(desc(users.createdAt))
            .limit(250),
    ]);

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
