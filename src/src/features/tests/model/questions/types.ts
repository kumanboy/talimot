import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type StandardTestOptionId =
    | "A"
    | "B"
    | "C"
    | "D";

export interface StandardTestQuestionOptionImage {
    readonly src: string;
    readonly alt: string;
    readonly caption?: string;
    readonly width?: number;
    readonly height?: number;
}

export interface StandardTestQuestionOption {
    readonly id:
        StandardTestOptionId;

    readonly text:
        string;

    readonly image?:
        StandardTestQuestionOptionImage;
}

export interface StandardTestQuestion {
    readonly id:
        string;

    readonly order:
        number;

    readonly question:
        string;

    readonly options:
        readonly StandardTestQuestionOption[];

    readonly correctOptionId:
        StandardTestOptionId;

    readonly explanation?:
        QuestionExplanation;
}

export type StandardTestDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type StandardTestAccess =
    | "free"
    | "premium";

export type StandardTestDataSource =
    | "temporary-static"
    | "admin"
    | "backend";

export type StandardTestAnswerKeyStatus =
    | "provisional"
    | "verified";

export interface StandardTestDefinition {
    readonly kind:
        "standard";

    readonly id:
        string;

    readonly slug:
        string;

    readonly title:
        string;

    readonly category:
        string;

    readonly topicSlug:
        string;

    readonly description:
        string;

    readonly questionCount:
        20;

    readonly estimatedMinutes:
        number;

    readonly difficulty:
        StandardTestDifficulty;

    readonly access:
        StandardTestAccess;

    readonly dataSource:
        StandardTestDataSource;

    readonly answerKeyStatus:
        StandardTestAnswerKeyStatus;

    readonly questions:
        readonly StandardTestQuestion[];
}

export type StandardTestAnswerKey =
    Readonly<
        Record<
            string,
            StandardTestOptionId
        >
    >;