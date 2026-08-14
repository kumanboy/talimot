"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./onboarding-action-button.module.css";

export type OnboardingActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children" | "className"
> & {
  children: ReactNode;
  type?: "button" | "submit";
  className?: string;
};

export function OnboardingActionButton({
  children,
  type = "button",
  className,
  ...buttonProps
}: OnboardingActionButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button
      {...buttonProps}
      className={classes}
      type={type}
    >
      {children}
    </button>
  );
}
