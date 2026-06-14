/**
 * UAV 6-axis telemetry data structure
 * Represents all outputs from the UAV simulation model
 */

export type BehaviourMode = 'idle' | 'climb' | 'cruise' | 'descent' | 'landing' | 'emergency';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface DisturbanceEvent {
  type: 'gust' | 'turbulence' | 'wind_shear' | 'unknown';
  magnitude: number;
  direction: number;
  timestamp: number;
}

export interface UAVTelemetry {
  // Flight State
  altitude: number; // meters
  speed: number; // m/s
  heading: number; // degrees (0-360)

  // Navigation Errors
  crossTrackError: number; // meters
  headingError: number; // degrees

  // Disturbances
  disturbanceDetected: boolean;
  disturbanceEvent?: DisturbanceEvent;

  // Location
  mapState: MapCoordinate;

  // Control System
  behaviourMode: BehaviourMode;

  // Control Inputs (normalized -1 to 1)
  elevatorCommand: number;
  rudderCommand: number;
  throttleCommand: number;

  // Aircraft Response
  rollResponse: number; // degrees
  yawRateResponse: number; // degrees/second

  // Aerodynamic State
  estimatedAngleOfAttack: number; // degrees

  // Timestamps
  timestamp: number;
}

export interface TelemetryHistory {
  data: UAVTelemetry[];
  maxSize: number;
}
