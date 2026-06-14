import {
  FlightPlan,
  FlightPlanNavState,
  Waypoint,
  WaypointStatus,
} from "@/app/types/flightPlan";
import { MapCoordinate } from "@/app/types/telemetry";

const EARTH_RADIUS_M = 6371000;
const WAYPOINT_CAPTURE_RADIUS_M = 80;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function haversineDistance(
  a: MapCoordinate,
  b: MapCoordinate,
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function bearing(from: MapCoordinate, to: MapCoordinate): number {
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function normalizeAngle(deg: number) {
  return ((deg + 180) % 360) - 180;
}

/** Signed cross-track error in metres (positive = right of track). */
export function crossTrackErrorMeters(
  position: MapCoordinate,
  from: MapCoordinate,
  to: MapCoordinate,
): number {
  const track = bearing(from, to);
  const distFromStart = haversineDistance(from, position);

  const bearingFromStart = bearing(from, position);
  const angleDiff = toRad(normalizeAngle(bearingFromStart - track));

  return distFromStart * Math.sin(angleDiff);
}

/** Distance along the active leg from the leg origin, in metres. */
export function alongTrackDistanceMeters(
  position: MapCoordinate,
  from: MapCoordinate,
  to: MapCoordinate,
): number {
  const track = bearing(from, to);
  const trackRad = toRad(track);
  const distFromStart = haversineDistance(from, position);
  const bearingFromStart = bearing(from, position);
  const angleDiff = toRad(normalizeAngle(bearingFromStart - track));

  return distFromStart * Math.cos(angleDiff);
}

/** Move from origin along bearing for distance metres. */
export function destinationPoint(
  origin: MapCoordinate,
  bearingDeg: number,
  distanceM: number,
): MapCoordinate {
  const angularDistance = distanceM / EARTH_RADIUS_M;
  const bearingRad = toRad(bearingDeg);
  const lat1 = toRad(origin.latitude);
  const lon1 = toRad(origin.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return { latitude: toDeg(lat2), longitude: toDeg(lon2) };
}

/** Closest point on the leg line and signed cross-track error. */
export function getTrackProjection(
  position: MapCoordinate,
  from: MapCoordinate,
  to: MapCoordinate,
) {
  const track = bearing(from, to);
  const alongTrack = alongTrackDistanceMeters(position, from, to);
  const crossTrackError = crossTrackErrorMeters(position, from, to);
  const clampedAlong = Math.max(0, Math.min(alongTrack, haversineDistance(from, to)));
  const trackPoint = destinationPoint(from, track, clampedAlong);

  return { trackPoint, crossTrackError, alongTrack: clampedAlong, track };
}

function getActiveLegIndex(position: MapCoordinate, waypoints: Waypoint[]) {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const distToEnd = haversineDistance(position, waypoints[i + 1].position);
    if (distToEnd > WAYPOINT_CAPTURE_RADIUS_M) {
      return i;
    }
  }
  return Math.max(0, waypoints.length - 2);
}

function getWaypointStatuses(
  activeLegIndex: number,
  isComplete: boolean,
  count: number,
): WaypointStatus[] {
  return Array.from({ length: count }, (_, i) => {
    if (isComplete) return "completed";
    if (i < activeLegIndex) return "completed";
    if (i === activeLegIndex) return "active";
    if (i === activeLegIndex + 1) return "next";
    return "pending";
  });
}

export function computeFlightPlanNavState(
  flightPlan: FlightPlan,
  position: MapCoordinate,
  heading: number,
): FlightPlanNavState {
  const { waypoints } = flightPlan;
  const lastWaypoint = waypoints[waypoints.length - 1];
  const distToFinal = haversineDistance(position, lastWaypoint.position);
  const isComplete = distToFinal <= WAYPOINT_CAPTURE_RADIUS_M;

  const activeLegIndex = isComplete
    ? waypoints.length - 2
    : getActiveLegIndex(position, waypoints);

  const fromWaypoint = waypoints[activeLegIndex];
  const toWaypoint = waypoints[activeLegIndex + 1];
  const legDistance = haversineDistance(
    fromWaypoint.position,
    toWaypoint.position,
  );
  const desiredTrack = bearing(fromWaypoint.position, toWaypoint.position);
  const distanceToNext = haversineDistance(position, toWaypoint.position);
  const alongTrack = alongTrackDistanceMeters(
    position,
    fromWaypoint.position,
    toWaypoint.position,
  );
  const legProgress =
    legDistance > 0
      ? Math.min(100, Math.max(0, (alongTrack / legDistance) * 100))
      : 100;

  const totalRouteDistance = waypoints
    .slice(0, -1)
    .reduce(
      (sum, wp, i) =>
        sum + haversineDistance(wp.position, waypoints[i + 1].position),
      0,
    );

  const completedDistance = waypoints
    .slice(0, activeLegIndex)
    .reduce(
      (sum, wp, i) =>
        sum + haversineDistance(wp.position, waypoints[i + 1].position),
      0,
    );

  const routeProgress =
    totalRouteDistance > 0
      ? Math.min(
          100,
          ((completedDistance + Math.max(0, alongTrack)) / totalRouteDistance) *
            100,
        )
      : 100;

  return {
    activeLegIndex,
    fromWaypoint,
    toWaypoint,
    desiredTrack,
    distanceToNext,
    legDistance,
    legProgress,
    crossTrackError: crossTrackErrorMeters(
      position,
      fromWaypoint.position,
      toWaypoint.position,
    ),
    headingError: normalizeAngle(heading - desiredTrack),
    routeProgress: isComplete ? 100 : routeProgress,
    isComplete,
    waypointStatuses: getWaypointStatuses(
      activeLegIndex,
      isComplete,
      waypoints.length,
    ),
  };
}

export function getFlightPlanRoute(
  flightPlan: FlightPlan,
): [number, number][] {
  return flightPlan.waypoints.map((wp) => [
    wp.position.latitude,
    wp.position.longitude,
  ]);
}

export function getTotalRouteDistance(flightPlan: FlightPlan): number {
  return flightPlan.waypoints
    .slice(0, -1)
    .reduce(
      (sum, wp, i) =>
        sum +
        haversineDistance(
          wp.position,
          flightPlan.waypoints[i + 1].position,
        ),
      0,
    );
}
