import {
    repairLegacyStoredTestHref,
} from "./test-navigation";

export type StoredTestOptionId =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F";

/**
 * Shared answer value used by every test runner.
 *
 * Examples:
 *
 * Standard answer:
 * "A"
 *
 * Written answer:
 * "yaqin"
 *
 * Matching answer:
 * {
 *     "question-33": "A",
 *     "question-34": "C",
 * }
 *
 * Multipart answer:
 * {
 *     "a": "first answer",
 *     "b": "second answer",
 * }
 */
export interface StoredNestedTestAnswers {
    readonly [key: string]:
        StoredTestAnswerValue;
}

export type StoredTestAnswerValue =
    | string
    | StoredNestedTestAnswers;

export type StoredTestAnswers =
    Readonly<
        Partial<
            Record<
                string,
                StoredTestAnswerValue
            >
        >
    >;

export type StoredTestFormat =
    | "standard"
    | "ghazal"
    | "passage-five"
    | "standard-five"
    | "mixed"
    | "diagnostic";

export interface StoredTestMetadata {
    readonly title: string;
    readonly category: string;
    readonly href: string;
    readonly totalQuestions: number;
    readonly estimatedMinutes: number;
    readonly isPremium?: boolean;
    readonly format?: StoredTestFormat;
}

export interface StoredTestProgress {
    readonly version: 2;
    readonly testId: string;
    readonly metadata: StoredTestMetadata;
    readonly currentIndex: number;
    readonly answers: StoredTestAnswers;
    readonly markedQuestionIds:
        readonly string[];
    readonly remainingSeconds: number;
    readonly startedAt: number;
    readonly savedAt: number;
}

export interface StoredCompletedTest {
    readonly version: 1;
    readonly attemptId: string;
    readonly testId: string;
    readonly metadata: StoredTestMetadata;
    readonly answers: StoredTestAnswers;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly needsReviewCount?: number;
    readonly percentage: number;
    readonly durationSeconds: number;
    readonly completedAt: number;
    readonly score?: number;
    readonly maximumScore?: number;
}

export interface SaveTestProgressInput {
    readonly testId: string;
    readonly metadata: StoredTestMetadata;
    readonly currentIndex: number;
    readonly answers: StoredTestAnswers;
    readonly markedQuestionIds:
        readonly string[];
    readonly remainingSeconds: number;
}

export interface SaveCompletedTestInput {
    readonly testId: string;
    readonly metadata: StoredTestMetadata;
    readonly answers: StoredTestAnswers;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly needsReviewCount?: number;
    readonly percentage: number;
    readonly durationSeconds: number;
    readonly score?: number;
    readonly maximumScore?: number;
}

const PROGRESS_STORAGE_PREFIX =
    "talimot-test-progress";

const PROGRESS_REGISTRY_KEY =
    "talimot-test-progress-registry";

const COMPLETED_TESTS_KEY =
    "talimot-completed-tests";

export const TEST_STORAGE_EVENT =
    "talimot-test-storage-change";

function createProgressStorageKey(
    testId: string,
) {
    return `${PROGRESS_STORAGE_PREFIX}:${testId}`;
}

function notifyStorageChange() {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    window.dispatchEvent(
        new Event(TEST_STORAGE_EVENT),
    );
}

function isStoredAnswerValue(
    value: unknown,
    depth = 0,
): value is StoredTestAnswerValue {
    if (typeof value === "string") {
        return true;
    }

    if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value) ||
        depth >= 4
    ) {
        return false;
    }

    return Object.values(value).every(
        (nestedValue) =>
            isStoredAnswerValue(
                nestedValue,
                depth + 1,
            ),
    );
}

function isStoredMetadata(
    value: unknown,
): value is StoredTestMetadata {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const candidate =
        value as Partial<StoredTestMetadata>;

    return (
        typeof candidate.title ===
        "string" &&
        typeof candidate.category ===
        "string" &&
        typeof candidate.href ===
        "string" &&
        typeof candidate.totalQuestions ===
        "number" &&
        Number.isFinite(
            candidate.totalQuestions,
        ) &&
        typeof candidate.estimatedMinutes ===
        "number" &&
        Number.isFinite(
            candidate.estimatedMinutes,
        ) &&
        (
            candidate.format ===
            undefined ||
            candidate.format ===
            "standard" ||
            candidate.format ===
            "ghazal"  ||
            candidate.format ===
            "passage-five" ||
            candidate.format ===
            "standard-five" ||
            candidate.format ===
            "mixed" ||
            candidate.format ===
            "diagnostic"
        )
    );
}

function areAnswersValid(
    value: unknown,
): value is StoredTestAnswers {
    if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
    ) {
        return false;
    }

    return Object.values(value).every(
        (answer) =>
            answer === undefined ||
            isStoredAnswerValue(
                answer,
            ),
    );
}

function isStoredTestProgress(
    value: unknown,
): value is StoredTestProgress {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const candidate =
        value as Partial<StoredTestProgress>;

    return (
        candidate.version === 2 &&
        typeof candidate.testId ===
        "string" &&
        isStoredMetadata(
            candidate.metadata,
        ) &&
        typeof candidate.currentIndex ===
        "number" &&
        Number.isInteger(
            candidate.currentIndex,
        ) &&
        areAnswersValid(
            candidate.answers,
        ) &&
        Array.isArray(
            candidate.markedQuestionIds,
        ) &&
        (
            candidate.markedQuestionIds as
                unknown[]
        ).every(
            (questionId) =>
                typeof questionId ===
                "string",
        ) &&
        typeof candidate.remainingSeconds ===
        "number" &&
        typeof candidate.startedAt ===
        "number" &&
        typeof candidate.savedAt ===
        "number"
    );
}

function isStoredCompletedTest(
    value: unknown,
): value is StoredCompletedTest {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const candidate =
        value as Partial<StoredCompletedTest>;

    return (
        candidate.version === 1 &&
        typeof candidate.attemptId ===
        "string" &&
        typeof candidate.testId ===
        "string" &&
        isStoredMetadata(
            candidate.metadata,
        ) &&
        areAnswersValid(
            candidate.answers,
        ) &&
        typeof candidate.correctCount ===
        "number" &&
        typeof candidate.incorrectCount ===
        "number" &&
        typeof candidate.unansweredCount ===
        "number" &&
        (
            candidate.needsReviewCount ===
            undefined ||
            (
                typeof candidate.needsReviewCount ===
                "number" &&
                Number.isFinite(
                    candidate.needsReviewCount,
                )
            )
        ) &&
        typeof candidate.percentage ===
        "number" &&
        typeof candidate.durationSeconds ===
        "number" &&
        typeof candidate.completedAt ===
        "number" &&
        (
            candidate.score ===
            undefined ||
            (
                typeof candidate.score ===
                "number" &&
                Number.isFinite(
                    candidate.score,
                )
            )
        ) &&
        (
            candidate.maximumScore ===
            undefined ||
            (
                typeof candidate.maximumScore ===
                "number" &&
                Number.isFinite(
                    candidate.maximumScore,
                )
            )
        )
    );
}

function readProgressRegistry():
    string[] {
    if (
        typeof window === "undefined"
    ) {
        return [];
    }

    try {
        const rawRegistry =
            window.localStorage.getItem(
                PROGRESS_REGISTRY_KEY,
            );

        if (!rawRegistry) {
            return [];
        }

        const parsed: unknown =
            JSON.parse(rawRegistry);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (testId): testId is string =>
                typeof testId === "string",
        );
    } catch {
        return [];
    }
}

function saveProgressRegistry(
    testIds: readonly string[],
) {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    const uniqueIds = [
        ...new Set(testIds),
    ];

    window.localStorage.setItem(
        PROGRESS_REGISTRY_KEY,
        JSON.stringify(uniqueIds),
    );
}

function addTestToRegistry(
    testId: string,
) {
    const registry =
        readProgressRegistry();

    if (registry.includes(testId)) {
        return;
    }

    saveProgressRegistry([
        ...registry,
        testId,
    ]);
}

function removeTestFromRegistry(
    testId: string,
) {
    const registry =
        readProgressRegistry();

    saveProgressRegistry(
        registry.filter(
            (storedTestId) =>
                storedTestId !== testId,
        ),
    );
}

export function readTestProgress(
    testId: string,
): StoredTestProgress | null {
    if (
        typeof window === "undefined"
    ) {
        return null;
    }

    try {
        const storageKey =
            createProgressStorageKey(
                testId,
            );

        const rawProgress =
            window.localStorage.getItem(
                storageKey,
            );

        if (!rawProgress) {
            return null;
        }

        const parsedProgress: unknown =
            JSON.parse(rawProgress);

        if (
            !isStoredTestProgress(
                parsedProgress,
            ) ||
            parsedProgress.testId !==
            testId
        ) {
            window.localStorage.removeItem(
                storageKey,
            );

            removeTestFromRegistry(
                testId,
            );

            return null;
        }

        const repairedHref =
            repairLegacyStoredTestHref(
                parsedProgress.metadata.href,
                parsedProgress.metadata.category,
            );

        if (
            repairedHref ===
            parsedProgress.metadata.href
        ) {
            return parsedProgress;
        }

        const repairedProgress:
            StoredTestProgress = {
            ...parsedProgress,
            metadata: {
                ...parsedProgress.metadata,
                href: repairedHref,
            },
        };

        window.localStorage.setItem(
            storageKey,
            JSON.stringify(
                repairedProgress,
            ),
        );

        return repairedProgress;
    } catch {
        return null;
    }
}

export function readAllTestProgress():
    StoredTestProgress[] {
    if (
        typeof window === "undefined"
    ) {
        return [];
    }

    const registry =
        readProgressRegistry();

    const validProgress:
        StoredTestProgress[] = [];

    const validTestIds: string[] =
        [];

    registry.forEach((testId) => {
        const progress =
            readTestProgress(testId);

        if (!progress) {
            return;
        }

        validProgress.push(progress);
        validTestIds.push(testId);
    });

    if (
        validTestIds.length !==
        registry.length
    ) {
        saveProgressRegistry(
            validTestIds,
        );
    }

    return validProgress.sort(
        (first, second) =>
            second.savedAt -
            first.savedAt,
    );
}

export function saveTestProgress(
    input: SaveTestProgressInput,
) {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    try {
        const existingProgress =
            readTestProgress(
                input.testId,
            );

        const now = Date.now();

        const storedProgress:
            StoredTestProgress = {
            version: 2,
            ...input,
            startedAt:
                existingProgress?.startedAt ??
                now,
            savedAt: now,
        };

        window.localStorage.setItem(
            createProgressStorageKey(
                input.testId,
            ),
            JSON.stringify(
                storedProgress,
            ),
        );

        addTestToRegistry(
            input.testId,
        );

        notifyStorageChange();
    } catch {
        // Local storage unavailable.
    }
}

export function removeTestProgress(
    testId: string,
) {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    try {
        window.localStorage.removeItem(
            createProgressStorageKey(
                testId,
            ),
        );

        removeTestFromRegistry(
            testId,
        );

        notifyStorageChange();
    } catch {
        // Local storage unavailable.
    }
}

export function calculateRestoredTime(
    progress: StoredTestProgress,
) {
    const elapsedSeconds =
        Math.floor(
            (Date.now() -
                progress.savedAt) /
            1000,
        );

    return Math.max(
        0,
        progress.remainingSeconds -
        elapsedSeconds,
    );
}

export function readCompletedTests():
    StoredCompletedTest[] {
    if (
        typeof window === "undefined"
    ) {
        return [];
    }

    try {
        const rawAttempts =
            window.localStorage.getItem(
                COMPLETED_TESTS_KEY,
            );

        if (!rawAttempts) {
            return [];
        }

        const parsed: unknown =
            JSON.parse(rawAttempts);

        if (!Array.isArray(parsed)) {
            return [];
        }

        const validAttempts =
            parsed.filter(
                isStoredCompletedTest,
            );

        let didRepairHref =
            false;

        const repairedAttempts =
            validAttempts.map(
                (attempt) => {
                    const repairedHref =
                        repairLegacyStoredTestHref(
                            attempt.metadata.href,
                            attempt.metadata.category,
                        );

                    if (
                        repairedHref ===
                        attempt.metadata.href
                    ) {
                        return attempt;
                    }

                    didRepairHref =
                        true;

                    return {
                        ...attempt,
                        metadata: {
                            ...attempt.metadata,
                            href: repairedHref,
                        },
                    } satisfies StoredCompletedTest;
                },
            );

        if (didRepairHref) {
            window.localStorage.setItem(
                COMPLETED_TESTS_KEY,
                JSON.stringify(
                    repairedAttempts,
                ),
            );
        }

        return repairedAttempts.sort(
            (first, second) =>
                second.completedAt -
                first.completedAt,
        );
    } catch {
        return [];
    }
}

export function saveCompletedTest(
    input: SaveCompletedTestInput,
) {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    try {
        const attempts =
            readCompletedTests();

        const completedAt =
            Date.now();

        const completedTest:
            StoredCompletedTest = {
            version: 1,
            attemptId:
                `${input.testId}-${completedAt}`,
            ...input,
            completedAt,
        };

        const nextAttempts = [
            completedTest,
            ...attempts,
        ].slice(0, 100);

        window.localStorage.setItem(
            COMPLETED_TESTS_KEY,
            JSON.stringify(
                nextAttempts,
            ),
        );

        window.localStorage.removeItem(
            createProgressStorageKey(
                input.testId,
            ),
        );

        removeTestFromRegistry(
            input.testId,
        );

        notifyStorageChange();

        // Persist the completed attempt to the authenticated database history.
        // Local storage remains as an offline/browser cache for existing result UI.
        void fetch("/api/test-attempts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(completedTest),
            keepalive: true,
        }).catch(() => {
            // The local result is still retained; roadmap legacy sync retries later.
        });

        return completedTest;
    } catch {
        // Local storage unavailable.
        return null;
    }
}

export function readCompletedTest(
    attemptId: string,
) {
    return (
        readCompletedTests().find(
            (attempt) =>
                attempt.attemptId ===
                attemptId,
        ) ?? null
    );
}

export function removeCompletedTest(
    attemptId: string,
) {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    try {
        const attempts =
            readCompletedTests();

        const nextAttempts =
            attempts.filter(
                (attempt) =>
                    attempt.attemptId !==
                    attemptId,
            );

        window.localStorage.setItem(
            COMPLETED_TESTS_KEY,
            JSON.stringify(
                nextAttempts,
            ),
        );

        notifyStorageChange();
    } catch {
        // Local storage unavailable.
    }
}

export function clearCompletedTests() {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    try {
        window.localStorage.removeItem(
            COMPLETED_TESTS_KEY,
        );

        notifyStorageChange();
    } catch {
        // Local storage unavailable.
    }
}