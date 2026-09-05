import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("../storage/admin-test-audio-storage", () => ({
    getAdminTestAudioPublicUrl: (path: string) => `https://assets.example/${path}`,
}));
vi.mock("../storage/admin-test-image-storage", () => ({ getAdminTestImagePublicUrl: () => "" }));
import { convertAdminTestDraftToStudentTest } from "./admin-test-draft-to-student-test";
import { createEmptyAdminTestDraft, createEmptyMatchingQuestion, createEmptyMultipartQuestion } from "../model/admin-test-draft-factory";
import type { AdminDraftAudioAsset, AdminDraftQuestion } from "../model/admin-question-types";

const audio: AdminDraftAudioAsset = {
    kind: "audio", id: "audio", fileName: "q33.mp3", mimeType: "audio/mpeg",
    sizeBytes: 500, durationSeconds: 12, storagePath: "test/q33.mp3",
};
function publish(question: AdminDraftQuestion) {
    const draft = createEmptyAdminTestDraft({ metadata: {
        title: "Test", description: "Test", group: "national-certificate", category: "diagnostika",
        topicSlug: "diagnostika", slug: "1", format: "diagnostic", difficulty: "hard",
        access: "free", tangaPrice: 0, estimatedMinutes: 180,
    } });
    const result = convertAdminTestDraftToStudentTest({ ...draft, questions: [question] });
    if (result.kind !== "diagnostic") throw new Error("Expected diagnostic test");
    return result.questions[0];
}

describe("diagnostic audio publishing", () => {
    it("preserves the shared matching recording", () => {
        const result = publish({ ...createEmptyMatchingQuestion({ order: 33 }),
            explanation: { text: "Shared explanation", audio },
            items: [{ id: "33", order: 33, sourceOrder: 33, prompt: "Item", correctChoiceId: "A",
                maximumScore: 1, explanation: { text: "", audio } }],
        });
        expect(result.type).toBe("matching-group");
        expect("explanation" in result && result.explanation?.audio?.src).toBe("https://assets.example/test/q33.mp3");
        expect(result.type === "matching-group" && result.items[0].explanation?.audio).toBeUndefined();
    });
    it("retains part audio when the parent explanation contains only text", () => {
        const result = publish({ ...createEmptyMultipartQuestion({ order: 38 }),
            explanation: { text: "Text only", audio: null },
            parts: [{ id: "a", order: 1, label: "a", prompt: "Part A", acceptedAnswers: ["yes"],
                requiredKeywords: [], comparison: "normalized", maximumScore: 1,
                explanation: { text: "", audio } }],
        });
        if (result.type !== "multipart") throw new Error("Expected multipart");
        expect(result.parts[0].explanation?.audio?.src).toBe("https://assets.example/test/q33.mp3");
    });
    it("uses the shared recording once when multipart has parent audio", () => {
        const result = publish({ ...createEmptyMultipartQuestion({ order: 38 }),
            explanation: { text: "Shared", audio },
            parts: [{ id: "a", order: 1, label: "a", prompt: "Part A", acceptedAnswers: ["yes"],
                requiredKeywords: [], comparison: "normalized", maximumScore: 1,
                explanation: { text: "", audio } }],
        });
        if (result.type !== "multipart") throw new Error("Expected multipart");
        expect(result.explanation?.audio?.src).toBe("https://assets.example/test/q33.mp3");
        expect(result.parts[0].explanation?.audio).toBeUndefined();
    });
});
