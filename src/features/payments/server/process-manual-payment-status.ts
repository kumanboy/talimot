import "server-only";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { createInAppNotification } from "@/features/notifications/server/create-in-app-notification";
import { sendPaymentStatusNotification } from "@/features/payments/server/send-payment-status-notification";
import { sendTangaNotification } from "@/features/tanga/server/send-tanga-notification";
import { databaseClient, db } from "@/lib/database/db";
import { users } from "@/lib/database/schema/users";

export type ManualPaymentDecision = "confirm" | "reject";

function paymentCode(id: string): string {
    return `PAY-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function processManualPaymentStatus(input: {
    readonly paymentId: string;
    readonly action: ManualPaymentDecision;
    readonly receiptReference?: string | null;
    readonly adminNote?: string | null;
    readonly processedBy: string;
}) {
    const transactionResult = await databaseClient.begin(async (sql) => {
        const rows = await sql`
            select id, user_id, kind, title, amount_som, status, metadata
            from public.manual_payments
            where id = ${input.paymentId}
            for update
        `;

        const payment = rows[0] as {
            id: string;
            user_id: string | null;
            kind: "tanga" | "book" | "course";
            title: string;
            amount_som: number;
            status: string;
            metadata: Record<string, unknown> | null;
        } | undefined;

        if (!payment) {
            return { outcome: "missing" as const };
        }

        if (payment.status !== "pending") {
            return {
                outcome: "already_processed" as const,
                currentStatus: payment.status,
            };
        }

        const now = Date.now();
        const nextStatus = input.action === "confirm" ? "confirmed" : "rejected";

        await sql`
            update public.manual_payments
            set status = ${nextStatus},
                receipt_reference = ${input.receiptReference ?? null},
                admin_note = ${input.adminNote ?? null},
                processed_by = ${input.processedBy},
                processed_at = ${now},
                updated_at = ${now}
            where id = ${input.paymentId}
        `;

        let balanceAfter: number | null = null;
        let tangaAmount: number | null = null;

        if (input.action === "confirm" && payment.kind === "tanga") {
            if (!payment.user_id) {
                throw new Error("Tanga payment has no linked user");
            }

            const rawAmount = payment.metadata?.tangaAmount;
            const parsedTangaAmount = typeof rawAmount === "number"
                ? rawAmount
                : Number.parseInt(String(rawAmount ?? ""), 10);

            if (!Number.isSafeInteger(parsedTangaAmount) || parsedTangaAmount < 1) {
                throw new Error("Tanga payment amount is invalid");
            }

            tangaAmount = parsedTangaAmount;

            const walletRows = await sql`
                select *
                from public.apply_tanga_transaction(
                    ${randomUUID()},
                    ${payment.user_id},
                    ${"credit"},
                    ${tangaAmount},
                    ${"uzcard_payment"},
                    ${"manual_payment"},
                    ${payment.id},
                    ${`${payment.title} · ${payment.amount_som} so‘m`},
                    ${input.processedBy}
                )
            `;

            balanceAfter = Number(
                (walletRows[0] as { balance_after?: number } | undefined)
                    ?.balance_after ?? 0,
            );
        }

        return {
            outcome: nextStatus as "confirmed" | "rejected",
            payment,
            balanceAfter,
            tangaAmount,
        };
    });

    if (
        transactionResult.outcome === "missing" ||
        transactionResult.outcome === "already_processed"
    ) {
        return transactionResult;
    }

    const payment = transactionResult.payment;
    const [user] = payment.user_id
        ? await db
            .select({
                firstName: users.firstName,
                userNumber: users.userNumber,
                telegramChatId: users.telegramChatId,
                telegramUserId: users.telegramUserId,
            })
            .from(users)
            .where(eq(users.id, payment.user_id))
            .limit(1)
        : [];

    if (user) {
        try {
            const isConfirmed = transactionResult.outcome === "confirmed";
            await createInAppNotification({
                userId: payment.user_id as string,
                kind: payment.kind === "tanga" ? "tanga" : "payment",
                title: isConfirmed ? "To‘lov tasdiqlandi" : "To‘lov tasdiqlanmadi",
                message: isConfirmed
                    ? `${paymentCode(payment.id)} · ${payment.title} muvaffaqiyatli tasdiqlandi.`
                    : `${paymentCode(payment.id)} · ${payment.title} bo‘yicha to‘lov rad etildi.`,
                href: payment.kind === "tanga"
                    ? "/profil"
                    : payment.kind === "book"
                        ? "/kitoblar"
                        : "/kurslar",
            });
        } catch (error) {
            console.error("In-app payment notification failed", error);
        }

        try {
            if (
                transactionResult.outcome === "confirmed" &&
                payment.kind === "tanga" &&
                transactionResult.tangaAmount &&
                transactionResult.balanceAfter !== null
            ) {
                await sendTangaNotification({
                    chatId: user.telegramChatId ?? null,
                    telegramUserId: user.telegramUserId ?? null,
                    firstName: user.firstName,
                    userNumber: user.userNumber,
                    direction: "credit",
                    amount: transactionResult.tangaAmount,
                    balanceAfter: transactionResult.balanceAfter,
                    note: `To‘lov ${paymentCode(payment.id)} tasdiqlandi`,
                });
            } else {
                await sendPaymentStatusNotification({
                    chatId: user.telegramChatId ?? null,
                    telegramUserId: user.telegramUserId ?? null,
                    destination: payment.kind === "tanga"
                        ? "/packages"
                        : payment.kind === "book"
                            ? "/kitoblar"
                            : "/kurslar",
                    firstName: user.firstName,
                    paymentCode: paymentCode(payment.id),
                    title: payment.title,
                    amountSom: Number(payment.amount_som),
                    status: transactionResult.outcome,
                });
            }
        } catch (error) {
            // Payment state is already committed. Telegram delivery is best-effort
            // and must not make a successfully processed payment look failed.
            console.error("Telegram payment status notification failed", error);
        }
    }

    return transactionResult;
}
