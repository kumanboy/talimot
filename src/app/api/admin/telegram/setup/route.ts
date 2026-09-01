import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { syncTelegramBotCommands } from "@/features/telegram/server/telegram-bot-commands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.redirect(new URL("/admin/login", request.url), 303);
    }

    const url = new URL("/admin/telegram", request.url);

    try {
        await syncTelegramBotCommands();
        url.searchParams.set("commands", "updated");
    } catch (error) {
        console.error("Telegram command sync failed", error);
        url.searchParams.set("commands", "failed");
    }

    return NextResponse.redirect(url, 303);
}
