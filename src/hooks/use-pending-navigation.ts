"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationMode = "push" | "replace" | "back";

const FALLBACK_RESET_MS = 9000;

export function usePendingNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [pending, setPending] = useState(false);
    const pendingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        pendingRef.current = false;
        setPending(false);
        clearTimer();
    }, [pathname, clearTimer]);

    useEffect(() => clearTimer, [clearTimer]);

    const begin = useCallback(() => {
        // State updates are asynchronous. Keep a ref lock as well so two taps
        // in the same frame cannot dispatch the same navigation twice.
        if (pendingRef.current) return false;

        pendingRef.current = true;
        setPending(true);
        clearTimer();
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            pendingRef.current = false;
            setPending(false);
        }, FALLBACK_RESET_MS);
        return true;
    }, [clearTimer]);

    const navigate = useCallback((mode: NavigationMode, href?: string) => {
        if (!begin()) return;

        if (mode === "back") {
            router.back();
            return;
        }

        if (!href) {
            pendingRef.current = false;
            setPending(false);
            return;
        }

        if (mode === "replace") router.replace(href);
        else router.push(href);
    }, [begin, router]);

    return {
        pending,
        push: (href: string) => navigate("push", href),
        replace: (href: string) => navigate("replace", href),
        back: () => navigate("back"),
    } as const;
}
