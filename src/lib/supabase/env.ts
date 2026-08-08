import "server-only";

function requireServerEnvironment(
    key:
        | "SUPABASE_URL"
        | "SUPABASE_SERVICE_ROLE_KEY",
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

export const supabaseStorageEnvironment = {
    get url(): string {
        return requireServerEnvironment(
            "SUPABASE_URL",
        ).replace(/\/+$/, "");
    },

    get serviceRoleKey(): string {
        return requireServerEnvironment(
            "SUPABASE_SERVICE_ROLE_KEY",
        );
    },

    get testAssetsBucket(): string {
        return (
            process.env
                .SUPABASE_TEST_ASSETS_BUCKET
                ?.trim() ||
            "test-assets"
        );
    },
} as const;
