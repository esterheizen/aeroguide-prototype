"use client";

import { useEffect, useMemo } from "react";
import { useTelemetry } from "@/app/hooks/useTelemetry";
import {
  Gauge,
  StatusIndicator,
  Compass,
} from "@/app/components/TelemetryDisplay";
import {
  LocationCard,
  ControlCommandDisplay,
} from "@/app/components/TelemetryAlerts";
import { TelemetryOverviewPanel } from "@/app/components/EventHorizonIndicator";
import { PrimaryFlightDisplay } from "@/app/components/FlightInstruments";
import { FlightMapLoader } from "@/app/components/FlightMapLoader";
import { FlightPlanDisplay } from "@/app/components/FlightPlanDisplay";
import { ErrorLogPanel } from "@/app/components/ErrorLogPanel";
import { DEFAULT_FLIGHT_PLAN } from "@/app/data/defaultFlightPlan";
import { computeFlightPlanNavState } from "@/app/lib/flightPlanNav";
import { collectActiveTelemetryErrors } from "@/app/lib/collectTelemetryErrors";
import { useErrorLog } from "@/app/hooks/useErrorLog";

export default function Dashboard() {
  const { telemetry, history, isConnected, connect, disconnect } = useTelemetry(500);

  const navState = useMemo(
    () =>
      computeFlightPlanNavState(
        DEFAULT_FLIGHT_PLAN,
        telemetry.mapState,
        telemetry.heading,
      ),
    [telemetry.mapState, telemetry.heading],
  );

  const activeErrors = useMemo(
    () => collectActiveTelemetryErrors(telemetry, isConnected, navState),
    [telemetry, isConnected, navState],
  );

  const errorLog = useErrorLog(activeErrors);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  const behaviorModeColors = {
    idle: "info" as const,
    cruise: "normal" as const,
    climb: "warning" as const,
    descent: "warning" as const,
    landing: "alert" as const,
    emergency: "alert" as const,
  };

  return (
    <>

      <ErrorLogPanel errors={errorLog} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 pb-32">
        <div className="max-w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">
                AI Model Evaluation
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-sm font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div>
            Inputs
          </div>

          <div>
            Outputs
          </div>
        </div>
      </div>
    </>
  );
}
