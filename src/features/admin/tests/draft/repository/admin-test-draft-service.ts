import {
    validateAdminTestDraft,
} from "../model";
import {
    getAdminTestDraftPublishValidationMessages,
} from "../publish/admin-test-draft-publish-validation";

import {
    AdminTestDraftNotFoundError,
    AdminTestDraftRouteConflictError,
    AdminTestDraftValidationError,
} from "./admin-test-draft-repository-errors";

import type {
    AdminTestDraft,
    AdminTestDraftGroup,
    AdminTestDraftSummary,
} from "../model";
import type {
    AdminTestDraftListFilters,
    AdminTestDraftRepository,
    AdminTestDraftRoute,
} from "./admin-test-draft-repository-types";

function assertDraftIsValid(
    draft:
        AdminTestDraft,
) {
    const result =
        validateAdminTestDraft(
            draft,
        );

    if (
        result.isValid
    ) {
        return;
    }

    throw new AdminTestDraftValidationError(
        result.errors.map(
            (validationIssue) =>
                validationIssue.message,
        ),
    );
}

function assertDraftCanPublish(
    draft:
        AdminTestDraft,
) {
    const messages =
        getAdminTestDraftPublishValidationMessages(
            draft,
        );

    if (messages.length === 0) {
        return;
    }

    throw new AdminTestDraftValidationError(
        messages,
    );
}

export class AdminTestDraftService {
    constructor(
        private readonly repository:
            AdminTestDraftRepository,
    ) {}

    getById(
        id: string,
    ) {
        return this.repository.getById(
            id,
        );
    }

    getByRoute(
        route:
            AdminTestDraftRoute,
    ) {
        return this.repository.getByRoute(
            route,
        );
    }

    list(
        filters?:
            AdminTestDraftListFilters,
    ) {
        return this.repository.list(
            filters,
        );
    }

    async listPublished(
        group:
            AdminTestDraftGroup,
    ): Promise<readonly AdminTestDraftSummary[]> {
        const pageSize =
            100;
        const items:
            AdminTestDraftSummary[] =
            [];
        let offset =
            0;
        let total =
            Number.POSITIVE_INFINITY;

        while (
            offset < total
        ) {
            const page =
                await this.repository.list({
                    status:
                        "published",
                    group,
                    limit:
                        pageSize,
                    offset,
                });

            items.push(
                ...page.items,
            );
            total =
                page.total;

            if (
                page.items.length ===
                0
            ) {
                break;
            }

            offset +=
                page.items.length;
        }

        return items;
    }

    async create(
        draft:
            AdminTestDraft,
    ) {
        assertDraftIsValid(
            draft,
        );

        const routeExists =
            await this.repository
                .existsByRoute({
                    group:
                        draft.metadata.group,
                    topicSlug:
                        draft.metadata.topicSlug,
                    slug:
                        draft.metadata.slug,
                });

        if (routeExists) {
            throw new AdminTestDraftRouteConflictError(
                draft.metadata.group,
                draft.metadata.topicSlug,
                draft.metadata.slug,
            );
        }

        return this.repository.create({
            draft,
        });
    }

    async update(
        draft:
            AdminTestDraft,
        expectedUpdatedAt:
            number,
    ) {
        const existing =
            await this.repository.getById(
                draft.id,
            );

        if (!existing) {
            throw new AdminTestDraftNotFoundError(
                draft.id,
            );
        }

        if (
            existing.status ===
                "published" ||
            existing.status ===
                "archived"
        ) {
            throw new AdminTestDraftValidationError([
                existing.status ===
                    "published"
                    ? "Nashr qilingan testni draft sifatida o‘zgartirib bo‘lmaydi."
                    : "Arxivlangan testni draft sifatida o‘zgartirib bo‘lmaydi.",
            ]);
        }

        if (
            draft.status !==
            existing.status
        ) {
            throw new AdminTestDraftValidationError([
                "Test holatini oddiy saqlash orqali o‘zgartirib bo‘lmaydi.",
            ]);
        }

        assertDraftIsValid(
            draft,
        );

        const routeExists =
            await this.repository
                .existsByRoute(
                    {
                        group:
                            draft.metadata.group,
                        topicSlug:
                            draft.metadata.topicSlug,
                        slug:
                            draft.metadata.slug,
                    },
                    draft.id,
                );

        if (routeExists) {
            throw new AdminTestDraftRouteConflictError(
                draft.metadata.group,
                draft.metadata.topicSlug,
                draft.metadata.slug,
            );
        }

        return this.repository.update({
            draft,
            expectedUpdatedAt,
        });
    }

    async publish(
        draft:
            AdminTestDraft,
        expectedUpdatedAt:
            number,
    ) {
        const existing =
            await this.repository.getById(
                draft.id,
            );

        if (!existing) {
            throw new AdminTestDraftNotFoundError(
                draft.id,
            );
        }

        if (
            existing.status ===
            "published"
        ) {
            throw new AdminTestDraftValidationError([
                "Test allaqachon nashr qilingan.",
            ]);
        }

        if (
            existing.status ===
            "archived"
        ) {
            throw new AdminTestDraftValidationError([
                "Arxivlangan testni to‘g‘ridan-to‘g‘ri nashr qilib bo‘lmaydi.",
            ]);
        }

        if (
            draft.status !==
            existing.status
        ) {
            throw new AdminTestDraftValidationError([
                "Nashr qilishdan oldin sahifani yangilang va draftni qayta saqlang.",
            ]);
        }

        assertDraftCanPublish(
            draft,
        );

        const routeExists =
            await this.repository
                .existsByRoute(
                    {
                        group:
                            draft.metadata.group,
                        topicSlug:
                            draft.metadata.topicSlug,
                        slug:
                            draft.metadata.slug,
                    },
                    draft.id,
                );

        if (routeExists) {
            throw new AdminTestDraftRouteConflictError(
                draft.metadata.group,
                draft.metadata.topicSlug,
                draft.metadata.slug,
            );
        }

        const publishedDraft:
            AdminTestDraft = {
            ...draft,
            status:
                "published",
        };

        return this.repository.update({
            draft:
                publishedDraft,
            expectedUpdatedAt,
        });
    }

    delete(
        id: string,
    ) {
        return this.repository.delete(
            id,
        );
    }
}
