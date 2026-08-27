import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { createInAppNotification } from "@/features/notifications/server/create-in-app-notification";
import { sendTangaNotification } from "@/features/tanga/server/send-tanga-notification";
import { databaseClient, db } from "@/lib/database/db";
import { tangaWallets } from "@/lib/database/schema/tanga-wallets";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PurchaseOutcome =
    | {
        readonly status: "purchased";
        readonly balanceAfter: number;
        readonly price: number;
        readonly title: string;
    }
    | {
        readonly status: "already_purchased";
        readonly balanceAfter: number;
        readonly price: number;
        readonly title: string;
    }
    | {
        readonly status: "insufficient_balance";
        readonly balance: number;
        readonly price: number;
        readonly title: string;
    }
    | {
        readonly status: "free";
        readonly balanceAfter: number;
        readonly price: 0;
        readonly title: string;
    }
    | {
        readonly status: "unavailable";
    };

function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
    );
}

async function getActiveUser(request: NextRequest) {
    const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);

    if (!session) {
        return null;
    }

    const [user] = await db
        .select({
            id: users.id,
            status: users.status,
            userNumber: users.userNumber,
            firstName: users.firstName,
            telegramChatId: users.telegramChatId,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    return user?.status === "active"
        ? user
        : null;
}

async function currentBalance(userId: string): Promise<number> {
    const [wallet] = await db
        .select({ balance: tangaWallets.balance })
        .from(tangaWallets)
        .where(eq(tangaWallets.userId, userId))
        .limit(1);

    return wallet?.balance ?? 0;
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ testId: string }> },
) {
    const user = await getActiveUser(request);

    if (!user) {
        return NextResponse.json(
            {
                error: "Test sotib olish uchun hisobga kiring.",
                code: "AUTH_REQUIRED",
            },
            { status: 401 },
        );
    }

    const { testId } = await context.params;

    if (!testId || testId.length > 180) {
        return NextResponse.json(
            {
                error: "Test identifikatori noto‘g‘ri.",
                code: "INVALID_TEST",
            },
            { status: 400 },
        );
    }

    try {
        const result = await databaseClient.begin(async (sql): Promise<PurchaseOutcome> => {
            const testRows = await sql`
                select id, title, status, access, tanga_price
                from public.admin_test_drafts
                where id = ${testId}
                limit 1
            `;

            const test = testRows[0] as {
                id: string;
                title: string;
                status: string;
                access: string;
                tanga_price: number;
            } | undefined;

            if (!test || test.status !== "published") {
                return { status: "unavailable" };
            }

            const price = Number(test.tanga_price ?? 0);

            if (test.access === "free") {
                const walletRows = await sql`
                    select balance
                    from public.tanga_wallets
                    where user_id = ${user.id}
                    limit 1
                `;

                return {
                    status: "free",
                    balanceAfter: Number(
                        (walletRows[0] as { balance?: number } | undefined)?.balance ?? 0,
                    ),
                    price: 0,
                    title: test.title,
                };
            }

            if (
                test.access !== "premium" ||
                !Number.isSafeInteger(price) ||
                price < 1 ||
                price > 1000
            ) {
                throw new Error("Paid test price is invalid");
            }

            // Lock the wallet first. This serializes simultaneous purchase attempts
            // from the same user, so a double click cannot charge twice.
            const walletRows = await sql`
                select balance
                from public.tanga_wallets
                where user_id = ${user.id}
                for update
            `;

            const wallet = walletRows[0] as { balance: number } | undefined;
            const balance = Number(wallet?.balance ?? 0);

            const existingRows = await sql`
                select id
                from public.test_purchases
                where user_id = ${user.id}
                  and test_id = ${test.id}
                limit 1
            `;

            if (existingRows.length > 0) {
                return {
                    status: "already_purchased",
                    balanceAfter: balance,
                    price,
                    title: test.title,
                };
            }

            if (!wallet || balance < price) {
                return {
                    status: "insufficient_balance",
                    balance,
                    price,
                    title: test.title,
                };
            }

            const transactionId = randomUUID();
            const purchaseId = randomUUID();

            const transactionRows = await sql`
                select *
                from public.apply_tanga_transaction(
                    ${transactionId},
                    ${user.id},
                    ${"debit"},
                    ${price},
                    ${"test_purchase"},
                    ${"test"},
                    ${test.id},
                    ${`${test.title} testi sotib olindi`},
                    ${"student"}
                )
            `;

            const balanceAfter = Number(
                (transactionRows[0] as { balance_after?: number } | undefined)?.balance_after
                    ?? balance - price,
            );

            await sql`
                insert into public.test_purchases (
                    id,
                    user_id,
                    test_id,
                    price_paid,
                    tanga_transaction_id,
                    purchased_at
                ) values (
                    ${purchaseId},
                    ${user.id},
                    ${test.id},
                    ${price},
                    ${transactionId},
                    ${Date.now()}
                )
            `;

            return {
                status: "purchased",
                balanceAfter,
                price,
                title: test.title,
            };
        });

        if (result.status === "unavailable") {
            return NextResponse.json(
                {
                    error: "Test topilmadi yoki hali nashr qilinmagan.",
                    code: "TEST_UNAVAILABLE",
                },
                { status: 404 },
            );
        }

        if (result.status === "insufficient_balance") {
            return NextResponse.json(
                {
                    error: "Tanga balansingiz yetarli emas.",
                    code: "INSUFFICIENT_BALANCE",
                    balance: result.balance,
                    required: result.price,
                    title: result.title,
                },
                { status: 402 },
            );
        }

        if (result.status === "purchased") {
            try {
                await createInAppNotification({
                    userId: user.id,
                    kind: "tanga",
                    title: "Test sotib olindi",
                    message: `${result.title} · -${result.price} Tanga · Yangi balans: ${result.balanceAfter} Tanga`,
                    href: "/tests",
                });
            } catch (notificationError) {
                console.error("Paid test in-app notification failed", notificationError);
            }

            try {
                await sendTangaNotification({
                    chatId: user.telegramChatId ?? null,
                    firstName: user.firstName,
                    userNumber: user.userNumber,
                    direction: "debit",
                    amount: result.price,
                    balanceAfter: result.balanceAfter,
                    note: `${result.title} testi sotib olindi`,
                });
            } catch (notificationError) {
                console.error("Paid test Telegram notification failed", notificationError);
            }
        }

        return NextResponse.json({
            ok: true,
            purchased:
                result.status === "purchased" ||
                result.status === "already_purchased",
            alreadyPurchased: result.status === "already_purchased",
            free: result.status === "free",
            balance: result.balanceAfter,
            price: result.price,
            title: result.title,
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json({
                ok: true,
                purchased: true,
                alreadyPurchased: true,
                balance: await currentBalance(user.id),
            });
        }

        const message = error instanceof Error
            ? error.message.toLowerCase()
            : "";

        if (message.includes("insufficient tanga balance")) {
            return NextResponse.json(
                {
                    error: "Tanga balansingiz yetarli emas.",
                    code: "INSUFFICIENT_BALANCE",
                    balance: await currentBalance(user.id),
                },
                { status: 402 },
            );
        }

        console.error("Paid test purchase failed", {
            userId: user.id,
            testId,
            error,
        });

        return NextResponse.json(
            {
                error: "Testni sotib olishda xatolik yuz berdi.",
                code: "PURCHASE_FAILED",
            },
            { status: 500 },
        );
    }
}
