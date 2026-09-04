export type VariantSortableTest = {
    readonly title: string;
    readonly slug: string;
};

const naturalUzbekCollator =
    new Intl.Collator(
        "uz",
        {
            numeric: true,
            sensitivity: "base",
        },
    );

const variantPatterns: readonly RegExp[] = [
    // Prefer "3 variant" over a later question-count token such as
    // "ot_3_variant_20" (3-variant, 20 questions).
    /\b(\d{1,3})\s*[-–—:_]?\s*variant(?:i)?\b/iu,
    /\b(\d{1,3})[-_.]variant(?:i)?\b/iu,
    /\bvariant(?:i)?\s*[-–—:_]?\s*(\d{1,3})\b/iu,
    /\bvariant(?:i)?[-_.](\d{1,3})\b/iu,
];

function normalizedCandidate(
    value: string,
): string {
    return value
        .replace(/[_]+/gu, " ")
        .replace(/\s+/gu, " ")
        .trim();
}

/**
 * Extracts an explicit variant number from titles/slugs such as:
 * - "Ot — 1-variant"
 * - "Ravish 2 variant"
 * - "Variant 3"
 * - "ravish_3_variant_20"
 *
 * We intentionally do not use arbitrary numbers (for example "20 ta savol")
 * as a variant number. This prevents question-count numbers from affecting
 * student catalogue order.
 */
export function getTestVariantNumber(
    test: VariantSortableTest,
): number | null {
    const candidates = [
        normalizedCandidate(
            test.title,
        ),
        normalizedCandidate(
            test.slug,
        ),
    ];

    for (const candidate of candidates) {
        for (const pattern of variantPatterns) {
            const match =
                pattern.exec(
                    candidate,
                );

            if (!match?.[1]) {
                continue;
            }

            const parsed =
                Number.parseInt(
                    match[1],
                    10,
                );

            if (
                Number.isSafeInteger(
                    parsed,
                ) &&
                parsed > 0
            ) {
                return parsed;
            }
        }
    }

    return null;
}

/**
 * Student-facing test lists must be stable and predictable.
 * Explicit variants are ordered first (1, 2, 3, ...), then any tests without
 * an explicit variant marker are ordered naturally by title and slug.
 */
export function sortTestCollectionsByVariant<
    T extends VariantSortableTest,
>(
    collections: readonly T[],
): T[] {
    return [...collections].sort(
        (left, right) => {
            const leftVariant =
                getTestVariantNumber(
                    left,
                );
            const rightVariant =
                getTestVariantNumber(
                    right,
                );

            if (
                leftVariant !== null &&
                rightVariant !== null &&
                leftVariant !== rightVariant
            ) {
                return (
                    leftVariant -
                    rightVariant
                );
            }

            if (
                leftVariant !== null &&
                rightVariant === null
            ) {
                return -1;
            }

            if (
                leftVariant === null &&
                rightVariant !== null
            ) {
                return 1;
            }

            const titleOrder =
                naturalUzbekCollator.compare(
                    left.title,
                    right.title,
                );

            if (titleOrder !== 0) {
                return titleOrder;
            }

            return naturalUzbekCollator.compare(
                left.slug,
                right.slug,
            );
        },
    );
}
