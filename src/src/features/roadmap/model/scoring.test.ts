import { describe, expect, it } from "vitest";

import {
  getRoadmapStatusFromScore,
  isPrerequisiteSatisfied,
} from "./scoring";

describe("roadmap score status", () => {
  it.each([
    [0, "review-needed"],
    [59, "review-needed"],
    [60, "good"],
    [79, "good"],
    [80, "mastered"],
    [100, "mastered"],
  ] as const)("maps %s to %s", (score, expectedStatus) => {
    expect(getRoadmapStatusFromScore(score)).toBe(expectedStatus);
  });

  it.each([undefined, null])("returns no result for %s", (score) => {
    expect(getRoadmapStatusFromScore(score)).toBeNull();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects the non-finite score %s",
    (score) => {
      expect(() => getRoadmapStatusFromScore(score)).toThrow(
        "Roadmap score must be finite.",
      );
    },
  );

  it.each([-1, 101])("rejects the out-of-range score %s", (score) => {
    expect(() => getRoadmapStatusFromScore(score)).toThrow(
      "Roadmap score must be between 0 and 100.",
    );
  });
});

describe("roadmap prerequisite progression", () => {
  it("accepts a completed below-60 attempt", () => {
    expect(
      isPrerequisiteSatisfied({
        completed: true,
        score: 48,
      }),
    ).toBe(true);
  });

  it("accepts a completed attempt without a score", () => {
    expect(
      isPrerequisiteSatisfied({
        completed: true,
        score: null,
      }),
    ).toBe(true);
  });

  it("rejects an incomplete attempt regardless of score", () => {
    expect(
      isPrerequisiteSatisfied({
        completed: false,
        score: 100,
      }),
    ).toBe(false);
  });

  it("rejects a missing attempt", () => {
    expect(isPrerequisiteSatisfied(undefined)).toBe(false);
    expect(isPrerequisiteSatisfied(null)).toBe(false);
  });
});
