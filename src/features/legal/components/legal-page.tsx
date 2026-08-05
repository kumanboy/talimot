"use client";

import {
    useRouter,
} from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import styles from "./legal-page.module.css";

type LegalSection = {
    readonly title: string;
    readonly paragraphs?: readonly string[];
    readonly items?: readonly string[];
};

type LegalPageProps = {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly updatedAt?: string;
    readonly sections: readonly LegalSection[];
};

function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function LegalPage({
    eyebrow,
    title,
    description,
    updatedAt,
    sections,
}: LegalPageProps) {
    const router = useRouter();

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Oldingi sahifaga qaytish"
                        onClick={() => router.back()}
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>TA’LIMOT</span>
                        <strong>{title}</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span className={styles.eyebrow}>
                        {eyebrow}
                    </span>

                    <h1>{title}</h1>
                    <p>{description}</p>

                    {updatedAt ? (
                        <small>{updatedAt}</small>
                    ) : null}
                </section>

                <div className={styles.sections}>
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className={styles.section}
                        >
                            <h2>{section.title}</h2>

                            {section.paragraphs?.map(
                                (paragraph) => (
                                    <p key={paragraph}>
                                        {paragraph}
                                    </p>
                                ),
                            )}

                            {section.items ? (
                                <ul>
                                    {section.items.map((item) => (
                                        <li key={item}>
                                            <span aria-hidden="true">
                                                ✓
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>
                    ))}
                </div>

                <section className={styles.supportCard}>
                    <div>
                        <span>YORDAM KERAKMI?</span>
                        <strong>
                            Savollaringiz bo‘lsa, bizga yozing
                        </strong>
                        <p>
                            Administrator Telegram orqali
                            murojaatingizni ko‘rib chiqadi.
                        </p>
                    </div>

                    <a
                        href="https://t.me/husan_davronov"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Yordam
                    </a>
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}
