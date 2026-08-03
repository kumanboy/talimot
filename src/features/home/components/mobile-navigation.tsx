"use client";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import styles from "./mobile-navigation.module.css";

type NavigationIconType =
    | "home"
    | "tests"
    | "roadmap"
    | "results"
    | "profile";

type NavigationItem = {
    id: NavigationIconType;
    label: string;
    href: string;
    icon: NavigationIconType;
};

const navigationItems = [
    {
        id: "home",
        label: "Bosh sahifa",
        href: "/",
        icon: "home",
    },
    {
        id: "tests",
        label: "Testlar",
        href: "/tests",
        icon: "tests",
    },
    {
        id: "roadmap",
        label: "Yo‘l xaritasi",
        href:
            "/yol-xaritasi?mode=from-zero&view=full",
        icon: "roadmap",
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
    type: NavigationIconType;
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

    if (type === "results") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
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

export function MobileNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (
        item: NavigationItem,
    ) => {
        if (item.id === "home") {
            return pathname === "/";
        }

        if (item.id === "roadmap") {
            return pathname.startsWith(
                "/yol-xaritasi",
            );
        }

        return pathname.startsWith(
            item.href,
        );
    };

    return (
        <nav
            className={
                styles.navigation
            }
            aria-label="Asosiy navigatsiya"
        >
            <div
                className={
                    styles.glassSurface
                }
            >
                {navigationItems.map(
                    (item) => {
                        const active =
                            isActive(item);

                        return (
                            <button
                                key={item.id}
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
                                aria-label={
                                    item.label
                                }
                                onClick={() =>
                                    router.push(
                                        item.href,
                                    )
                                }
                            >
                <span
                    className={
                        styles.iconWrapper
                    }
                >
                  <NavigationIcon
                      type={
                          item.icon
                      }
                  />
                </span>

                                <span
                                    className={
                                        styles.label
                                    }
                                >
                  {item.label}
                </span>
                            </button>
                        );
                    },
                )}
            </div>
        </nav>
    );
}