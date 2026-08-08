import "server-only";

import {
    getSupabaseAdminStorageClient,
} from "@/lib/supabase/admin-storage";
import {
    supabaseStorageEnvironment,
} from "@/lib/supabase/env";
import {
    ADMIN_TEST_AUDIO_MAX_BYTES,
    ADMIN_TEST_AUDIO_STORAGE_MIME_TYPES,
} from "@/features/admin/tests/draft/model/admin-test-audio-validation";

export class AdminTestAudioStorageError
    extends Error {
    constructor(message: string) {
        super(message);
        this.name =
            "AdminTestAudioStorageError";
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

export function getAdminTestAudioStorageUrl():
    string {
    return `${supabaseStorageEnvironment.url}/storage/v1`;
}

export function getAdminTestAudioBucket():
    string {
    return `${supabaseStorageEnvironment.testAssetsBucket}-audio`;
}

export function getAdminTestAudioPublicUrl(
    storagePath: string,
): string {
    const bucket =
        encodeURIComponent(
            getAdminTestAudioBucket(),
        );

    return `${supabaseStorageEnvironment.url}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`;
}

async function ensureAdminTestAudioBucket():
    Promise<void> {
    const storage =
        getSupabaseAdminStorageClient();
    const bucket =
        getAdminTestAudioBucket();
    const options = {
        public: true,
        fileSizeLimit:
            ADMIN_TEST_AUDIO_MAX_BYTES,
        allowedMimeTypes: [
            ...ADMIN_TEST_AUDIO_STORAGE_MIME_TYPES,
        ],
    };

    const {
        data,
        error,
    } = await storage.getBucket(
        bucket,
    );

    if (!error && data) {
        const {
            error: updateError,
        } = await storage.updateBucket(
            bucket,
            options,
        );

        if (updateError) {
            throw new AdminTestAudioStorageError(
                `Audio Storage bucket sozlamalarini yangilab bo‘lmadi: ${updateError.message}`,
            );
        }

        return;
    }

    const {
        error: createError,
    } = await storage.createBucket(
        bucket,
        options,
    );

    if (createError) {
        throw new AdminTestAudioStorageError(
            `Audio Storage bucket yaratib bo‘lmadi: ${createError.message}`,
        );
    }
}

export async function createAdminTestAudioSignedUpload(
    storagePath: string,
): Promise<{
    readonly token: string;
}> {
    await ensureAdminTestAudioBucket();

    const storage =
        getSupabaseAdminStorageClient();

    const {
        data,
        error,
    } = await storage
        .from(
            getAdminTestAudioBucket(),
        )
        .createSignedUploadUrl(
            storagePath,
            {
                upsert: false,
            },
        );

    if (error || !data?.token) {
        throw new AdminTestAudioStorageError(
            `Audio uchun xavfsiz yuklash manzilini yaratib bo‘lmadi: ${error?.message ?? "token qaytmadi"}`,
        );
    }

    return {
        token: data.token,
    };
}

export async function removeAdminTestAudioObject(
    storagePath: string,
): Promise<void> {
    const storage =
        getSupabaseAdminStorageClient();

    const {
        error,
    } = await storage
        .from(
            getAdminTestAudioBucket(),
        )
        .remove([
            storagePath,
        ]);

    if (error) {
        throw new AdminTestAudioStorageError(
            `Audioni Supabase Storage’dan o‘chirib bo‘lmadi: ${error.message}`,
        );
    }
}
