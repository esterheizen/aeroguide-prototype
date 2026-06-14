"use client";

import { motion } from "framer-motion";
import { FlightPlan, FlightPlanNavState } from "@/app/types/flightPlan";
import { getTotalRouteDistance } from "@/app/lib/flightPlanNav";
import { CrossTrackIndicator } from "@/app/components/CrossTrackIndicator";

interface FlightPlanDisplayProps {
  flightPlan: FlightPlan;
  navState: FlightPlanNavState;
}

const statusStyles = {
  completed: {
    dot: "bg-green-500",
    row: "opacity-60",
    label: "DONE",
    labelColor: "text-green-400",
  },
  active: {
    dot: "bg-amber-400 animate-pulse",
    row: "bg-amber-400/10 border-amber-400/40",
    label: "ACTIVE",
    labelColor: "text-amber-400",
  },
  next: {
    dot: "bg-blue-400",
    row: "border-blue-400/20",
    label: "NEXT",
    labelColor: "text-blue-400",
  },
  pending: {
    dot: "bg-gray-600",
    row: "opacity-70",
    label: "",
    labelColor: "text-gray-500",
  },
};

function formatDistance(meters: number) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(0)} m`;
}

export function FlightPlanDisplay({
  flightPlan,
  navState,
}: FlightPlanDisplayProps) {
  const totalDistance = getTotalRouteDistance(flightPlan);

  return (
    <div
      className="rounded-lg border border-gray-700 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Flight Plan
          </div>
          <div className="text-sm font-bold text-white">{flightPlan.name}</div>
          <div className="text-xs font-mono text-gray-400">{flightPlan.id}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Route
          </div>
          <div className="text-sm font-mono font-bold text-cyan-400">
            {formatDistance(totalDistance)}
          </div>
        </div>
      </div>

      {/* Active leg */}
      <div className="px-4 py-3 border-b border-gray-700/70 bg-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Active Leg {navState.activeLegIndex + 1}
          </span>
          {navState.isComplete ? (
            <span className="text-xs font-bold text-green-400">ROUTE COMPLETE</span>
          ) : (
            <span className="text-xs font-mono text-gray-400">
              {navState.legProgress.toFixed(0)}% leg
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-amber-400 font-bold">
            {navState.fromWaypoint.id}
          </span>
          <span className="text-gray-600">→</span>
          <span className="text-blue-400 font-bold">{navState.toWaypoint.id}</span>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <div className="text-gray-500">DTK</div>
            <div className="text-white font-bold">
              {Math.round(navState.desiredTrack).toString().padStart(3, "0")}°
            </div>
          </div>
          <div>
            <div className="text-gray-500">DIST</div>
            <div className="text-white font-bold">
              {formatDistance(navState.distanceToNext)}
            </div>
          </div>
          <div>
            <div className="text-gray-500">XTK</div>
            <div
              className={`font-bold ${Math.abs(navState.crossTrackError) > 30 ? "text-red-400" : "text-white"}`}
            >
              {navState.crossTrackError >= 0 ? "+" : ""}
              {navState.crossTrackError.toFixed(0)} m
            </div>
          </div>
        </div>

        {/* Route progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Route progress</span>
            <span>{navState.routeProgress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #22c55e, #06b6d4)",
              }}
              animate={{ width: `${navState.routeProgress}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* Cross-track CDI */}
      <div className="px-4 py-3 border-b border-gray-700/70">
        <CrossTrackIndicator
          crossTrackError={navState.crossTrackError}
          headingError={navState.headingError}
        />
      </div>

      {/* Waypoint list */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900/95 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left font-bold">WP</th>
              <th className="px-3 py-2 text-left font-bold">Name</th>
              <th className="px-3 py-2 text-right font-bold">Alt</th>
              <th className="px-3 py-2 text-right font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {flightPlan.waypoints.map((wp, i) => {
              const status = navState.waypointStatuses[i];
              const styles = statusStyles[status];

              return (
                <tr
                  key={wp.id}
                  className={`border-t border-gray-800 ${styles.row}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                      <span className="font-mono font-bold text-white">
                        {wp.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-300">{wp.name}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-gray-400">
                    {wp.altitude} m
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-bold ${styles.labelColor}`}
                  >
                    {styles.label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
