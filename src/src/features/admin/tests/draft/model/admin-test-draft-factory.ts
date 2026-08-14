import type {
    AdminDraftQuestion,
    AdminDraftQuestionSection,
} from "./admin-question-types";
import type {
    AdminTestDraft,
    AdminTestDraftMetadata,
    AdminTestDraftSource,
} from "./admin-test-draft-types";

function createStableId(
    prefix: string,
): string {
    const randomPart =
        Math.random()
            .toString(36)
            .slice(2, 10);

    return `${prefix}-${Date.now()}-${randomPart}`;
}

export function createEmptyAdminTestDraft({
    metadata,
    source = "manual",
    createdBy = null,
    now = Date.now(),
}: {
    readonly metadata:
        AdminTestDraftMetadata;
    readonly source?:
        AdminTestDraftSource;
    readonly createdBy?:
        string | null;
    readonly now?: number;
}): AdminTestDraft {
    return {
        version: 1,
        id:
            createStableId(
                "test-draft",
            ),
        status: "draft",
        source,
        metadata,
        questions: [],
        audit: {
            createdAt: now,
            updatedAt: now,
            createdBy,
            updatedBy:
                createdBy,
        },
    };
}

export function createEmptyMultipleChoiceQuestion({
    order,
    section = "general",
}: {
    readonly order: number;
    readonly section?:
        AdminDraftQuestionSection;
}): Extract<
    AdminDraftQuestion,
    {
        readonly type:
            "multiple-choice";
    }
> {
    return {
        type: "multiple-choice",
        id:
            createStableId(
                "question",
            ),
        order,
        sourceOrder: null,
        section,
        question: "",
        instruction: null,
        context: null,
        maximumScore: 1,
        image: null,
        explanation: {
            text: "",
            audio: null,
        },
        options: [
            {
                id: "A",
                text: "",
            },
            {
                id: "B",
                text: "",
            },
            {
                id: "C",
                text: "",
            },
            {
                id: "D",
                text: "",
            },
        ],
        correctOptionId: null,
    };
}

export function createEmptyShortAnswerQuestion({
    order,
    section = "written",
}: {
    readonly order: number;
    readonly section?:
        AdminDraftQuestionSection;
}): Extract<
    AdminDraftQuestion,
    {
        readonly type:
            "short-answer";
    }
> {
    return {
        type: "short-answer",
        id:
            createStableId(
                "question",
            ),
        order,
        sourceOrder: null,
        section,
        question: "",
        instruction: null,
        context: null,
        maximumScore: 1,
        image: null,
        explanation: {
            text: "",
            audio: null,
        },
        acceptedAnswers: [],
        requiredKeywords: [],
        comparison: "normalized",
    };
}


export function createEmptyMatchingQuestion({
    order,
    section = "syntax",
}: {
    readonly order: number;
    readonly section?:
        AdminDraftQuestionSection;
}): Extract<
    AdminDraftQuestion,
    {
        readonly type:
            "matching";
    }
> {
    return {
        type: "matching",
        id:
            createStableId(
                "matching-question",
            ),
        order,
        sourceOrder: null,
        section,
        question: "",
        instruction: null,
        context: null,
        maximumScore: 0,
        image: null,
        explanation: {
            text: "",
            audio: null,
        },
        title: null,
        choices: [
            { id: "A", text: "" },
            { id: "B", text: "" },
        ],
        items: [],
    };
}

export function createEmptyMultipartQuestion({
    order,
    section = "written",
}: {
    readonly order: number;
    readonly section?:
        AdminDraftQuestionSection;
}): Extract<
    AdminDraftQuestion,
    {
        readonly type:
            "multipart";
    }
> {
    return {
        type: "multipart",
        id:
            createStableId(
                "multipart-question",
            ),
        order,
        sourceOrder: null,
        section,
        question: "",
        instruction: null,
        context: null,
        maximumScore: 0,
        image: null,
        explanation: {
            text: "",
            audio: null,
        },
        parts: [],
    };
}

export function createEmptyEssayQuestion({
    order,
}: {
    readonly order: number;
}): Extract<
    AdminDraftQuestion,
    {
        readonly type:
            "essay";
    }
> {
    return {
        type: "essay",
        id:
            createStableId(
                "question",
            ),
        order,
        sourceOrder: null,
        section: "essay",
        question: "",
        instruction: null,
        context: null,
        maximumScore: 0,
        image: null,
        explanation: {
            text: "",
            audio: null,
        },
        topic: "",
        requirements: {
            minimumWords: null,
            recommendedWords: null,
            maximumWords: null,
            recommendedParagraphs:
                null,
            introduction: [],
            body: [],
            conclusion: [],
            warnings: [],
            rubric: [],
        },
        comparison: "manual-review",
    };
}
