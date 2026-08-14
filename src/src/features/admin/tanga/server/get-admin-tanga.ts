import "server-only";

import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "@/lib/database/db";
import {
    tangaTransactions,
    tangaWallets,
    users,
} from "@/lib/database/schema";

export type AdminTangaUserRecord = {
    readonly id: string;
    readonly userNumber: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
    readonly phone: string;
    readonly status: string;
    readonly telegramUsername: string | null;
    readonly balance: number;
    readonly lifetimeCredited: number;
    readonly lifetimeSpent: number;
    readonly walletUpdatedAt: number | null;
};

export type AdminTangaTransactionRecord = {
    readonly id: string;
    readonly userId: string;
    readonly userNumber: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly direction: "credit" | "debit";
    readonly amount: number;
    readonly balanceBefore: number;
    readonly balanceAfter: number;
    readonly source: string;
    readonly note: string | null;
    readonly createdBy: string | null;
    readonly createdAt: number;
};

export type AdminTangaOverview = {
    readonly records: readonly AdminTangaUserRecord[];
    readonly recentTransactions: readonly AdminTangaTransactionRecord[];
    readonly walletCount: number;
    readonly totalBalance: number;
    readonly lifetimeCredited: number;
    readonly lifetimeSpent: number;
};

function cleanSearch(value: string): string {
    return value
        .trim()
        .toLocaleLowerCase("uz-UZ")
        .slice(0, 80);
}

export async function getAdminTangaOverview(options?: {
    search?: string;
}): Promise<AdminTangaOverview> {
    const search = cleanSearch(options?.search ?? "");

    const queryStartedAt = Date.now();
    console.info("[admin/tanga] wallet directory query started");

    const allWalletUsers = await db
        .select({
            id: users.id,
            userNumber: users.userNumber,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            status: users.status,
            telegramUsername: users.telegramUsername,
            balance: tangaWallets.balance,
            lifetimeCredited: tangaWallets.lifetimeCredited,
            lifetimeSpent: tangaWallets.lifetimeSpent,
            walletUpdatedAt: tangaWallets.updatedAt,
        })
        .from(users)
        .leftJoin(
            tangaWallets,
            eq(tangaWallets.userId, users.id),
        )
        .orderBy(desc(users.createdAt))
        .limit(1000);

    console.info("[admin/tanga] wallet directory query completed", {
        durationMs: Date.now() - queryStartedAt,
        rowCount: allWalletUsers.length,
    });

    const normalizedRecords: AdminTangaUserRecord[] = allWalletUsers.map(
        (record) => ({
            ...record,
            balance: record.balance ?? 0,
            lifetimeCredited: record.lifetimeCredited ?? 0,
            lifetimeSpent: record.lifetimeSpent ?? 0,
            walletUpdatedAt: record.walletUpdatedAt ?? null,
        }),
    );

    const records = normalizedRecords.filter((record) => {
        if (!search) {
            return true;
        }

        const haystack = [
            record.id,
            String(record.userNumber),
            record.firstName,
            record.lastName,
            record.fatherName,
            record.phone,
            record.telegramUsername ?? "",
        ]
            .join(" ")
            .toLocaleLowerCase("uz-UZ");

        return haystack.includes(search);
    });

    const transactionStartedAt = Date.now();
    console.info("[admin/tanga] recent transactions query started");

    const recentTransactions = await db
        .select({
            id: tangaTransactions.id,
            userId: tangaTransactions.userId,
            userNumber: users.userNumber,
            firstName: users.firstName,
            lastName: users.lastName,
            direction: tangaTransactions.direction,
            amount: tangaTransactions.amount,
            balanceBefore: tangaTransactions.balanceBefore,
            balanceAfter: tangaTransactions.balanceAfter,
            source: tangaTransactions.source,
            note: tangaTransactions.note,
            createdBy: tangaTransactions.createdBy,
            createdAt: tangaTransactions.createdAt,
        })
        .from(tangaTransactions)
        .innerJoin(users, eq(users.id, tangaTransactions.userId))
        .orderBy(desc(tangaTransactions.createdAt))
        .limit(50);

    console.info("[admin/tanga] recent transactions query completed", {
        durationMs: Date.now() - transactionStartedAt,
        rowCount: recentTransactions.length,
    });

    return {
        records,
        recentTransactions,
        walletCount: normalizedRecords.length,
        totalBalance: normalizedRecords.reduce(
            (total, record) => total + record.balance,
            0,
        ),
        lifetimeCredited: normalizedRecords.reduce(
            (total, record) => total + record.lifetimeCredited,
            0,
        ),
        lifetimeSpent: normalizedRecords.reduce(
            (total, record) => total + record.lifetimeSpent,
            0,
        ),
    };
}

export async function getAdminTangaUser(userId: string) {
    const [record] = await db
        .select({
            id: users.id,
            userNumber: users.userNumber,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            status: users.status,
            telegramUsername: users.telegramUsername,
            balance: tangaWallets.balance,
            lifetimeCredited: tangaWallets.lifetimeCredited,
            lifetimeSpent: tangaWallets.lifetimeSpent,
            walletUpdatedAt: tangaWallets.updatedAt,
        })
        .from(users)
        .leftJoin(
            tangaWallets,
            eq(tangaWallets.userId, users.id),
        )
        .where(eq(users.id, userId))
        .limit(1);

    if (!record) {
        return null;
    }

    const transactions = await db
        .select({
            id: tangaTransactions.id,
            userId: tangaTransactions.userId,
            direction: tangaTransactions.direction,
            amount: tangaTransactions.amount,
            balanceBefore: tangaTransactions.balanceBefore,
            balanceAfter: tangaTransactions.balanceAfter,
            source: tangaTransactions.source,
            note: tangaTransactions.note,
            createdBy: tangaTransactions.createdBy,
            createdAt: tangaTransactions.createdAt,
        })
        .from(tangaTransactions)
        .where(eq(tangaTransactions.userId, userId))
        .orderBy(desc(tangaTransactions.createdAt))
        .limit(100);

    return {
        user: {
            ...record,
            balance: record.balance ?? 0,
            lifetimeCredited: record.lifetimeCredited ?? 0,
            lifetimeSpent: record.lifetimeSpent ?? 0,
            walletUpdatedAt: record.walletUpdatedAt ?? null,
        },
        transactions,
    };
}
