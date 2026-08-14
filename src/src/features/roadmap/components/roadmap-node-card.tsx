"use client";

import { useId } from "react";

import {
  roadmapNodeStatusLabels,
  type RoadmapNodeStatus,
} from "@/features/roadmap/model/types";

import styles from "./roadmap-components.module.css";

type RoadmapNodeActionProps =
  | {
      actionLabel?: undefined;
      onAction?: never;
      disabled?: never;
    }
  | {
      actionLabel: string;
      onAction: () => void;
      disabled?: false;
    }
  | {
      actionLabel: string;
      onAction?: never;
      disabled: true;
    };

type RoadmapNodeCardBaseProps = {
  title: string;
  status: RoadmapNodeStatus;
  score?: number | string | null;
  estimatedDuration?: string | null;
  reason?: string;
};

export type RoadmapNodeCardProps = RoadmapNodeCardBaseProps &
  RoadmapNodeActionProps;

export function RoadmapNodeCard({
  title,
  status,
  score,
  estimatedDuration,
  reason,
  actionLabel,
  onAction,
  disabled,
}: RoadmapNodeCardProps) {
  const titleId = useId();
  const isLocked = status === "locked";
  const isActionDisabled =
    isLocked || disabled === true || typeof onAction !== "function";
  const resolvedActionLabel = isLocked
    ? "Avvalgi bosqichni yakunlang"
    : actionLabel;

  return (
    <article
      className={styles.nodeCard}
      data-status={status}
      aria-labelledby={titleId}
    >
      <div className={styles.cardHeading}>
        <h2 id={titleId}>{title}</h2>
        <span className={styles.statusBadge}>
          {roadmapNodeStatusLabels[status]}
        </span>
      </div>

      <dl className={styles.metadata}>
        <div>
          <dt>Ball:</dt>
          <dd>{score ?? "—"}</dd>
        </div>
        <div>
          <dt>Taxminiy vaqt:</dt>
          <dd>{estimatedDuration ?? "—"}</dd>
        </div>
      </dl>

      {reason ? <p className={styles.description}>{reason}</p> : null}

      {resolvedActionLabel ? (
        <button
          className={styles.cardAction}
          type="button"
          disabled={isActionDisabled}
          aria-disabled={isActionDisabled}
          onClick={isActionDisabled ? undefined : onAction}
        >
          <span>{resolvedActionLabel}</span>
          {!isLocked ? <span aria-hidden="true">→</span> : null}
        </button>
      ) : null}
    </article>
  );
}
