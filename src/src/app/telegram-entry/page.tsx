import { redirect } from "next/navigation";

/**
 * Legacy route kept for users who may still have an older Telegram menu button
 * cached in their private chat. The current access flow no longer uses
 * Telegram initData here; users must verify subscriptions in the bot first.
 */
export default function TelegramEntryPage() {
    redirect("/access-required?reason=legacy-entry");
}
