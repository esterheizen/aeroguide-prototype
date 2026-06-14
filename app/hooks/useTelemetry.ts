'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { UAVTelemetry, BehaviourMode, DisturbanceEvent } from '@/app/types/telemetry';
import { DEFAULT_FLIGHT_PLAN } from '@/app/data/defaultFlightPlan';
import { computeFlightPlanNavState } from '@/app/lib/flightPlanNav';

/**
 * Mock telemetry data generator for simulation
 * In production, this would connect to your actual simulation backend
 */
function generateMockTelemetry(prevState?: UAVTelemetry): UAVTelemetry {
  const now = Date.now();

  const baseLat = prevState?.mapState.latitude ?? DEFAULT_FLIGHT_PLAN.waypoints[0].position.latitude;
  const baseLon = prevState?.mapState.longitude ?? DEFAULT_FLIGHT_PLAN.waypoints[0].position.longitude;
  const position = { latitude: baseLat, longitude: baseLon };
  const baseHeading = prevState?.heading ?? 45;

  const navState = computeFlightPlanNavState(
    DEFAULT_FLIGHT_PLAN,
    position,
    baseHeading,
  );

  const baseSpeed = prevState?.speed ?? 80;
  const speed = Math.max(0, baseSpeed + (Math.random() - 0.5) * 2);

  // Track the active leg with small heading noise
  const heading =
    (navState.desiredTrack + (Math.random() - 0.5) * 4 + 360) % 360;

  const headingRad = (heading * Math.PI) / 180;
  const stepMeters = speed * 0.08;
  const dLat = (stepMeters * Math.cos(headingRad)) / 111320;
  const dLon =
    (stepMeters * Math.sin(headingRad)) /
    (111320 * Math.cos((baseLat * Math.PI) / 180));

  const targetAlt = navState.toWaypoint.altitude;
  const baseAltitude = prevState?.altitude ?? DEFAULT_FLIGHT_PLAN.waypoints[0].altitude;
  const altDelta = (targetAlt - baseAltitude) * 0.02;
  const altitude = baseAltitude + altDelta + (Math.random() - 0.5) * 5;

  const crossTrackError = navState.crossTrackError + (Math.random() - 0.5) * 4;
  const headingError = navState.headingError + (Math.random() - 0.5) * 1.5;

  // Random disturbance every ~50 iterations
  const disturbanceDetected = Math.random() < 0.02;
  const disturbanceEvent: DisturbanceEvent | undefined = disturbanceDetected
    ? {
        type: ['gust', 'turbulence', 'wind_shear'][Math.floor(Math.random() * 3)] as DisturbanceEvent['type'],
        magnitude: Math.random() * 5 + 2,
        direction: Math.random() * 360,
        timestamp: now,
      }
    : undefined;

  const altDeltaSign = targetAlt > baseAltitude ? 1 : targetAlt < baseAltitude ? -1 : 0;
  const behaviourMode: BehaviourMode =
    altDeltaSign > 0 ? 'climb' : altDeltaSign < 0 ? 'descent' : 'cruise';

  return {
    timestamp: now,
    altitude: Math.max(0, altitude),
    speed: speed,
    heading: heading,
    crossTrackError: crossTrackError,
    headingError: headingError,
    disturbanceDetected: disturbanceDetected,
    disturbanceEvent: disturbanceEvent,
    mapState: {
      latitude: baseLat + dLat + (Math.random() - 0.5) * 0.00001,
      longitude: baseLon + dLon + (Math.random() - 0.5) * 0.00001,
    },
    behaviourMode: disturbanceDetected ? 'emergency' : behaviourMode,
    elevatorCommand: altDeltaSign * 0.3 + (Math.random() - 0.5) * 0.2,
    rudderCommand: (crossTrackError / 100) + (Math.random() - 0.5) * 0.1,
    throttleCommand: 0.5 + (Math.random() - 0.5) * 0.1,
    rollResponse: (crossTrackError / 3) + (Math.random() - 0.5) * 5,
    yawRateResponse: (headingError / 5) + (Math.random() - 0.5) * 2,
    estimatedAngleOfAttack: altDeltaSign * 3 + (Math.random() - 0.5) * 4,
  };
}

export function useTelemetry(updateInterval: number = 500) {
  const [telemetry, setTelemetry] = useState<UAVTelemetry>(generateMockTelemetry());
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState<UAVTelemetry[]>([telemetry]);
  const maxHistorySize = 500; // Keep last 500 data points
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling telemetry data
  const connect = useCallback(() => {
    if (intervalRef.current) return; // Already connected

    setIsConnected(true);
    intervalRef.current = setInterval(() => {
      setTelemetry((prev) => {
        const newTelemetry = generateMockTelemetry(prev);
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, newTelemetry];
          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
          }
          return newHistory;
        });
        return newTelemetry;
      });
    }, updateInterval);
  }, [updateInterval]);

  // Stop polling telemetry data
  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    telemetry,
    history,
    isConnected,
    connect,
    disconnect,
  };
}
