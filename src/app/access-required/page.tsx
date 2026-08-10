import Link from "next/link";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./page.module.css";

export default function AccessRequiredPage() {
    const botUsername =
        process.env.TELEGRAM_VERIFICATION_BOT_USERNAME?.trim() || "talimot_bot";
    const botUrl = `https://t.me/${botUsername.replace(/^@/, "")}?start=access`;

    return (
        <main className={styles.screen}>
            <section className={styles.card}>
                <TalimotLogo />

                <div className={styles.icon} aria-hidden="true">
                    🔒
                </div>

                <h1>Avval obunani tasdiqlang</h1>
                <p>
                    TA’LIMOT platformasidan foydalanish uchun bot orqali
                    Instagram va Telegram obuna bosqichini yakunlang.
                </p>

                <Link className={styles.button} href={botUrl}>
                    Telegram botga o‘tish
                </Link>
            </section>
        </main>
    );
}
