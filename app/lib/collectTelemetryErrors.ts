import { FlightPlanNavState } from "@/app/types/flightPlan";
import { UAVTelemetry } from "@/app/types/telemetry";

export type ErrorSeverity = "critical" | "warning" | "info";

export interface TelemetryErrorEntry {
  id: string;
  key: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  timestamp: number;
  active: boolean;
  clearedAt?: number;
}

export interface ActiveTelemetryError {
  key: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  timestamp: number;
}

interface ThresholdCheck {
  key: string;
  label: string;
  value: number;
  warning: number;
  critical: number;
  unit: string;
}

function pushThresholdErrors(
  errors: ActiveTelemetryError[],
  check: ThresholdCheck,
  timestamp: number,
) {
  if (check.value >= check.critical) {
    errors.push({
      key: `${check.key}-critical`,
      severity: "critical",
      title: `${check.label} — Critical`,
      message: `${check.value.toFixed(1)} ${check.unit} exceeds critical threshold (${check.critical} ${check.unit})`,
      timestamp,
    });
  } else if (check.value >= check.warning) {
    errors.push({
      key: `${check.key}-warning`,
      severity: "warning",
      title: `${check.label} — Warning`,
      message: `${check.value.toFixed(1)} ${check.unit} approaching limit (${check.warning} ${check.unit})`,
      timestamp,
    });
  }
}

const DISTURBANCE_LABELS: Record<string, string> = {
  gust: "Wind gust",
  turbulence: "Turbulence",
  wind_shear: "Wind shear",
  unknown: "Unknown disturbance",
};

export function collectActiveTelemetryErrors(
  telemetry: UAVTelemetry,
  isConnected: boolean,
  navState?: FlightPlanNavState,
): ActiveTelemetryError[] {
  const errors: ActiveTelemetryError[] = [];
  const ts = telemetry.timestamp;

  if (!isConnected) {
    errors.push({
      key: "connection-lost",
      severity: "critical",
      title: "Telemetry Disconnected",
      message: "No live data from the simulation backend.",
      timestamp: ts,
    });
  }

  if (telemetry.disturbanceDetected && telemetry.disturbanceEvent) {
    const event = telemetry.disturbanceEvent;
    errors.push({
      key: `disturbance-${event.timestamp}`,
      severity: "critical",
      title: "Disturbance Detected",
      message: `${DISTURBANCE_LABELS[event.type] ?? event.type}: ${event.magnitude.toFixed(1)} m/s at ${event.direction.toFixed(0)}°`,
      timestamp: event.timestamp,
    });
  }

  if (telemetry.behaviourMode === "emergency") {
    errors.push({
      key: "behaviour-emergency",
      severity: "critical",
      title: "Emergency Behaviour Mode",
      message: "Autopilot has entered emergency behaviour mode.",
      timestamp: ts,
    });
  }

  if (telemetry.behaviourMode === "landing") {
    errors.push({
      key: "behaviour-landing",
      severity: "warning",
      title: "Landing Mode Active",
      message: "Aircraft is in landing behaviour mode.",
      timestamp: ts,
    });
  }

  pushThresholdErrors(
    errors,
    {
      key: "eh-altitude",
      label: "Altitude",
      value: telemetry.altitude,
      warning: 800,
      critical: 950,
      unit: "m",
    },
    ts,
  );

  pushThresholdErrors(
    errors,
    {
      key: "eh-speed",
      label: "Airspeed",
      value: telemetry.speed,
      warning: 40,
      critical: 48,
      unit: "m/s",
    },
    ts,
  );

  pushThresholdErrors(
    errors,
    {
      key: "eh-aoa",
      label: "Angle of Attack",
      value: Math.abs(telemetry.estimatedAngleOfAttack),
      warning: 15,
      critical: 22,
      unit: "°",
    },
    ts,
  );

  pushThresholdErrors(
    errors,
    {
      key: "eh-xtk",
      label: "Cross-Track Error",
      value: Math.abs(telemetry.crossTrackError),
      warning: 60,
      critical: 90,
      unit: "m",
    },
    ts,
  );

  pushThresholdErrors(
    errors,
    {
      key: "eh-hdg",
      label: "Heading Error",
      value: Math.abs(telemetry.headingError),
      warning: 20,
      critical: 28,
      unit: "°",
    },
    ts,
  );

  if (navState && Math.abs(navState.crossTrackError) >= 30) {
    errors.push({
      key: "nav-xtk",
      severity: Math.abs(navState.crossTrackError) >= 60 ? "critical" : "warning",
      title: "Navigation — Off Track",
      message: `Cross-track error ${navState.crossTrackError >= 0 ? "+" : ""}${navState.crossTrackError.toFixed(1)} m on leg ${navState.fromWaypoint.id}→${navState.toWaypoint.id}`,
      timestamp: ts,
    });
  }

  return errors;
}
