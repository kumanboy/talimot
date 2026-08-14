export const DEFAULT_AUDIO_EXPLANATION_TITLE =
    "USTOZNING OVOZLI IZOHINI TINGLANG!";

export interface QuestionExplanationAudio {
    readonly src: string;
    readonly title?: string;
    readonly durationLabel?: string;
}

export interface QuestionExplanation {
    readonly text?: string;
    readonly audio?: QuestionExplanationAudio;
}

export function hasQuestionAudioExplanation(
    explanation:
        QuestionExplanation | undefined,
): explanation is QuestionExplanation & {
    readonly audio:
        QuestionExplanationAudio;
} {
    return Boolean(
        explanation?.audio?.src.trim(),
    );
}
