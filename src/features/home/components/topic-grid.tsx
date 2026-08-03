"use client";

import { useRouter } from "next/navigation";

import styles from "./topic-grid.module.css";

type Topic = {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: "spelling" | "morphemics" | "morphology" | "syntax"
        | "ghazal" | "literary" | "scientific" | "essay";
};

const topics: Topic[] = [
    {
        id: "spelling",
        title: "Imlo",
        description: "To‘g‘ri yozish qoidalari",
        href: "/mavzular/imlo",
        icon: "spelling",
    },
    {
        id: "morphemics",
        title: "Morfemika",
        description: "So‘z tarkibi",
        href: "/mavzular/morfemika",
        icon: "morphemics",
    },
    {
        id: "morphology",
        title: "Morfologiya",
        description: "So‘z turkumlari",
        href: "/mavzular/morfologiya",
        icon: "morphology",
    },
    {
        id: "syntax",
        title: "Sintaksis",
        description: "Gap tuzilishi",
        href: "/mavzular/sintaksis",
        icon: "syntax",
    },
    {
        id: "ghazal",
        title: "G‘azal",
        description: "Bayt va san’atlar",
        href: "/mavzular/gazal",
        icon: "ghazal",
    },
    {
        id: "literary-text",
        title: "Badiiy matn",
        description: "Asar tahlili",
        href: "/mavzular/badiiy-matn",
        icon: "literary",
    },
    {
        id: "scientific-text",
        title: "Ilmiy matn",
        description: "Matn va dalillar",
        href: "/mavzular/ilmiy-matn",
        icon: "scientific",
    },
    {
        id: "essay",
        title: "Esse",
        description: "Fikr va dalillash",
        href: "/mavzular/esse",
        icon: "essay",
    },
];

function TopicIcon({ type }: { type: Topic["icon"] }) {
    if (type === "spelling") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M8 19c3-1 4-4 4-7s2-5 5-5c4 0 6 3 6 7 0 5-4 9-9 9H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M10 25c2 0 3-1 4-2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "morphemics") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect
                    x="5"
                    y="10"
                    width="8"
                    height="12"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <rect
                    x="12"
                    y="10"
                    width="8"
                    height="12"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <rect
                    x="19"
                    y="10"
                    width="8"
                    height="12"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
        );
    }

    if (type === "morphology") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M7 9h18M7 16h12M7 23h16"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
                <circle cx="24" cy="16" r="3" fill="currentColor" />
            </svg>
        );
    }

    if (type === "syntax") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M7 10h18M7 16h14M7 22h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M24 14v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "ghazal") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M8 24c5-1 9-5 12-12 2-4 5-5 6-5-1 5-4 10-8 13-3 3-6 4-10 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 25h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "literary") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M6 8c4-1 7 0 10 3v14c-3-3-6-4-10-3V8Zm20 0c-4-1-7 0-10 3v14c3-3 6-4 10-3V8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === "scientific") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M12 6h8M14 6v7l-6 10c-1 2 0 3 2 3h12c2 0 3-1 2-3l-6-10V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M11 21h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
                d="m8 24 3-8L22 5l5 5-11 11-8 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="m19 8 5 5M8 24l6-2-4-4-2 6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function TopicGrid() {
    const router = useRouter();

    return (
        <section className={styles.section}>
            <div className={styles.heading}>
                <div>
                    <span>TEZKOR TANLOV</span>
                    <h2>Mavzuni tanlang</h2>
                    <p>Bilimingizni kerakli yo‘nalish bo‘yicha mustahkamlang.</p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/tests")}
                >
                    Barchasi
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            <div className={styles.grid}>
                {topics.map((topic) => (
                    <button
                        key={topic.id}
                        className={styles.card}
                        type="button"
                        onClick={() => router.push(topic.href)}
                    >
            <span className={`${styles.icon} ${styles[topic.icon]}`}>
              <TopicIcon type={topic.icon} />
            </span>

                        <span className={styles.copy}>
              <strong>{topic.title}</strong>
              <small>{topic.description}</small>
            </span>

                        <span className={styles.arrow} aria-hidden="true">
              ›
            </span>
                    </button>
                ))}
            </div>
        </section>
    );
}