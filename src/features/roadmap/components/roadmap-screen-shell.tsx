"use client";

import { useId, type ReactNode } from "react";

import { TalimotLogo } from "@/components/brand/talimot-logo";
import type {
  RoadmapMode,
  RoadmapView,
} from "@/features/roadmap/model/types";

import { RoadmapNavigation } from "./roadmap-navigation";
import styles from "./roadmap-screen-shell.module.css";

export type RoadmapScreenShellProps = {
  title: string;
  selectedMode: RoadmapMode;
  selectedView: RoadmapView;
  onModeChange: (mode: RoadmapMode) => void;
  onViewChange: (view: RoadmapView) => void;
  children: ReactNode;
  stickyAction: ReactNode;
};

export function RoadmapScreenShell({
  title,
  selectedMode,
  selectedView,
  onModeChange,
  onViewChange,
  children,
  stickyAction,
}: RoadmapScreenShellProps) {
  const titleId = useId();

  return (
    <main className={styles.screen} aria-labelledby={titleId}>
      <div
        className={`${styles.decorativeShape} ${styles.topShape}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.decorativeShape} ${styles.bottomShape}`}
        aria-hidden="true"
      />

      <div className={styles.shell}>
        <header className={styles.header}>
          <TalimotLogo />
          <h1 id={titleId}>{title}</h1>
        </header>

        <RoadmapNavigation
          selectedMode={selectedMode}
          selectedView={selectedView}
          onModeChange={onModeChange}
          onViewChange={onViewChange}
        />

        <div className={styles.scrollRegion}>{children}</div>

        <footer className={styles.stickyFooter}>{stickyAction}</footer>
      </div>
    </main>
  );
}
