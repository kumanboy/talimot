import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { databaseClient } from "@/lib/database/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToUser(
    request: Request,
    userId: string,
    status: "credited" | "debited" | "insufficient" | "invalid" | "failed",
) {
    const url = new URL(
        `/admin/tanga/${encodeURIComponent(userId)}`,
        request.url,
    );
    url.searchParams.set("status", status);

    return NextResponse.redirect(url, 303);
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
    const noteValue = formData.get("note");

    const direction =
        directionValue === "credit" || directionValue === "debit"
            ? directionValue
            : null;
    const amount =
        typeof amountValue === "string"
            ? Number.parseInt(amountValue, 10)
            : Number.NaN;
    const note =
        typeof noteValue === "string" && noteValue.trim()
            ? noteValue.trim().slice(0, 160)
            : null;

    if (
        !direction ||
        !Number.isSafeInteger(amount) ||
        amount < 1 ||
        amount > 1_000_000
    ) {
        return redirectToUser(request, userId, "invalid");
    }

    try {
        await databaseClient`
            select *
            from public.apply_tanga_transaction(
                ${randomUUID()},
                ${userId},
                ${direction},
                ${amount},
                ${"admin_adjustment"},
                ${"admin"},
                ${null},
                ${note},
                ${"admin"}
            )
        `;

        return redirectToUser(
            request,
            userId,
            direction === "credit" ? "credited" : "debited",
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
            error,
        });

        return redirectToUser(request, userId, "failed");
    }
}
