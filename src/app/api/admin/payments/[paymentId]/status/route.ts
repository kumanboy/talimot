import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { processManualPaymentStatus } from "@/features/payments/server/process-manual-payment-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null, maxLength: number): string | null {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, maxLength)
        : null;
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
        const result = await processManualPaymentStatus({
            paymentId,
            action,
            receiptReference,
            adminNote,
            processedBy: "admin",
        });

        if (result.outcome === "missing") {
            return redirectToPayment(request, paymentId, "failed");
        }

        if (result.outcome === "already_processed") {
            return redirectToPayment(request, paymentId, "already_processed");
        }

        return redirectToPayment(request, paymentId, result.outcome);
    } catch (error) {
        console.error("Admin payment status update failed", { paymentId, action, error });
        return redirectToPayment(request, paymentId, "failed");
    }
}
