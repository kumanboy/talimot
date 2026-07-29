import { describe, expect, it } from "vitest";

import {
  createRoadmapRoute,
  defaultRoadmapRouteState,
  parseRoadmapRoute,
} from "./routes";
import type { RoadmapRouteState } from "./types";

const canonicalRoutes = [
  [
    { mode: "from-zero", view: "full" },
    "/yol-xaritasi?mode=from-zero&view=full",
  ],
  [
    { mode: "from-zero", view: "week" },
    "/yol-xaritasi?mode=from-zero&view=week",
  ],
  [
    { mode: "from-zero", view: "results" },
    "/yol-xaritasi?mode=from-zero&view=results",
  ],
  [
    { mode: "boost", view: "full" },
    "/yol-xaritasi?mode=boost&view=full",
  ],
  [
    { mode: "boost", view: "week" },
    "/yol-xaritasi?mode=boost&view=week",
  ],
  [
    { mode: "boost", view: "results" },
    "/yol-xaritasi?mode=boost&view=results",
  ],
] as const satisfies readonly (readonly [RoadmapRouteState, string])[];

describe("canonical roadmap routes", () => {
  it.each(canonicalRoutes)(
    "creates and parses $mode / $view",
    (state, route) => {
      expect(createRoadmapRoute(state)).toBe(route);
      expect(parseRoadmapRoute(route)).toEqual(state);
    },
  );
});

describe("safe roadmap route defaults", () => {
  it.each([
    "/boshqa?mode=boost&view=results",
    "not a valid roadmap route",
  ])("returns the approved default for an unrelated path: %s", (route) => {
    expect(parseRoadmapRoute(route)).toBe(defaultRoadmapRouteState);
  });

  it("returns the approved values when both parameters are missing", () => {
    expect(parseRoadmapRoute("/yol-xaritasi")).toEqual({
      mode: "from-zero",
      view: "full",
    });
  });

  it("ignores unrelated parameters before and after valid parameters", () => {
    expect(
      parseRoadmapRoute(
        "/yol-xaritasi?mode=boost&view=week&utm_source=telegram",
      ),
    ).toEqual({ mode: "boost", view: "week" });
    expect(
      parseRoadmapRoute(
        "/yol-xaritasi?ref=onboarding&mode=from-zero&view=results",
      ),
    ).toEqual({ mode: "from-zero", view: "results" });
  });

  it("falls back invalid or missing parameters independently", () => {
    expect(
      parseRoadmapRoute("/yol-xaritasi?mode=boost&view=unknown"),
    ).toEqual({ mode: "boost", view: "full" });
    expect(
      parseRoadmapRoute("/yol-xaritasi?mode=unknown&view=week"),
    ).toEqual({ mode: "from-zero", view: "week" });
    expect(
      parseRoadmapRoute("/yol-xaritasi?mode=unknown&view=unknown"),
    ).toEqual({ mode: "from-zero", view: "full" });
    expect(parseRoadmapRoute("/yol-xaritasi?mode=boost")).toEqual({
      mode: "boost",
      view: "full",
    });
    expect(parseRoadmapRoute("/yol-xaritasi?view=results")).toEqual({
      mode: "from-zero",
      view: "results",
    });
  });

  it("uses the first repeated mode and view values deterministically", () => {
    expect(
      parseRoadmapRoute(
        "/yol-xaritasi?mode=boost&mode=from-zero&view=week&view=results",
      ),
    ).toEqual({ mode: "boost", view: "week" });
    expect(
      parseRoadmapRoute(
        "/yol-xaritasi?mode=unknown&mode=boost&view=invalid&view=results",
      ),
    ).toEqual({ mode: "from-zero", view: "full" });
  });

  it("treats empty mode and view values as independently invalid", () => {
    expect(parseRoadmapRoute("/yol-xaritasi?mode=&view=week")).toEqual({
      mode: "from-zero",
      view: "week",
    });
    expect(parseRoadmapRoute("/yol-xaritasi?mode=boost&view=")).toEqual({
      mode: "boost",
      view: "full",
    });
  });

  it("safely parses malformed but URL-parseable unrelated query text", () => {
    expect(
      parseRoadmapRoute("/yol-xaritasi?mode=boost&view=results&broken=%"),
    ).toEqual({ mode: "boost", view: "results" });
  });

  it("does not throw when unrelated parameters are present", () => {
    expect(() =>
      parseRoadmapRoute(
        "/yol-xaritasi?ref=onboarding&mode=boost&view=full&utm_source=test",
      ),
    ).not.toThrow();
  });

  it("exports an immutable default route state", () => {
    expect(Object.isFrozen(defaultRoadmapRouteState)).toBe(true);
  });
});
