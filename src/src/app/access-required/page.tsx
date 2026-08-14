import Link from "next/link";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./page.module.css";

type AccessRequiredPageProps = {
    searchParams: Promise<{
        reason?: string | string[];
    }>;
};

export default async function AccessRequiredPage({
    searchParams,
}: AccessRequiredPageProps) {
    const params = await searchParams;
    const reason = Array.isArray(params.reason)
        ? params.reason[0]
        : params.reason;
    const blocked = reason === "blocked";
    const botUsername =
        process.env.TELEGRAM_VERIFICATION_BOT_USERNAME?.trim() || "talimot_bot";
    const botUrl = `https://t.me/${botUsername.replace(/^@/, "")}?start=access`;

    return (
        <main className={styles.screen}>
            <section className={styles.card}>
                <TalimotLogo />

                <div className={styles.icon} aria-hidden="true">
                    {blocked ? "⛔" : "🔒"}
                </div>

                <h1>
                    {blocked
                        ? "Akkauntingiz vaqtincha bloklangan"
                        : "Avval obunani tasdiqlang"}
                </h1>
                <p>
                    {blocked
                        ? "Platformaga kirish administrator tomonidan vaqtincha cheklangan. Yordam uchun TA’LIMOT botiga murojaat qiling."
                        : "TA’LIMOT platformasidan foydalanish uchun bot orqali Instagram va Telegram obuna bosqichini yakunlang."}
                </p>

                <Link className={styles.button} href={botUrl}>
                    Telegram botga o‘tish
                </Link>
            </section>
        </main>
    );
}
