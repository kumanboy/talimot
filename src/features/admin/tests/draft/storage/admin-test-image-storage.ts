import "server-only";

import {
    getSupabaseAdminStorageClient,
} from "@/lib/supabase/admin-storage";
import {
    supabaseStorageEnvironment,
} from "@/lib/supabase/env";

export class AdminTestImageStorageError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminTestImageStorageError";
    }
}

function encodeStoragePath(
    storagePath: string,
): string {
    return storagePath
        .split("/")
        .map((segment) =>
            encodeURIComponent(
                segment,
            ),
        )
        .join("/");
}

export function getAdminTestImageStorageUrl():
    string {
    return `${supabaseStorageEnvironment.url}/storage/v1`;
}

export function getAdminTestImageBucket():
    string {
    return supabaseStorageEnvironment
        .testAssetsBucket;
}

export function getAdminTestImagePublicUrl(
    storagePath: string,
): string {
    const bucket =
        encodeURIComponent(
            getAdminTestImageBucket(),
        );

    return `${supabaseStorageEnvironment.url}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`;
}

export async function createAdminTestImageSignedUpload(
    storagePath: string,
): Promise<{
    readonly token: string;
}> {
    const storage =
        getSupabaseAdminStorageClient();

    const {
        data,
        error,
    } = await storage
        .from(
            getAdminTestImageBucket(),
        )
        .createSignedUploadUrl(
            storagePath,
            {
                upsert: false,
            },
        );

    if (error || !data?.token) {
        throw new AdminTestImageStorageError(
            `Rasm uchun xavfsiz yuklash manzilini yaratib bo‘lmadi: ${error?.message ?? "token qaytmadi"}`,
        );
    }

    return {
        token: data.token,
    };
}

export async function removeAdminTestImageObject(
    storagePath: string,
): Promise<void> {
    const storage =
        getSupabaseAdminStorageClient();

    const {
        error,
    } = await storage
        .from(
            getAdminTestImageBucket(),
        )
        .remove([
            storagePath,
        ]);

    if (error) {
        throw new AdminTestImageStorageError(
            `Rasmni Supabase Storage’dan o‘chirib bo‘lmadi: ${error.message}`,
        );
    }
}
