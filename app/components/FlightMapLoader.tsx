"use client";

import dynamic from "next/dynamic";
import { UAVTelemetry } from "@/app/types/telemetry";
import { FlightPlan, FlightPlanNavState } from "@/app/types/flightPlan";

const FlightMap = dynamic(
  () => import("@/app/components/FlightMap").then((mod) => mod.FlightMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-lg border border-gray-700 bg-gray-800 animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500 font-medium">Loading map…</span>
      </div>
    ),
  },
);

interface FlightMapLoaderProps {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  altitude: number;
  history?: UAVTelemetry[];
  crossTrackError?: number;
  flightPlan?: FlightPlan;
  navState?: FlightPlanNavState;
  className?: string;
}

export function FlightMapLoader(props: FlightMapLoaderProps) {
  return <FlightMap {...props} />;
}
