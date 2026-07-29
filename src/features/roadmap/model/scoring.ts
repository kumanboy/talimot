import type { RoadmapNodeStatus } from "./types";

export interface RoadmapAttemptCompletion {
  readonly completed: boolean;
  readonly score?: number | null;
}

export function getRoadmapStatusFromScore(
  score: number | null | undefined,
): RoadmapNodeStatus | null {
  if (score === null || score === undefined) {
    return null;
  }

  if (!Number.isFinite(score)) {
    throw new RangeError("Roadmap score must be finite.");
  }

  if (score < 0 || score > 100) {
    throw new RangeError("Roadmap score must be between 0 and 100.");
  }

  if (score < 60) {
    return "review-needed";
  }

  if (score < 80) {
    return "good";
  }

  return "mastered";
}

export function isPrerequisiteSatisfied(
  attempt: RoadmapAttemptCompletion | null | undefined,
): boolean {
  return attempt?.completed === true;
}
