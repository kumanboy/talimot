"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    usePathname,
    useRouter,
} from "next/navigation";

import styles from "./mobile-navigation.module.css";

type NavigationIconType =
    | "home"
    | "courses"
    | "mytests"
    | "results"
    | "profile";

type NavigationItem = {
    readonly id: NavigationIconType;
    readonly label: string;
    readonly href: string;
    readonly icon: NavigationIconType;
};

const navigationItems = [
    {
        id: "home",
        label: "Bosh sahifa",
        href: "/",
        icon: "home",
    },
    {
        id: "courses",
        label: "Kurslar",
        href: "/kurslar",
        icon: "courses",
    },
    {
        id: "mytests",
        label: "Testlarim",
        href: "/mening-testlarim",
        icon: "mytests",
    },
    {
        id: "results",
        label: "Natijalar",
        href: "/natijalar",
        icon: "results",
    },
    {
        id: "profile",
        label: "Profil",
        href: "/profil",
        icon: "profile",
    },
] as const satisfies readonly NavigationItem[];

function NavigationIcon({
    type,
}: {
    readonly type: NavigationIconType;
}) {
    if (type === "home") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

    if (type === "courses") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M4.5 6.2A2.2 2.2 0 0 1 6.7 4h4.1c.7 0 1.2.2 1.7.7L13 5.2l.5-.5c.5-.5 1-.7 1.7-.7h2.1a2.2 2.2 0 0 1 2.2 2.2v12.1c0 .7-.6 1.2-1.3 1.1l-3.1-.5a4.3 4.3 0 0 0-3.1.7 4.3 4.3 0 0 0-3.1-.7l-3.1.5c-.7.1-1.3-.4-1.3-1.1V6.2Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 5.3v14.1"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                />
                <path
                    d="M7.4 8h2.4M14.2 8h2.4M7.4 11h2.4M14.2 11h2.4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "mytests") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                    x="4.5"
                    y="4"
                    width="15"
                    height="16"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M8 8h8M8 12h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="m13.5 16 1.6 1.6 3.1-3.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === "results") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M5 20V10M12 20V4M19 20v-7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M3.5 20.5h17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function matchesPath(
    item: NavigationItem,
    pathname: string,
): boolean {
    if (item.id === "home") {
        return pathname === "/";
    }

    if (item.id === "mytests") {
        return pathname.startsWith("/mening-testlarim");
    }

    if (item.id === "results") {
        return pathname.startsWith("/natijalar");
    }

    return pathname.startsWith(item.href);
}

export function MobileNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const pathnameIndex = useMemo(() => {
        const index = navigationItems.findIndex((item) =>
            matchesPath(item, pathname),
        );

        return index;
    }, [pathname]);

    const [visualIndex, setVisualIndex] =
        useState(pathnameIndex);

    const [pendingHref, setPendingHref] =
        useState<string | null>(null);

    useEffect(() => {
        const prefetch = () => {
            navigationItems.forEach((item) => {
                if (!matchesPath(item, pathname)) {
                    router.prefetch(item.href);
                }
            });
        };

        if (typeof window.requestIdleCallback === "function") {
            const idleId = window.requestIdleCallback(prefetch, { timeout: 1200 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timerId = setTimeout(prefetch, 450);
        return () => clearTimeout(timerId);
    }, [pathname, router]);

    useEffect(() => {
        setVisualIndex(pathnameIndex);
        setPendingHref(null);
    }, [pathnameIndex]);

    const handleNavigate = (
        item: NavigationItem,
        index: number,
    ) => {
        if (
            visualIndex === index &&
            matchesPath(item, pathname)
        ) {
            return;
        }

        setVisualIndex(index);
        setPendingHref(item.href);
        router.push(item.href);
    };

    return (
        <nav
            className={styles.navigation}
            aria-label="Asosiy navigatsiya"
        >
            <div className={styles.glassSurface}>
                <span
                    className={styles.slidingIndicator}
                    style={{
                        transform: `translateX(${Math.max(0, visualIndex) * 100}%)`,
                        opacity: visualIndex >= 0 ? 1 : 0,
                    }}
                    aria-hidden="true"
                />

                {navigationItems.map((item, index) => {
                    const active = visualIndex === index;
                    const pending =
                        pendingHref === item.href &&
                        !matchesPath(item, pathname);

                    return (
                        <button
                            key={item.id}
                            className={[
                                active
                                    ? styles.activeItem
                                    : "",
                                pending
                                    ? styles.pendingItem
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            type="button"
                            aria-current={
                                matchesPath(item, pathname)
                                    ? "page"
                                    : undefined
                            }
                            aria-label={item.label}
                            aria-busy={pending}
                            onPointerEnter={() => router.prefetch(item.href)}
                            onFocus={() => router.prefetch(item.href)}
                            onClick={() =>
                                handleNavigate(item, index)
                            }
                        >
                            <span className={styles.iconWrapper}>
                                <NavigationIcon type={item.icon} />
                            </span>

                            <span className={styles.label}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
