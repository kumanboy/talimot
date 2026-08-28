export type MyTestAttempt = {
    readonly id: string;
    readonly percentage: number;
    readonly score: number | null;
    readonly maximumScore: number | null;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly durationSeconds: number;
    readonly completedAt: number;
    readonly grade: string | null;
    readonly certificateCode: string | null;
};

export type MyTestLibraryItem = {
    readonly testId: string;
    readonly title: string;
    readonly category: string;
    readonly href: string;
    readonly format: string | null;
    readonly purchased: boolean;
    readonly purchasedAt: number | null;
    readonly tangaPrice: number;
    readonly available: boolean;
    readonly attemptCount: number;
    readonly firstAttempt: MyTestAttempt | null;
    readonly latestAttempt: MyTestAttempt | null;
    readonly bestAttempt: MyTestAttempt | null;
    readonly attempts: readonly MyTestAttempt[];
    readonly lastActivityAt: number;
};

export type MyTestsLibraryData = {
    readonly authenticated: boolean;
    readonly purchasedCount: number;
    readonly completedTestCount: number;
    readonly totalAttempts: number;
    readonly bestPercentage: number | null;
    readonly items: readonly MyTestLibraryItem[];
};
