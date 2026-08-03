export type TestDashboardTab =
    | "all"
    | "ongoing"
    | "completed";

export type TestDashboardFilter =
    | "all"
    | "free"
    | "premium";

export const testDashboardTabLabels: Readonly<
    Record<TestDashboardTab, string>
> = Object.freeze({
    all: "Barchasi",
    ongoing: "Davom etayotgan",
    completed: "Yakunlangan",
});

export const testDashboardFilterLabels: Readonly<
    Record<TestDashboardFilter, string>
> = Object.freeze({
    all: "Barchasi",
    free: "Bepul",
    premium: "Premium",
});