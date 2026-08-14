import Link from "next/link";

import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";

import styles from "./not-found.module.css";

function HomeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TestsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M9 8h6M9 12h6M9 16h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function NotFound() {
    return (
        <main className={styles.page}>
            <div className={styles.glow} aria-hidden="true" />

            <section className={styles.card}>
                <TalimotLogo className={styles.logo} />

                <div className={styles.code} aria-hidden="true">
                    404
                </div>

                <span className={styles.eyebrow}>
                    SAHIFA TOPILMADI
                </span>

                <h1>Bu manzil mavjud emas</h1>

                <p>
                    Havola noto‘g‘ri yozilgan, sahifa ko‘chirilgan
                    yoki o‘chirib yuborilgan bo‘lishi mumkin.
                </p>

                <div className={styles.actions}>
                    <Link href="/" className={styles.primaryAction}>
                        <HomeIcon />
                        <span>Bosh sahifaga qaytish</span>
                    </Link>

                    <Link href="/tests" className={styles.secondaryAction}>
                        <TestsIcon />
                        <span>Testlarni ko‘rish</span>
                    </Link>
                </div>

                <small>
                    TA’LIMOT platformasida kerakli bo‘limga
                    bosh sahifa orqali o‘tishingiz mumkin.
                </small>
            </section>
        </main>
    );
}
