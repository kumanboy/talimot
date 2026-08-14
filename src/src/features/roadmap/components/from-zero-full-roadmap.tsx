"use client";

import { useRouter } from "next/navigation";

import { fromZeroRoadmapDefinition } from "@/features/roadmap/model/roadmap-definition";
import { createRoadmapRoute } from "@/features/roadmap/model/routes";
import type { RoadmapLiveData } from "@/features/roadmap/model/live-data";
import type {
  RoadmapMode,
  RoadmapNodeId,
  RoadmapStageId,
  RoadmapView,
} from "@/features/roadmap/model/types";

import { RoadmapNodeCard } from "./roadmap-node-card";
import { RoadmapScreenShell } from "./roadmap-screen-shell";
import { RoadmapStickyAction } from "./roadmap-sticky-action";
import styles from "./from-zero-full-roadmap.module.css";

const nodeDurations = {
  spelling: "30 daqiqa",
  morphemics: "30 daqiqa",
  morphology: "45 daqiqa",
  syntax: "45 daqiqa",
  stylistics: "30 daqiqa",
  "scientific-text": "40 daqiqa",
  "literary-text": "40 daqiqa",
  ghazal: "40 daqiqa",
  "essay-writing": "60 daqiqa",
  "topic-quizzes": "30 daqiqa",
  "mixed-practice": "45 daqiqa",
  "error-review": "30 daqiqa",
  "full-trial-exam": "180 daqiqa",
  "exam-error-analysis": "30 daqiqa",
  "weak-area-improvement": "45 daqiqa",
  "essay-check": "15 daqiqa",
  "final-full-trial-exam": "180 daqiqa",
} as const satisfies Readonly<Record<RoadmapNodeId, string>>;

const nodeDestinations: Partial<Record<RoadmapNodeId, string>> = {
  spelling: "/tests/grammatika/imlo",
  morphemics: "/tests/grammatika/morfemika",
  morphology: "/tests/grammatika/morfologiya",
  syntax: "/tests/grammatika/sintaksis",
  stylistics: "/tests/grammatika/uslubiyat",
  "scientific-text": "/tests/milliy-sertifikat/ilmiy-matn",
  "literary-text": "/tests/milliy-sertifikat/badiiy-matn",
  ghazal: "/tests/milliy-sertifikat/gazal",
  "topic-quizzes": "/tests",
  "mixed-practice": "/tests/milliy-sertifikat/aralash",
  "full-trial-exam": "/tests/milliy-sertifikat/diagnostika",
  "exam-error-analysis": "/natijalar",
};

const nodeReasons = {
  spelling: "Imlo bo‘yicha real test natijalaringiz asosida kuzatiladi.",
  morphemics: "Morfemika natijasi yakunlangan testlaringizdan hisoblanadi.",
  morphology: "Morfologiya bo‘yicha yakunlangan testlaringiz umumlashtiriladi.",
  syntax: "Sintaksis bo‘yicha real test ko‘rsatkichlaringiz ishlatiladi.",
  stylistics: "Uslubiyat natijasi database’dagi urinishlaringizdan olinadi.",
  "scientific-text": "Ilmiy matn bo‘yicha natijalar real urinishlardan hisoblanadi.",
  "literary-text": "Badiiy matn bo‘yicha natijalar real urinishlardan hisoblanadi.",
  ghazal: "G‘azal bo‘yicha natijalar real urinishlardan hisoblanadi.",
  "essay-writing": "Esse moduli ishga tushgach real natija bilan ulanadi.",
  "topic-quizzes": "Mavzu testlaridagi umumiy natijalaringiz asosida hisoblanadi.",
  "mixed-practice": "Aralash testlar natijasi database’dan olinadi.",
  "error-review": "Aralash mashqdan keyin xatolarni tahlil qilish mumkin.",
  "full-trial-exam": "Diagnostika yoki to‘liq sinov natijangiz bilan yangilanadi.",
  "exam-error-analysis": "Diagnostika yakunlangach natijalarni tahlil qilish mumkin.",
  "weak-area-improvement": "Esse va natijalar moduli to‘liq ulangach avtomatik shakllanadi.",
  "essay-check": "Esse tekshiruvi keyingi modulda real natijalar bilan ulanadi.",
  "final-full-trial-exam": "Yakuniy bosqich barcha real natijalar ulangach ochiladi.",
} as const satisfies Readonly<Record<RoadmapNodeId, string>>;

const stageDescriptions = {
  foundation: "Imlo va so‘z tuzilishi bo‘yicha real test jarayonini kuzating.",
  grammar: "Morfologiya va sintaksis natijalari database’dan olinadi.",
  "text-and-style": "Uslubiyat, ilmiy va badiiy matn natijalari alohida hisoblanadi.",
  "literary-analysis": "G‘azal bo‘yicha natijangiz shu yerda aks etadi.",
  essay: "Esse moduli keyingi bosqichda real tekshiruvlar bilan ulanadi.",
  reinforcement: "Mavzu va aralash test natijalari asosida mustahkamlash olib boriladi.",
  "exam-preparation": "Diagnostika natijasi real database ma’lumotlari bilan yangilanadi.",
} as const satisfies Readonly<Record<RoadmapStageId, string>>;

const nodesById = new Map(fromZeroRoadmapDefinition.nodes.map((node) => [node.id, node]));

function getNode(nodeId: RoadmapNodeId) {
  const node = nodesById.get(nodeId);
  if (!node) throw new Error(`Roadmap node is missing: ${nodeId}`);
  return node;
}

function getStage(stageId: RoadmapStageId) {
  const stage = fromZeroRoadmapDefinition.stages.find((candidate) => candidate.id === stageId);
  if (!stage) throw new Error(`Roadmap stage is missing: ${stageId}`);
  return stage;
}

type RoadmapNodeViewProps = {
  nodeId: RoadmapNodeId;
  data: RoadmapLiveData;
  onNavigate: (destination: string) => void;
};

function RoadmapNodeView({ nodeId, data, onNavigate }: RoadmapNodeViewProps) {
  const node = getNode(nodeId);
  const live = data.nodes[nodeId];
  const destination = nodeDestinations[nodeId];
  const actionAllowed = Boolean(destination) && live.status !== "locked";
  const score = live.averagePercentage === null ? null : `${live.averagePercentage}%`;
  const reason = live.attemptCount > 0
    ? `${live.attemptCount} ta yakunlangan urinish • oxirgi natija ${live.latestPercentage ?? 0}%`
    : nodeReasons[nodeId];

  if (actionAllowed && destination) {
    return (
      <RoadmapNodeCard
        title={node.label}
        status={live.status}
        score={score}
        estimatedDuration={nodeDurations[nodeId]}
        reason={reason}
        actionLabel={live.attemptCount > 0 ? "Yana ishlash" : "Boshlash"}
        onAction={() => onNavigate(destination)}
      />
    );
  }

  return (
    <RoadmapNodeCard
      title={node.label}
      status={live.status}
      score={score}
      estimatedDuration={nodeDurations[nodeId]}
      reason={reason}
    />
  );
}

type NodeSequenceProps = {
  nodeIds: readonly RoadmapNodeId[];
  data: RoadmapLiveData;
  onNavigate: (destination: string) => void;
};

function NodeSequence({ nodeIds, data, onNavigate }: NodeSequenceProps) {
  return (
    <ol className={styles.nodeSequence}>
      {nodeIds.map((nodeId, index) => (
        <li key={nodeId}>
          <RoadmapNodeView nodeId={nodeId} data={data} onNavigate={onNavigate} />
          {index < nodeIds.length - 1 ? <span className={styles.nodeConnector} aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

function StageHeader({ order, title, description }: { order: number; title: string; description: string }) {
  return (
    <header className={styles.stageHeader}>
      <span>{order}-bosqich</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function StandardStage({
  stageId,
  data,
  onNavigate,
  dependencyLabel,
  note,
}: {
  stageId: Exclude<RoadmapStageId, "text-and-style">;
  data: RoadmapLiveData;
  onNavigate: (destination: string) => void;
  dependencyLabel?: string;
  note?: string;
}) {
  const stage = getStage(stageId);
  return (
    <section className={styles.stage}>
      <StageHeader order={stage.order} title={stage.label} description={stageDescriptions[stage.id]} />
      {dependencyLabel ? <p className={styles.dependencyLabel}>{dependencyLabel}</p> : null}
      <NodeSequence nodeIds={stage.nodeIds} data={data} onNavigate={onNavigate} />
      {note ? <p className={styles.policyNote}>{note}</p> : null}
    </section>
  );
}

function TextAndStyleStage({ data, onNavigate }: { data: RoadmapLiveData; onNavigate: (destination: string) => void }) {
  const stage = getStage("text-and-style");
  return (
    <section className={styles.stage}>
      <StageHeader order={stage.order} title={stage.label} description={stageDescriptions[stage.id]} />
      <RoadmapNodeView nodeId="stylistics" data={data} onNavigate={onNavigate} />
      <div className={styles.parallelBranches} role="group" aria-label="Ilmiy matn va Badiiy matn parallel yo‘nalishlari">
        <div className={styles.splitPoint} aria-hidden="true" />
        <p>Ikkala yo‘nalish ham alohida natija bilan kuzatiladi</p>
        <div className={styles.branchList}>
          <section aria-label="Ilmiy matn yo‘nalishi">
            <RoadmapNodeView nodeId="scientific-text" data={data} onNavigate={onNavigate} />
          </section>
          <section aria-label="Badiiy matn yo‘nalishi">
            <RoadmapNodeView nodeId="literary-text" data={data} onNavigate={onNavigate} />
          </section>
        </div>
        <div className={styles.mergePoint} aria-hidden="true" />
      </div>
    </section>
  );
}

function StageTransition() {
  return <div className={styles.stageTransition} aria-hidden="true"><span>↓</span></div>;
}

const actionableCore = [
  "spelling",
  "morphemics",
  "morphology",
  "syntax",
  "stylistics",
  "scientific-text",
  "literary-text",
  "ghazal",
] as const satisfies readonly RoadmapNodeId[];

export function FromZeroFullRoadmap({ data }: { readonly data: RoadmapLiveData }) {
  const router = useRouter();
  const navigateRoadmap = (mode: RoadmapMode, view: RoadmapView) => router.push(createRoadmapRoute({ mode, view }));
  const navigateTo = (destination: string) => router.push(destination);

  const nextNodeId = actionableCore.find((nodeId) => {
    const status = data.nodes[nodeId].status;
    return status === "available" || status === "review-needed" || status === "good";
  }) ?? "spelling";
  const nextNode = getNode(nextNodeId);
  const nextDestination = nodeDestinations[nextNodeId] ?? "/tests";

  return (
    <RoadmapScreenShell
      title="Sizning yo‘l xaritangiz"
      selectedMode="from-zero"
      selectedView="full"
      onModeChange={(mode) => navigateRoadmap(mode, "full")}
      onViewChange={(view) => navigateRoadmap("from-zero", view)}
      stickyAction={
        <RoadmapStickyAction
          nextStepLabel={`Keyingi qadam: ${nextNode.label}`}
          buttonLabel="Boshlash"
          onAction={() => navigateTo(nextDestination)}
        />
      }
    >
      <div className={styles.scrollContent}>
        <section className={styles.summary} aria-labelledby="roadmap-summary">
          <h2 id="roadmap-summary">Real jarayon</h2>
          <dl>
            <div><dt>Yakunlangan urinishlar:</dt><dd>{data.totalAttempts}</dd></div>
            <div><dt>O‘rtacha natija:</dt><dd>{data.averagePercentage === null ? "—" : `${data.averagePercentage}%`}</dd></div>
            <div><dt>Asosiy mavzular:</dt><dd>{data.coreCompletedCount} / {data.coreTotalCount}</dd></div>
            <div><dt>Umumiy jarayon:</dt><dd>{data.progressPercentage}%</dd></div>
            <div><dt>Ma’lumot manbasi:</dt><dd>Database’dagi test natijalari</dd></div>
          </dl>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Umumiy jarayon"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={data.progressPercentage}
          >
            <span className={styles.progressValue} style={{ width: `${data.progressPercentage}%` }} />
          </div>
        </section>

        <div className={styles.roadmap}>
          <StandardStage stageId="foundation" data={data} onNavigate={navigateTo} />
          <StageTransition />
          <StandardStage stageId="grammar" data={data} onNavigate={navigateTo} />
          <StageTransition />
          <TextAndStyleStage data={data} onNavigate={navigateTo} />
          <StageTransition />
          <StandardStage stageId="literary-analysis" dependencyLabel="Sintaksis ↓" data={data} onNavigate={navigateTo} />
          <StageTransition />
          <StandardStage
            stageId="essay"
            dependencyLabel="Esse moduli ↓"
            note="Esse bo‘limi ishga tushgach AI va ustoz tekshiruvlari real natijalar bilan shu yo‘l xaritasiga ulanadi."
            data={data}
            onNavigate={navigateTo}
          />
          <StageTransition />
          <StandardStage stageId="reinforcement" data={data} onNavigate={navigateTo} />
          <StageTransition />
          <StandardStage stageId="exam-preparation" data={data} onNavigate={navigateTo} />
        </div>
      </div>
    </RoadmapScreenShell>
  );
}
