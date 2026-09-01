export type NationalTestTopic =
    | "gazal"
    | "ilmiy-matn"
    | "badiiy-matn"
    | "badiiy-asarlar"
    | "aralash"
    | "diagnostika";

export type NationalTestFormat =
    | "standard"
    | "passage-five"
    | "standard-five"
    | "mixed"
    | "diagnostic";

export type NationalTestDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type NationalTestAccess =
    | "free"
    | "premium";

export interface PlannedNationalTest {
    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    readonly topic:
        NationalTestTopic;

    readonly format:
        NationalTestFormat;

    readonly questionCount: number;
    readonly estimatedMinutes: number;

    readonly difficulty:
        NationalTestDifficulty;

    readonly access:
        NationalTestAccess;
}

export interface NationalTestSummary {
    readonly id: string;
    readonly slug: string;

    readonly title: string;
    readonly description: string;

    readonly topic:
        NationalTestTopic;

    readonly format:
        NationalTestFormat;

    readonly questionCount: number;
    readonly estimatedMinutes: number;

    readonly difficulty:
        NationalTestDifficulty;

    readonly access:
        NationalTestAccess;

    readonly tangaPrice: number;
    readonly isPurchased: boolean;

    readonly href: string;
    readonly isAvailable: boolean;
}