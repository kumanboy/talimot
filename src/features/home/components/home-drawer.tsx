"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    usePathname,
    useRouter,
} from "next/navigation";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./home-drawer.module.css";

type HomeDrawerProps = {
    isOpen: boolean;
    onCloseAction: () => void;
};

type DrawerIcon =
    | "home"
    | "tests"
    | "roadmap"
    | "courses"
    | "books"
    | "profile";

type DrawerItem = {
    label: string;
    href: string;
    icon: DrawerIcon;
};

const CLOSE_ANIMATION_DURATION = 340;

const drawerItems = [
    {
        label: "Bosh sahifa",
        href: "/",
        icon: "home",
    },
    {
        label: "Testlar",
        href: "/tests",
        icon: "tests",
    },
    {
        label: "Yo‘l xaritasi",
        href:
            "/yol-xaritasi?mode=from-zero&view=full",
        icon: "roadmap",
    },
    {
        label: "Kurslar",
        href: "/kurslar",
        icon: "courses",
    },
    {
        label: "Kitoblar",
        href: "/kitoblar",
        icon: "books",
    },
    {
        label: "Profil",
        href: "/profil",
        icon: "profile",
    },
] as const satisfies readonly DrawerItem[];

function DrawerItemIcon({
                            type,
                        }: {
    type: DrawerIcon;
}) {
    if (type === "home") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="m3.5 10.8 8.5-7.3 8.5 7.3v8.4a1.3 1.3 0 0 1-1.3 1.3h-4.6v-6.1H9.4v6.1H4.8a1.3 1.3 0 0 1-1.3-1.3v-8.4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === "tests") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <rect
                    x="5"
                    y="4"
                    width="14"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M9 8.5h6M9 12.5h6M9 16.5h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />

                <path
                    d="m6.8 8.5.7.7 1.4-1.5M6.8 12.5l.7.7 1.4-1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === "roadmap") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <circle
                    cx="6"
                    cy="18"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <circle
                    cx="12"
                    cy="6"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <circle
                    cx="18"
                    cy="15"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M7.2 16.4 10.8 7.7M13.5 7.4l3.1 5.9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "courses") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <rect
                    x="3.5"
                    y="4.5"
                    width="17"
                    height="14"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="m10 9 5 3-5 3V9Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M8 21h8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "books") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M12 7.2A7.6 7.6 0 0 0 5 4.5v13.2a7.6 7.6 0 0 1 7 2.3V7.2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <path
                    d="M12 7.2a7.6 7.6 0 0 1 7-2.7v13.2a7.6 7.6 0 0 0-7 2.3V7.2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <circle
                cx="12"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
            />

            <path
                d="M6.8 19a5.4 5.4 0 0 1 10.4 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function HomeDrawer({
                               isOpen,
                               onCloseAction,
                           }: HomeDrawerProps) {
    const router = useRouter();
    const pathname = usePathname();

    const closeTimerRef =
        useRef<number | null>(null);

    const pendingHrefRef =
        useRef<string | null>(null);

    const [isClosing, setIsClosing] =
        useState(false);

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current === null) {
            return;
        }

        window.clearTimeout(
            closeTimerRef.current,
        );

        closeTimerRef.current = null;
    }, []);

    const completeClose = useCallback(() => {
        clearCloseTimer();

        const pendingHref =
            pendingHrefRef.current;

        pendingHrefRef.current = null;

        document.body.style.overflow = "";

        setIsClosing(false);
        onCloseAction();

        if (pendingHref) {
            router.push(pendingHref);
        }
    }, [
        clearCloseTimer,
        onCloseAction,
        router,
    ]);

    const requestClose = useCallback(
        (destination?: string) => {
            if (isClosing) {
                return;
            }

            pendingHrefRef.current =
                destination ?? null;

            setIsClosing(true);
            clearCloseTimer();

            closeTimerRef.current =
                window.setTimeout(
                    completeClose,
                    CLOSE_ANIMATION_DURATION + 80,
                );
        },
        [
            clearCloseTimer,
            completeClose,
            isClosing,
        ],
    );

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        pendingHrefRef.current = null;
        document.body.style.overflow = "hidden";

        return () => {
            clearCloseTimer();
            document.body.style.overflow = "";
        };
    }, [
        clearCloseTimer,
        isOpen,
    ]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                requestClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        isOpen,
        requestClose,
    ]);

    if (!isOpen) {
        return null;
    }

    const isActiveItem = (
        item: DrawerItem,
    ) => {
        if (item.href === "/") {
            return pathname === "/";
        }

        if (
            item.href.startsWith(
                "/yol-xaritasi",
            )
        ) {
            return pathname.startsWith(
                "/yol-xaritasi",
            );
        }

        return pathname.startsWith(
            item.href,
        );
    };

    return (
        <div
            className={[
                styles.layer,
                isClosing
                    ? styles.closing
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <button
                className={styles.overlay}
                type="button"
                aria-label="Menyuni yopish"
                tabIndex={isClosing ? -1 : 0}
                onClick={() => requestClose()}
            />

            <aside
                id="home-navigation-drawer"
                className={styles.drawer}
                role="dialog"
                aria-modal="true"
                aria-label="Yon menyu"
                aria-hidden={isClosing}
                onAnimationEnd={(event) => {
                    if (!isClosing) {
                        return;
                    }

                    if (
                        event.currentTarget !==
                        event.target
                    ) {
                        return;
                    }

                    if (
                        event.animationName.includes(
                            "drawer-exit",
                        )
                    ) {
                        completeClose();
                    }
                }}
            >
                <div
                    className={
                        styles.decorativeGlow
                    }
                    aria-hidden="true"
                />

                <header className={styles.header}>
                    <TalimotLogo />

                    <button
                        className={
                            styles.closeButton
                        }
                        type="button"
                        aria-label="Menyuni yopish"
                        disabled={isClosing}
                        onClick={() =>
                            requestClose()
                        }
                    >
                        <span />
                        <span />
                    </button>
                </header>

                <div
                    className={
                        styles.welcomeCard
                    }
                >
                    <span>TA’LIMOT</span>

                    <strong>
                        Milliy sertifikatga birgalikda
                        tayyorlanamiz
                    </strong>

                    <p>
                        Kerakli bo‘limni tanlang va
                        tayyorgarlikni davom ettiring.
                    </p>
                </div>

                <nav
                    className={styles.navigation}
                    aria-label="Yon navigatsiya"
                >
                    {drawerItems.map((item) => {
                        const active =
                            isActiveItem(item);

                        return (
                            <button
                                key={item.href}
                                className={
                                    active
                                        ? styles.activeItem
                                        : undefined
                                }
                                type="button"
                                aria-current={
                                    active
                                        ? "page"
                                        : undefined
                                }
                                disabled={isClosing}
                                onClick={() =>
                                    requestClose(item.href)
                                }
                            >
                <span
                    className={
                        styles.itemIcon
                    }
                >
                  <DrawerItemIcon
                      type={item.icon}
                  />
                </span>

                                <span
                                    className={
                                        styles.itemLabel
                                    }
                                >
                  {item.label}
                </span>

                                <span
                                    className={
                                        styles.itemArrow
                                    }
                                    aria-hidden="true"
                                >
                  ›
                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className={styles.socials}>
                    <a
                        href="https://t.me/sardortoshmuhammad_onatili"
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isClosing ? -1 : 0}
                    >
                        Telegram kanal
                    </a>

                    <a
                        href="https://www.instagram.com/sardor_toshmuhammadov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isClosing ? -1 : 0}
                    >
                        Instagram sahifa
                    </a>
                </div>
            </aside>
        </div>
    );
}