import "server-only";

function requireServerEnvironment(
    key: "DATABASE_URL",
): string {
    const value =
        process.env[key]?.trim();

    if (!value) {
        throw new Error(
            `${key} environment variable is not configured.`,
        );
    }

    return value;
}

export const databaseEnvironment = {
    get url(): string {
        return requireServerEnvironment(
            "DATABASE_URL",
        );
    },
} as const;
