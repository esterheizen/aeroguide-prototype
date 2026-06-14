"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [latitude, setLatitude] = useState("");
const [longitude, setLongitude] = useState("");
const [started, setStarted] = useState(false);

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
  if (!started) return;

  connect();

  return () => {
    disconnect();
  };
}, [started]);

  const behaviorModeColors = {
    idle: "info" as const,
    cruise: "normal" as const,
    climb: "warning" as const,
    descent: "warning" as const,
    landing: "alert" as const,
    emergency: "alert" as const,
  };

    const getDecisionOutput = () => {
  if (telemetry.behaviourMode === "emergency") {
    return "Emergency Response";
  }

  if (telemetry.disturbanceDetected) {
    return "Correct Trajectory";
  }

  if (Math.abs(telemetry.crossTrackError) > 20) {
    return "Change Trajectory";
  }

  if (telemetry.behaviourMode === "landing") {
    return "Prepare Landing";
  }

  if (telemetry.behaviourMode === "climb") {
    return "Climb";
  }

  if (telemetry.behaviourMode === "descent") {
    return "Descend";
  }

  if (telemetry.behaviourMode === "idle") {
    return "Hold Position";
  }

  return "Continue Flight";
};

  const handleStart = () => {
  if (!latitude || !longitude) {
    alert("Please enter both coordinates");
    return;
  }



  console.log("Got coordinates:", {
    latitude: Number(latitude),
    longitude: Number(longitude),
  });

  setStarted(true);
};

if (!started) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">
          Enter Start Coordinates
        </h2>

        <div className="space-y-4">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
          >
            Start AeroGuide AI
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <>

    
      {/* <ErrorLogPanel errors={errorLog} /> */}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 pb-32">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              UAV 6-Axis Telemetry Dashboard
              <p className="text-green-400 mt-1">
  Got coordinates: {latitude}, {longitude}
</p>
            </h1>
            <p className="text-gray-400 mt-1">
              Real-time simulation monitoring
            </p>
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
{/* Decision Model */}
<div className="mb-8">
  <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
    <h2 className="text-xl font-bold mb-6">
      Model Decisions
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div>
        <h3 className="text-blue-400 font-semibold mb-4">
          Inputs
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Latitude</span>
            <span>{telemetry.mapState.latitude.toFixed(6)}</span>
          </div>

          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Longitude</span>
            <span>{telemetry.mapState.longitude.toFixed(6)}</span>
          </div>

          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Heading</span>
            <span>{telemetry.heading.toFixed(1)}°</span>
          </div>

          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Speed</span>
            <span>{telemetry.speed.toFixed(1)} m/s</span>
          </div>

          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Altitude</span>
            <span>{telemetry.altitude.toFixed(1)} m</span>
          </div>

          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span>Cross Track Error</span>
            <span>{telemetry.crossTrackError.toFixed(2)} m</span>
          </div>

          <div className="flex justify-between">
            <span>Disturbance</span>
            <span>
              {telemetry.disturbanceDetected ? "Detected" : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-green-400 font-semibold mb-4">
          Model Output
        </h3>

        <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center justify-center h-full">
          <div className="text-gray-400 text-sm mb-2">
            Current Decision
          </div>

          <div className="text-3xl font-bold text-green-400 text-center">
            {getDecisionOutput()}
          </div>

          <div className="mt-4 text-sm text-gray-300">
            Behaviour Mode: {telemetry.behaviourMode}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Primary Flight Display — aviation-style instruments */}
        <div className="mb-8">
          <PrimaryFlightDisplay
            altitude={telemetry.altitude}
            pitch={telemetry.estimatedAngleOfAttack}
            roll={telemetry.rollResponse}
            heading={telemetry.heading}
            speed={telemetry.speed}
          />
        </div>

        {/* Secondary Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Gauge
            label="Angle of Attack"
            value={telemetry.estimatedAngleOfAttack}
            min={-20}
            max={20}
            unit="°"
            color="bg-orange-500"
          />
          <div className="flex items-center justify-center">
            <Compass heading={telemetry.heading} size="lg" />
          </div>
        </div>

        {/* Navigation — moving map, flight plan & track errors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FlightMapLoader
              latitude={telemetry.mapState.latitude}
              longitude={telemetry.mapState.longitude}
              heading={telemetry.heading}
              speed={telemetry.speed}
              altitude={telemetry.altitude}
              history={history}
              crossTrackError={telemetry.crossTrackError}
              flightPlan={DEFAULT_FLIGHT_PLAN}
              navState={navState}
            />
          </div>
          <div className="space-y-4">
            <FlightPlanDisplay
              flightPlan={DEFAULT_FLIGHT_PLAN}
              navState={navState}
            />
            <LocationCard
              latitude={telemetry.mapState.latitude}
              longitude={telemetry.mapState.longitude}
            />
          </div>
        </div>

        {/* Control System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <StatusIndicator
            label="Behaviour Mode"
            value={telemetry.behaviourMode}
            status={behaviorModeColors[telemetry.behaviourMode]}
          />
          <StatusIndicator
            label="Disturbance"
            value={telemetry.disturbanceDetected ? "Detected" : "None"}
            status={telemetry.disturbanceDetected ? "alert" : "normal"}
          />
          <StatusIndicator
            label="Roll Response"
            value={telemetry.rollResponse.toFixed(1) + "°"}
            status="info"
          />
          <StatusIndicator
            label="Yaw Rate"
            value={telemetry.yawRateResponse.toFixed(1) + "°/s"}
            status="info"
          />
        </div>

        {/* Control Commands */}
        <div className="mb-8">
          <ControlCommandDisplay
            elevatorCommand={telemetry.elevatorCommand}
            rudderCommand={telemetry.rudderCommand}
            throttleCommand={telemetry.throttleCommand}
          />
        </div>

        {/* Telemetry & Event Horizon — merged overview */}
        <TelemetryOverviewPanel telemetry={telemetry} />

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Last update: {new Date(telemetry.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
