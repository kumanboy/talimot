"use client";

import { useEffect } from "react";

const SESSION_KEY =
    "talimot:test-catalog-warmup:v1";

type NavigatorWithConnection =
    Navigator & {
        connection?: {
            readonly saveData?: boolean;
            readonly effectiveType?: string;
        };
    };

/**
 * The homepage is intentionally light and does not wait for test DB data.
 * Once it is interactive, prime the public test catalogue in the background
 * so the student's first module tap is not also the first catalogue query.
 */
export function StudentModuleWarmup() {
    useEffect(() => {
        try {
            if (
                sessionStorage.getItem(
                    SESSION_KEY,
                )
            ) {
                return;
            }
        } catch {
            // Storage can be unavailable in restrictive webviews. Warmup can
            // still continue safely without persistence.
        }

        const network =
            (
                navigator as
                    NavigatorWithConnection
            ).connection;

        if (
            network?.saveData ||
            network?.effectiveType ===
                "slow-2g" ||
            network?.effectiveType ===
                "2g"
        ) {
            return;
        }

        const runWarmup = () => {
            try {
                sessionStorage.setItem(
                    SESSION_KEY,
                    "started",
                );
            } catch {
                // Non-critical.
            }

            void fetch(
                "/api/tests/warmup",
                {
                    method: "GET",
                    credentials:
                        "same-origin",
                    cache: "no-store",
                    keepalive: true,
                },
            ).catch(() => {
                // The normal module request remains the fallback.
            });
        };

        if (
            typeof window.requestIdleCallback ===
            "function"
        ) {
            const idleId =
                window.requestIdleCallback(
                    runWarmup,
                    {
                        timeout: 1600,
                    },
                );

            return () => {
                window.cancelIdleCallback(
                    idleId,
                );
            };
        }

        const timeoutId =
            window.setTimeout(
                runWarmup,
                900,
            );

        return () =>
            window.clearTimeout(
                timeoutId,
            );
    }, []);

    return null;
}
