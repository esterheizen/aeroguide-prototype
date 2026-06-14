"use client";

import { useEffect, useState } from "react";
import {
  ActiveTelemetryError,
  TelemetryErrorEntry,
} from "@/app/lib/collectTelemetryErrors";

/**
 * Accumulates telemetry errors into a persistent log.
 * Entries are never removed — cleared conditions are marked inactive but stay visible.
 */
export function useErrorLog(activeErrors: ActiveTelemetryError[]) {
  const [errorLog, setErrorLog] = useState<TelemetryErrorEntry[]>([]);

  useEffect(() => {
    setErrorLog((prev) => {
      const activeKeys = new Set(activeErrors.map((e) => e.key));
      const now = Date.now();

      let next = prev.map((entry) => {
        if (entry.active && !activeKeys.has(entry.key)) {
          return { ...entry, active: false, clearedAt: now };
        }
        return entry;
      });

      for (const err of activeErrors) {
        const activeEntry = next.find((e) => e.key === err.key && e.active);
        if (activeEntry) {
          next = next.map((e) =>
            e.key === err.key && e.active
              ? { ...e, message: err.message, timestamp: err.timestamp }
              : e,
          );
          continue;
        }

        const reactivatedIdx = next.findIndex(
          (e) => e.key === err.key && !e.active,
        );
        if (reactivatedIdx >= 0) {
          next = next.map((e, i) =>
            i === reactivatedIdx
              ? {
                  ...e,
                  active: true,
                  clearedAt: undefined,
                  message: err.message,
                  timestamp: err.timestamp,
                  severity: err.severity,
                  title: err.title,
                }
              : e,
          );
          continue;
        }

        if (!next.some((e) => e.key === err.key && e.active)) {
          next = [
            {
              id: `${err.key}-${err.timestamp}`,
              key: err.key,
              severity: err.severity,
              title: err.title,
              message: err.message,
              timestamp: err.timestamp,
              active: true,
            },
            ...next,
          ];
        }
      }

      return next;
    });
  }, [activeErrors]);

  return errorLog;
}
