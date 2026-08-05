"use client";

import { useRouter } from "next/navigation";

import { createRoadmapRoute } from "@/features/roadmap/model/routes";
import type {
  RoadmapMode,
  RoadmapNodeStatus,
  RoadmapView,
} from "@/features/roadmap/model/types";

import { RoadmapNodeCard } from "./roadmap-node-card";
import { RoadmapScreenShell } from "./roadmap-screen-shell";
import { RoadmapStickyAction } from "./roadmap-sticky-action";
import styles from "./boost-full-roadmap.module.css";

type BoostNode = {
  readonly id: string;
  readonly title: string;
  readonly status: RoadmapNodeStatus;
  readonly score?: string;
  readonly duration?: string;
  readonly reason: string;
  readonly action?: {
    readonly label: string;
    readonly destination: string;
  };
};

const baselineNode = {
  id: "latest-trial-result",
  title: "Oxirgi sinov natijasi",
  status: "mastered",
  score: "57 / 75",
  reason: "Test: 61 / 75 • Esse: 53 / 75",
  action: {
    label: "Natijani ko‘rish",
    destination: createRoadmapRoute({ mode: "boost", view: "results" }),
  },
} as const satisfies BoostNode;

const testBranchNodes = [
  {
    id: "strengthen-syntax",
    title: "Sintaksisni mustahkamlash",
    status: "in-progress",
    score: "48%",
    duration: "35 daqiqa",
    reason: "Eng zaif uch mavzudan biri; maqsad uchun ustuvor.",
    action: {
      label: "Davom etish",
      destination: "/mavzular/sintaksis",
    },
  },
  {
    id: "ghazal-analysis",
    title: "G‘azal tahlili",
    status: "review-needed",
    score: "52%",
    duration: "40 daqiqa",
    reason: "52% natija sababli haftalik rejaga qaytarildi.",
    action: {
      label: "Takrorlash",
      destination: "/mavzular/gazal",
    },
  },
  {
    id: "scientific-text-practice",
    title: "Ilmiy matn amaliyoti",
    status: "review-needed",
    score: "58%",
    duration: "40 daqiqa",
    reason: "58% natija sababli qayta mashq tavsiya etildi.",
    action: {
      label: "Takrorlash",
      destination: "/mavzular/ilmiy-matn",
    },
  },
] as const satisfies readonly BoostNode[];

const essayBranchNodes = [
  {
    id: "strengthen-argumentation",
    title: "Dalillashni kuchaytirish",
    status: "available",
    duration: "30 daqiqa",
    reason: "Esse mezonlarida dalillash eng zaif yo‘nalish.",
    action: {
      label: "Boshlash",
      destination: "/esse-tekshirish",
    },
  },
  {
    id: "improve-essay-structure",
    title: "Esse tuzilmasini yaxshilash",
    status: "locked",
    duration: "35 daqiqa",
    reason: "Dalillashdan keyin esse tuzilmasi mustahkamlanadi.",
  },
  {
    id: "punctuation-practice",
    title: "Punktuatsiya mashqi",
    status: "locked",
    duration: "30 daqiqa",
    reason: "Tuzilmadan keyin punktuatsiya mashqi ochiladi.",
  },
  {
    id: "essay-check",
    title: "Esse tekshiruvi",
    status: "locked",
    duration: "20 daqiqa",
    reason: "Mashqlardan keyin avtomatik tekshiruv ochiladi.",
  },
] as const satisfies readonly BoostNode[];

const finalSequenceNodes = [
  {
    id: "full-trial-exam",
    title: "To‘liq sinov imtihoni",
    status: "locked",
    duration: "180 daqiqa",
    reason: "Ikki yo‘nalish yakunlangach umumiy natija o‘lchanadi.",
  },
  {
    id: "error-analysis",
    title: "Xatolar tahlili",
    status: "locked",
    duration: "45 daqiqa",
    reason: "Sinovdagi xatolar sabab va mavzu bo‘yicha ajratiladi.",
  },
  {
    id: "weak-area-improvement",
    title: "Zaif mavzu va ko‘nikmalar ustida ishlash",
    status: "locked",
    duration: "60 daqiqa",
    reason: "Tahlil aniqlagan zaifliklar maqsadli mustahkamlanadi.",
  },
  {
    id: "final-essay-check",
    title: "Esse tekshiruvi",
    status: "locked",
    duration: "20 daqiqa",
    reason: "Avtomatik tekshiruv yetarli; o‘qituvchi ixtiyoriy.",
  },
  {
    id: "final-full-trial-exam",
    title: "Yakuniy to‘liq sinov imtihoni",
    status: "locked",
    duration: "180 daqiqa",
    reason: "Maqsad darajasiga tayyorlik yakuniy baholanadi.",
  },
] as const satisfies readonly BoostNode[];

type BoostNodeCardProps = {
  node: BoostNode;
  onNavigate: (destination: string) => void;
};

function BoostNodeCard({
  node,
  onNavigate,
}: BoostNodeCardProps) {
  const action = node.action;

  if (action) {
    return (
      <RoadmapNodeCard
        title={node.title}
        status={node.status}
        score={node.score}
        estimatedDuration={node.duration}
        reason={node.reason}
        actionLabel={action.label}
        onAction={() => onNavigate(action.destination)}
      />
    );
  }

  return (
    <RoadmapNodeCard
      title={node.title}
      status={node.status}
      score={node.score}
      estimatedDuration={node.duration}
      reason={node.reason}
    />
  );
}

type NodeSequenceProps = {
  nodes: readonly BoostNode[];
  onNavigate: (destination: string) => void;
};

function NodeSequence({
  nodes,
  onNavigate,
}: NodeSequenceProps) {
  return (
    <ol className={styles.nodeSequence}>
      {nodes.map((node, index) => (
        <li key={node.id}>
          <BoostNodeCard node={node} onNavigate={onNavigate} />
          {index < nodes.length - 1 ? (
            <span className={styles.nodeConnector} aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

type BranchSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  nodes: readonly BoostNode[];
  onNavigate: (destination: string) => void;
};

function BranchSection({
  eyebrow,
  title,
  description,
  nodes,
  onNavigate,
}: BranchSectionProps) {
  return (
    <section className={styles.stage}>
      <header className={styles.stageHeader}>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <NodeSequence nodes={nodes} onNavigate={onNavigate} />
    </section>
  );
}

export function BoostFullRoadmap() {
  const router = useRouter();

  const navigateRoadmap = (mode: RoadmapMode, view: RoadmapView) => {
    router.push(createRoadmapRoute({ mode, view }));
  };

  const navigateTo = (destination: string) => {
    router.push(destination);
  };

  const startSyntax = () => {
    router.push("/tests/grammatika/sintaksis");
  };

  return (
    <RoadmapScreenShell
      title="Sizning yo‘l xaritangiz"
      selectedMode="boost"
      selectedView="full"
      onModeChange={(mode) => navigateRoadmap(mode, "full")}
      onViewChange={(view) => navigateRoadmap("boost", view)}
      stickyAction={
        <RoadmapStickyAction
          nextStepLabel="Keyingi qadam: Sintaksisni mustahkamlash"
          buttonLabel="Boshlash"
          onAction={startSyntax}
        />
      }
    >
      <div className={styles.scrollContent}>
        <section className={styles.summary} aria-labelledby="boost-summary">
          <h2 id="boost-summary">Natija tafsilotlari</h2>
          <dl>
            <div>
              <dt>Hozirgi daraja:</dt>
              <dd>B</dd>
            </div>
            <div>
              <dt>Hozirgi natija:</dt>
              <dd>57 / 75</dd>
            </div>
            <div>
              <dt>Maqsad:</dt>
              <dd>A+</dd>
            </div>
            <div>
              <dt>Kerakli o‘sish:</dt>
              <dd>+13 ball</dd>
            </div>
            <div>
              <dt>Natija manbasi:</dt>
              <dd>Oxirgi sinov imtihoni</dd>
            </div>
          </dl>
        </section>

        <div className={styles.roadmap}>
          <BranchSection
            eyebrow="1-BOSQICH"
            title="Boshlang‘ich natija"
            description="Oxirgi natija shaxsiy ustuvorliklarni belgilaydi."
            nodes={[baselineNode]}
            onNavigate={navigateTo}
          />

          <div className={styles.splitConnector}>
            <p>Natija ikki parallel yo‘nalishda oshiriladi</p>
            <div className={styles.splitRails} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.branchLabels}>
              <span>TEST</span>
              <span>ESSE</span>
            </div>
          </div>

          <div
            role="group"
            aria-label="Test va esse ballini oshirish parallel yo‘nalishlari"
          >
            <BranchSection
              eyebrow="A YO‘NALISH"
              title="Test ballini oshirish"
              description="Eng zaif uch mavzu natija va maqsadga ko‘ra ustuvorlandi."
              nodes={testBranchNodes}
              onNavigate={navigateTo}
            />

            <div className={styles.parallelContinuation}>
              <span aria-hidden="true" />
              <p>Test va esse ishlari bir-biriga parallel davom etadi</p>
              <span aria-hidden="true" />
            </div>

            <BranchSection
              eyebrow="B YO‘NALISH"
              title="Esse ballini oshirish"
              description="Zaif mezonlar ketma-ket mashq va tekshiruv bilan kuchaytiriladi."
              nodes={essayBranchNodes}
              onNavigate={navigateTo}
            />
          </div>

          <p className={styles.essayPolicy}>
            Avtomatik esse tekshiruvi yetarli. O‘qituvchi tekshiruvi
            ixtiyoriy.
          </p>

          <details className={styles.masteredTopics} open>
            <summary>O‘zlashtirilgan mavzular</summary>
            <p>Fonetika&nbsp; • &nbsp;Morfemika&nbsp; • &nbsp;Morfologiya</p>
            <p>
              Majburiy yo‘ldan o‘tilmaydi, lekin ixtiyoriy takrorlash
              mumkin.
            </p>
          </details>

          <div className={styles.mergeConnector}>
            <div className={styles.mergeRails} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>Test va esse yo‘nalishlari birlashdi</p>
          </div>

          <BranchSection
            eyebrow="YAKUNIY BOSQICH"
            title="Natijani birlashtirish"
            description="Ikkala faol yo‘nalish yakunlangach ochiladi."
            nodes={finalSequenceNodes}
            onNavigate={navigateTo}
          />
        </div>
      </div>
    </RoadmapScreenShell>
  );
}
