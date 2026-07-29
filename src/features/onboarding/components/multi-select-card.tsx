"use client";

import type { ChangeEventHandler } from "react";

import styles from "./choice-cards.module.css";

export type MultiSelectCardProps = {
  label: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function MultiSelectCard({
  label,
  value,
  checked,
  disabled = false,
  name,
  onChange,
  className,
}: MultiSelectCardProps) {
  const classes = [styles.card, styles.compactCard, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        className={styles.nativeInput}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className={styles.checkboxIndicator} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <path
            d="m3.5 8.2 2.7 2.7 6.3-6.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
