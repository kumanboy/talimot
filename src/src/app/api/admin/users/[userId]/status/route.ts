import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeReturnPath(value: FormDataEntryValue | null): string {
    if (
        typeof value !== "string" ||
        !value.startsWith("/admin/users") ||
        value.startsWith("//")
    ) {
        return "/admin/users";
    }

    return value;
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
    const statusValue = formData.get("status");
    const returnTo = safeReturnPath(formData.get("returnTo"));

    if (statusValue !== "active" && statusValue !== "blocked") {
        return NextResponse.redirect(new URL(returnTo, request.url), 303);
    }

    await db
        .update(users)
        .set({
            status: statusValue,
            updatedAt: Date.now(),
        })
        .where(eq(users.id, userId));

    return NextResponse.redirect(new URL(returnTo, request.url), 303);
}
