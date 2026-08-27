import type {
    StandardTestAccess,
    StandardTestDifficulty,
} from "@/features/tests/model/questions/types";

export interface StandardTestSummary {
    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    readonly category: string;
    readonly topicSlug: string;

    readonly questionCount: 20;
    readonly estimatedMinutes: number;

    readonly difficulty:
        StandardTestDifficulty;

    readonly access:
        StandardTestAccess;

    readonly tangaPrice: number;
    readonly isPurchased: boolean;

    readonly href: string;

    /**
     * True when the test has a registered
     * 20-question dataset and can be opened.
     */
    readonly isAvailable: boolean;
}

export interface PlannedStandardTest {
    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    readonly category: string;
    readonly topicSlug: string;

    readonly questionCount: 20;
    readonly estimatedMinutes: number;

    readonly difficulty:
        StandardTestDifficulty;

    readonly access:
        StandardTestAccess;
}