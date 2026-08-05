export class AdminTestDraftRepositoryError
    extends Error {
    constructor(
        message: string,
        options?: {
            readonly cause?: unknown;
        },
    ) {
        super(
            message,
            options,
        );

        this.name =
            "AdminTestDraftRepositoryError";
    }
}

export class AdminTestDraftNotFoundError
    extends AdminTestDraftRepositoryError {
    constructor(
        readonly draftId:
            string,
    ) {
        super(
            `Admin test draft "${draftId}" was not found.`,
        );

        this.name =
            "AdminTestDraftNotFoundError";
    }
}

export class AdminTestDraftConflictError
    extends AdminTestDraftRepositoryError {
    constructor(
        readonly draftId:
            string,
    ) {
        super(
            `Admin test draft "${draftId}" was changed by another request.`,
        );

        this.name =
            "AdminTestDraftConflictError";
    }
}

export class AdminTestDraftRouteConflictError
    extends AdminTestDraftRepositoryError {
    constructor(
        readonly group:
            string,
        readonly topicSlug:
            string,
        readonly slug:
            string,
        options?: {
            readonly cause?: unknown;
        },
    ) {
        super(
            `A draft already exists for "${group}/${topicSlug}/${slug}".`,
            options,
        );

        this.name =
            "AdminTestDraftRouteConflictError";
    }
}

export class AdminTestDraftValidationError
    extends AdminTestDraftRepositoryError {
    constructor(
        readonly validationMessages:
            readonly string[],
    ) {
        super(
            validationMessages.join(
                " ",
            ),
        );

        this.name =
            "AdminTestDraftValidationError";
    }
}
