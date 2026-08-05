import { describe, expect, it } from "vitest";

import {
  findDuplicateNodeIds,
  findIncorrectNodeOrder,
  findMissingDependencyIds,
  findSelfDependencies,
  fromZeroNodeIds,
  fromZeroRoadmapDefinition,
  hasDependencyCycle,
  validateRoadmapDefinition,
  type RoadmapDefinitionCandidate,
} from "./roadmap-definition";
import {
  roadmapNodeStatusLabels,
  type RoadmapNode,
} from "./types";

const approvedLabels = [
  "Imlo",
  "Morfemika",
  "Morfologiya",
  "Sintaksis",
  "Uslubiyat",
  "Ilmiy matn",
  "Badiiy matn",
  "G‘azal",
  "Esse yozish",
  "Mavzu testlari",
  "Aralash mashqlar",
  "Xatolarni takrorlash",
  "To‘liq sinov imtihoni",
  "Xatolar tahlili",
  "Zaif mavzu va ko‘nikmalar ustida ishlash",
  "Esse tekshiruvi",
  "Yakuniy to‘liq sinov imtihoni",
] as const;

const approvedDependencies = [
  ["morphemics", "spelling"],
  ["morphology", "morphemics"],
  ["syntax", "morphology"],
  ["stylistics", "syntax"],
  ["scientific-text", "stylistics"],
  ["literary-text", "stylistics"],
  ["ghazal", "syntax"],
  ["essay-writing", "syntax"],
  ["essay-writing", "stylistics"],
  ["topic-quizzes", "scientific-text"],
  ["topic-quizzes", "literary-text"],
  ["topic-quizzes", "ghazal"],
  ["topic-quizzes", "essay-writing"],
  ["mixed-practice", "topic-quizzes"],
  ["error-review", "mixed-practice"],
  ["full-trial-exam", "error-review"],
  ["exam-error-analysis", "full-trial-exam"],
  ["weak-area-improvement", "exam-error-analysis"],
  ["essay-check", "weak-area-improvement"],
  ["final-full-trial-exam", "essay-check"],
] as const;

function dependencyPairs() {
  return fromZeroRoadmapDefinition.dependencies.map(
    ({ nodeId, prerequisiteId }) => [nodeId, prerequisiteId] as const,
  );
}

function candidate(
  overrides: Partial<RoadmapDefinitionCandidate> = {},
): RoadmapDefinitionCandidate {
  return {
    nodes: fromZeroRoadmapDefinition.nodes,
    dependencies: fromZeroRoadmapDefinition.dependencies,
    ...overrides,
  };
}

describe("from-zero roadmap definition", () => {
  it("contains exactly 17 nodes in the approved order", () => {
    expect(fromZeroRoadmapDefinition.nodes).toHaveLength(17);
    expect(fromZeroRoadmapDefinition.nodes.map((node) => node.id)).toEqual(
      fromZeroNodeIds,
    );
    expect(fromZeroRoadmapDefinition.nodes.map((node) => node.label)).toEqual(
      approvedLabels,
    );
    expect(fromZeroRoadmapDefinition.nodes.map((node) => node.order)).toEqual(
      Array.from({ length: 17 }, (_, index) => index + 1),
    );
  });

  it("contains all 20 approved dependency edges", () => {
    expect(fromZeroRoadmapDefinition.dependencies).toHaveLength(20);
    expect(dependencyPairs()).toEqual(approvedDependencies);
  });

  it("keeps both reading branches parallel after Uslubiyat", () => {
    const readingDependencies =
      fromZeroRoadmapDefinition.dependencies.filter(
        (dependency) =>
          dependency.nodeId === "scientific-text" ||
          dependency.nodeId === "literary-text",
      );

    expect(readingDependencies).toEqual([
      { nodeId: "scientific-text", prerequisiteId: "stylistics" },
      { nodeId: "literary-text", prerequisiteId: "stylistics" },
    ]);
  });

  it("requires both Sintaksis and Uslubiyat before Esse yozish", () => {
    expect(
      fromZeroRoadmapDefinition.dependencies
        .filter((dependency) => dependency.nodeId === "essay-writing")
        .map((dependency) => dependency.prerequisiteId),
    ).toEqual(["syntax", "stylistics"]);
  });

  it("requires Sintaksis before G‘azal", () => {
    expect(
      fromZeroRoadmapDefinition.dependencies.filter(
        (dependency) => dependency.nodeId === "ghazal",
      ),
    ).toEqual([{ nodeId: "ghazal", prerequisiteId: "syntax" }]);
  });

  it("merges all four required branches before Mavzu testlari", () => {
    expect(
      fromZeroRoadmapDefinition.dependencies
        .filter((dependency) => dependency.nodeId === "topic-quizzes")
        .map((dependency) => dependency.prerequisiteId),
    ).toEqual([
      "scientific-text",
      "literary-text",
      "ghazal",
      "essay-writing",
    ]);
  });

  it("keeps the final five examination nodes sequential", () => {
    expect(
      fromZeroRoadmapDefinition.nodes.slice(12).map((node) => node.id),
    ).toEqual([
      "full-trial-exam",
      "exam-error-analysis",
      "weak-area-improvement",
      "essay-check",
      "final-full-trial-exam",
    ]);

    expect(dependencyPairs().slice(-5)).toEqual([
      ["full-trial-exam", "error-review"],
      ["exam-error-analysis", "full-trial-exam"],
      ["weak-area-improvement", "exam-error-analysis"],
      ["essay-check", "weak-area-improvement"],
      ["final-full-trial-exam", "essay-check"],
    ]);
  });

  it("passes every structural validation helper", () => {
    expect(findDuplicateNodeIds(fromZeroRoadmapDefinition.nodes)).toEqual([]);
    expect(findMissingDependencyIds(fromZeroRoadmapDefinition)).toEqual([]);
    expect(
      findSelfDependencies(fromZeroRoadmapDefinition.dependencies),
    ).toEqual([]);
    expect(hasDependencyCycle(fromZeroRoadmapDefinition)).toBe(false);
    expect(findIncorrectNodeOrder(fromZeroRoadmapDefinition)).toEqual([]);
    expect(validateRoadmapDefinition(fromZeroRoadmapDefinition)).toEqual([]);
  });

  it("detects duplicate node IDs", () => {
    const nodes = [
      ...fromZeroRoadmapDefinition.nodes,
      fromZeroRoadmapDefinition.nodes[0],
    ];

    expect(findDuplicateNodeIds(nodes)).toEqual(["spelling"]);
    expect(
      validateRoadmapDefinition(candidate({ nodes })).map(
        (issue) => issue.code,
      ),
    ).toContain("duplicate-node-id");
  });

  it("detects missing dependency IDs", () => {
    const dependencies = [
      ...fromZeroRoadmapDefinition.dependencies,
      { nodeId: "unknown-node", prerequisiteId: "unknown-prerequisite" },
    ];

    expect(findMissingDependencyIds(candidate({ dependencies }))).toEqual([
      "unknown-node",
      "unknown-prerequisite",
    ]);
  });

  it("detects self-dependencies", () => {
    const dependencies = [
      ...fromZeroRoadmapDefinition.dependencies,
      { nodeId: "spelling", prerequisiteId: "spelling" },
    ];

    expect(findSelfDependencies(dependencies)).toEqual([
      { nodeId: "spelling", prerequisiteId: "spelling" },
    ]);
  });

  it("detects dependency cycles", () => {
    const dependencies = [
      ...fromZeroRoadmapDefinition.dependencies,
      {
        nodeId: "spelling",
        prerequisiteId: "final-full-trial-exam",
      },
    ];

    expect(hasDependencyCycle(candidate({ dependencies }))).toBe(true);
  });

  it("detects incorrect node order", () => {
    const nodes = [
      fromZeroRoadmapDefinition.nodes[1],
      fromZeroRoadmapDefinition.nodes[0],
      ...fromZeroRoadmapDefinition.nodes.slice(2),
    ];

    expect(findIncorrectNodeOrder(candidate({ nodes }))).not.toEqual([]);
    expect(
      validateRoadmapDefinition(candidate({ nodes })).map(
        (issue) => issue.code,
      ),
    ).toContain("incorrect-node-order");
  });

  it("exports a deeply immutable definition", () => {
    expect(Object.isFrozen(fromZeroRoadmapDefinition)).toBe(true);
    expect(Object.isFrozen(fromZeroRoadmapDefinition.nodes)).toBe(true);
    expect(Object.isFrozen(fromZeroRoadmapDefinition.nodes[0])).toBe(true);
    expect(Object.isFrozen(fromZeroRoadmapDefinition.dependencies)).toBe(true);
    expect(Object.isFrozen(fromZeroRoadmapDefinition.stages)).toBe(true);
    expect(Object.isFrozen(fromZeroRoadmapDefinition.stages[0].nodeIds)).toBe(
      true,
    );

    expect(() => {
      (
        fromZeroRoadmapDefinition.nodes as unknown as RoadmapNode[]
      ).push(fromZeroRoadmapDefinition.nodes[0]);
    }).toThrow(TypeError);

    const originalStageLabel = fromZeroRoadmapDefinition.stages[0].label;
    expect(() => {
      (fromZeroRoadmapDefinition.stages[0] as unknown as { label: string }).label =
        "O‘zgartirilgan";
    }).toThrow(TypeError);
    expect(fromZeroRoadmapDefinition.stages[0].label).toBe(originalStageLabel);

    const originalPrerequisiteId =
      fromZeroRoadmapDefinition.dependencies[0].prerequisiteId;
    expect(() => {
      (
        fromZeroRoadmapDefinition
          .dependencies[0] as unknown as { prerequisiteId: string }
      ).prerequisiteId = "morphemics";
    }).toThrow(TypeError);
    expect(fromZeroRoadmapDefinition.dependencies[0].prerequisiteId).toBe(
      originalPrerequisiteId,
    );

    const originalLockedLabel = roadmapNodeStatusLabels.locked;
    expect(() => {
      (
        roadmapNodeStatusLabels as unknown as Record<string, string>
      ).locked = "O‘zgartirilgan";
    }).toThrow(TypeError);
    expect(roadmapNodeStatusLabels.locked).toBe(originalLockedLabel);
  });
});
