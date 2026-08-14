import "server-only";

import {
    drizzle,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
    databaseEnvironment,
} from "./env";
import * as schema from "./schema";

type PostgresClient =
    ReturnType<typeof postgres>;

const globalDatabase =
    globalThis as typeof globalThis & {
        talimotDatabaseClient?:
            PostgresClient;
    };

/**
 * Shared server-only PostgreSQL client.
 *
 * This is the single database entry point for:
 * - admin test drafts
 * - users and authentication
 * - test attempts and results
 * - payments and subscriptions
 * - certificates
 *
 * Future schema modules only need to be exported from
 * `src/lib/database/schema/index.ts`.
 */
export const databaseClient =
    globalDatabase
        .talimotDatabaseClient ??
    postgres(
        databaseEnvironment.url,
        {
            /**
             * Supabase Transaction Pooler does not support
             * prepared statements.
             */
            prepare: false,

            /**
             * Each Vercel serverless instance keeps a very
             * small connection footprint. Supabase Pooler
             * handles concurrency across instances.
             */
            max: 1,

            idle_timeout: 20,
            connect_timeout: 15,
        },
    );

if (
    process.env.NODE_ENV !==
    "production"
) {
    globalDatabase
        .talimotDatabaseClient =
        databaseClient;
}

export const db =
    drizzle(
        databaseClient,
        {
            schema,
        },
    );

export type TalimotDatabase =
    typeof db;

export type TalimotDatabaseSchema =
    typeof schema;
