import {
    nationalTestRegistry,
} from "@/features/national-certificate/model/national-test-registry";
import {
    standardTestRegistry,
} from "@/features/tests/model/test-registry";

import {
    getAdminTestCatalogItem,
} from "./admin-test-catalog";
import type {
    AdminTestCatalogItem,
} from "./admin-test-catalog";

export interface AdminQuestionOptionSummary {
    readonly id: string;
    readonly text: string;
}

export interface AdminQuestionSummary {
    readonly id: string;
    readonly order: number;
    readonly sourceOrder:
        number | null;
    readonly type: string;
    readonly question: string;
    readonly options:
        readonly AdminQuestionOptionSummary[];
    readonly correctAnswer:
        string | null;
    readonly maximumScore:
        number | null;
    readonly hasAudio: boolean;
}

export interface AdminTestDetails {
    readonly test:
        AdminTestCatalogItem;
    readonly questions:
        readonly AdminQuestionSummary[];
    readonly dataSource:
        string | null;
    readonly answerKeyStatus:
        string | null;
}

type UnknownRecord =
    Record<string, unknown>;

function isRecord(
    value: unknown,
): value is UnknownRecord {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function asString(
    value: unknown,
): string | null {
    return typeof value === "string"
        ? value
        : null;
}

function asNumber(
    value: unknown,
): number | null {
    return (
        typeof value === "number" &&
        Number.isFinite(value)
    )
        ? value
        : null;
}

function getOptions(
    value: unknown,
): readonly AdminQuestionOptionSummary[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap(
        (option) => {
            if (!isRecord(option)) {
                return [];
            }

            const id =
                asString(option.id);
            const text =
                asString(option.text);

            if (!id || !text) {
                return [];
            }

            return [{
                id,
                text,
            }];
        },
    );
}

function getCorrectAnswer(
    question: UnknownRecord,
): string | null {
    const direct =
        asString(
            question.correctOptionId,
        ) ??
        asString(
            question.correctChoiceId,
        );

    if (direct) {
        return direct;
    }

    if (
        Array.isArray(
            question.acceptedAnswers,
        )
    ) {
        const answers =
            question.acceptedAnswers
                .filter(
                    (
                        value,
                    ): value is string =>
                        typeof value ===
                        "string",
                );

        return answers.length > 0
            ? answers.join(" / ")
            : null;
    }

    return null;
}

function hasAudio(
    question: UnknownRecord,
): boolean {
    if (
        !isRecord(
            question.explanation,
        )
    ) {
        return false;
    }

    if (
        !isRecord(
            question.explanation.audio,
        )
    ) {
        return false;
    }

    return Boolean(
        asString(
            question.explanation
                .audio.src,
        )?.trim(),
    );
}

function getQuestionText(
    question: UnknownRecord,
): string {
    return (
        asString(
            question.question,
        ) ??
        asString(
            question.prompt,
        ) ??
        asString(
            question.title,
        ) ??
        asString(
            question.instruction,
        ) ??
        "Savol matni ko‘rsatilmagan"
    );
}

function createQuestionSummary(
    question: UnknownRecord,
    fallbackOrder: number,
): AdminQuestionSummary {
    return {
        id:
            asString(question.id) ??
            `question-${fallbackOrder}`,
        order:
            asNumber(question.order) ??
            fallbackOrder,
        sourceOrder:
            asNumber(
                question.sourceOrder,
            ),
        type:
            asString(question.type) ??
            "multiple-choice",
        question:
            getQuestionText(
                question,
            ),
        options:
            getOptions(
                question.options,
            ),
        correctAnswer:
            getCorrectAnswer(
                question,
            ),
        maximumScore:
            asNumber(
                question.maximumScore,
            ) ??
            asNumber(
                question.score,
            ),
        hasAudio:
            hasAudio(question),
    };
}

function flattenQuestionRecords(
    value: unknown,
): readonly UnknownRecord[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const result:
        UnknownRecord[] = [];

    for (const entry of value) {
        if (!isRecord(entry)) {
            continue;
        }

        const nestedQuestions =
            flattenQuestionRecords(
                entry.questions,
            );

        if (
            nestedQuestions.length > 0
        ) {
            result.push(
                ...nestedQuestions,
            );
            continue;
        }

        const items =
            flattenQuestionRecords(
                entry.items,
            );

        if (items.length > 0) {
            result.push(...items);
            continue;
        }

        const parts =
            flattenQuestionRecords(
                entry.parts,
            );

        if (parts.length > 0) {
            result.push(...parts);
            continue;
        }

        result.push(entry);
    }

    return result;
}

function findRegisteredDefinition(
    test:
        AdminTestCatalogItem,
): UnknownRecord | null {
    if (
        test.group === "grammar"
    ) {
        const definition =
            standardTestRegistry.find(
                (item) =>
                    item.id === test.id,
            );

        return definition
            ? definition as unknown as
                UnknownRecord
            : null;
    }

    if (
        test.group ===
        "national-certificate"
    ) {
        const definition =
            nationalTestRegistry.find(
                (item) =>
                    item.id === test.id,
            );

        return definition
            ? definition as unknown as
                UnknownRecord
            : null;
    }

    return null;
}

export function getAdminTestDetails(
    testId: string,
): AdminTestDetails | null {
    const test =
        getAdminTestCatalogItem(
            testId,
        );

    if (!test) {
        return null;
    }

    const definition =
        findRegisteredDefinition(
            test,
        );

    if (!definition) {
        return {
            test,
            questions: [],
            dataSource: null,
            answerKeyStatus: null,
        };
    }

    const questionRecords =
        flattenQuestionRecords(
            definition.questions,
        );

    return {
        test,
        questions:
            questionRecords.map(
                (
                    question,
                    index,
                ) =>
                    createQuestionSummary(
                        question,
                        index + 1,
                    ),
            ),
        dataSource:
            asString(
                definition.dataSource,
            ),
        answerKeyStatus:
            asString(
                definition.answerKeyStatus,
            ),
    };
}
