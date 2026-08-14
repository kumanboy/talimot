export const TEST_ROUTES = {
    testsHome: "/tests",
    grammarHome: "/tests/grammatika",
    morphologyHome: "/tests/grammatika/morfologiya",
    nationalCertificateHome: "/tests/milliy-sertifikat",
} as const;

function encodeRouteSegment(
    value: string,
): string {
    return encodeURIComponent(
        value.trim(),
    );
}

export function getGrammarCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.grammarHome}/${encodeRouteSegment(
        topicSlug,
    )}`;
}

export function getNationalCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.nationalCertificateHome}/${encodeRouteSegment(
        topicSlug,
    )}`;
}

function normalizeCategory(
    value: string,
): string {
    return value
        .trim()
        .toLocaleLowerCase(
            "uz",
        )
        .replace(
            /[‘’ʻʼ`´]/gu,
            "'",
        );
}

const grammarTopicByCategory =
    new Map<string, string>([
        ["imlo", "imlo"],
        ["morfemika", "morfemika"],
        ["leksikologiya", "leksikologiya"],
        ["uslubiyat", "uslubiyat"],
        ["sintaksis", "sintaksis"],
        ["punktuatsiya", "punktuatsiya"],
    ]);

const nationalTopicByCategory =
    new Map<string, string>([
        ["g'azal", "gazal"],
        ["ilmiy matn", "ilmiy-matn"],
        ["badiiy matn", "badiiy-matn"],
        ["badiiy asarlar", "badiiy-asarlar"],
        ["aralash", "aralash"],
        ["aralash testlar", "aralash"],
        ["diagnostika", "diagnostika"],
        [
            "to'liq diagnostika imtihonlar to'plami",
            "diagnostika",
        ],
    ]);

/**
 * Repairs progress links written by the old navigation helpers.
 *
 * Old grammar progress could be stored as:
 * /tests/grammatika/1 or /tests/grammatika//1
 *
 * Old mixed progress could be stored as:
 * /tests/1
 *
 * Already-correct/current routes are returned unchanged.
 */
export function repairLegacyStoredTestHref(
    href: string,
    category: string,
): string {
    const normalizedHref =
        href.trim();

    const grammarMatch =
        /^\/tests\/grammatika\/+([^/]+)\/?$/u.exec(
            normalizedHref,
        );

    if (grammarMatch?.[1]) {
        const topicSlug =
            grammarTopicByCategory.get(
                normalizeCategory(
                    category,
                ),
            );

        if (topicSlug) {
            return `${getGrammarCollectionHref(
                topicSlug,
            )}/${grammarMatch[1]}`;
        }
    }

    const nationalRootMatch =
        /^\/tests\/([^/]+)\/?$/u.exec(
            normalizedHref,
        );

    const nationalMissingTopicMatch =
        /^\/tests\/milliy-sertifikat\/+([^/]+)\/?$/u.exec(
            normalizedHref,
        );

    const legacyNationalSlug =
        nationalRootMatch?.[1] ??
        nationalMissingTopicMatch?.[1] ??
        null;

    if (legacyNationalSlug) {
        const topicSlug =
            nationalTopicByCategory.get(
                normalizeCategory(
                    category,
                ),
            );

        if (topicSlug) {
            return `${getNationalCollectionHref(
                topicSlug,
            )}/${legacyNationalSlug}`;
        }
    }

    return normalizedHref;
}
