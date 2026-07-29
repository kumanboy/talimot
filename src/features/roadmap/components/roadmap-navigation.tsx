"use client";

import {
  roadmapModeLabels,
  roadmapModes,
  roadmapViewLabels,
  roadmapViews,
  type RoadmapMode,
  type RoadmapView,
} from "@/features/roadmap/model/types";

import styles from "./roadmap-components.module.css";

export type RoadmapNavigationProps = {
  selectedMode: RoadmapMode;
  selectedView: RoadmapView;
  onModeChange: (mode: RoadmapMode) => void;
  onViewChange: (view: RoadmapView) => void;
};

export function RoadmapNavigation({
  selectedMode,
  selectedView,
  onModeChange,
  onViewChange,
}: RoadmapNavigationProps) {
  return (
    <nav className={styles.navigation} aria-label="Yo‘l xaritasi boshqaruvi">
      <div
        className={styles.modeSelector}
        role="group"
        aria-label="Tayyorgarlik yo‘nalishi"
      >
        {roadmapModes.map((mode) => (
          <button
            key={mode}
            className={styles.modeButton}
            type="button"
            aria-pressed={selectedMode === mode}
            onClick={() => onModeChange(mode)}
          >
            {roadmapModeLabels[mode]}
          </button>
        ))}
      </div>

      <div
        className={styles.viewSelector}
        role="group"
        aria-label="Yo‘l xaritasi ko‘rinishi"
      >
        {roadmapViews.map((view) => (
          <button
            key={view}
            className={styles.viewButton}
            type="button"
            aria-current={selectedView === view ? "page" : undefined}
            onClick={() => onViewChange(view)}
          >
            {roadmapViewLabels[view]}
          </button>
        ))}
      </div>
    </nav>
  );
}
