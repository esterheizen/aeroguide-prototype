"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface GaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color?: string;
}

/**
 * Accelerator/Speedometer style gauge with Framer Motion animations
 * Smooth needle movement and animated value changes using production-ready animation library
 */
export function Gauge({
  label,
  value,
  min,
  max,
  unit,
  color = "bg-blue-500",
}: GaugeProps) {
  const cx = 70;
  const cy = 70;
  const needleLength = 45;

  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Bottom semicircle arc: 180° (left/min) → 0° (right/max), passing through 90° (bottom)
  const needleAngle = 180 - (clampedPercentage / 100) * 180;
  const needleRadians = (needleAngle * Math.PI) / 180;
  const targetX2 = cx + needleLength * Math.cos(needleRadians);
  const targetY2 = cy + needleLength * Math.sin(needleRadians);

  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#22c55e",
    "bg-orange-500": "#f97316",
    "bg-red-500": "#ef4444",
    "bg-purple-500": "#a855f7",
  };

  const colorValue = colorMap[color] || "#3b82f6";

  const gradientId = useMemo(
    () => `grad-${label.replace(/\s+/g, "-").toLowerCase()}`,
    [label],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Speedometer style gauge */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background circle */}
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 140 140"
          style={{ transform: "rotateX(0deg)" }}
        >
          {/* Outer ring */}
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />

          {/* Gradient arc background (180 degrees) */}
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Colored arc (180 degree arc from left to right) */}
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            const angle = 180 - (i / 10) * 180;
            const radians = (angle * Math.PI) / 180;
            const x1 = cx + 55 * Math.cos(radians);
            const y1 = cy + 55 * Math.sin(radians);
            const x2 = cx + 60 * Math.cos(radians);
            const y2 = cy + 60 * Math.sin(radians);

            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-400 dark:text-gray-500"
              />
            );
          })}

          {/* Needle — pivots at centre, endpoint animated via spring */}
          <motion.line
            x1={cx}
            y1={cy}
            animate={{ x2: targetX2, y2: targetY2 }}
            transition={{ type: "spring", stiffness: 60, damping: 14, mass: 1.2 }}
            stroke={colorValue}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="5"
            fill={colorValue}
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
          />
        </svg>

        {/* Value display below needle pivot */}
        <motion.div
          className="absolute inset-x-0 bottom-1 flex flex-col items-center"
          animate={{ scale: 1 + (clampedPercentage / 100) * 0.08 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <motion.div
            className="text-xl font-bold tabular-nums"
            style={{ color: colorValue }}
            key={Math.floor(value * 10)}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          >
            {value.toFixed(1)}
          </motion.div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {unit}
          </div>
        </motion.div>
      </div>

      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  label: string;
  value: string | number;
  status?: "normal" | "warning" | "alert" | "info";
}

/**
 * Status indicator for discrete values
 */
export function StatusIndicator({
  label,
  value,
  status = "normal",
}: StatusIndicatorProps) {
  const statusColors = {
    normal: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    warning:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    alert: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    info: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  };

  return (
    <motion.div
      className="flex flex-col gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </div>
      <motion.div
        className={`px-3 py-2 rounded-lg text-sm font-semibold text-center ${statusColors[status]}`}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        key={value}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}

interface LinearIndicatorProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

/**
 * Linear bar indicator with Framer Motion animations
 */
export function LinearIndicator({
  label,
  value,
  min,
  max,
  unit,
}: LinearIndicatorProps) {
  const range = max - min;
  const position = ((value - min) / range) * 100;

  // Determine color based on value (neutral at center for errors)
  const isError = min < 0 && max > 0;
  let barColor = "bg-blue-500";
  if (isError) {
    if (value > 0) {
      barColor = "bg-orange-500";
    } else if (value < 0) {
      barColor = "bg-purple-500";
    } else {
      barColor = "bg-green-500";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {value.toFixed(2)} {unit}
        </div>
      </div>
      <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute h-full ${barColor}`}
          animate={{
            left: isError ? "50%" : "0%",
            width: isError
              ? `${Math.abs((position / 100) * 50)}%`
              : `${position}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 12,
            mass: 1.5,
          }}
        />
        {isError && (
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-600 -translate-x-1/2" />
        )}
      </div>
    </div>
  );
}

interface CompassProps {
  heading: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Compass rose with Framer Motion needle animation
 */
export function Compass({ heading, size = "md" }: CompassProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  // Normalize heading to 0-360
  const normalizedHeading = ((heading % 360) + 360) % 360;

  return (
    <div
      className={`${sizeClasses[size]} relative flex items-center justify-center`}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />

      {/* Cardinal directions */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-300">
        N
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-300">
        S
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-700 dark:text-gray-300">
        W
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-700 dark:text-gray-300">
        E
      </div>

      {/* Heading needle — pivot at dial centre */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 w-1 h-10 rounded-full bg-red-500"
        animate={{ rotate: 180+normalizedHeading }}
        transition={{
          type: "spring",
          stiffness: 40,
          damping: 10,
          mass: 2.5,
        }}
        style={{
          transformOrigin: "top center",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      />

      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg z-10" />

      {/* Heading value */}
      <motion.div
        className="text-xs font-semibold text-gray-900 dark:text-white mt-12"
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        key={Math.round(normalizedHeading)}
      >
        {Math.round(normalizedHeading)}°
      </motion.div>
    </div>
  );
}
