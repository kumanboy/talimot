import type {
    AdminTestDraft,
    AdminTestDraftSummary,
} from "../model";
import {
    calculateAdminDraftMaximumScore,
} from "../model";

import type {
    AdminTestDraftStorageRecord,
} from "./admin-test-draft-storage-record";

function countDraftQuestions(
    draft:
        AdminTestDraft,
): number {
    return draft.questions.reduce(
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

            return total + 1;
        },
        0,
    );
}

export function mapDraftToStorageRecord(
    draft:
        AdminTestDraft,
): AdminTestDraftStorageRecord {
    return {
        id:
            draft.id,
        version:
            draft.version,
        status:
            draft.status,
        source:
            draft.source,
        title:
            draft.metadata.title,
        groupName:
            draft.metadata.group,
        topicSlug:
            draft.metadata.topicSlug,
        slug:
            draft.metadata.slug,
        format:
            draft.metadata.format,
        access:
            draft.metadata.access,
        questionCount:
            countDraftQuestions(
                draft,
            ),
        maximumScore:
            calculateAdminDraftMaximumScore(
                draft,
            ).toFixed(2),
        payload:
            draft,
        createdAt:
            draft.audit.createdAt,
        updatedAt:
            draft.audit.updatedAt,
        createdBy:
            draft.audit.createdBy,
        updatedBy:
            draft.audit.updatedBy,
    };
}

export function mapStorageRecordToDraft(
    record:
        AdminTestDraftStorageRecord,
): AdminTestDraft {
    return record.payload;
}

export function mapStorageRecordToSummary(
    record:
        AdminTestDraftStorageRecord,
): AdminTestDraftSummary {
    return {
        id:
            record.id,
        title:
            record.title,
        status:
            record.status,
        source:
            record.source,
        group:
            record.groupName,
        format:
            record.format,
        questionCount:
            record.questionCount,
        maximumScore:
            Number(
                record.maximumScore,
            ),
        updatedAt:
            record.updatedAt,
    };
}
