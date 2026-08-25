import {
    config as loadEnvironment,
} from "dotenv";

loadEnvironment({
    path: ".env.local",
});

function assert(
    condition: unknown,
    message: string,
): asserts condition {
    if (!condition) {
        throw new Error(
            `Smoke test assertion failed: ${message}`,
        );
    }
}

function logStep(
    label: string,
) {
    console.log(
        `✓ ${label}`,
    );
}

async function main() {
    const {
        createEmptyAdminTestDraft,
    } = await import(
        "../src/features/admin/tests/draft/model/admin-test-draft-factory"
    );

    const {
        AdminTestDraftConflictError,
        AdminTestDraftRouteConflictError,
    } = await import(
        "../src/features/admin/tests/draft/repository/admin-test-draft-repository-errors"
    );

    const {
        adminTestDraftService,
    } = await import(
        "../src/features/admin/tests/draft/repository/admin-test-draft-service-instance"
    );

    const runId =
        `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const topicSlug =
        `smoke-topic-${runId}`;

    const slug =
        `smoke-test-${runId}`;

    const originalNow =
        Date.now();

    const originalDraft =
        createEmptyAdminTestDraft({
            metadata: {
                title:
                    `Repository smoke test ${runId}`,
                description:
                    "Temporary database integration test.",
                group:
                    "grammar",
                category:
                    "Smoke Test",
                topicSlug,
                slug,
                format:
                    "standard",
                difficulty:
                    "easy",
                access:
                    "free",
                tangaPrice:
                    0,
                estimatedMinutes:
                    1,
            },
            source:
                "manual",
            createdBy:
                "database-smoke-test",
            now:
                originalNow,
        });

    const createdIds =
        new Set<string>();

    try {
        const created =
            await adminTestDraftService.create(
                originalDraft,
            );

        createdIds.add(
            created.id,
        );

        assert(
            created.id ===
                originalDraft.id,
            "created draft ID must match",
        );

        logStep(
            "create draft",
        );

        const fetched =
            await adminTestDraftService.getById(
                created.id,
            );

        assert(
            fetched !== null,
            "created draft must be readable",
        );

        assert(
            fetched.metadata.slug ===
                slug,
            "fetched draft route must match",
        );

        logStep(
            "read draft",
        );

        const listed =
            await adminTestDraftService.list({
                search:
                    runId,
                group:
                    "grammar",
                status:
                    "draft",
                limit:
                    10,
            });

        assert(
            listed.items.some(
                (item) =>
                    item.id ===
                    created.id,
            ),
            "created draft must appear in filtered list",
        );

        logStep(
            "list and search draft",
        );

        const updatedAt =
            originalNow + 1_000;

        const updatedDraft = {
            ...created,
            metadata: {
                ...created.metadata,
                title:
                    `${created.metadata.title} — updated`,
            },
            audit: {
                ...created.audit,
                updatedAt,
                updatedBy:
                    "database-smoke-test",
            },
        };

        const updated =
            await adminTestDraftService.update(
                updatedDraft,
                created.audit.updatedAt,
            );

        assert(
            updated.metadata.title.endsWith(
                "— updated",
            ),
            "updated title must be persisted",
        );

        assert(
            updated.audit.updatedAt ===
                updatedAt,
            "updated timestamp must be persisted",
        );

        logStep(
            "update draft",
        );

        let staleConflictDetected =
            false;

        try {
            await adminTestDraftService.update(
                {
                    ...updated,
                    audit: {
                        ...updated.audit,
                        updatedAt:
                            updatedAt + 1_000,
                    },
                },
                created.audit.updatedAt,
            );
        } catch (error) {
            staleConflictDetected =
                error instanceof
                AdminTestDraftConflictError;
        }

        assert(
            staleConflictDetected,
            "stale update must raise AdminTestDraftConflictError",
        );

        logStep(
            "detect stale update",
        );

        const duplicateDraft =
            createEmptyAdminTestDraft({
                metadata: {
                    ...originalDraft.metadata,
                    title:
                        `Duplicate route ${runId}`,
                },
                source:
                    "manual",
                createdBy:
                    "database-smoke-test",
                now:
                    updatedAt + 2_000,
            });

        let duplicateConflictDetected =
            false;

        try {
            const duplicateCreated =
                await adminTestDraftService.create(
                    duplicateDraft,
                );

            createdIds.add(
                duplicateCreated.id,
            );
        } catch (error) {
            duplicateConflictDetected =
                error instanceof
                AdminTestDraftRouteConflictError;
        }

        assert(
            duplicateConflictDetected,
            "duplicate route must raise AdminTestDraftRouteConflictError",
        );

        logStep(
            "detect duplicate route",
        );

        const deleted =
            await adminTestDraftService.delete(
                created.id,
            );

        createdIds.delete(
            created.id,
        );

        assert(
            deleted,
            "created draft must be deleted",
        );

        const afterDelete =
            await adminTestDraftService.getById(
                created.id,
            );

        assert(
            afterDelete === null,
            "deleted draft must no longer exist",
        );

        logStep(
            "delete draft",
        );

        console.log(
            "\nAdmin test draft repository smoke test passed.",
        );
    } finally {
        await Promise.all(
            [...createdIds].map(
                async (id) => {
                    try {
                        await adminTestDraftService.delete(
                            id,
                        );
                    } catch {
                        // Best-effort cleanup.
                    }
                },
            ),
        );
    }
}

main().catch(
    (error) => {
        console.error(
            "\nAdmin test draft repository smoke test failed.",
        );
        console.error(
            error,
        );
        process.exitCode = 1;
    },
);
