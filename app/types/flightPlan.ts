import { MapCoordinate } from "@/app/types/telemetry";

export interface Waypoint {
  id: string;
  name: string;
  position: MapCoordinate;
  altitude: number;
  type?: "departure" | "enroute" | "approach" | "arrival";
}

export interface FlightPlan {
  id: string;
  name: string;
  waypoints: Waypoint[];
}

export type WaypointStatus = "completed" | "active" | "next" | "pending";

export interface FlightPlanNavState {
  activeLegIndex: number;
  fromWaypoint: Waypoint;
  toWaypoint: Waypoint;
  desiredTrack: number;
  distanceToNext: number;
  legDistance: number;
  legProgress: number;
  crossTrackError: number;
  headingError: number;
  routeProgress: number;
  isComplete: boolean;
  waypointStatuses: WaypointStatus[];
}
