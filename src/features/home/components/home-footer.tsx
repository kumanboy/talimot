import Link from "next/link";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./home-footer.module.css";

const footerLinks = [
    {
        label: "Biz haqimizda",
        href: "/haqida",
    },
    {
        label: "Foydalanish shartlari",
        href: "/foydalanish-shartlari",
    },
    {
        label: "Maxfiylik siyosati",
        href: "/maxfiylik-siyosati",
    },
] as const;

const SUPPORT_TELEGRAM_URL =
    "https://t.me/husan_davronov";

export function HomeFooter() {
    return (
        <footer className={styles.footer}>
            <div
                className={styles.decorativeGlow}
                aria-hidden="true"
            />

            <section className={styles.brandSection}>
                <TalimotLogo />

                <p>
                    Ona tili milliy sertifikatiga tizimli,
                    zamonaviy va natijaga yo‘naltirilgan
                    tayyorgarlik platformasi.
                </p>

                <div className={styles.brandTags}>
                    <span>Bepul testlar</span>
                    <span>Diagnostika</span>
                    <span>Online kurslar</span>
                </div>
            </section>

            <section
                className={styles.socialSection}
                aria-labelledby="social-heading"
            >
                <div className={styles.sectionHeading}>
                    <span>BIZNI KUZATING</span>

                    <h2 id="social-heading">
                        Foydali darslarni o‘tkazib yubormang
                    </h2>
                </div>

                <div className={styles.socialGrid}>
                    <a
                        className={styles.telegramLink}
                        href="https://t.me/sardortoshmuhammad_onatili"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={styles.socialIcon}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="m21 4-3 16-6-4-3 3 1-5 8-7-10 6-5-2 18-7Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>

                        <span className={styles.socialCopy}>
                            <strong>Telegram kanal</strong>
                            <small>
                                Darslar, testlar va e’lonlar
                            </small>
                        </span>

                        <span
                            className={styles.socialArrow}
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </a>

                    <a
                        className={styles.instagramLink}
                        href="https://www.instagram.com/sardor_toshmuhammadov/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={styles.socialIcon}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="4"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />

                                <circle
                                    cx="17.5"
                                    cy="6.5"
                                    r="1"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>

                        <span className={styles.socialCopy}>
                            <strong>Instagram sahifa</strong>
                            <small>
                                Qisqa va foydali video darslar
                            </small>
                        </span>

                        <span
                            className={styles.socialArrow}
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </a>
                </div>
            </section>

            <section
                className={styles.linksSection}
                aria-labelledby="footer-navigation-heading"
            >
                <div className={styles.sectionHeading}>
                    <span>PLATFORMA</span>

                    <h2 id="footer-navigation-heading">
                        Kerakli sahifalar
                    </h2>
                </div>

                <nav
                    className={styles.linksGrid}
                    aria-label="Footer navigatsiyasi"
                >
                    {footerLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                        >
                            <span>{link.label}</span>
                            <span aria-hidden="true">›</span>
                        </Link>
                    ))}

                    <a
                        href={SUPPORT_TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>Yordam</span>
                        <span aria-hidden="true">›</span>
                    </a>
                </nav>
            </section>

            <section className={styles.supportCard}>
                <span className={styles.supportIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M5 18a8 8 0 1 1 14 0"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />

                        <path
                            d="M5 14H3v4h3M19 14h2v4h-3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M18 19c-1 1-3 2-6 2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>

                <div>
                    <strong>Yordam kerakmi?</strong>

                    <p>
                        Platformadan foydalanish bo‘yicha
                        savollaringizga javob oling.
                    </p>
                </div>

                <a
                    href={SUPPORT_TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Yordam
                </a>
            </section>

            <div className={styles.bottom}>
                <p>© 2026 TA’LIMOT</p>

                <span>
                    Barcha huquqlar himoyalangan
                </span>
            </div>
        </footer>
    );
}
