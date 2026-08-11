"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./notification-center.module.css";

type NotificationItem = {
    id: string;
    kind: string;
    title: string;
    message: string;
    href: string | null;
    isRead: boolean;
    createdAt: number;
};

function formatTime(value: number): string {
    try {
        return new Intl.DateTimeFormat("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    } catch {
        return "";
    }
}

export function NotificationCenter() {
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/notifications", { cache: "no-store" });
            if (!response.ok) return;
            const data = await response.json() as {
                notifications?: NotificationItem[];
                unreadCount?: number;
            };
            setItems(Array.isArray(data.notifications) ? data.notifications : []);
            setUnreadCount(Number(data.unreadCount ?? 0));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const markRead = async (item: NotificationItem) => {
        if (!item.isRead) {
            setItems((current) => current.map((candidate) =>
                candidate.id === item.id ? { ...candidate, isRead: true } : candidate,
            ));
            setUnreadCount((count) => Math.max(0, count - 1));
            void fetch("/api/notifications", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: item.id }),
            });
        }
        if (item.href) {
            setOpen(false);
            router.push(item.href);
        }
    };

    const markAll = async () => {
        setItems((current) => current.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ markAll: true }),
        });
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                className={styles.button}
                type="button"
                aria-label="Bildirishnomalar"
                aria-expanded={open}
                onClick={() => {
                    const next = !open;
                    setOpen(next);
                    if (next) void load();
                }}
            >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {unreadCount > 0 ? <span className={styles.dot} aria-hidden="true" /> : null}
            </button>

            {open ? (
                <section className={styles.panel} aria-label="Bildirishnomalar paneli">
                    <header className={styles.header}>
                        <h2>Bildirishnomalar</h2>
                        {unreadCount > 0 ? (
                            <button type="button" onClick={() => void markAll()}>Barchasini o‘qildi</button>
                        ) : null}
                    </header>
                    {loading && items.length === 0 ? (
                        <div className={styles.loading}>Yuklanmoqda...</div>
                    ) : items.length === 0 ? (
                        <div className={styles.empty}>Hozircha yangi bildirishnoma yo‘q.</div>
                    ) : (
                        <ul className={styles.list}>
                            {items.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        className={`${styles.itemButton} ${!item.isRead ? styles.unread : ""}`}
                                        onClick={() => void markRead(item)}
                                    >
                                        <span className={styles.itemTop}>
                                            <strong>{item.title}</strong>
                                            {!item.isRead ? <span aria-label="O‘qilmagan" /> : null}
                                        </span>
                                        <p>{item.message}</p>
                                        <time dateTime={new Date(item.createdAt).toISOString()}>{formatTime(item.createdAt)}</time>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ) : null}
        </div>
    );
}
