"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TelemetryErrorEntry } from "@/app/lib/collectTelemetryErrors";

interface ErrorLogPanelProps {
  errors: TelemetryErrorEntry[];
}

const severityStyles = {
  critical: {
    border: "border-red-500/60",
    bg: "bg-red-950/90",
    badge: "bg-red-500 text-white",
    dot: "bg-red-500",
  },
  warning: {
    border: "border-yellow-500/50",
    bg: "bg-yellow-950/80",
    badge: "bg-yellow-500 text-black",
    dot: "bg-yellow-500",
  },
  info: {
    border: "border-blue-500/40",
    bg: "bg-blue-950/80",
    badge: "bg-blue-500 text-white",
    dot: "bg-blue-500",
  },
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ErrorLogPanel({ errors }: ErrorLogPanelProps) {
  const activeCount = errors.filter((e) => e.active).length;

  return (
    <div
      className="fixed bottom-4 left-4 z-[2000] w-[min(100vw-2rem,24rem)] flex flex-col rounded-lg border border-gray-700 shadow-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(15,15,26,0.97) 0%, rgba(10,10,18,0.98) 100%)",
        backdropFilter: "blur(12px)",
        maxHeight: "min(50vh, 22rem)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/80 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-red-500 animate-pulse" : "bg-gray-600"}`}
          />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
            System Errors
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
              {activeCount} active
            </span>
          )}
          <span className="text-gray-500">{errors.length} total</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0">
        {errors.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-500">
            No errors recorded
          </div>
        ) : (
          <ul className="divide-y divide-gray-800/80">
            <AnimatePresence initial={false}>
              {errors.map((error) => {
                const styles = severityStyles[error.severity];
                return (
                  <motion.li
                    key={error.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-3 py-2.5 border-l-2 ${styles.border} ${error.active ? styles.bg : "bg-gray-900/40 opacity-75"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot} ${error.active ? "animate-pulse" : "opacity-40"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className={`text-xs font-bold truncate ${error.active ? "text-white" : "text-gray-400"}`}
                          >
                            {error.title}
                          </span>
                          <span
                            className={`shrink-0 text-[9px] font-bold uppercase px-1 py-0.5 rounded ${styles.badge} ${!error.active ? "opacity-50" : ""}`}
                          >
                            {error.severity}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] leading-snug ${error.active ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {error.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-500">
                          <span>{formatTime(error.timestamp)}</span>
                          {error.active ? (
                            <span className="text-red-400 font-bold">ACTIVE</span>
                          ) : error.clearedAt ? (
                            <span>Cleared {formatTime(error.clearedAt)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
