"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UAVTelemetry } from "@/app/types/telemetry";
import { FlightPlan, FlightPlanNavState } from "@/app/types/flightPlan";
import { getFlightPlanRoute, getTrackProjection } from "@/app/lib/flightPlanNav";

function createWaypointIcon(id: string, status: "completed" | "active" | "next" | "pending") {
  const colors = {
    completed: { bg: "#22c55e", border: "#fff" },
    active: { bg: "#fbbf24", border: "#fff" },
    next: { bg: "#3b82f6", border: "#93c5fd" },
    pending: { bg: "#4b5563", border: "#9ca3af" },
  };
  const { bg, border } = colors[status];

  return L.divIcon({
    className: "flight-map-waypoint-icon",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid ${border};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: bold;
        font-family: monospace;
        color: #000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      ">${id.replace("WP", "")}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createAircraftIcon(heading: number) {
  return L.divIcon({
    className: "flight-map-aircraft-icon",
    html: `
      <div style="
        transform: rotate(${heading}deg);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));
      ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="#fbbf24" stroke="#fff" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function MapFollower({
  latitude,
  longitude,
  follow,
}: {
  latitude: number;
  longitude: number;
  follow: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (follow) {
      map.panTo([latitude, longitude], { animate: true, duration: 0.4 });
    }
  }, [latitude, longitude, map, follow]);

  return null;
}

function MapInteractionHandler({
  onUserInteraction,
}: {
  onUserInteraction: () => void;
}) {
  useMapEvents({
    dragstart: onUserInteraction,
    zoomstart: onUserInteraction,
  });
  return null;
}

interface FlightMapProps {
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

export function FlightMap({
  latitude,
  longitude,
  heading,
  speed,
  altitude,
  history = [],
  crossTrackError = 0,
  flightPlan,
  navState,
  className = "",
}: FlightMapProps) {
  const initialCenter = useRef<[number, number]>([latitude, longitude]);
  const [followAircraft, setFollowAircraft] = useState(false);

  const flightPath = useMemo(
    () =>
      history.map(
        (point) =>
          [point.mapState.latitude, point.mapState.longitude] as [number, number],
      ),
    [history],
  );

  const aircraftIcon = useMemo(
    () => createAircraftIcon(heading),
    [heading],
  );

  const plannedRoute = useMemo(
    () => (flightPlan ? getFlightPlanRoute(flightPlan) : []),
    [flightPlan],
  );

  const activeLegRoute = useMemo(() => {
    if (!navState) return [];
    return [
      [
        navState.fromWaypoint.position.latitude,
        navState.fromWaypoint.position.longitude,
      ],
      [
        navState.toWaypoint.position.latitude,
        navState.toWaypoint.position.longitude,
      ],
    ] as [number, number][];
  }, [navState]);

  const trackDeviation = useMemo(() => {
    if (!navState) return null;
    const position = { latitude, longitude };
    const projection = getTrackProjection(
      position,
      navState.fromWaypoint.position,
      navState.toWaypoint.position,
    );
    return {
      ...projection,
      deviationLine: [
        [projection.trackPoint.latitude, projection.trackPoint.longitude],
        [latitude, longitude],
      ] as [number, number][],
    };
  }, [latitude, longitude, navState]);

  const xtk = navState?.crossTrackError ?? crossTrackError;
  const xtkSeverity =
    Math.abs(xtk) >= 90 ? "critical" : Math.abs(xtk) >= 60 ? "warning" : "normal";

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gray-700 ${className}`}
    >
      {/* HUD overlay */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none space-y-1">
        <div
          className="px-3 py-2 rounded-md text-xs font-mono backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Position
          </div>
          <div className="text-white">
            {latitude.toFixed(6)}° N
          </div>
          <div className="text-white">
            {longitude.toFixed(6)}° E
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[1000] pointer-events-none">
        <div
          className="px-3 py-2 rounded-md text-xs font-mono backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-400">HDG</span>
            <span className="text-amber-400 font-bold text-right">
              {Math.round(heading).toString().padStart(3, "0")}°
            </span>
            <span className="text-gray-400">SPD</span>
            <span className="text-green-400 font-bold text-right">
              {speed.toFixed(1)} m/s
            </span>
            <span className="text-gray-400">ALT</span>
            <span className="text-blue-400 font-bold text-right">
              {altitude.toFixed(0)} m
            </span>
            <span className="text-gray-400">XTK</span>
            <span
              className={`font-bold text-right ${
                xtkSeverity === "critical"
                  ? "text-red-400"
                  : xtkSeverity === "warning"
                    ? "text-yellow-400"
                    : "text-white"
              }`}
            >
              {xtk >= 0 ? "+" : ""}
              {xtk.toFixed(1)} m
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none flex gap-2">
        <div
          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          Moving Map
        </div>
        {flightPlan && (
          <div
            className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-cyan-400"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            {flightPlan.id}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 right-3 z-[1000]">
        <button
          type="button"
          onClick={() => setFollowAircraft((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
            followAircraft
              ? "bg-amber-500/90 text-black"
              : "bg-black/60 text-gray-300 hover:bg-black/80"
          }`}
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
        >
          {followAircraft ? "Following" : "Follow AC"}
        </button>
      </div>

      <MapContainer
        center={initialCenter.current}
        zoom={14}
        scrollWheelZoom
        dragging
        touchZoom
        doubleClickZoom
        boxZoom
        keyboard
        className="h-full w-full z-0"
        style={{ height: "100%", minHeight: 420, background: "#0a0a0a" }}
      >
        <MapInteractionHandler onUserInteraction={() => setFollowAircraft(false)} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {plannedRoute.length > 1 && (
          <Polyline
            positions={plannedRoute}
            pathOptions={{
              color: "#06b6d4",
              weight: 3,
              opacity: 0.85,
            }}
          />
        )}

        {activeLegRoute.length === 2 && (
          <Polyline
            positions={activeLegRoute}
            pathOptions={{
              color: "#fbbf24",
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {flightPlan?.waypoints.map((wp, i) => {
          const status = navState?.waypointStatuses[i] ?? "pending";
          return (
            <Marker
              key={wp.id}
              position={[wp.position.latitude, wp.position.longitude]}
              icon={createWaypointIcon(wp.id, status)}
            />
          );
        })}

        {trackDeviation && Math.abs(trackDeviation.crossTrackError) > 2 && (
          <>
            <Polyline
              positions={trackDeviation.deviationLine}
              pathOptions={{
                color:
                  xtkSeverity === "critical"
                    ? "#ef4444"
                    : xtkSeverity === "warning"
                      ? "#eab308"
                      : "#a855f7",
                weight: 2,
                opacity: 0.9,
                dashArray: "4 6",
              }}
            />
            <Circle
              center={[
                trackDeviation.trackPoint.latitude,
                trackDeviation.trackPoint.longitude,
              ]}
              radius={6}
              pathOptions={{
                color: "#22c55e",
                weight: 2,
                fillColor: "#22c55e",
                fillOpacity: 0.9,
              }}
            />
          </>
        )}

        {flightPath.length > 1 && (
          <Polyline
            positions={flightPath}
            pathOptions={{
              color: "#22c55e",
              weight: 2,
              opacity: 0.7,
              dashArray: "6 4",
            }}
          />
        )}

        <Marker position={[latitude, longitude]} icon={aircraftIcon} />

        <MapFollower
          latitude={latitude}
          longitude={longitude}
          follow={followAircraft}
        />
      </MapContainer>
    </div>
  );
}
