"use client";

import {
    useEffect,
    useState,
} from "react";

import styles from "./theme-toggle.module.css";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "talimot-theme";

function getCurrentTheme(): Theme {
    return document.documentElement.dataset.theme ===
    "dark"
        ? "dark"
        : "light";
}

export function ThemeToggle() {
    const [theme, setTheme] =
        useState<Theme>("light");

    const [isMounted, setIsMounted] =
        useState(false);

    useEffect(() => {
        setTheme(getCurrentTheme());
        setIsMounted(true);
    }, []);

    const toggleTheme = () => {
        const nextTheme: Theme =
            theme === "dark"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme =
            nextTheme;

        document.documentElement.style.colorScheme =
            nextTheme;

        window.localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme,
        );

        setTheme(nextTheme);
    };

    const isDark = theme === "dark";

    return (
        <button
            className={styles.button}
            type="button"
            aria-label={
                isDark
                    ? "Yorug‘ rejimni yoqish"
                    : "Tungi rejimni yoqish"
            }
            aria-pressed={isDark}
            title={
                isDark
                    ? "Yorug‘ rejim"
                    : "Tungi rejim"
            }
            onClick={toggleTheme}
        >
      <span
          className={styles.glow}
          aria-hidden="true"
      />

            {isMounted && isDark ? (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />

                    <path
                        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M20 15.2A8.5 8.5 0 0 1 8.8 4a7.5 7.5 0 1 0 11.2 11.2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
}