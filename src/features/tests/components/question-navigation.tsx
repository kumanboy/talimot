"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./question-navigation.module.css";

export function QuestionNavigation({ children, currentIndex, className }: {
    children: ReactNode;
    currentIndex: number;
    className?: string;
}) {
    const stripRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: true, end: false });

    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        const update = () => setEdges({
            start: strip.scrollLeft <= 1,
            end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1,
        });
        const observer = new ResizeObserver(update);
        observer.observe(strip);
        strip.addEventListener("scroll", update, { passive: true });
        update();
        return () => {
            observer.disconnect();
            strip.removeEventListener("scroll", update);
        };
    }, []);

    useEffect(() => {
        const strip = stripRef.current;
        const current = strip?.children[currentIndex] as HTMLElement | undefined;
        if (!strip || !current) return;
        const bounds = strip.getBoundingClientRect();
        const button = current.getBoundingClientRect();
        if (button.left < bounds.left || button.right > bounds.right) {
            strip.scrollLeft += button.left - bounds.left - (bounds.width - button.width) / 2;
        }
    }, [currentIndex]);

    function scroll(direction: number) {
        const strip = stripRef.current;
        if (!strip) return;
        strip.scrollBy({
            left: direction * strip.clientWidth * 0.8,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    }

    return (
        <nav className={styles.navigation} aria-label="Savollar">
            <button type="button" className={styles.arrow} disabled={edges.start}
                aria-label="Oldingi savollarni ko‘rsatish" onClick={() => scroll(-1)}>‹</button>
            <div ref={stripRef} className={`${className ?? ""} ${styles.strip}`}>
                {children}
            </div>
            <button type="button" className={styles.arrow} disabled={edges.end}
                aria-label="Keyingi savollarni ko‘rsatish" onClick={() => scroll(1)}>›</button>
        </nav>
    );
}
