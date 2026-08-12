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
    readonly validationMessages:
        readonly string[];

    constructor(
        validationMessages:
            readonly string[],
    ) {
        const uniqueMessages =
            Array.from(
                new Set(
                    validationMessages
                        .map(
                            (message) =>
                                message.trim(),
                        )
                        .filter(Boolean),
                ),
            );

        super(
            uniqueMessages.join(
                " ",
            ),
        );

        this.validationMessages =
            uniqueMessages;
        this.name =
            "AdminTestDraftValidationError";
    }
}
