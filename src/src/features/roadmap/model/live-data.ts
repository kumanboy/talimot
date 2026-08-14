import type { RoadmapMode, RoadmapNodeId, RoadmapNodeStatus } from "./types";

export type RoadmapLiveNode = {
    readonly attemptCount: number;
    readonly averagePercentage: number | null;
    readonly latestPercentage: number | null;
    readonly lastCompletedAt: number | null;
    readonly status: RoadmapNodeStatus;
};

export type RoadmapWeakTopic = {
    readonly nodeId: RoadmapNodeId;
    readonly label: string;
    readonly percentage: number;
    readonly attemptCount: number;
};

export type RoadmapDiagnosticSnapshot = {
    readonly attemptId: string;
    readonly title: string;
    readonly percentage: number;
    readonly score: number | null;
    readonly maximumScore: number | null;
    readonly completedAt: number;
    readonly href: string;
};

export type RoadmapLiveData = {
    readonly authenticated: boolean;
    readonly preferredMode: RoadmapMode;
    readonly totalAttempts: number;
    readonly averagePercentage: number | null;
    readonly coreCompletedCount: number;
    readonly coreTotalCount: number;
    readonly progressPercentage: number;
    readonly nodes: Readonly<Record<RoadmapNodeId, RoadmapLiveNode>>;
    readonly weakestTopics: readonly RoadmapWeakTopic[];
    readonly masteredTopics: readonly RoadmapWeakTopic[];
    readonly latestDiagnostic: RoadmapDiagnosticSnapshot | null;
};
