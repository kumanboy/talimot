"use client";

import { useRouter } from "next/navigation";

import { createRoadmapRoute } from "@/features/roadmap/model/routes";
import type { RoadmapLiveData, RoadmapWeakTopic } from "@/features/roadmap/model/live-data";
import type { RoadmapMode, RoadmapNodeStatus, RoadmapView } from "@/features/roadmap/model/types";

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
  readonly action?: { readonly label: string; readonly destination: string };
};

const destinations: Record<string, string> = {
  spelling: "/tests/grammatika/imlo",
  morphemics: "/tests/grammatika/morfemika",
  morphology: "/tests/grammatika/morfologiya",
  syntax: "/tests/grammatika/sintaksis",
  stylistics: "/tests/grammatika/uslubiyat",
  "scientific-text": "/tests/milliy-sertifikat/ilmiy-matn",
  "literary-text": "/tests/milliy-sertifikat/badiiy-matn",
  ghazal: "/tests/milliy-sertifikat/gazal",
};

function topicToNode(topic: RoadmapWeakTopic): BoostNode {
  return {
    id: topic.nodeId,
    title: topic.label,
    status: topic.percentage < 60 ? "review-needed" : topic.percentage < 80 ? "good" : "mastered",
    score: `${topic.percentage}%`,
    duration: "30–45 daqiqa",
    reason: `${topic.attemptCount} ta real urinish o‘rtachasi. Natija database’dan olindi.`,
    action: {
      label: topic.percentage < 80 ? "Mustahkamlash" : "Takrorlash",
      destination: destinations[topic.nodeId] ?? "/tests",
    },
  };
}

function BoostNodeCard({ node, onNavigate }: { node: BoostNode; onNavigate: (destination: string) => void }) {
  if (node.action) {
    return (
      <RoadmapNodeCard
        title={node.title}
        status={node.status}
        score={node.score}
        estimatedDuration={node.duration}
        reason={node.reason}
        actionLabel={node.action.label}
        onAction={() => onNavigate(node.action!.destination)}
      />
    );
  }
  return <RoadmapNodeCard title={node.title} status={node.status} score={node.score} estimatedDuration={node.duration} reason={node.reason} />;
}

function NodeSequence({ nodes, onNavigate }: { nodes: readonly BoostNode[]; onNavigate: (destination: string) => void }) {
  return (
    <ol className={styles.nodeSequence}>
      {nodes.map((node, index) => (
        <li key={node.id}>
          <BoostNodeCard node={node} onNavigate={onNavigate} />
          {index < nodes.length - 1 ? <span className={styles.nodeConnector} aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

function BranchSection({ eyebrow, title, description, nodes, onNavigate }: {
  eyebrow: string;
  title: string;
  description: string;
  nodes: readonly BoostNode[];
  onNavigate: (destination: string) => void;
}) {
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

export function BoostFullRoadmap({ data }: { readonly data: RoadmapLiveData }) {
  const router = useRouter();
  const navigateRoadmap = (mode: RoadmapMode, view: RoadmapView) => router.push(createRoadmapRoute({ mode, view }));
  const navigateTo = (destination: string) => router.push(destination);

  const diagnostic = data.latestDiagnostic;
  const baselineNode: BoostNode = diagnostic
    ? {
        id: "latest-trial-result",
        title: diagnostic.title || "Oxirgi diagnostika natijasi",
        status: diagnostic.percentage < 60 ? "review-needed" : diagnostic.percentage < 80 ? "good" : "mastered",
        score: diagnostic.score !== null && diagnostic.maximumScore !== null
          ? `${diagnostic.score} / ${diagnostic.maximumScore}`
          : `${diagnostic.percentage}%`,
        reason: `${diagnostic.percentage}% • ${new Intl.DateTimeFormat("uz-UZ").format(new Date(diagnostic.completedAt))} • database natijasi`,
        action: { label: "Diagnostikani ochish", destination: diagnostic.href },
      }
    : {
        id: "latest-trial-result",
        title: "Diagnostika natijasi hali yo‘q",
        status: "available",
        reason: "Natijani oshirish yo‘li diagnostika yoki real mavzu testlari asosida shakllanadi.",
        action: { label: "Diagnostikani boshlash", destination: "/tests/milliy-sertifikat/diagnostika" },
      };

  const testBranchNodes: BoostNode[] = data.weakestTopics.length > 0
    ? data.weakestTopics.map(topicToNode)
    : [{
        id: "no-topic-result",
        title: "Mavzu natijalari hali yetarli emas",
        status: "available",
        reason: "Kamida bitta mavzu testini yakunlang. Zaif mavzular avtomatik aniqlanadi.",
        action: { label: "Testlarni ochish", destination: "/tests" },
      }];

  const essayBranchNodes: BoostNode[] = [
    {
      id: "essay-module",
      title: "Esse natijalari",
      status: "locked",
      duration: "—",
      reason: "AI va ustoz esse moduli ishga tushgach real esse ballari shu yerga ulanadi.",
    },
  ];

  const finalSequenceNodes: BoostNode[] = [
    {
      id: "next-diagnostic",
      title: "Keyingi to‘liq diagnostika",
      status: data.totalAttempts > 0 ? "available" : "locked",
      duration: "180 daqiqa",
      reason: "Mavzu natijalaridagi o‘sishni keyingi to‘liq diagnostikada tekshiring.",
      ...(data.totalAttempts > 0
        ? { action: { label: "Diagnostikaga o‘tish", destination: "/tests/milliy-sertifikat/diagnostika" } }
        : {}),
    },
    {
      id: "essay-final",
      title: "Esse bilan yakuniy natija",
      status: "locked",
      reason: "Esse moduli ulangach test + esse yakuniy natijasi shu bosqichda hisoblanadi.",
    },
  ];

  const nextTopic = data.weakestTopics[0];
  const nextDestination = nextTopic ? (destinations[nextTopic.nodeId] ?? "/tests") : "/tests";
  const nextLabel = nextTopic ? `${nextTopic.label}ni mustahkamlash` : "Birinchi real testni ishlash";

  return (
    <RoadmapScreenShell
      title="Sizning yo‘l xaritangiz"
      selectedMode="boost"
      selectedView="full"
      onModeChange={(mode) => navigateRoadmap(mode, "full")}
      onViewChange={(view) => navigateRoadmap("boost", view)}
      stickyAction={
        <RoadmapStickyAction
          nextStepLabel={`Keyingi qadam: ${nextLabel}`}
          buttonLabel="Boshlash"
          onAction={() => navigateTo(nextDestination)}
        />
      }
    >
      <div className={styles.scrollContent}>
        <section className={styles.summary} aria-labelledby="boost-summary">
          <h2 id="boost-summary">Real natija tafsilotlari</h2>
          <dl>
            <div><dt>Oxirgi diagnostika:</dt><dd>{diagnostic ? `${diagnostic.percentage}%` : "—"}</dd></div>
            <div><dt>Barcha urinishlar:</dt><dd>{data.totalAttempts}</dd></div>
            <div><dt>O‘rtacha natija:</dt><dd>{data.averagePercentage === null ? "—" : `${data.averagePercentage}%`}</dd></div>
            <div><dt>O‘zlashtirilgan mavzular:</dt><dd>{data.masteredTopics.length}</dd></div>
            <div><dt>Natija manbasi:</dt><dd>Database’dagi real testlar</dd></div>
          </dl>
        </section>

        <div className={styles.roadmap}>
          <BranchSection
            eyebrow="1-BOSQICH"
            title="Boshlang‘ich natija"
            description="Oxirgi diagnostika mavjud bo‘lsa shu natija, aks holda real test tarixi ishlatiladi."
            nodes={[baselineNode]}
            onNavigate={navigateTo}
          />

          <div className={styles.splitConnector}>
            <p>Natijalar real urinishlar asosida ustuvorlanadi</p>
            <div className={styles.splitRails} aria-hidden="true"><span /><span /><span /></div>
            <div className={styles.branchLabels}><span>TEST</span><span>ESSE</span></div>
          </div>

          <div role="group" aria-label="Test va esse yo‘nalishlari">
            <BranchSection
              eyebrow="A YO‘NALISH"
              title="Eng zaif mavzular"
              description="Eng past o‘rtacha natijaga ega 3 ta real mavzu avtomatik tanlanadi."
              nodes={testBranchNodes}
              onNavigate={navigateTo}
            />

            <div className={styles.parallelContinuation}>
              <span aria-hidden="true" /><p>Test natijalari hozir real database’dan olinmoqda</p><span aria-hidden="true" />
            </div>

            <BranchSection
              eyebrow="B YO‘NALISH"
              title="Esse ballini oshirish"
              description="Bu yo‘nalish teacher/AI esse moduli bilan keyingi bosqichda ulanadi."
              nodes={essayBranchNodes}
              onNavigate={navigateTo}
            />
          </div>

          {data.masteredTopics.length > 0 ? (
            <details className={styles.masteredTopics} open>
              <summary>O‘zlashtirilgan mavzular</summary>
              <p>{data.masteredTopics.map((item) => `${item.label} ${item.percentage}%`).join(" • ")}</p>
              <p>Bu ro‘yxat 80% va undan yuqori real o‘rtacha natijalardan shakllanadi.</p>
            </details>
          ) : null}

          <div className={styles.mergeConnector}>
            <div className={styles.mergeRails} aria-hidden="true"><span /><span /><span /></div>
            <p>Keyingi diagnostikada o‘sishni tekshiring</p>
          </div>

          <BranchSection
            eyebrow="YAKUNIY BOSQICH"
            title="Natijani qayta o‘lchash"
            description="Yangi diagnostika real o‘sishni database’da qayd etadi."
            nodes={finalSequenceNodes}
            onNavigate={navigateTo}
          />
        </div>
      </div>
    </RoadmapScreenShell>
  );
}
