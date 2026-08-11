"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readCompletedTests } from "@/features/tests/model/test-progress-storage";

const SYNC_KEY = "talimot-roadmap-db-sync-v1";

export function RoadmapLegacyAttemptSync() {
    const router = useRouter();

    useEffect(() => {
        if (window.localStorage.getItem(SYNC_KEY) === "done") return;

        const attempts = readCompletedTests().slice(0, 100);
        if (attempts.length === 0) {
            window.localStorage.setItem(SYNC_KEY, "done");
            return;
        }

        void fetch("/api/test-attempts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ attempts }),
        })
            .then(async (response) => {
                if (!response.ok) return;
                window.localStorage.setItem(SYNC_KEY, "done");
                router.refresh();
            })
            .catch(() => {
                // Keep local history and retry on the next roadmap visit.
            });
    }, [router]);

    return null;
}
