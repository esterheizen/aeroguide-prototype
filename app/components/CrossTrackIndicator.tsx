"use client";

import { motion } from "framer-motion";

interface CrossTrackIndicatorProps {
  crossTrackError: number;
  headingError?: number;
  maxError?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

function getStatus(
  abs: number,
  warning: number,
  critical: number,
): "normal" | "warning" | "critical" {
  if (abs >= critical) return "critical";
  if (abs >= warning) return "warning";
  return "normal";
}

/**
 * Course Deviation Indicator — lateral offset from the active leg centreline.
 */
export function CrossTrackIndicator({
  crossTrackError,
  headingError,
  maxError = 90,
  warningThreshold = 60,
  criticalThreshold = 90,
}: CrossTrackIndicatorProps) {
  const clamped = Math.max(-maxError, Math.min(maxError, crossTrackError));
  const needlePercent = 50 + (clamped / maxError) * 50;
  const absError = Math.abs(crossTrackError);
  const status = getStatus(absError, warningThreshold, criticalThreshold);

  const needleColor =
    status === "critical"
      ? "#ef4444"
      : status === "warning"
        ? "#eab308"
        : "#22c55e";

  return (
    <div
      className="rounded-lg border border-gray-700 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)",
      }}
    >
      <div className="px-3 py-2 border-b border-gray-700/70 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Cross-Track Deviation
        </span>
        <motion.span
          className="text-xs font-mono font-bold tabular-nums"
          animate={{ color: needleColor }}
          transition={{ duration: 0.3 }}
        >
          {crossTrackError >= 0 ? "+" : ""}
          {crossTrackError.toFixed(1)} m
        </motion.span>
      </div>

      <div className="px-4 py-4">
        {/* CDI scale */}
        <div className="relative h-10 rounded-md overflow-hidden border border-gray-700 bg-black/40">
          {/* Warning zones */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              width: `${((maxError - warningThreshold) / maxError) * 50}%`,
              background: "rgba(239, 68, 68, 0.08)",
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{
              width: `${((maxError - warningThreshold) / maxError) * 50}%`,
              background: "rgba(239, 68, 68, 0.08)",
            }}
          />
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${((maxError - warningThreshold) / maxError) * 50}%`,
              width: `${(warningThreshold / maxError) * 50}%`,
              background: "rgba(234, 179, 8, 0.06)",
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{
              width: `${(warningThreshold / maxError) * 50}%`,
              background: "rgba(234, 179, 8, 0.06)",
            }}
          />

          {/* Centre line / on-track */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-green-500/80" />

          {/* Tick marks */}
          {[-60, -30, 30, 60].map((tick) => (
            <div
              key={tick}
              className="absolute top-1 bottom-1 w-px bg-gray-600/80"
              style={{ left: `${50 + (tick / maxError) * 50}%` }}
            />
          ))}

          {/* Deviation needle */}
          <motion.div
            className="absolute top-1 bottom-1 w-1 -translate-x-1/2 rounded-full shadow-lg"
            style={{ boxShadow: `0 0 8px ${needleColor}`, backgroundColor: needleColor }}
            animate={{
              left: `${needlePercent}%`,
              scale: status === "critical" ? [1, 1.2, 1] : 1,
            }}
            transition={{
              left: { type: "spring", stiffness: 70, damping: 16 },
              scale: {
                duration: 0.6,
                repeat: status === "critical" ? Infinity : 0,
              },
            }}
          />
        </div>

        <div className="flex justify-between mt-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
          <span>Left</span>
          <span className="text-green-500/80">On Track</span>
          <span>Right</span>
        </div>

        {headingError !== undefined && (
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">Heading error</span>
            <motion.span
              className="font-bold tabular-nums"
              animate={{
                color:
                  Math.abs(headingError) >= 20
                    ? "#ef4444"
                    : Math.abs(headingError) >= 10
                      ? "#eab308"
                      : "#ffffff",
              }}
            >
              {headingError >= 0 ? "+" : ""}
              {headingError.toFixed(1)}°
            </motion.span>
          </div>
        )}
      </div>
    </div>
  );
}
