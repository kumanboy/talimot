"use client";

import type { ChangeEventHandler } from "react";

import styles from "./choice-cards.module.css";

export type PathChoiceCardProps = {
  title: string;
  description: string;
  badge?: "Tavsiya etiladi";
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function PathChoiceCard({
  title,
  description,
  badge,
  name,
  value,
  checked,
  disabled = false,
  onChange,
  className,
}: PathChoiceCardProps) {
  const classes = [styles.card, styles.pathCard, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        className={styles.nativeInput}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className={styles.pathIndicator} aria-hidden="true" />
      <span className={styles.pathContent}>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <span className={styles.pathTitle}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </label>
  );
}
