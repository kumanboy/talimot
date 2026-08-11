import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { sendPaymentStatusNotification } from "@/features/payments/server/send-payment-status-notification";
import { sendTangaNotification } from "@/features/tanga/server/send-tanga-notification";
import { databaseClient, db } from "@/lib/database/db";
import { manualPayments } from "@/lib/database/schema/manual-payments";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null, maxLength: number): string | null {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, maxLength)
        : null;
}

function code(id: string): string {
    return `PAY-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function redirectToPayment(request: Request, paymentId: string, status: string) {
    const url = new URL(`/admin/payments/${encodeURIComponent(paymentId)}`, request.url);
    url.searchParams.set("status", status);
    return NextResponse.redirect(url, 303);
}

export async function POST(
    request: Request,
    context: { params: Promise<{ paymentId: string }> },
) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.redirect(new URL("/admin/login", request.url), 303);
    }

    const { paymentId } = await context.params;
    const formData = await request.formData();
    const action = formData.get("action");
    const receiptReference = cleanText(formData.get("receiptReference"), 100);
    const adminNote = cleanText(formData.get("adminNote"), 240);

    if (action !== "confirm" && action !== "reject") {
        return redirectToPayment(request, paymentId, "failed");
    }

    try {
        const transactionResult = await databaseClient.begin(async (sql) => {
            const rows = await sql`
                select id, user_id, kind, title, amount_som, status, metadata
                from public.manual_payments
                where id = ${paymentId}
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
                return { outcome: "already_processed" as const };
            }

            const now = Date.now();
            const nextStatus = action === "confirm" ? "confirmed" : "rejected";

            await sql`
                update public.manual_payments
                set status = ${nextStatus},
                    receipt_reference = ${receiptReference},
                    admin_note = ${adminNote},
                    processed_by = ${"admin"},
                    processed_at = ${now},
                    updated_at = ${now}
                where id = ${paymentId}
            `;

            let balanceAfter: number | null = null;
            let tangaAmount: number | null = null;

            if (action === "confirm" && payment.kind === "tanga") {
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
                        ${"admin"}
                    )
                `;

                balanceAfter = Number((walletRows[0] as { balance_after?: number } | undefined)?.balance_after ?? 0);
            }

            return {
                outcome: nextStatus as "confirmed" | "rejected",
                payment,
                balanceAfter,
                tangaAmount,
            };
        });

        if (transactionResult.outcome === "missing") {
            return redirectToPayment(request, paymentId, "failed");
        }

        if (transactionResult.outcome === "already_processed") {
            return redirectToPayment(request, paymentId, "already_processed");
        }

        const payment = transactionResult.payment;
        const [user] = payment.user_id
            ? await db
                .select({
                    firstName: users.firstName,
                    userNumber: users.userNumber,
                    telegramChatId: users.telegramChatId,
                })
                .from(users)
                .where(eq(users.id, payment.user_id))
                .limit(1)
            : [];

        if (user) {
            if (
                transactionResult.outcome === "confirmed" &&
                payment.kind === "tanga" &&
                transactionResult.tangaAmount &&
                transactionResult.balanceAfter !== null
            ) {
                await sendTangaNotification({
                    chatId: user.telegramChatId ?? null,
                    firstName: user.firstName,
                    userNumber: user.userNumber,
                    direction: "credit",
                    amount: transactionResult.tangaAmount,
                    balanceAfter: transactionResult.balanceAfter,
                    note: `To‘lov ${code(payment.id)} tasdiqlandi`,
                });
            } else {
                await sendPaymentStatusNotification({
                    chatId: user.telegramChatId ?? null,
                    firstName: user.firstName,
                    paymentCode: code(payment.id),
                    title: payment.title,
                    amountSom: Number(payment.amount_som),
                    status: transactionResult.outcome,
                });
            }
        }

        return redirectToPayment(request, paymentId, transactionResult.outcome);
    } catch (error) {
        console.error("Admin payment status update failed", { paymentId, action, error });
        return redirectToPayment(request, paymentId, "failed");
    }
}
