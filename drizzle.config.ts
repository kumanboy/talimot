import { config as loadEnvironment } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnvironment({
    path: ".env.local",
});

const migrationDatabaseUrl =
    process.env.DATABASE_MIGRATION_URL?.trim();

if (!migrationDatabaseUrl) {
    throw new Error(
        "DATABASE_MIGRATION_URL is not configured in .env.local.",
    );
}

export default defineConfig({
    dialect: "postgresql",

    schema: "./src/lib/database/schema/index.ts",

    out: "./drizzle",

    dbCredentials: {
        url: migrationDatabaseUrl,
    },

    migrations: {
        prefix: "timestamp",
        table: "__drizzle_migrations",
        schema: "public",
    },

    strict: true,
    verbose: true,
});