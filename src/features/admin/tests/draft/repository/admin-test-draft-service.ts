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
    AdminTestDraftFormat,
    AdminTestDraftGroup,
    AdminTestDraftSummary,
} from "../model";
import type {
    AdminTestDraftListFilters,
    AdminTestDraftRepository,
    AdminTestDraftRoute,
} from "./admin-test-draft-repository-types";

const STANDARD_DRAFT_INCOMPLETE_ERROR_CODES =
    new Set([
        "QUESTION_TEXT_REQUIRED",
        "MCQ_OPTION_CONTENT_REQUIRED",
        "MCQ_CORRECT_ANSWER_REQUIRED",
    ]);

/**
 * A draft is allowed to be incomplete while an admin is still building it.
 * Publication remains strict and still runs the full validator plus the
 * format-specific question-count rules.
 *
 * We keep structural errors blocking here (duplicate option ids, invalid
 * scores, an invalid selected answer id, unsafe asset metadata, etc.).
 */
function assertDraftIsValidForSave(
    draft:
        AdminTestDraft,
) {
    const result =
        validateAdminTestDraft(
            draft,
        );

    const isStandardDraft =
        draft.status === "draft" &&
        (
            draft.metadata.format ===
                "standard" ||
            draft.metadata.format ===
                "morphology-standard"
        );

    const blockingErrors =
        isStandardDraft
            ? result.errors.filter(
                (validationIssue) =>
                    !STANDARD_DRAFT_INCOMPLETE_ERROR_CODES.has(
                        validationIssue.code,
                    ),
            )
            : result.errors;

    if (
        blockingErrors.length === 0
    ) {
        return;
    }

    throw new AdminTestDraftValidationError(
        blockingErrors.map(
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
        filters?: {
            readonly topicSlug?: string;
            readonly format?: AdminTestDraftFormat;
        },
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
                    topicSlug:
                        filters?.topicSlug,
                    format:
                        filters?.format,
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
        assertDraftIsValidForSave(
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

        assertDraftIsValidForSave(
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
