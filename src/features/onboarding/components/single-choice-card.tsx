"use client";

import type { ChangeEventHandler } from "react";

import styles from "./choice-cards.module.css";

export type SingleChoiceCardProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function SingleChoiceCard({
  label,
  name,
  value,
  checked,
  disabled = false,
  onChange,
  className,
}: SingleChoiceCardProps) {
  const classes = [styles.card, styles.compactCard, className]
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
      <span className={styles.radioIndicator} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
