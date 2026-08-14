import {
  roadmapModes,
  roadmapViews,
  type RoadmapMode,
  type RoadmapRouteState,
  type RoadmapView,
} from "./types";

export const ROADMAP_PATH = "/yol-xaritasi";

export const defaultRoadmapRouteState: RoadmapRouteState = Object.freeze({
  mode: "from-zero",
  view: "full",
});

function isRoadmapMode(value: string | null): value is RoadmapMode {
  return roadmapModes.some((mode) => mode === value);
}

function isRoadmapView(value: string | null): value is RoadmapView {
  return roadmapViews.some((view) => view === value);
}

export function createRoadmapRoute(state: RoadmapRouteState): string {
  const searchParams = new URLSearchParams({
    mode: state.mode,
    view: state.view,
  });

  return `${ROADMAP_PATH}?${searchParams.toString()}`;
}

export function parseRoadmapRoute(route: string): RoadmapRouteState {
  let url: URL;

  try {
    url = new URL(route, "https://talimot.local");
  } catch {
    return defaultRoadmapRouteState;
  }

  if (url.pathname !== ROADMAP_PATH) {
    return defaultRoadmapRouteState;
  }

  const modeValue = url.searchParams.get("mode");
  const viewValue = url.searchParams.get("view");
  const mode = isRoadmapMode(modeValue)
    ? modeValue
    : defaultRoadmapRouteState.mode;
  const view = isRoadmapView(viewValue)
    ? viewValue
    : defaultRoadmapRouteState.view;

  return Object.freeze({ mode, view });
}
