"use client";

import styles from "./test-access-filter.module.css";

export type TestAccessFilterValue =
    | "all"
    | "free"
    | "premium";

type TestAccessFilterProps = {
    readonly value: TestAccessFilterValue;
    readonly onChange: (
        value: TestAccessFilterValue,
    ) => void;
    readonly totalCount: number;
    readonly freeCount: number;
    readonly premiumCount: number;
};

const filters: readonly {
    readonly value: TestAccessFilterValue;
    readonly label: string;
}[] = [
    {
        value: "all",
        label: "Barchasi",
    },
    {
        value: "free",
        label: "Bepul",
    },
    {
        value: "premium",
        label: "Premium",
    },
];

export function TestAccessFilter({
    value,
    onChange,
    totalCount,
    freeCount,
    premiumCount,
}: TestAccessFilterProps) {
    const counts: Readonly<
        Record<
            TestAccessFilterValue,
            number
        >
    > = {
        all: totalCount,
        free: freeCount,
        premium: premiumCount,
    };

    const hasMixedAccess =
        freeCount > 0 &&
        premiumCount > 0;

    if (
        totalCount <= 1 &&
        !hasMixedAccess
    ) {
        return null;
    }

    return (
        <div
            className={styles.toolbar}
            aria-label="Testlar tartibi va filtri"
        >
            <span
                className={
                    styles.orderHint
                }
            >
                <span aria-hidden="true">
                    1 → 2 → 3
                </span>
                Variant tartibida
            </span>

            {hasMixedAccess ? (
                <div
                    className={
                        styles.filters
                    }
                    role="group"
                    aria-label="Testlarni kirish turiga ko‘ra filtrlash"
                >
                    {filters.map(
                        (filter) => (
                            <button
                                key={
                                    filter.value
                                }
                                type="button"
                                className={[
                                    styles.filterButton,
                                    value ===
                                    filter.value
                                        ? styles.activeFilter
                                        : "",
                                ]
                                    .filter(
                                        Boolean,
                                    )
                                    .join(
                                        " ",
                                    )}
                                aria-pressed={
                                    value ===
                                    filter.value
                                }
                                onClick={() =>
                                    onChange(
                                        filter.value,
                                    )
                                }
                            >
                                <span>
                                    {
                                        filter.label
                                    }
                                </span>
                                <strong>
                                    {
                                        counts[
                                            filter
                                                .value
                                        ]
                                    }
                                </strong>
                            </button>
                        ),
                    )}
                </div>
            ) : null}
        </div>
    );
}
