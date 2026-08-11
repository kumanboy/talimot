import "server-only";

import { randomUUID } from "node:crypto";

import { db } from "@/lib/database/db";
import { notifications } from "@/lib/database/schema/notifications";

type CreateInAppNotificationInput = {
    readonly userId: string;
    readonly kind?: string;
    readonly title: string;
    readonly message: string;
    readonly href?: string | null;
};

function safeText(value: string, maxLength: number): string {
    return value.trim().slice(0, maxLength);
}

function safeHref(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.startsWith("/") ? trimmed.slice(0, 240) : null;
}

export async function createInAppNotification(
    input: CreateInAppNotificationInput,
): Promise<void> {
    const title = safeText(input.title, 120);
    const message = safeText(input.message, 500);

    if (!input.userId || !title || !message) return;

    await db.insert(notifications).values({
        id: randomUUID(),
        userId: input.userId,
        kind: safeText(input.kind ?? "system", 40) || "system",
        title,
        message,
        href: safeHref(input.href),
        isRead: false,
        createdAt: Date.now(),
    });
}
