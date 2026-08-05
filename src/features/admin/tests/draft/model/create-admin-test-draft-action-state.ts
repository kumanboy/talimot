export interface CreateAdminTestDraftActionState {
    readonly status:
        | "idle"
        | "error";
    readonly message:
        string | null;
    readonly fieldErrors:
        Readonly<
            Partial<
                Record<
                    | "title"
                    | "description"
                    | "group"
                    | "category"
                    | "topicSlug"
                    | "slug"
                    | "format"
                    | "difficulty"
                    | "access"
                    | "estimatedMinutes",
                    string
                >
            >
        >;
    readonly values: {
        readonly title: string;
        readonly description: string;
        readonly group: string;
        readonly category: string;
        readonly topicSlug: string;
        readonly slug: string;
        readonly format: string;
        readonly difficulty: string;
        readonly access: string;
        readonly estimatedMinutes: string;
    };
}

export const initialCreateAdminTestDraftActionState:
    CreateAdminTestDraftActionState = {
        status: "idle",
        message: null,
        fieldErrors: {},
        values: {
            title: "",
            description: "",
            group: "grammar",
            category: "",
            topicSlug: "",
            slug: "",
            format: "standard",
            difficulty: "medium",
            access: "free",
            estimatedMinutes: "30",
        },
    };
