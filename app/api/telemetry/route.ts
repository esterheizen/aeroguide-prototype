import { NextResponse } from 'next/server';
import { UAVTelemetry } from '@/app/types/telemetry';

/**
 * Example API route for telemetry data
 * This is a template showing how to connect to your actual simulation backend
 *
 * Usage:
 * In useTelemetry.ts hook, replace the setInterval with:
 *
 * intervalRef.current = setInterval(async () => {
 *   const response = await fetch('/api/telemetry');
 *   const data = await response.json();
 *   setTelemetry(data);
 * }, updateInterval);
 *
 * Integration options:
 * 1. Call your Simulink model directly if running on server
 * 2. Forward requests to a separate simulation service
 * 3. Read from a database/message queue that simulation publishes to
 */

export async function GET() {
  try {
    // TODO: Replace with your actual simulation backend
    // Examples:

    // Option 1: Call to external simulation service
    // const response = await fetch('http://localhost:5000/telemetry');
    // const data = await response.json();

    // Option 2: Direct Simulink model call (if running locally)
    // const data = await getSimulinkTelemetry();

    // Option 3: Read from message queue/database
    // const data = await getTelemetryFromDatabase();

    // For now, return a placeholder
    const telemetry: UAVTelemetry = {
      timestamp: Date.now(),
      altitude: 500,
      speed: 20,
      heading: 90,
      crossTrackError: 0,
      headingError: 0,
      disturbanceDetected: false,
      mapState: {
        latitude: -37.8136,
        longitude: 144.9631,
      },
      behaviourMode: 'cruise',
      elevatorCommand: 0,
      rudderCommand: 0,
      throttleCommand: 0.5,
      rollResponse: 0,
      yawRateResponse: 0,
      estimatedAngleOfAttack: 0,
    };

    return NextResponse.json(telemetry);
  } catch (error) {
    console.error('Telemetry API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch telemetry' },
      { status: 500 }
    );
  }
}
