export const roadmapModes = ["from-zero", "boost"] as const;

export type RoadmapMode = (typeof roadmapModes)[number];

export const roadmapViews = ["full", "week", "results"] as const;

export type RoadmapView = (typeof roadmapViews)[number];

export const roadmapNodeStatuses = [
  "locked",
  "available",
  "in-progress",
  "review-needed",
  "good",
  "mastered",
  "optional",
  "skipped",
] as const;

export type RoadmapNodeStatus = (typeof roadmapNodeStatuses)[number];

export const weeklyTaskStatuses = [
  "today",
  "scheduled",
  "completed",
  "review-needed",
  "moved",
] as const;

export type WeeklyTaskStatus = (typeof weeklyTaskStatuses)[number];

export type RoadmapNodeId =
  | "phonetics"
  | "morphemics"
  | "morphology"
  | "syntax"
  | "stylistics"
  | "scientific-text"
  | "literary-text"
  | "ghazal"
  | "essay-writing"
  | "topic-quizzes"
  | "mixed-practice"
  | "error-review"
  | "full-trial-exam"
  | "exam-error-analysis"
  | "weak-area-improvement"
  | "essay-check"
  | "final-full-trial-exam";

export type RoadmapStageId =
  | "foundation"
  | "grammar"
  | "text-and-style"
  | "literary-analysis"
  | "essay"
  | "reinforcement"
  | "exam-preparation";

export interface RoadmapNode {
  readonly id: RoadmapNodeId;
  readonly label: string;
  readonly order: number;
  readonly stageId: RoadmapStageId;
}

export interface RoadmapStage {
  readonly id: RoadmapStageId;
  readonly label: string;
  readonly order: number;
  readonly nodeIds: readonly RoadmapNodeId[];
}

export interface RoadmapDependency {
  readonly nodeId: RoadmapNodeId;
  readonly prerequisiteId: RoadmapNodeId;
}

export interface WeeklyTask {
  readonly id: string;
  readonly nodeId: RoadmapNodeId;
  readonly title: string;
  readonly status: WeeklyTaskStatus;
  readonly dayLabel: string;
  readonly estimatedMinutes: number;
  readonly reason: string;
  readonly actionLabel?: string;
}

export interface RoadmapResult {
  readonly nodeId: RoadmapNodeId;
  readonly score: number | null;
  readonly status: RoadmapNodeStatus | null;
  readonly completedAttempt: boolean;
  readonly attemptedAt: string;
}

export interface RoadmapVersion {
  readonly id: string;
  readonly version: number;
  readonly mode: RoadmapMode;
  readonly createdAt: string;
  readonly nodes: readonly RoadmapNode[];
  readonly dependencies: readonly RoadmapDependency[];
}

export interface RoadmapSummary {
  readonly mode: RoadmapMode;
  readonly progressPercentage: number;
  readonly masteredCount: number;
  readonly totalCount: number;
  readonly inProgressCount: number;
  readonly currentStageId: RoadmapStageId;
}

export interface RoadmapRouteState {
  readonly mode: RoadmapMode;
  readonly view: RoadmapView;
}

export interface RoadmapDefinition {
  readonly mode: "from-zero";
  readonly nodes: readonly RoadmapNode[];
  readonly stages: readonly RoadmapStage[];
  readonly dependencies: readonly RoadmapDependency[];
}

export const roadmapModeLabels: Readonly<Record<RoadmapMode, string>> =
  Object.freeze({
    "from-zero": "Noldan sertifikatgacha",
    boost: "Natijani oshirish",
  });

export const roadmapViewLabels: Readonly<Record<RoadmapView, string>> =
  Object.freeze({
    full: "To‘liq yo‘l",
    week: "Bu hafta",
    results: "Natijalar",
  });

export const roadmapNodeStatusLabels: Readonly<
  Record<RoadmapNodeStatus, string>
> = Object.freeze({
  locked: "Qulflangan",
  available: "Mavjud",
  "in-progress": "Jarayonda",
  "review-needed": "Takrorlash kerak",
  good: "Yaxshi",
  mastered: "O‘zlashtirilgan",
  optional: "Ixtiyoriy",
  skipped: "O‘tilmaydi",
});

export const weeklyTaskStatusLabels: Readonly<
  Record<WeeklyTaskStatus, string>
> = Object.freeze({
  today: "Bugun",
  scheduled: "Rejalashtirilgan",
  completed: "Bajarildi",
  "review-needed": "Takrorlash kerak",
  moved: "Ko‘chirildi",
});
