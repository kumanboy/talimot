import {
    validateAdminTestDraft,
} from "../model";

import {
    AdminTestDraftRouteConflictError,
    AdminTestDraftValidationError,
} from "./admin-test-draft-repository-errors";

import type {
    AdminTestDraft,
} from "../model";
import type {
    AdminTestDraftListFilters,
    AdminTestDraftRepository,
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

    list(
        filters?:
            AdminTestDraftListFilters,
    ) {
        return this.repository.list(
            filters,
        );
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

    delete(
        id: string,
    ) {
        return this.repository.delete(
            id,
        );
    }
}
