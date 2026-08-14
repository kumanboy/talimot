import "server-only";

import {
    StorageClient,
} from "@supabase/storage-js";

import {
    supabaseStorageEnvironment,
} from "./env";

let storageClient:
    StorageClient | null = null;

export function getSupabaseAdminStorageClient():
    StorageClient {
    if (storageClient) {
        return storageClient;
    }

    storageClient =
        new StorageClient(
            `${supabaseStorageEnvironment.url}/storage/v1`,
            {
                apikey:
                    supabaseStorageEnvironment
                        .serviceRoleKey,
                Authorization:
                    `Bearer ${supabaseStorageEnvironment.serviceRoleKey}`,
            },
        );

    return storageClient;
}
