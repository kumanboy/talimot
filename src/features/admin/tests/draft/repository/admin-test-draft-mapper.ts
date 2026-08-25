import type {
    AdminTestDraft,
    AdminTestDraftSummary,
} from "../model";
import {
    calculateAdminDraftMaximumScore,
    calculateAdminDraftTaskCount,
} from "../model";

import type {
    AdminTestDraftStorageRecord,
} from "./admin-test-draft-storage-record";

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
        description:
            draft.metadata.description,
        category:
            draft.metadata.category,
        difficulty:
            draft.metadata.difficulty,
        estimatedMinutes:
            draft.metadata.estimatedMinutes,
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
        tangaPrice:
            draft.metadata.tangaPrice,
        questionCount:
            calculateAdminDraftTaskCount(
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
    const payloadPrice =
        record.payload.metadata.tangaPrice;

    const normalizedTangaPrice =
        Number.isInteger(payloadPrice) &&
        payloadPrice >= 0
            ? payloadPrice
            : record.tangaPrice;

    return {
        ...record.payload,
        metadata: {
            ...record.payload.metadata,
            tangaPrice:
                record.payload.metadata.access === "premium"
                    ? Math.max(1, normalizedTangaPrice)
                    : 0,
        },
    };
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
        description:
            record.description,
        status:
            record.status,
        source:
            record.source,
        group:
            record.groupName,
        category:
            record.category,
        topicSlug:
            record.topicSlug,
        slug:
            record.slug,
        format:
            record.format,
        difficulty:
            record.difficulty,
        access:
            record.access,
        tangaPrice:
            record.tangaPrice,
        estimatedMinutes:
            record.estimatedMinutes,
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
