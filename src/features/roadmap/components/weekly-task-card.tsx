"use client";

import { useId } from "react";

import {
  weeklyTaskStatusLabels,
  type WeeklyTaskStatus,
} from "@/features/roadmap/model/types";

import styles from "./roadmap-components.module.css";

type WeeklyTaskActionProps =
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

type WeeklyTaskCardBaseProps = {
  title: string;
  dayLabel: string;
  dateLabel?: string;
  duration: string;
  resultLabel?: string;
  activities?: readonly string[];
  supportingDescription?: string;
  status: WeeklyTaskStatus;
};

export type WeeklyTaskCardProps = WeeklyTaskCardBaseProps &
    WeeklyTaskActionProps;

export function WeeklyTaskCard({
                                 title,
                                 dayLabel,
                                 dateLabel,
                                 duration,
                                 resultLabel,
                                 activities,
                                 supportingDescription,
                                 status,
                                 actionLabel,
                                 onAction,
                                 disabled,
                               }: WeeklyTaskCardProps) {
  const titleId = useId();
  const isActionDisabled =
      disabled === true || typeof onAction !== "function";

  return (
      <article
          className={styles.weeklyCard}
          data-status={status}
          aria-labelledby={titleId}
      >
        <div className={styles.weeklyEyebrow}>
          <p>
            <span>{dayLabel}</span>
            {dateLabel ? <span>{dateLabel}</span> : null}
          </p>

          <span className={styles.statusBadge}>
          {weeklyTaskStatusLabels[status]}
        </span>
        </div>

        <h2 id={titleId}>{title}</h2>

        <div className={styles.weeklyMetadata}>
          {resultLabel ? <span>{resultLabel}</span> : null}
          <span>Jami: {duration}</span>
        </div>

        {activities && activities.length > 0 ? (
            <ul className={styles.weeklyActivities}>
              {activities.map((activity) => (
                  <li key={activity}>{activity}</li>
              ))}
            </ul>
        ) : null}

        {supportingDescription ? (
            <p className={styles.description}>{supportingDescription}</p>
        ) : null}

        {actionLabel ? (
            <button
                className={styles.cardAction}
                type="button"
                disabled={isActionDisabled}
                aria-disabled={isActionDisabled}
                onClick={isActionDisabled ? undefined : onAction}
            >
              <span>{actionLabel}</span>
              <span aria-hidden="true">→</span>
            </button>
        ) : null}
      </article>
  );
}