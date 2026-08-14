import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Esse tekshirish | TA’LIMOT",
    description: "TA’LIMOT esse tekshirish xizmati tez orada ishga tushadi.",
};

function EssayIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6.75 3.75h7.75l3.75 3.75v12.75H6.75V3.75Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <path
                d="M14.5 3.75V7.5h3.75M9.5 11h5M9.5 14.25h5M9.5 17.5h3.25"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function EssayCheckRoute() {
    return (
        <main className={styles.page}>
            <section className={styles.card} aria-labelledby="essay-coming-soon-title">
                <div className={styles.iconWrap}>
                    <EssayIcon />
                </div>

                <span className={styles.badge}>TEZ ORADA</span>

                <h1 id="essay-coming-soon-title">Esse tekshirish</h1>

                <p>
                    Yaqinda ushbu xizmat TA’LIMOT platformasiga qo‘shiladi.
                </p>

                <Link href="/" className={styles.homeLink}>
                    Bosh sahifaga qaytish
                </Link>
            </section>
        </main>
    );
}
