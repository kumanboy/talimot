import type {
    MixedMatchingChoiceId,
    MixedOptionId,
    WrittenAnswerComparison,
} from "@/features/national-certificate/model/mixed-test-types";
import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

export type DiagnosticTestTopic =
    "diagnostika";

export type DiagnosticTestAccess =
    | "free"
    | "premium";

export type DiagnosticTestDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type DiagnosticQuestionSection =
    | "grammar"
    | "literature"
    | "scientific-text"
    | "literary-text"
    | "ghazal"
    | "syntax"
    | "written"
    | "essay";


export interface DiagnosticQuestionImage {
    readonly src: string;
    readonly alt: string;
    readonly caption?: string;
    readonly width?: number;
    readonly height?: number;
}

export interface DiagnosticOption {
    readonly id:
        MixedOptionId;

    readonly text: string;
}

export interface DiagnosticNumberedStatement {
    readonly number: number;
    readonly text: string;
}

export interface DiagnosticWordDiagramNode {
    readonly id: string;
    readonly text: string;

    readonly role?:
        | "root"
        | "branch"
        | "leaf";
}

export interface DiagnosticWordDiagramConnection {
    readonly from: string;
    readonly to: string;
}

export interface DiagnosticNumberedStatementsVisual {
    readonly type:
        "numbered-statements";

    readonly statements:
        readonly DiagnosticNumberedStatement[];
}

export interface DiagnosticWordDiagramVisual {
    readonly type:
        "word-diagram";

    readonly nodes:
        readonly DiagnosticWordDiagramNode[];

    readonly connections:
        readonly DiagnosticWordDiagramConnection[];
}

export type DiagnosticQuestionVisual =
    | DiagnosticNumberedStatementsVisual
    | DiagnosticWordDiagramVisual;

export interface DiagnosticMultipleChoiceQuestion {
    readonly type:
        "multiple-choice";

    readonly id: string;
    readonly order: number;

    readonly section:
        DiagnosticQuestionSection;

    readonly question: string;

    readonly context?: string;

    readonly image?:
        DiagnosticQuestionImage;

    readonly visual?:
        DiagnosticQuestionVisual;

    readonly options:
        readonly DiagnosticOption[];

    readonly correctOptionId:
        MixedOptionId;

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface DiagnosticPassageBlock {
    readonly id: string;

    readonly type:
        | "heading"
        | "paragraph"
        | "numbered-paragraph"
        | "dialogue"
        | "poetry";

    readonly marker?: string;
    readonly text: string;
}

export interface DiagnosticPassageGroup {
    readonly type:
        "passage-group";

    readonly id: string;
    readonly order: number;

    readonly section:
        DiagnosticQuestionSection;

    readonly title?: string;
    readonly instruction: string;

    readonly passage:
        readonly DiagnosticPassageBlock[];

    readonly questions:
        readonly DiagnosticMultipleChoiceQuestion[];
}

export interface DiagnosticMatchingChoice {
    readonly id:
        MixedMatchingChoiceId;

    readonly text: string;
}

export interface DiagnosticMatchingItem {
    readonly id: string;
    readonly order: number;

    readonly prompt: string;

    readonly correctChoiceId:
        MixedMatchingChoiceId;

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface DiagnosticMatchingGroup {
    readonly type:
        "matching-group";

    readonly id: string;
    readonly order: number;

    readonly section:
        DiagnosticQuestionSection;

    readonly title?: string;
    readonly instruction: string;

    readonly image?:
        DiagnosticQuestionImage;

    readonly items:
        readonly DiagnosticMatchingItem[];

    readonly choices:
        readonly DiagnosticMatchingChoice[];
}

export interface DiagnosticShortAnswerQuestion {
    readonly type:
        "short-answer";

    readonly id: string;
    readonly order: number;

    readonly section:
        DiagnosticQuestionSection;

    readonly question: string;
    readonly context?: string;

    readonly image?:
        DiagnosticQuestionImage;

    readonly examples?:
        readonly string[];

    readonly acceptedAnswers:
        readonly string[];

    readonly comparison:
        WrittenAnswerComparison;

    readonly requiredKeywords?:
        readonly string[];

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface DiagnosticQuestionPart {
    readonly id: string;

    readonly label:
        | "a"
        | "b"
        | "c";

    readonly question: string;

    readonly acceptedAnswers:
        readonly string[];

    readonly comparison:
        WrittenAnswerComparison;

    readonly requiredKeywords?:
        readonly string[];

    readonly score: number;

    readonly explanation?:
        QuestionExplanation;
}

export interface DiagnosticMultipartQuestion {
    readonly type:
        "multipart";

    readonly id: string;
    readonly order: number;

    readonly section:
        DiagnosticQuestionSection;

    readonly question: string;
    readonly context?: string;

    readonly image?:
        DiagnosticQuestionImage;

    readonly parts:
        readonly DiagnosticQuestionPart[];

    readonly maximumScore:
        number;

    readonly explanation?:
        QuestionExplanation;
}

export interface DiagnosticEssayRequirements {
    readonly minimumWords:
        number;

    readonly recommendedWords?:
        number;

    readonly introduction:
        readonly string[];

    readonly body:
        readonly string[];

    readonly conclusion:
        readonly string[];

    readonly warnings?:
        readonly string[];
}

export interface DiagnosticEssayQuestion {
    readonly type:
        "essay";

    readonly id: string;
    readonly order: 45;

    readonly section:
        "essay";

    readonly title: string;

    readonly prompt: string;

    readonly situation?: string;

    readonly requirements:
        DiagnosticEssayRequirements;

    readonly maximumScore: 24;

    readonly explanation?:
        QuestionExplanation;
}

export type DiagnosticQuestion =
    | DiagnosticMultipleChoiceQuestion
    | DiagnosticPassageGroup
    | DiagnosticMatchingGroup
    | DiagnosticShortAnswerQuestion
    | DiagnosticMultipartQuestion
    | DiagnosticEssayQuestion;

export interface DiagnosticTestDefinition {
    readonly kind:
        "diagnostic";

    readonly id: string;
    readonly slug: string;

    readonly topic:
        DiagnosticTestTopic;

    readonly title: string;
    readonly description: string;

    readonly instruction: string;

    readonly questionCount: 45;

    readonly estimatedMinutes: 180;

    readonly maximumScore:
        number;

    readonly difficulty:
        DiagnosticTestDifficulty;

    readonly access:
        DiagnosticTestAccess;

    readonly questions:
        readonly DiagnosticQuestion[];
}

export type DiagnosticChoiceAnswer =
    MixedOptionId;

export type DiagnosticMatchingAnswers =
    Readonly<
        Partial<
            Record<
                string,
                MixedMatchingChoiceId
            >
        >
    >;

export interface DiagnosticMultipartAnswers {
    readonly [partId: string]:
        string;
}

export type DiagnosticAnswerValue =
    | string
    | DiagnosticChoiceAnswer
    | DiagnosticMatchingAnswers
    | DiagnosticMultipartAnswers;

export type DiagnosticAnswers =
    Readonly<
        Partial<
            Record<
                string,
                DiagnosticAnswerValue
            >
        >
    >;

export interface DiagnosticPartScoreResult {
    readonly partId: string;

    readonly awardedScore:
        number;

    readonly maximumScore:
        number;

    readonly verdict:
        | "correct"
        | "incorrect"
        | "unanswered";
}

export interface DiagnosticQuestionScoreResult {
    readonly questionId:
        string;

    readonly order:
        number;

    readonly section:
        DiagnosticQuestionSection;

    readonly awardedScore:
        number;

    readonly maximumScore:
        number;

    readonly verdict:
        | "correct"
        | "incorrect"
        | "unanswered"
        | "pending";

    readonly parts?:
        readonly DiagnosticPartScoreResult[];
}

export interface DiagnosticSectionScoreResult {
    readonly section:
        DiagnosticQuestionSection;

    readonly score:
        number;

    readonly maximumScore:
        number;

    readonly percentage:
        number;
}

export interface DiagnosticTestScoreResult {
    readonly score:
        number;

    readonly maximumScore:
        number;

    readonly percentage:
        number;

    readonly correctCount:
        number;

    readonly incorrectCount:
        number;

    readonly unansweredCount:
        number;

    readonly pendingCount:
        number;

    readonly questionResults:
        readonly DiagnosticQuestionScoreResult[];

    readonly sectionResults:
        readonly DiagnosticSectionScoreResult[];
}

export function countDiagnosticQuestions(
    questions:
    readonly DiagnosticQuestion[],
): number {
    return questions.reduce(
        (
            total,
            question,
        ) => {
            if (
                question.type ===
                "passage-group"
            ) {
                return (
                    total +
                    question.questions.length
                );
            }

            if (
                question.type ===
                "matching-group"
            ) {
                return (
                    total +
                    question.items.length
                );
            }

            return total + 1;
        },
        0,
    );
}

export function calculateDiagnosticMaximumScore(
    questions:
    readonly DiagnosticQuestion[],
): number {
    const total =
        questions.reduce(
            (
                sum,
                question,
            ) => {
                if (
                    question.type ===
                    "passage-group"
                ) {
                    return (
                        sum +
                        question.questions.reduce(
                            (
                                questionTotal,
                                item,
                            ) =>
                                questionTotal +
                                item.maximumScore,
                            0,
                        )
                    );
                }

                if (
                    question.type ===
                    "matching-group"
                ) {
                    return (
                        sum +
                        question.items.reduce(
                            (
                                itemTotal,
                                item,
                            ) =>
                                itemTotal +
                                item.maximumScore,
                            0,
                        )
                    );
                }

                return (
                    sum +
                    question.maximumScore
                );
            },
            0,
        );

    return (
        Math.round(
            total * 10,
        ) / 10
    );
}