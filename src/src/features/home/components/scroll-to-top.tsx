"use client";

import { useEffect, useState } from "react";

import styles from "./scroll-to-top.module.css";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateVisibility = () => {
            setIsVisible(window.scrollY > 520);
        };

        updateVisibility();

        window.addEventListener(
            "scroll",
            updateVisibility,
            { passive: true },
        );

        return () => {
            window.removeEventListener(
                "scroll",
                updateVisibility,
            );
        };
    }, []);

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: reduceMotion
                ? "auto"
                : "smooth",
        });
    };

    return (
        <button
            className={[
                styles.button,
                isVisible ? styles.visible : "",
            ]
                .filter(Boolean)
                .join(" ")}
            type="button"
            aria-label="Sahifa tepasiga qaytish"
            aria-hidden={!isVisible}
            tabIndex={isVisible ? 0 : -1}
            onClick={scrollToTop}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="m6 14 6-6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}