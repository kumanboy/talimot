export const TEST_ROUTES = {
    testsHome: "/tests",
    grammarHome: "/tests/grammatika",
    morphologyHome: "/tests/grammatika/morfologiya",
    nationalCertificateHome: "/tests/milliy-sertifikat",
} as const;

export function getGrammarCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.grammarHome}/${topicSlug}`;
}

export function getNationalCollectionHref(
    topicSlug: string,
): string {
    return `${TEST_ROUTES.nationalCertificateHome}/${topicSlug}`;
}
