'use client';

import { DisturbanceEvent } from '@/app/types/telemetry';

interface DisturbanceAlertProps {
  disturbance: DisturbanceEvent;
}

/**
 * Alert banner for disturbance events
 */
export function DisturbanceAlert({ disturbance }: DisturbanceAlertProps) {
  const typeLabels = {
    gust: '🌪️ Wind Gust',
    turbulence: '⚡ Turbulence',
    wind_shear: '💨 Wind Shear',
    unknown: '❓ Unknown Disturbance',
  };

  return (
    <div className="px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
      <div className="flex items-center gap-3">
        <div className="text-lg">⚠️</div>
        <div className="flex-1">
          <div className="font-semibold text-red-900 dark:text-red-100">
            {typeLabels[disturbance.type]}
          </div>
          <div className="text-sm text-red-800 dark:text-red-200">
            Magnitude: {disturbance.magnitude.toFixed(1)} m/s | Direction: {disturbance.direction.toFixed(0)}°
          </div>
        </div>
      </div>
    </div>
  );
}

interface LocationCardProps {
  latitude: number;
  longitude: number;
}

/**
 * Display current GPS coordinates
 */
export function LocationCard({ latitude, longitude }: LocationCardProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Position</h3>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Latitude:</span>
          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
            {latitude.toFixed(6)}°
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Longitude:</span>
          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
            {longitude.toFixed(6)}°
          </span>
        </div>
      </div>
    </div>
  );
}

interface ControlCommandDisplayProps {
  elevatorCommand: number;
  rudderCommand: number;
  throttleCommand: number;
}

/**
 * Display current control commands
 */
export function ControlCommandDisplay({
  elevatorCommand,
  rudderCommand,
  throttleCommand,
}: ControlCommandDisplayProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Control Commands</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Elevator</span>
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {elevatorCommand.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${((elevatorCommand + 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Rudder</span>
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {rudderCommand.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${((rudderCommand + 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Throttle</span>
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {throttleCommand.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${throttleCommand * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
