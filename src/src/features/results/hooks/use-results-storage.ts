"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    readCompletedTests,
    TEST_STORAGE_EVENT,
} from "@/features/tests/model/test-progress-storage";

import type {
    StoredCompletedTest,
} from "@/features/tests/model/test-progress-storage";

type ResultsStorageState = {
    readonly attempts:
        readonly StoredCompletedTest[];
    readonly isLoaded: boolean;
};

const initialState:
    ResultsStorageState = {
    attempts: [],
    isLoaded: false,
};

export function useResultsStorage() {
    const [
        storage,
        setStorage,
    ] =
        useState<ResultsStorageState>(
            initialState,
        );

    const loadResults =
        useCallback(() => {
            setStorage({
                attempts:
                    readCompletedTests(),
                isLoaded: true,
            });
        }, []);

    useEffect(() => {
        const loadTimerId =
            window.setTimeout(
                loadResults,
                0,
            );

        window.addEventListener(
            TEST_STORAGE_EVENT,
            loadResults,
        );

        window.addEventListener(
            "storage",
            loadResults,
        );

        return () => {
            window.clearTimeout(
                loadTimerId,
            );

            window.removeEventListener(
                TEST_STORAGE_EVENT,
                loadResults,
            );

            window.removeEventListener(
                "storage",
                loadResults,
            );
        };
    }, [loadResults]);

    return storage;
}