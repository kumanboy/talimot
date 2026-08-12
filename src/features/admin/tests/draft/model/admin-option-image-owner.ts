import type {
    AdminDraftOptionId,
} from "./admin-question-types";

/**
 * Option images reuse the existing test-image upload route.
 * A dedicated owner id keeps A/B/C/D files isolated from the
 * question-level image while remaining compatible with the
 * existing Storage path validator.
 */
export function getAdminOptionImageOwnerId(
    questionId: string,
    optionId: AdminDraftOptionId,
): string {
    const suffix =
        `-option-${optionId}`;
    const maxQuestionIdLength =
        Math.max(
            1,
            200 - suffix.length,
        );

    return `${questionId.slice(0, maxQuestionIdLength)}${suffix}`;
}
