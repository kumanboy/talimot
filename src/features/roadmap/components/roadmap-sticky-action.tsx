"use client";

import styles from "./roadmap-components.module.css";

export type RoadmapStickyActionProps = {
  nextStepLabel: string;
  buttonLabel: string;
  disabled?: boolean;
  onAction: () => void;
};

export function RoadmapStickyAction({
  nextStepLabel,
  buttonLabel,
  disabled = false,
  onAction,
}: RoadmapStickyActionProps) {
  return (
    <div className={styles.stickyAction}>
      <p>{nextStepLabel}</p>
      <button
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        onClick={onAction}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
