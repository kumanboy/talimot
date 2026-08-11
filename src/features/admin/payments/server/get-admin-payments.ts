import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/database/db";
import { manualPayments } from "@/lib/database/schema/manual-payments";
import { users } from "@/lib/database/schema/users";
import type {
    ManualPaymentKind,
    ManualPaymentStatus,
} from "@/lib/database/schema/manual-payments";

export type AdminPaymentRecord = {
    readonly id: string;
    readonly paymentCode: string;
    readonly userId: string | null;
    readonly userNumber: number | null;
    readonly kind: ManualPaymentKind;
    readonly itemKey: string;
    readonly title: string;
    readonly quantity: number;
    readonly amountSom: number;
    readonly paymentMethod: string;
    readonly status: ManualPaymentStatus;
    readonly fullName: string | null;
    readonly phone: string | null;
    readonly telegramUsername: string | null;
    readonly metadata: Record<string, unknown>;
    readonly receiptReference: string | null;
    readonly adminNote: string | null;
    readonly processedBy: string | null;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly processedAt: number | null;
};

export type AdminPaymentsOverview = {
    readonly records: readonly AdminPaymentRecord[];
    readonly totalCount: number;
    readonly pendingCount: number;
    readonly confirmedCount: number;
    readonly rejectedCount: number;
    readonly confirmedRevenueSom: number;
};

function code(id: string): string {
    return `PAY-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function clean(value: string): string {
    return value.trim().toLocaleLowerCase("uz-UZ").slice(0, 80);
}

export async function getAdminPaymentsOverview(options?: {
    search?: string;
    status?: string;
    kind?: string;
}): Promise<AdminPaymentsOverview> {
    const rows = await db
        .select({
            id: manualPayments.id,
            userId: manualPayments.userId,
            userNumber: users.userNumber,
            kind: manualPayments.kind,
            itemKey: manualPayments.itemKey,
            title: manualPayments.title,
            quantity: manualPayments.quantity,
            amountSom: manualPayments.amountSom,
            paymentMethod: manualPayments.paymentMethod,
            status: manualPayments.status,
            fullName: manualPayments.fullName,
            phone: manualPayments.phone,
            telegramUsername: manualPayments.telegramUsername,
            metadata: manualPayments.metadata,
            receiptReference: manualPayments.receiptReference,
            adminNote: manualPayments.adminNote,
            processedBy: manualPayments.processedBy,
            createdAt: manualPayments.createdAt,
            updatedAt: manualPayments.updatedAt,
            processedAt: manualPayments.processedAt,
        })
        .from(manualPayments)
        .leftJoin(users, eq(users.id, manualPayments.userId))
        .orderBy(desc(manualPayments.createdAt))
        .limit(1000);

    const normalized: AdminPaymentRecord[] = rows.map((row) => ({
        ...row,
        paymentCode: code(row.id),
        userNumber: row.userNumber ?? null,
        metadata: row.metadata ?? {},
    }));

    const search = clean(options?.search ?? "");
    const status = options?.status?.trim() ?? "";
    const kind = options?.kind?.trim() ?? "";

    const records = normalized.filter((record) => {
        if (status && record.status !== status) {
            return false;
        }
        if (kind && record.kind !== kind) {
            return false;
        }
        if (!search) {
            return true;
        }

        const haystack = [
            record.paymentCode,
            record.id,
            record.userNumber ? String(record.userNumber) : "",
            record.fullName ?? "",
            record.phone ?? "",
            record.telegramUsername ?? "",
            record.title,
        ]
            .join(" ")
            .toLocaleLowerCase("uz-UZ");

        return haystack.includes(search);
    });

    return {
        records,
        totalCount: normalized.length,
        pendingCount: normalized.filter((item) => item.status === "pending").length,
        confirmedCount: normalized.filter((item) => item.status === "confirmed").length,
        rejectedCount: normalized.filter((item) => item.status === "rejected").length,
        confirmedRevenueSom: normalized
            .filter((item) => item.status === "confirmed")
            .reduce((sum, item) => sum + item.amountSom, 0),
    };
}

export async function getAdminPayment(paymentId: string): Promise<AdminPaymentRecord | null> {
    const [row] = await db
        .select({
            id: manualPayments.id,
            userId: manualPayments.userId,
            userNumber: users.userNumber,
            kind: manualPayments.kind,
            itemKey: manualPayments.itemKey,
            title: manualPayments.title,
            quantity: manualPayments.quantity,
            amountSom: manualPayments.amountSom,
            paymentMethod: manualPayments.paymentMethod,
            status: manualPayments.status,
            fullName: manualPayments.fullName,
            phone: manualPayments.phone,
            telegramUsername: manualPayments.telegramUsername,
            metadata: manualPayments.metadata,
            receiptReference: manualPayments.receiptReference,
            adminNote: manualPayments.adminNote,
            processedBy: manualPayments.processedBy,
            createdAt: manualPayments.createdAt,
            updatedAt: manualPayments.updatedAt,
            processedAt: manualPayments.processedAt,
        })
        .from(manualPayments)
        .leftJoin(users, eq(users.id, manualPayments.userId))
        .where(eq(manualPayments.id, paymentId))
        .limit(1);

    return row
        ? {
            ...row,
            paymentCode: code(row.id),
            userNumber: row.userNumber ?? null,
            metadata: row.metadata ?? {},
        }
        : null;
}
