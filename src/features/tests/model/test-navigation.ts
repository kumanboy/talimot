export const TEST_ROUTES = {
    testsHome: "/tests",
    grammarHome: "/tests/grammatika",
    morphologyHome: "/tests/grammatika/morfologiya",
    nationalCertificateHome: "/tests",
} as const;

export function getGrammarCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.grammarHome}/`;
}

export function getNationalCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.nationalCertificateHome}`;
}
