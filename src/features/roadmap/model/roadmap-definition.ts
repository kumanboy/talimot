import type {
  RoadmapDefinition,
  RoadmapDependency,
  RoadmapNode,
  RoadmapNodeId,
  RoadmapStage,
} from "./types";

type DeepReadonly<Value> = Value extends (...args: never[]) => unknown
  ? Value
  : Value extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : Value extends object
      ? { readonly [Key in keyof Value]: DeepReadonly<Value[Key]> }
      : Value;

interface RoadmapNodeCandidate {
  readonly id: string;
  readonly order: number;
}

interface RoadmapDependencyCandidate {
  readonly nodeId: string;
  readonly prerequisiteId: string;
}

export interface RoadmapDefinitionCandidate {
  readonly nodes: readonly RoadmapNodeCandidate[];
  readonly dependencies: readonly RoadmapDependencyCandidate[];
}

export type RoadmapValidationIssue =
  | {
      readonly code: "duplicate-node-id";
      readonly nodeId: string;
    }
  | {
      readonly code: "missing-dependency-id";
      readonly nodeId: string;
    }
  | {
      readonly code: "self-dependency";
      readonly nodeId: string;
    }
  | {
      readonly code: "dependency-cycle";
    }
  | {
      readonly code: "incorrect-node-order";
      readonly nodeId: string;
      readonly prerequisiteId?: string;
    };

function deepFreeze<Value>(value: Value): DeepReadonly<Value> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }

    Object.freeze(value);
  }

  return value as DeepReadonly<Value>;
}

export const fromZeroNodeIds = deepFreeze([
  "phonetics",
  "morphemics",
  "morphology",
  "syntax",
  "stylistics",
  "scientific-text",
  "literary-text",
  "ghazal",
  "essay-writing",
  "topic-quizzes",
  "mixed-practice",
  "error-review",
  "full-trial-exam",
  "exam-error-analysis",
  "weak-area-improvement",
  "essay-check",
  "final-full-trial-exam",
] as const satisfies readonly RoadmapNodeId[]);

const nodes = [
  { id: "phonetics", label: "Fonetika", order: 1, stageId: "foundation" },
  { id: "morphemics", label: "Morfemika", order: 2, stageId: "foundation" },
  { id: "morphology", label: "Morfologiya", order: 3, stageId: "grammar" },
  { id: "syntax", label: "Sintaksis", order: 4, stageId: "grammar" },
  {
    id: "stylistics",
    label: "Uslubiyat",
    order: 5,
    stageId: "text-and-style",
  },
  {
    id: "scientific-text",
    label: "Ilmiy matn",
    order: 6,
    stageId: "text-and-style",
  },
  {
    id: "literary-text",
    label: "Badiiy matn",
    order: 7,
    stageId: "text-and-style",
  },
  {
    id: "ghazal",
    label: "G‘azal",
    order: 8,
    stageId: "literary-analysis",
  },
  {
    id: "essay-writing",
    label: "Esse yozish",
    order: 9,
    stageId: "essay",
  },
  {
    id: "topic-quizzes",
    label: "Mavzu testlari",
    order: 10,
    stageId: "reinforcement",
  },
  {
    id: "mixed-practice",
    label: "Aralash mashqlar",
    order: 11,
    stageId: "reinforcement",
  },
  {
    id: "error-review",
    label: "Xatolarni takrorlash",
    order: 12,
    stageId: "reinforcement",
  },
  {
    id: "full-trial-exam",
    label: "To‘liq sinov imtihoni",
    order: 13,
    stageId: "exam-preparation",
  },
  {
    id: "exam-error-analysis",
    label: "Xatolar tahlili",
    order: 14,
    stageId: "exam-preparation",
  },
  {
    id: "weak-area-improvement",
    label: "Zaif mavzu va ko‘nikmalar ustida ishlash",
    order: 15,
    stageId: "exam-preparation",
  },
  {
    id: "essay-check",
    label: "Esse tekshiruvi",
    order: 16,
    stageId: "exam-preparation",
  },
  {
    id: "final-full-trial-exam",
    label: "Yakuniy to‘liq sinov imtihoni",
    order: 17,
    stageId: "exam-preparation",
  },
] as const satisfies readonly RoadmapNode[];

const stages = [
  {
    id: "foundation",
    label: "Poydevor",
    order: 1,
    nodeIds: ["phonetics", "morphemics"],
  },
  {
    id: "grammar",
    label: "Grammatika",
    order: 2,
    nodeIds: ["morphology", "syntax"],
  },
  {
    id: "text-and-style",
    label: "Matn va uslub",
    order: 3,
    nodeIds: ["stylistics", "scientific-text", "literary-text"],
  },
  {
    id: "literary-analysis",
    label: "Adabiy tahlil",
    order: 4,
    nodeIds: ["ghazal"],
  },
  {
    id: "essay",
    label: "Esse",
    order: 5,
    nodeIds: ["essay-writing"],
  },
  {
    id: "reinforcement",
    label: "Mustahkamlash",
    order: 6,
    nodeIds: ["topic-quizzes", "mixed-practice", "error-review"],
  },
  {
    id: "exam-preparation",
    label: "Imtihon tayyorgarligi",
    order: 7,
    nodeIds: [
      "full-trial-exam",
      "exam-error-analysis",
      "weak-area-improvement",
      "essay-check",
      "final-full-trial-exam",
    ],
  },
] as const satisfies readonly RoadmapStage[];

const dependencies = [
  { nodeId: "morphemics", prerequisiteId: "phonetics" },
  { nodeId: "morphology", prerequisiteId: "morphemics" },
  { nodeId: "syntax", prerequisiteId: "morphology" },
  { nodeId: "stylistics", prerequisiteId: "syntax" },
  { nodeId: "scientific-text", prerequisiteId: "stylistics" },
  { nodeId: "literary-text", prerequisiteId: "stylistics" },
  { nodeId: "ghazal", prerequisiteId: "syntax" },
  { nodeId: "essay-writing", prerequisiteId: "syntax" },
  { nodeId: "essay-writing", prerequisiteId: "stylistics" },
  { nodeId: "topic-quizzes", prerequisiteId: "scientific-text" },
  { nodeId: "topic-quizzes", prerequisiteId: "literary-text" },
  { nodeId: "topic-quizzes", prerequisiteId: "ghazal" },
  { nodeId: "topic-quizzes", prerequisiteId: "essay-writing" },
  { nodeId: "mixed-practice", prerequisiteId: "topic-quizzes" },
  { nodeId: "error-review", prerequisiteId: "mixed-practice" },
  { nodeId: "full-trial-exam", prerequisiteId: "error-review" },
  { nodeId: "exam-error-analysis", prerequisiteId: "full-trial-exam" },
  {
    nodeId: "weak-area-improvement",
    prerequisiteId: "exam-error-analysis",
  },
  { nodeId: "essay-check", prerequisiteId: "weak-area-improvement" },
  { nodeId: "final-full-trial-exam", prerequisiteId: "essay-check" },
] as const satisfies readonly RoadmapDependency[];

export const fromZeroRoadmapDefinition = deepFreeze({
  mode: "from-zero",
  nodes,
  stages,
  dependencies,
} satisfies RoadmapDefinition);

export function findDuplicateNodeIds(
  nodesToValidate: readonly RoadmapNodeCandidate[],
): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const node of nodesToValidate) {
    if (seen.has(node.id)) {
      duplicates.add(node.id);
    }

    seen.add(node.id);
  }

  return [...duplicates];
}

export function findMissingDependencyIds(
  definition: RoadmapDefinitionCandidate,
): readonly string[] {
  const nodeIds = new Set(definition.nodes.map((node) => node.id));
  const missingIds = new Set<string>();

  for (const dependency of definition.dependencies) {
    if (!nodeIds.has(dependency.nodeId)) {
      missingIds.add(dependency.nodeId);
    }

    if (!nodeIds.has(dependency.prerequisiteId)) {
      missingIds.add(dependency.prerequisiteId);
    }
  }

  return [...missingIds];
}

export function findSelfDependencies(
  dependenciesToValidate: readonly RoadmapDependencyCandidate[],
): readonly RoadmapDependencyCandidate[] {
  return dependenciesToValidate.filter(
    (dependency) => dependency.nodeId === dependency.prerequisiteId,
  );
}

export function hasDependencyCycle(
  definition: RoadmapDefinitionCandidate,
): boolean {
  const nodeIds = new Set(definition.nodes.map((node) => node.id));
  const dependentsByPrerequisite = new Map<string, string[]>();

  for (const dependency of definition.dependencies) {
    if (
      !nodeIds.has(dependency.nodeId) ||
      !nodeIds.has(dependency.prerequisiteId)
    ) {
      continue;
    }

    const dependents =
      dependentsByPrerequisite.get(dependency.prerequisiteId) ?? [];
    dependents.push(dependency.nodeId);
    dependentsByPrerequisite.set(dependency.prerequisiteId, dependents);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(nodeId: string): boolean {
    if (visiting.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);

    for (const dependentId of dependentsByPrerequisite.get(nodeId) ?? []) {
      if (visit(dependentId)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return definition.nodes.some((node) => visit(node.id));
}

export function findIncorrectNodeOrder(
  definition: RoadmapDefinitionCandidate,
): readonly RoadmapValidationIssue[] {
  const issues: RoadmapValidationIssue[] = [];
  const indexByNodeId = new Map(
    definition.nodes.map((node, index) => [node.id, index]),
  );

  definition.nodes.forEach((node, index) => {
    if (node.order !== index + 1) {
      issues.push({
        code: "incorrect-node-order",
        nodeId: node.id,
      });
    }
  });

  for (const dependency of definition.dependencies) {
    const nodeIndex = indexByNodeId.get(dependency.nodeId);
    const prerequisiteIndex = indexByNodeId.get(dependency.prerequisiteId);

    if (
      nodeIndex !== undefined &&
      prerequisiteIndex !== undefined &&
      prerequisiteIndex >= nodeIndex
    ) {
      issues.push({
        code: "incorrect-node-order",
        nodeId: dependency.nodeId,
        prerequisiteId: dependency.prerequisiteId,
      });
    }
  }

  return issues;
}

export function validateRoadmapDefinition(
  definition: RoadmapDefinitionCandidate,
): readonly RoadmapValidationIssue[] {
  const issues: RoadmapValidationIssue[] = [];

  for (const nodeId of findDuplicateNodeIds(definition.nodes)) {
    issues.push({ code: "duplicate-node-id", nodeId });
  }

  for (const nodeId of findMissingDependencyIds(definition)) {
    issues.push({ code: "missing-dependency-id", nodeId });
  }

  for (const dependency of findSelfDependencies(definition.dependencies)) {
    issues.push({ code: "self-dependency", nodeId: dependency.nodeId });
  }

  if (hasDependencyCycle(definition)) {
    issues.push({ code: "dependency-cycle" });
  }

  issues.push(...findIncorrectNodeOrder(definition));

  return issues;
}
