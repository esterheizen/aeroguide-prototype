'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { UAVTelemetry } from '@/app/types/telemetry';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 110, damping: 16 },
  },
};

const cardGridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const cardGridItem = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 140, damping: 18 },
  },
};

interface EventHorizonIndicatorProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  showEventHorizon?: boolean;
}

/**
 * Event Horizon Indicator - shows critical thresholds and warning zones
 * Visual representation of safe operating zones with danger indicators
 */
export function EventHorizonIndicator({
  label,
  value,
  min,
  max,
  unit,
  warningThreshold = max * 0.7,
  criticalThreshold = max * 0.9,
  showEventHorizon = true,
}: EventHorizonIndicatorProps) {
  const range = max - min;
  const normalizedValue = ((value - min) / range) * 100;
  const normalizedWarning = ((warningThreshold - min) / range) * 100;
  const normalizedCritical = ((criticalThreshold - min) / range) * 100;

  // Determine status based on value
  const getStatus = () => {
    if (value >= criticalThreshold) return 'critical';
    if (value >= warningThreshold) return 'warning';
    return 'normal';
  };

  const status = getStatus();

  // Status colors
  const statusColors = {
    normal: {
      indicator: '#22c55e',
      zone: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    warning: {
      indicator: '#eab308',
      zone: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.3)',
    },
    critical: {
      indicator: '#ef4444',
      zone: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.5)',
    },
  };

  const colors = statusColors[status];
  const needleLeft = useSpring(normalizedValue, {
    stiffness: 70,
    damping: 18,
    mass: 0.8,
  });
  const needleLeftPercent = useTransform(needleLeft, (v) => `${v}%`);

  useEffect(() => {
    needleLeft.set(normalizedValue);
  }, [normalizedValue, needleLeft]);

  return (
    <motion.div
      layout
      className="flex flex-col gap-3 w-full"
      variants={staggerItem}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</div>
        <motion.div
          className="text-lg font-bold tabular-nums"
          animate={{
            scale: status === 'critical' ? [1, 1.1, 1] : status === 'warning' ? [1, 1.04, 1] : 1,
            color: colors.indicator,
          }}
          transition={{
            color: { duration: 0.35 },
            scale: {
              duration: status === 'critical' ? 0.6 : 1.2,
              repeat: status !== 'normal' ? Infinity : 0,
            },
          }}
          key={Math.round(value * 10)}
        >
          {value.toFixed(1)} {unit}
        </motion.div>
      </div>

      {/* Main Event Horizon Visualization */}
      <motion.div
        className="relative w-full h-12 rounded-lg overflow-hidden"
        animate={{ borderColor: colors.border }}
        style={{ borderWidth: 2, borderStyle: 'solid' }}
        transition={{ duration: 0.35 }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              rgba(34, 197, 94, 0.1) 0%,
              rgba(34, 197, 94, 0.1) ${normalizedWarning}%,
              rgba(234, 179, 8, 0.1) ${normalizedWarning}%,
              rgba(234, 179, 8, 0.1) ${normalizedCritical}%,
              rgba(239, 68, 68, 0.2) ${normalizedCritical}%,
              rgba(239, 68, 68, 0.2) 100%)`,
          }}
        />

        {/* Warning zone line */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-yellow-400 shadow-lg"
          animate={{
            left: `${normalizedWarning}%`,
            opacity: status !== 'normal' ? [0.5, 1, 0.5] : 0.7,
          }}
          transition={{
            left: { type: 'spring', stiffness: 60, damping: 20 },
            opacity: { duration: 2, repeat: status !== 'normal' ? Infinity : 0 },
          }}
        />

        {/* Critical zone line (event horizon) */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-red-600 shadow-lg"
          animate={{
            left: `${normalizedCritical}%`,
            opacity: status === 'critical' ? [0.8, 1, 0.8] : 0.6,
            boxShadow:
              status === 'critical'
                ? [
                    '0 0 10px rgba(239, 68, 68, 1)',
                    '0 0 20px rgba(239, 68, 68, 1)',
                    '0 0 10px rgba(239, 68, 68, 1)',
                  ]
                : '0 0 5px rgba(239, 68, 68, 0.5)',
          }}
          transition={{
            left: { type: 'spring', stiffness: 60, damping: 20 },
            opacity: { duration: status === 'critical' ? 0.6 : 1, repeat: Infinity },
            boxShadow: { duration: status === 'critical' ? 0.6 : 1, repeat: Infinity },
          }}
        />

        {/* Current value indicator */}
        <motion.div
          className="absolute top-1/2 w-1 h-8 -translate-x-1/2 -translate-y-1/2 bg-white border-l-2 border-r-2 shadow-2xl"
          style={{
            left: needleLeftPercent,
            borderColor: colors.indicator,
          }}
          animate={{
            scale: status === 'critical' ? [1, 1.15, 1] : status === 'warning' ? [1, 1.08, 1] : 1,
          }}
          transition={{
            scale: {
              duration: status === 'critical' ? 0.6 : 1,
              repeat: status !== 'normal' ? Infinity : 0,
            },
          }}
        />

        {/* Min label */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-gray-400">
          {min}
        </div>

        {/* Max label */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-gray-400">
          {max}
        </div>
      </motion.div>

      {/* Zone indicators */}
      <div className="flex justify-between items-center text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-gray-600 dark:text-gray-400">Safe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <span className="text-gray-600 dark:text-gray-400">
            Warning ({warningThreshold.toFixed(0)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-gray-600 dark:text-gray-400">
            Critical ({criticalThreshold.toFixed(0)})
          </span>
        </div>
      </div>

      {/* Status message */}
      {showEventHorizon && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          key={status}
        >
          {status === 'critical' && (
            <div className="px-3 py-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-sm font-semibold text-red-900 dark:text-red-100">
              ⚠️ CRITICAL: Event Horizon Breached! Immediate action required.
            </div>
          )}
          {status === 'warning' && (
            <div className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              ⚠️ WARNING: Approaching event horizon. Monitor closely.
            </div>
          )}
          {status === 'normal' && (
            <div className="px-3 py-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded text-sm font-semibold text-green-900 dark:text-green-100">
              ✓ NORMAL: All systems within safe operating range.
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Multi-parameter Event Horizon Dashboard
 * Shows all critical parameters with event horizon visualization
 */
export function EventHorizonDashboard({
  altitude,
  speed,
  angleOfAttack,
  crossTrackError,
  headingError,
  showHeader = true,
  showStatusMessages = true,
}: {
  altitude: number;
  speed: number;
  angleOfAttack: number;
  crossTrackError: number;
  headingError: number;
  showHeader?: boolean;
  showStatusMessages?: boolean;
}) {
  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg font-bold text-gray-900 dark:text-white">🚨 Event Horizon Monitor</div>
          <motion.div
            className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ACTIVE
          </motion.div>
        </div>
      )}

      <EventHorizonIndicator
        label="Altitude"
        value={altitude}
        min={0}
        max={1000}
        unit="m"
        warningThreshold={800}
        criticalThreshold={950}
        showEventHorizon={showStatusMessages}
      />

      <EventHorizonIndicator
        label="Airspeed"
        value={speed}
        min={0}
        max={120}
        unit="m/s"
        warningThreshold={90}
        criticalThreshold={110}
        showEventHorizon={showStatusMessages}
      />

      <EventHorizonIndicator
        label="Angle of Attack"
        value={Math.abs(angleOfAttack)}
        min={0}
        max={25}
        unit="°"
        warningThreshold={15}
        criticalThreshold={22}
        showEventHorizon={showStatusMessages}
      />

      <EventHorizonIndicator
        label="Cross-Track Error"
        value={Math.abs(crossTrackError)}
        min={0}
        max={100}
        unit="m"
        warningThreshold={60}
        criticalThreshold={90}
        showEventHorizon={showStatusMessages}
      />

      <EventHorizonIndicator
        label="Heading Error"
        value={Math.abs(headingError)}
        min={0}
        max={30}
        unit="°"
        warningThreshold={20}
        criticalThreshold={28}
        showEventHorizon={showStatusMessages}
      />
    </motion.div>
  );
}

function TelemetryValueCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      variants={cardGridItem}
      whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.15)' }}
      className={`bg-gray-700/80 rounded p-3 border ${
        highlight ? 'border-red-500/50' : 'border-gray-600/50'
      }`}
    >
      <div className="text-gray-400 text-xs">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0.5, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className={`font-mono text-base font-semibold mt-0.5 tabular-nums ${
          highlight ? 'text-red-400' : 'text-white'
        }`}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}

/**
 * Combined telemetry overview — event horizon monitors + supplementary flight data.
 */
export function TelemetryOverviewPanel({ telemetry }: { telemetry: UAVTelemetry }) {
  return (
    <motion.div
      className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
    >
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3 mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 16 }}
      >
        <h2 className="text-lg font-bold">Telemetry & Event Horizon Monitor</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <motion.div
            className="font-semibold px-2 py-1 rounded-full bg-blue-900/60 text-blue-200 border border-blue-700/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            MONITORING ACTIVE
          </motion.div>
          <motion.span
            key={telemetry.timestamp}
            className="font-mono"
            initial={{ opacity: 0.4, color: '#93c5fd' }}
            animate={{ opacity: 1, color: '#9ca3af' }}
            transition={{ duration: 0.6 }}
          >
            Updated {new Date(telemetry.timestamp).toLocaleTimeString()}
          </motion.span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <motion.div
          className="xl:col-span-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 90, damping: 16 }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Critical Parameters
          </h3>
          <EventHorizonDashboard
            altitude={telemetry.altitude}
            speed={telemetry.speed}
            angleOfAttack={telemetry.estimatedAngleOfAttack}
            crossTrackError={telemetry.crossTrackError}
            headingError={telemetry.headingError}
            showHeader={false}
            showStatusMessages={false}
          />
        </motion.div>

        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 16 }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Flight State
          </h3>
          <motion.div
            className="grid grid-cols-2 gap-3 text-sm"
            variants={cardGridContainer}
            initial="hidden"
            animate="show"
          >
            <TelemetryValueCard
              label="Heading"
              value={`${telemetry.heading.toFixed(2)}°`}
            />
            <TelemetryValueCard
              label="Behaviour Mode"
              value={telemetry.behaviourMode}
              highlight={
                telemetry.behaviourMode === 'emergency' ||
                telemetry.behaviourMode === 'landing'
              }
            />
            <TelemetryValueCard
              label="Roll Response"
              value={`${telemetry.rollResponse.toFixed(2)}°`}
            />
            <TelemetryValueCard
              label="Yaw Rate"
              value={`${telemetry.yawRateResponse.toFixed(2)}°/s`}
            />
            <TelemetryValueCard
              label="Elevator Cmd"
              value={telemetry.elevatorCommand.toFixed(2)}
            />
            <TelemetryValueCard
              label="Rudder Cmd"
              value={telemetry.rudderCommand.toFixed(2)}
            />
            <TelemetryValueCard
              label="Throttle Cmd"
              value={telemetry.throttleCommand.toFixed(2)}
            />
            <TelemetryValueCard
              label="Disturbance"
              value={telemetry.disturbanceDetected ? 'Detected' : 'None'}
              highlight={telemetry.disturbanceDetected}
            />
            <TelemetryValueCard
              label="Latitude"
              value={`${telemetry.mapState.latitude.toFixed(6)}°`}
            />
            <TelemetryValueCard
              label="Longitude"
              value={`${telemetry.mapState.longitude.toFixed(6)}°`}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
