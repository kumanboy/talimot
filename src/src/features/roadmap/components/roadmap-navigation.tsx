"use client";

import {
    roadmapModeLabels,
    type RoadmapMode,
    type RoadmapView,
} from "@/features/roadmap/model/types";

import styles from "./roadmap-components.module.css";

export type RoadmapNavigationProps = {
    selectedMode: RoadmapMode;
    selectedView: RoadmapView;
    onModeChange: (
        mode: RoadmapMode,
    ) => void;
    onViewChange: (
        view: RoadmapView,
    ) => void;
};

export function RoadmapNavigation({
                                      selectedMode,
                                  }: RoadmapNavigationProps) {
    return (
        <nav
            className={styles.navigation}
            aria-label="Yo‘l xaritasi yo‘nalishi"
        >
            <div
                className={styles.selectedModeCard}
                aria-label={`Tanlangan yo‘nalish: ${roadmapModeLabels[selectedMode]}`}
            >
        <span
            className={styles.selectedModeIcon}
            aria-hidden="true"
        >
          {selectedMode === "from-zero" ? (
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
              >
                  <path
                      d="M5 19V8M12 19V4M19 19v-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                  />

                  <path
                      d="m4 9 7-6 8 8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
              </svg>
          ) : (
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
              >
                  <path
                      d="M4 18V6M4 18h16"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                  />

                  <path
                      d="m7 15 4-4 3 2 5-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />

                  <path
                      d="M16 7h3v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
              </svg>
          )}
        </span>

                <span className={styles.selectedModeCopy}>
          <small>SHAXSIY YO‘NALISH</small>

          <strong>
            {roadmapModeLabels[selectedMode]}
          </strong>
        </span>

                <span
                    className={styles.selectedModeCheck}
                    aria-hidden="true"
                >
          ✓
        </span>
            </div>
        </nav>
    );
}