"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    calculateRestoredTime,
    readAllTestProgress,
    readCompletedTests,
    TEST_STORAGE_EVENT,
} from "@/features/tests/model/test-progress-storage";

import type {
    StoredCompletedTest,
    StoredTestProgress,
} from "@/features/tests/model/test-progress-storage";

export interface TestDashboardStorage {
    readonly ongoing:
        readonly StoredTestProgress[];
    readonly completed:
        readonly StoredCompletedTest[];
    readonly isLoaded: boolean;
}

const emptyStorage:
    TestDashboardStorage = {
    ongoing: [],
    completed: [],
    isLoaded: false,
};

export function useTestDashboardStorage() {
    const [storage, setStorage] =
        useState<TestDashboardStorage>(
            emptyStorage,
        );

    const loadStorage =
        useCallback(() => {
            const ongoing =
                readAllTestProgress().filter(
                    (progress) =>
                        calculateRestoredTime(
                            progress,
                        ) > 0,
                );

            const completed =
                readCompletedTests();

            setStorage({
                ongoing,
                completed,
                isLoaded: true,
            });
        }, []);

    useEffect(() => {
        const loadTimerId =
            window.setTimeout(
                loadStorage,
                0,
            );

        window.addEventListener(
            TEST_STORAGE_EVENT,
            loadStorage,
        );

        window.addEventListener(
            "storage",
            loadStorage,
        );

        return () => {
            window.clearTimeout(
                loadTimerId,
            );

            window.removeEventListener(
                TEST_STORAGE_EVENT,
                loadStorage,
            );

            window.removeEventListener(
                "storage",
                loadStorage,
            );
        };
    }, [loadStorage]);

    return storage;
}