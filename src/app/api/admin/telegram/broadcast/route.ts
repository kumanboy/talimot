import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { sendTelegramBroadcast } from "@/features/telegram/server/send-telegram-broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

function redirectResult(request: Request, params: Record<string, string>) {
    const url = new URL("/admin/telegram", request.url);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
    if (!(await hasValidAdminSession())) {
        return NextResponse.redirect(new URL("/admin/login", request.url), 303);
    }

    try {
        const formData = await request.formData();
        const image = formData.get("image");
        const captionValue = formData.get("caption");
        const caption = typeof captionValue === "string"
            ? captionValue.trim().slice(0, 1000)
            : "";

        if (!(image instanceof File) || image.size < 1) {
            return redirectResult(request, { status: "image_required" });
        }

        if (image.size > MAX_IMAGE_BYTES) {
            return redirectResult(request, { status: "image_too_large" });
        }

        if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
            return redirectResult(request, { status: "image_type" });
        }

        if (!caption) {
            return redirectResult(request, { status: "caption_required" });
        }

        const result = await sendTelegramBroadcast({ image, caption });

        return redirectResult(request, {
            status: "sent",
            total: String(result.total),
            sent: String(result.sent),
            failed: String(result.failed),
        });
    } catch (error) {
        console.error("Telegram broadcast failed", error);
        return redirectResult(request, { status: "failed" });
    }
}
