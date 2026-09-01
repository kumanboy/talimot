import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import {
    getBookBySlugFromDatabase,
    getCourseBySlugFromDatabase,
} from "@/features/catalog/server/catalog-repository";
import { MANUAL_PAYMENT_METHOD } from "@/features/payments/config/manual-payment";
import { sendManualPaymentAdminNotification } from "@/features/payments/server/send-manual-payment-admin-notification";
import { tangaPackages } from "@/features/tanga/model/tanga-packages";
import { db } from "@/lib/database/db";
import { manualPayments } from "@/lib/database/schema/manual-payments";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
    kind?: "tanga" | "book" | "course";
    itemKey?: string;
    quantity?: number;
    fullName?: string;
    phone?: string;
    telegramUsername?: string;
    metadata?: Record<string, unknown>;
};

function cleanText(value: unknown, maxLength: number): string | null {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, maxLength)
        : null;
}

function paymentCode(id: string): string {
    return `PAY-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function sanitizeMetadata(
    value: Record<string, unknown> | undefined,
): Record<string, string | number | boolean | null> {
    if (!value) return {};

    const sanitized: Record<string, string | number | boolean | null> = {};

    for (const [key, item] of Object.entries(value).slice(0, 20)) {
        const safeKey = key.trim().slice(0, 60);
        if (!safeKey) continue;

        if (typeof item === "string") {
            sanitized[safeKey] = item.slice(0, 240);
            continue;
        }

        if (typeof item === "number" && Number.isFinite(item)) {
            sanitized[safeKey] = item;
            continue;
        }

        if (typeof item === "boolean" || item === null) {
            sanitized[safeKey] = item;
        }
    }

    return sanitized;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as RequestBody;
        const kind = body.kind;
        const itemKey = cleanText(body.itemKey, 100);

        if (!kind || !itemKey || !["tanga", "book", "course"].includes(kind)) {
            return NextResponse.json(
                { error: "To‘lov turi yoki mahsulot noto‘g‘ri." },
                { status: 400 },
            );
        }

        const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
        const session = verifyStudentSessionToken(token);

        const [sessionUser] = session
            ? await db
                .select({
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    phone: users.phone,
                    telegramUsername: users.telegramUsername,
                    status: users.status,
                })
                .from(users)
                .where(eq(users.id, session.userId))
                .limit(1)
            : [];

        if (sessionUser && sessionUser.status !== "active") {
            return NextResponse.json(
                { error: "Foydalanuvchi hisobi faol emas." },
                { status: 403 },
            );
        }

        let title = "";
        let amountSom = 0;
        let quantity = 1;
        let metadata: Record<string, unknown> = {};

        if (kind === "tanga") {
            if (!sessionUser) {
                return NextResponse.json(
                    { error: "Tanga sotib olish uchun hisobga kiring." },
                    { status: 401 },
                );
            }

            const packageDefinition = tangaPackages.find((item) => item.id === itemKey);

            if (!packageDefinition) {
                return NextResponse.json(
                    { error: "Tanga paketi topilmadi." },
                    { status: 404 },
                );
            }

            title = `${packageDefinition.name} · ${packageDefinition.amount} Tanga`;
            amountSom = packageDefinition.price;
            metadata = {
                tangaAmount: packageDefinition.amount,
                packageName: packageDefinition.name,
            };
        } else if (kind === "book") {
            const book = await getBookBySlugFromDatabase(itemKey);

            if (!book) {
                return NextResponse.json(
                    { error: "Kitob topilmadi." },
                    { status: 404 },
                );
            }

            const requestedQuantity = Number.isSafeInteger(body.quantity)
                ? Number(body.quantity)
                : 1;
            quantity = Math.min(20, Math.max(1, requestedQuantity));
            title = book.title;
            amountSom = book.sale.salePrice * quantity + book.delivery.price;
            metadata = {
                ...sanitizeMetadata(body.metadata),
                unitPrice: book.sale.salePrice,
                deliveryPrice: book.delivery.price,
                deliveryMethod: book.delivery.method,
            };
        } else {
            const course = await getCourseBySlugFromDatabase(itemKey);

            if (!course) {
                return NextResponse.json(
                    { error: "Kurs topilmadi." },
                    { status: 404 },
                );
            }

            title = course.title;
            amountSom = course.sale.salePrice;
            metadata = sanitizeMetadata(body.metadata);
        }

        const isTanga = kind === "tanga";
        const fullName = isTanga && sessionUser
            ? `${sessionUser.firstName} ${sessionUser.lastName}`
            : cleanText(body.fullName, 120)
                ?? (sessionUser ? `${sessionUser.firstName} ${sessionUser.lastName}` : null);
        const phone = isTanga && sessionUser
            ? sessionUser.phone
            : cleanText(body.phone, 40) ?? sessionUser?.phone ?? null;
        const telegramUsername = isTanga && sessionUser
            ? sessionUser.telegramUsername
            : cleanText(body.telegramUsername, 80)?.replace(/^@/, "")
                ?? sessionUser?.telegramUsername
                ?? null;

        if (!phone) {
            return NextResponse.json(
                { error: "Telefon raqami kerak." },
                { status: 400 },
            );
        }

        const id = randomUUID();
        const now = Date.now();

        await db.insert(manualPayments).values({
            id,
            userId: sessionUser?.id ?? null,
            kind,
            itemKey,
            title,
            quantity,
            amountSom,
            paymentMethod: MANUAL_PAYMENT_METHOD,
            status: "pending",
            fullName,
            phone,
            telegramUsername,
            metadata,
            createdAt: now,
            updatedAt: now,
        });

        try {
            const adminNotification = await sendManualPaymentAdminNotification({
                id,
                kind,
                title,
                amountSom,
                fullName,
                phone,
                telegramUsername,
            });

            if (!adminNotification.sent) {
                console.warn("Telegram payment admin notification skipped", {
                    reason: adminNotification.reason,
                    paymentId: id,
                });
            }
        } catch (notificationError) {
            // Payment creation must not fail just because Telegram is temporarily
            // unavailable. The request remains visible in Admin > To‘lovlar.
            console.error("Telegram payment admin notification failed", {
                paymentId: id,
                notificationError,
            });
        }

        return NextResponse.json({
            ok: true,
            paymentId: id,
            paymentCode: paymentCode(id),
            amountSom,
            title,
        });
    } catch (error) {
        console.error("Manual payment request creation failed", error);
        return NextResponse.json(
            { error: "To‘lov so‘rovini yaratib bo‘lmadi." },
            { status: 500 },
        );
    }
}
