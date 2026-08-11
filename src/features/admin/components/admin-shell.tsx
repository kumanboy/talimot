import type {
    ReactNode,
} from "react";

import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";

import styles from "./admin-shell.module.css";

export type AdminNavigationKey =
    | "dashboard"
    | "tests"
    | "results"
    | "users"
    | "certificates"
    | "products"
    | "tanga"
    | "payments"
    | "essays"
    | "settings";

interface AdminNavigationItem {
    readonly key:
        AdminNavigationKey;
    readonly label:
        string;
    readonly href?:
        string;
    readonly disabled?:
        boolean;
}

const adminNavigationItems:
    readonly AdminNavigationItem[] = [
        {
            key: "dashboard",
            label: "Dashboard",
            href: "/admin",
        },
        {
            key: "tests",
            label: "Testlar",
            href: "/admin/tests",
        },
        {
            key: "results",
            label: "Natijalar",
            disabled: true,
        },
        {
            key: "users",
            label: "Foydalanuvchilar",
            href: "/admin/users",
        },
        {
            key: "certificates",
            label: "Sertifikatlar",
            disabled: true,
        },
        {
            key: "products",
            label: "Kurslar va kitoblar",
            href: "/admin/products",
        },
        {
            key: "tanga",
            label: "Tanga",
            href: "/admin/tanga",
        },
        {
            key: "payments",
            label: "To‘lovlar",
            href: "/admin/payments",
        },
        {
            key: "essays",
            label: "Esse tekshiruvlari",
            href: "/admin/essays",
        },
        {
            key: "settings",
            label: "Sozlamalar",
            disabled: true,
        },
    ];

interface AdminShellProps {
    readonly activeItem:
        AdminNavigationKey;
    readonly children:
        ReactNode;
}

export function AdminShell({
    activeItem,
    children,
}: AdminShellProps) {
    return (
        <main className={styles.shell}>
            <aside className={styles.sidebar}>
                <TalimotLogo
                    className={styles.logo}
                />

                <div className={styles.adminBadge}>
                    <span>
                        ADMIN
                    </span>

                    <strong>
                        Boshqaruv paneli
                    </strong>
                </div>

                <nav
                    className={styles.navigation}
                    aria-label="Admin navigatsiyasi"
                >
                    {adminNavigationItems.map(
                        (item) => {
                            const isActive =
                                item.key ===
                                activeItem;

                            if (
                                item.disabled ||
                                !item.href
                            ) {
                                return (
                                    <span
                                        key={item.key}
                                        className={
                                            styles.disabledItem
                                        }
                                        aria-disabled="true"
                                    >
                                        {item.label}

                                        <small>
                                            Tez orada
                                        </small>
                                    </span>
                                );
                            }

                            return (
                                <a
                                    key={item.key}
                                    href={item.href}
                                    className={
                                        isActive
                                            ? styles.activeItem
                                            : styles.navigationItem
                                    }
                                    aria-current={
                                        isActive
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    {item.label}
                                </a>
                            );
                        },
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.sessionStatus}>
                        <span
                            aria-hidden="true"
                        />

                        <div>
                            <strong>
                                Sessiya faol
                            </strong>

                            <small>
                                Xavfsiz admin kirishi
                            </small>
                        </div>
                    </div>

                    <form
                        action="/api/admin/logout"
                        method="post"
                    >
                        <button type="submit">
                            Hisobdan chiqish
                        </button>
                    </form>
                </div>
            </aside>

            <section className={styles.content}>
                {children}
            </section>
        </main>
    );
}
