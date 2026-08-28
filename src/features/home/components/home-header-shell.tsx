"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { TalimotLogo } from "@/components/brand/talimot-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationCenter } from "@/features/notifications/components/notification-center";

import styles from "@/app/page.module.css";

const HomeDrawer = dynamic(
    () => import("./home-drawer").then((module) => module.HomeDrawer),
    { ssr: false },
);

export function HomeHeaderShell() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasOpenedMenu, setHasOpenedMenu] = useState(false);

    const openMenu = () => {
        setHasOpenedMenu(true);
        setIsMenuOpen(true);
    };

    return (
        <>
            <header className={styles.header}>
                <TalimotLogo />

                <div className={styles.headerActions}>
                    <NotificationCenter />
                    <ThemeToggle />
                    <button
                        className={styles.menuButton}
                        type="button"
                        aria-label="Menyuni ochish"
                        aria-expanded={isMenuOpen}
                        aria-controls="home-navigation-drawer"
                        onClick={openMenu}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </header>

            {hasOpenedMenu ? (
                <HomeDrawer
                    isOpen={isMenuOpen}
                    onCloseAction={() => setIsMenuOpen(false)}
                />
            ) : null}
        </>
    );
}
