"use client";

export type CreateManualPaymentRequestInput = {
    readonly kind: "tanga" | "book" | "course";
    readonly itemKey: string;
    readonly quantity?: number;
    readonly fullName?: string;
    readonly phone?: string;
    readonly telegramUsername?: string;
    readonly metadata?: Record<string, string | number | boolean | null>;
};

export type CreatedManualPaymentRequest = {
    readonly paymentId: string;
    readonly paymentCode: string;
    readonly amountSom: number;
    readonly title: string;
};

export async function createManualPaymentRequest(
    input: CreateManualPaymentRequestInput,
): Promise<CreatedManualPaymentRequest> {
    const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(input),
    });

    const payload = (await response.json()) as Partial<CreatedManualPaymentRequest> & {
        error?: string;
    };

    if (
        !response.ok ||
        !payload.paymentId ||
        !payload.paymentCode ||
        typeof payload.amountSom !== "number" ||
        !payload.title
    ) {
        throw new Error(payload.error || "To‘lov so‘rovini yaratib bo‘lmadi.");
    }

    return payload as CreatedManualPaymentRequest;
}
