import "server-only";

import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import { fromZeroRoadmapDefinition } from "@/features/roadmap/model/roadmap-definition";
import { getRoadmapStatusFromScore } from "@/features/roadmap/model/scoring";
import type { RoadmapNodeId, RoadmapNodeStatus } from "@/features/roadmap/model/types";
import { db } from "@/lib/database/db";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";
import { users } from "@/lib/database/schema/users";

import type { RoadmapLiveData, RoadmapLiveNode } from "@/features/roadmap/model/live-data";

type Attempt = {
    id: string;
    testId: string;
    title: string;
    category: string;
    href: string;
    format: string | null;
    percentage: number;
    score: string | null;
    maximumScore: string | null;
    completedAt: number;
};

const coreNodeIds = [
    "spelling",
    "morphemics",
    "morphology",
    "syntax",
    "stylistics",
    "scientific-text",
    "literary-text",
    "ghazal",
] as const satisfies readonly RoadmapNodeId[];

const coreSet = new Set<RoadmapNodeId>(coreNodeIds);

const nodeLabels: Readonly<Record<RoadmapNodeId, string>> = Object.fromEntries(
    fromZeroRoadmapDefinition.nodes.map((node) => [node.id, node.label]),
) as Readonly<Record<RoadmapNodeId, string>>;

function parseScore(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function mapAttemptToNode(attempt: Pick<Attempt, "href" | "category" | "format">): RoadmapNodeId | null {
    const href = attempt.href.toLowerCase();
    const category = attempt.category.toLowerCase();

    if (href.includes("/diagnostika/") || attempt.format === "diagnostic") return "full-trial-exam";
    if (href.includes("/aralash/")) return "mixed-practice";
    if (href.includes("/imlo")) return "spelling";
    if (href.includes("/morfemika")) return "morphemics";
    if (href.includes("/morfologiya/") || category.includes("morfolog")) return "morphology";
    if (href.includes("/sintaksis")) return "syntax";
    if (href.includes("/uslubiyat")) return "stylistics";
    if (href.includes("/ilmiy-matn")) return "scientific-text";
    if (href.includes("/badiiy-matn")) return "literary-text";
    if (href.includes("/gazal") || href.includes("/g'azal") || category.includes("g‘azal") || category.includes("g'azal")) return "ghazal";

    return null;
}

function emptyNode(status: RoadmapNodeStatus = "locked"): RoadmapLiveNode {
    return {
        attemptCount: 0,
        averagePercentage: null,
        latestPercentage: null,
        lastCompletedAt: null,
        status,
    };
}

function emptyData(authenticated = false): RoadmapLiveData {
    const nodes = Object.fromEntries(
        fromZeroRoadmapDefinition.nodes.map((node, index) => [
            node.id,
            emptyNode(index === 0 ? "available" : "locked"),
        ]),
    ) as Record<RoadmapNodeId, RoadmapLiveNode>;

    return {
        authenticated,
        totalAttempts: 0,
        averagePercentage: null,
        coreCompletedCount: 0,
        coreTotalCount: coreNodeIds.length,
        progressPercentage: 0,
        nodes,
        weakestTopics: [],
        masteredTopics: [],
        latestDiagnostic: null,
    };
}

function statusFromAttempts(attempts: readonly Attempt[]): RoadmapNodeStatus {
    if (attempts.length === 0) return "locked";
    const average = Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length);
    return getRoadmapStatusFromScore(average) ?? "in-progress";
}

export async function getStudentRoadmapData(): Promise<RoadmapLiveData> {
    const cookieStore = await cookies();
    const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);
    if (!session) return emptyData(false);

    const [user] = await db
        .select({ id: users.id, status: users.status })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    if (!user || user.status !== "active") return emptyData(false);

    const attempts = await db
        .select({
            id: studentTestAttempts.id,
            testId: studentTestAttempts.testId,
            title: studentTestAttempts.title,
            category: studentTestAttempts.category,
            href: studentTestAttempts.href,
            format: studentTestAttempts.format,
            percentage: studentTestAttempts.percentage,
            score: studentTestAttempts.score,
            maximumScore: studentTestAttempts.maximumScore,
            completedAt: studentTestAttempts.completedAt,
        })
        .from(studentTestAttempts)
        .where(eq(studentTestAttempts.userId, user.id))
        .orderBy(desc(studentTestAttempts.completedAt))
        .limit(250) as Attempt[];

    if (attempts.length === 0) return emptyData(true);

    const grouped = new Map<RoadmapNodeId, Attempt[]>();
    for (const attempt of attempts) {
        const nodeId = mapAttemptToNode(attempt);
        if (!nodeId) continue;
        const list = grouped.get(nodeId) ?? [];
        list.push(attempt);
        grouped.set(nodeId, list);
    }

    const nodes = Object.fromEntries(
        fromZeroRoadmapDefinition.nodes.map((node) => [node.id, emptyNode()]),
    ) as Record<RoadmapNodeId, RoadmapLiveNode>;

    for (const nodeId of coreNodeIds) {
        const list = grouped.get(nodeId) ?? [];
        if (list.length === 0) continue;
        const average = Math.round(list.reduce((sum, attempt) => sum + attempt.percentage, 0) / list.length);
        nodes[nodeId] = {
            attemptCount: list.length,
            averagePercentage: average,
            latestPercentage: list[0]?.percentage ?? null,
            lastCompletedAt: list[0]?.completedAt ?? null,
            status: statusFromAttempts(list),
        };
    }

    const coreCompletedCount = coreNodeIds.filter((id) => nodes[id].attemptCount > 0).length;

    // For untouched core nodes, unlock only when all actual core prerequisites are completed.
    for (const nodeId of coreNodeIds) {
        if (nodes[nodeId].attemptCount > 0) continue;
        const prerequisites = fromZeroRoadmapDefinition.dependencies
            .filter((dependency) => dependency.nodeId === nodeId && coreSet.has(dependency.prerequisiteId))
            .map((dependency) => dependency.prerequisiteId);
        nodes[nodeId] = emptyNode(
            prerequisites.every((prerequisiteId) => nodes[prerequisiteId].attemptCount > 0)
                ? "available"
                : "locked",
        );
    }

    const topicAttempts = attempts.filter((attempt) => {
        const mapped = mapAttemptToNode(attempt);
        return mapped !== null && coreSet.has(mapped);
    });
    if (topicAttempts.length > 0) {
        const avg = Math.round(topicAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / topicAttempts.length);
        nodes["topic-quizzes"] = {
            attemptCount: topicAttempts.length,
            averagePercentage: avg,
            latestPercentage: topicAttempts[0]?.percentage ?? null,
            lastCompletedAt: topicAttempts[0]?.completedAt ?? null,
            status: getRoadmapStatusFromScore(avg) ?? "in-progress",
        };
    } else {
        nodes["topic-quizzes"] = emptyNode(coreCompletedCount > 0 ? "available" : "locked");
    }

    const mixedAttempts = grouped.get("mixed-practice") ?? [];
    if (mixedAttempts.length > 0) {
        const avg = Math.round(mixedAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / mixedAttempts.length);
        nodes["mixed-practice"] = {
            attemptCount: mixedAttempts.length,
            averagePercentage: avg,
            latestPercentage: mixedAttempts[0]?.percentage ?? null,
            lastCompletedAt: mixedAttempts[0]?.completedAt ?? null,
            status: getRoadmapStatusFromScore(avg) ?? "in-progress",
        };
        nodes["error-review"] = emptyNode("available");
    }

    const diagnosticAttempts = grouped.get("full-trial-exam") ?? [];
    if (diagnosticAttempts.length > 0) {
        const avg = Math.round(diagnosticAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / diagnosticAttempts.length);
        nodes["full-trial-exam"] = {
            attemptCount: diagnosticAttempts.length,
            averagePercentage: avg,
            latestPercentage: diagnosticAttempts[0]?.percentage ?? null,
            lastCompletedAt: diagnosticAttempts[0]?.completedAt ?? null,
            status: getRoadmapStatusFromScore(avg) ?? "in-progress",
        };
        nodes["exam-error-analysis"] = emptyNode("available");
    } else {
        nodes["full-trial-exam"] = emptyNode(topicAttempts.length > 0 ? "available" : "locked");
    }

    // Essay-linked nodes remain locked until the real essay module is connected.
    nodes["essay-writing"] = emptyNode("locked");
    nodes["essay-check"] = emptyNode("locked");
    nodes["weak-area-improvement"] = emptyNode("locked");
    nodes["final-full-trial-exam"] = emptyNode("locked");

    const topicSnapshots = coreNodeIds
        .filter((nodeId) => nodes[nodeId].averagePercentage !== null)
        .map((nodeId) => ({
            nodeId,
            label: nodeLabels[nodeId],
            percentage: nodes[nodeId].averagePercentage as number,
            attemptCount: nodes[nodeId].attemptCount,
        }));

    const weakestTopics = topicSnapshots
        .filter((item) => item.percentage < 80)
        .sort((first, second) => first.percentage - second.percentage)
        .slice(0, 3);
    const masteredTopics = topicSnapshots
        .filter((item) => item.percentage >= 80)
        .sort((first, second) => second.percentage - first.percentage);

    const latestDiagnosticAttempt = diagnosticAttempts[0] ?? null;
    const latestDiagnostic = latestDiagnosticAttempt
        ? {
            attemptId: latestDiagnosticAttempt.id,
            title: latestDiagnosticAttempt.title,
            percentage: latestDiagnosticAttempt.percentage,
            score: parseScore(latestDiagnosticAttempt.score),
            maximumScore: parseScore(latestDiagnosticAttempt.maximumScore),
            completedAt: latestDiagnosticAttempt.completedAt,
            href: latestDiagnosticAttempt.href,
        }
        : null;

    const averagePercentage = Math.round(
        attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length,
    );

    return {
        authenticated: true,
        totalAttempts: attempts.length,
        averagePercentage,
        coreCompletedCount,
        coreTotalCount: coreNodeIds.length,
        progressPercentage: Math.round((coreCompletedCount / coreNodeIds.length) * 100),
        nodes,
        weakestTopics,
        masteredTopics,
        latestDiagnostic,
    };
}
