import { notFound } from "next/navigation";

import { BoostFullRoadmap } from "@/features/roadmap/components/boost-full-roadmap";
import { FromZeroFullRoadmap } from "@/features/roadmap/components/from-zero-full-roadmap";
import { RoadmapLegacyAttemptSync } from "@/features/roadmap/components/roadmap-legacy-attempt-sync";
import { getStudentRoadmapData } from "@/features/roadmap/server/get-student-roadmap-data";
import {
  parseRoadmapRoute,
  ROADMAP_PATH,
} from "@/features/roadmap/model/routes";

type RoadmapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function createRouteFromSearchParams(
    searchParams: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value !== undefined) {
      query.append(key, value);
    }
  }

  const serializedQuery = query.toString();

  return serializedQuery
      ? `${ROADMAP_PATH}?${serializedQuery}`
      : ROADMAP_PATH;
}

export default async function RoadmapPage({
                                            searchParams,
                                          }: RoadmapPageProps) {
  const routeState = parseRoadmapRoute(
      createRouteFromSearchParams(await searchParams),
  );

  if (routeState.view !== "full") {
    notFound();
  }

  const data = await getStudentRoadmapData();

  return (
      <>
        <RoadmapLegacyAttemptSync />
        {routeState.mode === "boost" ? (
            <BoostFullRoadmap data={data} />
        ) : (
            <FromZeroFullRoadmap data={data} />
        )}
      </>
  );
}