"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type SessionResponse = {
    ok: boolean;
    reason?: string;
};

const PUBLIC_PATHS = [
    "/access-required",
    "/telegram-entry",
];

function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`),
    );
}

export function TelegramWebAppSetup() {
    const pathname = usePathname();
    const inFlightRef = useRef(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const telegramWebApp = window.Telegram?.WebApp;

        if (!telegramWebApp) {
            return;
        }

        telegramWebApp.ready();
        telegramWebApp.expand();

        if (typeof telegramWebApp.disableVerticalSwipes === "function") {
            telegramWebApp.disableVerticalSwipes();
        }
    }, []);

    useEffect(() => {
        const telegramWebApp = window.Telegram?.WebApp;

        if (
            !telegramWebApp?.initData ||
            isPublicPath(pathname)
        ) {
            setChecking(false);
            return;
        }

        let disposed = false;

        const verifyCurrentAccess = async () => {
            if (inFlightRef.current || disposed) {
                return;
            }

            inFlightRef.current = true;
            setChecking(true);

            try {
                const response = await fetch("/api/telegram/miniapp-session", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        initData: telegramWebApp.initData,
                        mode: "refresh",
                    }),
                    cache: "no-store",
                });

                const payload = await response.json() as SessionResponse;

                if (disposed) {
                    return;
                }

                if (!response.ok || !payload.ok) {
                    const reason = payload.reason === "subscription"
                        ? "subscription"
                        : "telegram";

                    window.location.replace(
                        `/access-required?reason=${reason}`,
                    );
                    return;
                }

                setChecking(false);
            } catch {
                if (!disposed) {
                    window.location.replace(
                        "/access-required?reason=network",
                    );
                }
            } finally {
                inFlightRef.current = false;
            }
        };

        const handleActivated = () => {
            void verifyCurrentAccess();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void verifyCurrentAccess();
            }
        };

        void verifyCurrentAccess();

        telegramWebApp.onEvent?.("activated", handleActivated);
        window.addEventListener("focus", handleActivated);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            disposed = true;
            telegramWebApp.offEvent?.("activated", handleActivated);
            window.removeEventListener("focus", handleActivated);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [pathname]);

    if (!checking || isPublicPath(pathname)) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                display: "grid",
                placeItems: "center",
                background: "var(--background, #f7fafc)",
                color: "var(--foreground, #111827)",
                fontSize: 15,
                fontWeight: 700,
            }}
        >
            Obuna tekshirilmoqda...
        </div>
    );
}
