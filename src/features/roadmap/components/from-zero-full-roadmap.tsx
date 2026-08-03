"use client";

import { useRouter } from "next/navigation";

import { fromZeroRoadmapDefinition } from "@/features/roadmap/model/roadmap-definition";
import { createRoadmapRoute } from "@/features/roadmap/model/routes";
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
} as const satisfies Readonly<
    Record<RoadmapNodeId, string>
>;

const nodeReasons = {
  spelling:
      "Yo‘l xaritangizdagi birinchi tavsiya etilgan mavzu — imlo qoidalari.",
  morphemics:
      "Imlo bo‘yicha kamida bir faoliyatni yakunlang.",
  morphology:
      "Poydevor faoliyatlaridan keyin tavsiya etiladi.",
  syntax:
      "Morfologiya bo‘yicha talab etilgan faoliyatni yakunlang.",
  stylistics:
      "Grammatika poydevoridan keyin uslubiy bilimlarni mustahkamlang.",
  "scientific-text":
      "Uslubiyatdan keyingi ilmiy matn tahlili yo‘nalishi.",
  "literary-text":
      "Uslubiyatdan keyingi badiiy matn tahlili yo‘nalishi.",
  ghazal:
      "Sintaksis va Grammatika bosqichidan keyin mavjud bo‘ladi.",
  "essay-writing":
      "Sintaksis va Uslubiyat bo‘yicha talab etilgan faoliyatlarni yakunlang.",
  "topic-quizzes":
      "Mavzular bo‘yicha asosiy faoliyatlardan keyin ochiladi.",
  "mixed-practice":
      "Mavzu testlaridan keyin turli ko‘nikmalarni birlashtiring.",
  "error-review":
      "Mashqlardagi xatolar asosida qayta ishlash tavsiya etiladi.",
  "full-trial-exam":
      "Asosiy o‘quv va mustahkamlash faoliyatlaridan keyin boshlanadi.",
  "exam-error-analysis":
      "Sinov imtihoni natijasidagi xatolarni sabablari bilan tahlil qiling.",
  "weak-area-improvement":
      "Natijalarga ko‘ra eng ustuvor zaifliklarni qayta ishlang.",
  "essay-check":
      "Avtomatik tekshiruv yetarli; o‘qituvchi tekshiruvi majburiy emas.",
  "final-full-trial-exam":
      "Yangilangan tayyorgarlikni yakuniy to‘liq sinovda tekshiring.",
} as const satisfies Readonly<
    Record<RoadmapNodeId, string>
>;

const stageDescriptions = {
  foundation:
      "Imlo va so‘z tuzilishi bo‘yicha asosiy bilimlarni shakllantiring.",
  grammar:
      "So‘z turkumlaridan gap qurilishiga ketma-ket o‘ting.",
  "text-and-style":
      "Uslubiyatdan ikki mustaqil matn tahlili yo‘nalishi ochiladi.",
  "literary-analysis":
      "G‘azal Grammatika bosqichi yakunlangach ochiladi.",
  essay:
      "Esse yozish uchun ikki zarur yo‘nalish birlashadi.",
  reinforcement:
      "Bilimlarni amaliyot, aralash mashq va xatolar orqali mustahkamlang.",
  "exam-preparation":
      "To‘liq sinov va tahlil orqali yakuniy tayyorgarlikka o‘ting.",
} as const satisfies Readonly<
    Record<RoadmapStageId, string>
>;

const nodesById = new Map(
    fromZeroRoadmapDefinition.nodes.map(
        (node) => [node.id, node],
    ),
);

function getNode(nodeId: RoadmapNodeId) {
  const node = nodesById.get(nodeId);

  if (!node) {
    throw new Error(
        `Roadmap node is missing: ${nodeId}`,
    );
  }

  return node;
}

function getStage(
    stageId: RoadmapStageId,
) {
  const stage =
      fromZeroRoadmapDefinition.stages.find(
          (candidate) =>
              candidate.id === stageId,
      );

  if (!stage) {
    throw new Error(
        `Roadmap stage is missing: ${stageId}`,
    );
  }

  return stage;
}

type RoadmapNodeViewProps = {
  nodeId: RoadmapNodeId;
  onStartSpelling: () => void;
};

function RoadmapNodeView({
                           nodeId,
                           onStartSpelling,
                         }: RoadmapNodeViewProps) {
  const node = getNode(nodeId);

  if (nodeId === "spelling") {
    return (
        <RoadmapNodeCard
            title={node.label}
            status="available"
            estimatedDuration={
              nodeDurations[nodeId]
            }
            reason={nodeReasons[nodeId]}
            actionLabel="Boshlash"
            onAction={onStartSpelling}
        />
    );
  }

  return (
      <RoadmapNodeCard
          title={node.label}
          status="locked"
          estimatedDuration={
            nodeDurations[nodeId]
          }
          reason={nodeReasons[nodeId]}
      />
  );
}

type NodeSequenceProps = {
  nodeIds: readonly RoadmapNodeId[];
  onStartSpelling: () => void;
};

function NodeSequence({
                        nodeIds,
                        onStartSpelling,
                      }: NodeSequenceProps) {
  return (
      <ol className={styles.nodeSequence}>
        {nodeIds.map(
            (nodeId, index) => (
                <li key={nodeId}>
                  <RoadmapNodeView
                      nodeId={nodeId}
                      onStartSpelling={
                        onStartSpelling
                      }
                  />

                  {index <
                  nodeIds.length - 1 ? (
                      <span
                          className={
                            styles.nodeConnector
                          }
                          aria-hidden="true"
                      />
                  ) : null}
                </li>
            ),
        )}
      </ol>
  );
}

type StageHeaderProps = {
  order: number;
  title: string;
  description: string;
};

function StageHeader({
                       order,
                       title,
                       description,
                     }: StageHeaderProps) {
  return (
      <header
          className={styles.stageHeader}
      >
        <span>{order}-bosqich</span>

        <h2>{title}</h2>

        <p>{description}</p>
      </header>
  );
}

type StandardStageProps = {
  stageId: Exclude<
      RoadmapStageId,
      "text-and-style"
  >;
  onStartSpelling: () => void;
  dependencyLabel?: string;
  note?: string;
};

function StandardStage({
                         stageId,
                         onStartSpelling,
                         dependencyLabel,
                         note,
                       }: StandardStageProps) {
  const stage = getStage(stageId);

  return (
      <section className={styles.stage}>
        <StageHeader
            order={stage.order}
            title={stage.label}
            description={
              stageDescriptions[stage.id]
            }
        />

        {dependencyLabel ? (
            <p
                className={
                  styles.dependencyLabel
                }
            >
              {dependencyLabel}
            </p>
        ) : null}

        <NodeSequence
            nodeIds={stage.nodeIds}
            onStartSpelling={
              onStartSpelling
            }
        />

        {note ? (
            <p className={styles.policyNote}>
              {note}
            </p>
        ) : null}
      </section>
  );
}

type TextAndStyleStageProps = {
  onStartSpelling: () => void;
};

function TextAndStyleStage({
                             onStartSpelling,
                           }: TextAndStyleStageProps) {
  const stage = getStage(
      "text-and-style",
  );

  return (
      <section className={styles.stage}>
        <StageHeader
            order={stage.order}
            title={stage.label}
            description={
              stageDescriptions[stage.id]
            }
        />

        <RoadmapNodeView
            nodeId="stylistics"
            onStartSpelling={
              onStartSpelling
            }
        />

        <div
            className={
              styles.parallelBranches
            }
            role="group"
            aria-label="Ilmiy matn va Badiiy matn parallel yo‘nalishlari"
        >
          <div
              className={styles.splitPoint}
              aria-hidden="true"
          />

          <p>
            Ikkala yo‘nalish ham
            bajariladi
          </p>

          <div
              className={styles.branchList}
          >
            <section
                aria-label="Ilmiy matn yo‘nalishi"
            >
              <RoadmapNodeView
                  nodeId="scientific-text"
                  onStartSpelling={
                    onStartSpelling
                  }
              />
            </section>

            <section
                aria-label="Badiiy matn yo‘nalishi"
            >
              <RoadmapNodeView
                  nodeId="literary-text"
                  onStartSpelling={
                    onStartSpelling
                  }
              />
            </section>
          </div>

          <div
              className={styles.mergePoint}
              aria-hidden="true"
          />
        </div>
      </section>
  );
}

function StageTransition() {
  return (
      <div
          className={styles.stageTransition}
          aria-hidden="true"
      >
        <span>↓</span>
      </div>
  );
}

export function FromZeroFullRoadmap() {
  const router = useRouter();

  const navigateRoadmap = (
      mode: RoadmapMode,
      view: RoadmapView,
  ) => {
    router.push(
        createRoadmapRoute({
          mode,
          view,
        }),
    );
  };

  const startSpelling = () => {
    router.push("/tests/imlo");
  };

  return (
      <RoadmapScreenShell
          title="Sizning yo‘l xaritangiz"
          selectedMode="from-zero"
          selectedView="full"
          onModeChange={(mode) =>
              navigateRoadmap(
                  mode,
                  "full",
              )
          }
          onViewChange={(view) =>
              navigateRoadmap(
                  "from-zero",
                  view,
              )
          }
          stickyAction={
            <RoadmapStickyAction
                nextStepLabel="Keyingi qadam: Imlo"
                buttonLabel="Boshlash"
                onAction={startSpelling}
            />
          }
      >
        <div
            className={
              styles.scrollContent
            }
        >
          <section
              className={styles.summary}
              aria-labelledby="roadmap-summary"
          >
            <h2 id="roadmap-summary">
              Reja tafsilotlari
            </h2>

            <dl>
              <div>
                <dt>Maqsad:</dt>
                <dd>A+</dd>
              </div>

              <div>
                <dt>Muddat:</dt>
                <dd>1 oydan kam</dd>
              </div>

              <div>
                <dt>
                  Tayyorgarlik sur’ati:
                </dt>
                <dd>Jadal</dd>
              </div>

              <div>
                <dt>Umumiy jarayon:</dt>
                <dd>0%</dd>
              </div>
            </dl>

            <div
                className={
                  styles.progressTrack
                }
                role="progressbar"
                aria-label="Umumiy jarayon"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
            >
            <span
                className={
                  styles.progressValue
                }
            />
            </div>
          </section>

          <div className={styles.roadmap}>
            <StandardStage
                stageId="foundation"
                onStartSpelling={
                  startSpelling
                }
            />

            <StageTransition />

            <StandardStage
                stageId="grammar"
                onStartSpelling={
                  startSpelling
                }
            />

            <StageTransition />

            <TextAndStyleStage
                onStartSpelling={
                  startSpelling
                }
            />

            <StageTransition />

            <StandardStage
                stageId="literary-analysis"
                dependencyLabel="Sintaksis ↓"
                onStartSpelling={
                  startSpelling
                }
            />

            <StageTransition />

            <StandardStage
                stageId="essay"
                dependencyLabel="Sintaksis + Uslubiyat ↓"
                note="Avtomatik esse tekshiruvi yetarli. O‘qituvchi tekshiruvi ixtiyoriy."
                onStartSpelling={
                  startSpelling
                }
            />

            <section
                className={
                  styles.mergeJunction
                }
                aria-labelledby="required-paths-merge"
            >
              <h2 id="required-paths-merge">
                Asosiy yo‘nalishlar
                yakunlandi
              </h2>

              <ul>
                <li>Ilmiy matn</li>
                <li>Badiiy matn</li>
                <li>G‘azal</li>
                <li>Esse yozish</li>
              </ul>
            </section>

            <StageTransition />

            <StandardStage
                stageId="reinforcement"
                onStartSpelling={
                  startSpelling
                }
            />

            <StageTransition />

            <StandardStage
                stageId="exam-preparation"
                onStartSpelling={
                  startSpelling
                }
            />
          </div>
        </div>
      </RoadmapScreenShell>
  );
}