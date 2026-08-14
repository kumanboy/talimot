import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { sendTangaNotification } from "@/features/tanga/server/send-tanga-notification";
import { createInAppNotification } from "@/features/notifications/server/create-in-app-notification";
import { databaseClient, db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdjustmentStatus =
    | "credited"
    | "debited"
    | "insufficient"
    | "invalid"
    | "failed";

type NotificationStatus = "sent" | "unavailable" | "failed";

type AdjustmentSource =
    | "promo_bonus"
    | "manual_correction"
    | "other";

const ALLOWED_SOURCES = new Set<AdjustmentSource>([
    "promo_bonus",
    "manual_correction",
    "other",
]);

function redirectToUser(
    request: Request,
    userId: string,
    status: AdjustmentStatus,
    notification?: NotificationStatus,
) {
    const url = new URL(
        `/admin/tanga/${encodeURIComponent(userId)}`,
        request.url,
    );
    url.searchParams.set("status", status);

    if (notification) {
        url.searchParams.set("notification", notification);
    }

    return NextResponse.redirect(url, 303);
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, maxLength)
        : null;
}


export async function POST(
    request: Request,
    context: { params: Promise<{ userId: string }> },
) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.redirect(new URL("/admin/login", request.url), 303);
    }

    const { userId } = await context.params;
    const formData = await request.formData();
    const directionValue = formData.get("direction");
    const amountValue = formData.get("amount");
    const sourceValue = cleanText(formData.get("source"), 40);
    const rawNote = cleanText(formData.get("note"), 160);

    const direction =
        directionValue === "credit" || directionValue === "debit"
            ? directionValue
            : null;
    const amount =
        typeof amountValue === "string"
            ? Number.parseInt(amountValue, 10)
            : Number.NaN;
    const source = sourceValue && ALLOWED_SOURCES.has(sourceValue as AdjustmentSource)
        ? sourceValue as AdjustmentSource
        : null;

    if (
        !direction ||
        !source ||
        !Number.isSafeInteger(amount) ||
        amount < 1 ||
        amount > 1_000_000
    ) {
        return redirectToUser(request, userId, "invalid");
    }

    const noteParts: string[] = [];

    if (rawNote) {
        noteParts.push(rawNote);
    }

    const note = noteParts.length ? noteParts.join(" · ").slice(0, 160) : null;
    const referenceType = source;

    try {
        const rows = await databaseClient`
            select *
            from public.apply_tanga_transaction(
                ${randomUUID()},
                ${userId},
                ${direction},
                ${amount},
                ${source},
                ${referenceType},
                ${null},
                ${note},
                ${"admin"}
            )
        `;

        const result = rows[0] as {
            balance_after?: number;
        } | undefined;
        const balanceAfter = Number(result?.balance_after ?? 0);

        const [user] = await db
            .select({
                userNumber: users.userNumber,
                firstName: users.firstName,
                telegramChatId: users.telegramChatId,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (user) {
            try {
                await createInAppNotification({
                    userId,
                    kind: "tanga",
                    title: direction === "credit" ? "Tanga qo‘shildi" : "Tanga sarflandi",
                    message: `${direction === "credit" ? "+" : "-"}${amount} Tanga · Yangi balans: ${balanceAfter} Tanga${note ? ` · ${note}` : ""}`,
                    href: "/profil",
                });
            } catch (notificationError) {
                console.error("In-app Tanga notification failed", notificationError);
            }
        }

        const notification = user
            ? await sendTangaNotification({
                chatId: user.telegramChatId ?? null,
                firstName: user.firstName,
                userNumber: user.userNumber,
                direction,
                amount,
                balanceAfter,
                note,
            })
            : "unavailable";

        return redirectToUser(
            request,
            userId,
            direction === "credit" ? "credited" : "debited",
            notification,
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message.toLowerCase()
                : "";

        if (message.includes("insufficient tanga balance")) {
            return redirectToUser(request, userId, "insufficient");
        }

        console.error("Admin Tanga adjustment failed", {
            userId,
            direction,
            amount,
            source,
            error,
        });

        return redirectToUser(request, userId, "failed");
    }
}
