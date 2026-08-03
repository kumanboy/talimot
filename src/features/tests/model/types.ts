export type TestCategoryIcon =
    | "spelling"
    | "morphemics"
    | "lexicology"
    | "stylistics"
    | "morphology"
    | "syntax"
    | "punctuation"
    | "ghazal"
    | "scientific-text"
    | "literary-text"
    | "literature"
    | "mixed"
    | "mock";

export type TestCategoryGroup =
    | "grammar"
    | "national-certificate";

export interface TestCategory {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly href: string;
    readonly icon: TestCategoryIcon;
    readonly group: TestCategoryGroup;
    readonly itemCountLabel: string;
    readonly featured?: boolean;
}