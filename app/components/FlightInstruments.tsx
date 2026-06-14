"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface InstrumentBezelProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function InstrumentBezel({ label, children, className = "" }: InstrumentBezelProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="relative rounded-full p-1.5 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #4a4a4a 0%, #1a1a1a 50%, #2d2d2d 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {children}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        {label}
      </span>
    </div>
  );
}

interface AltitudeIndicatorProps {
  altitude: number;
  min?: number;
  max?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

/**
 * Aviation-style vertical tape altimeter with drum counter readout.
 */
export function AltitudeIndicator({
  altitude,
  min = 0,
  max = 2000,
  warningThreshold = 1600,
  criticalThreshold = 1900,
}: AltitudeIndicatorProps) {
  const clampedAlt = Math.min(max, Math.max(min, altitude));
  const tapeRange = max - min;
  const pixelsPerMeter = 0.55;
  const tapeHeight = tapeRange * pixelsPerMeter;
  const tapeOffset = (clampedAlt - min) * pixelsPerMeter;

  const springAlt = useSpring(clampedAlt, { stiffness: 80, damping: 20, mass: 0.8 });
  const springOffset = useTransform(springAlt, (v) => (v - min) * pixelsPerMeter);

  useEffect(() => {
    springAlt.set(clampedAlt);
  }, [clampedAlt, springAlt]);

  const majorTicks = [];
  for (let m = min; m <= max; m += 100) {
    majorTicks.push(m);
  }

  const getTapeColor = (m: number) => {
    if (m >= criticalThreshold) return "#ef4444";
    if (m >= warningThreshold) return "#eab308";
    return "#ffffff";
  };

  const hundreds = Math.floor(clampedAlt / 100) % 10;
  const thousands = Math.floor(clampedAlt / 1000);
  const tens = Math.floor((clampedAlt % 100) / 10);

  return (
    <InstrumentBezel label="Altimeter">
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          width: 72,
          height: 200,
          background: "#0a0a0a",
          border: "2px solid #333",
        }}
      >
        {/* Warning zone bands on tape window */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: `${((max - criticalThreshold) / tapeRange) * 100}%`,
            height: `${((criticalThreshold - warningThreshold) / tapeRange) * 100}%`,
            background: "rgba(234, 179, 8, 0.08)",
            borderTop: "1px dashed rgba(234, 179, 8, 0.4)",
            borderBottom: "1px dashed rgba(239, 68, 68, 0.4)",
          }}
        />
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none z-10"
          style={{
            height: `${((max - criticalThreshold) / tapeRange) * 100}%`,
            background: "rgba(239, 68, 68, 0.1)",
            borderBottom: "1px solid rgba(239, 68, 68, 0.5)",
          }}
        />

        {/* Scrolling altitude tape */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-0 right-0"
            style={{
              height: tapeHeight,
              bottom: "50%",
              y: springOffset,
            }}
          >
            {majorTicks.map((m) => {
              const yPos = (m - min) * pixelsPerMeter;
              return (
                <div
                  key={m}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ bottom: yPos, height: 0 }}
                >
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: getTapeColor(m), opacity: 0.6 }}
                  />
                  <span
                    className="font-mono text-xs font-bold px-1 min-w-[28px] text-right"
                    style={{ color: getTapeColor(m) }}
                  >
                    {Math.round(m / 100)}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: getTapeColor(m), opacity: 0.6 }}
                  />
                </div>
              );
            })}
            {/* Minor ticks every 20m */}
            {Array.from({ length: Math.floor(tapeRange / 20) + 1 }, (_, i) => min + i * 20)
              .filter((m) => m % 100 !== 0)
              .map((m) => {
                const yPos = (m - min) * pixelsPerMeter;
                return (
                  <div
                    key={`minor-${m}`}
                    className="absolute left-2 w-3 h-px bg-gray-600"
                    style={{ bottom: yPos }}
                  />
                );
              })}
          </motion.div>
        </div>

        {/* Fixed pointer */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="flex items-center">
            <div
              className="w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "8px solid #fbbf24",
                filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))",
              }}
            />
            <div className="flex-1 h-0.5 bg-amber-400" />
            <div
              className="w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "8px solid #fbbf24",
                filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))",
              }}
            />
          </div>
        </div>

        {/* Drum counter readout */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-end gap-px px-1 py-0.5 rounded"
          style={{ background: "#111", border: "1px solid #444" }}
        >
          {thousands > 0 && (
            <span className="font-mono text-sm font-bold text-white leading-none">
              {thousands}
            </span>
          )}
          <span
            className="font-mono text-lg font-bold leading-none"
            style={{
              color:
                clampedAlt >= criticalThreshold
                  ? "#ef4444"
                  : clampedAlt >= warningThreshold
                    ? "#eab308"
                    : "#22c55e",
            }}
          >
            {String(hundreds).padStart(thousands > 0 ? 1 : 2, "0")}
          </span>
          <span className="font-mono text-xs font-bold text-amber-400 leading-none mb-0.5">
            {tens}
          </span>
        </div>

        {/* Unit label */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 z-20">
          M
        </div>
      </div>
    </InstrumentBezel>
  );
}

interface AirspeedIndicatorProps {
  speed: number;
  min?: number;
  max?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

/**
 * Aviation-style vertical tape airspeed indicator (ASI).
 */
export function AirspeedIndicator({
  speed,
  min = 0,
  max = 100,
  warningThreshold = 80,
  criticalThreshold = 90,
}: AirspeedIndicatorProps) {
  const clampedSpeed = Math.min(max, Math.max(min, speed));
  const tapeRange = max - min;
  const pixelsPerUnit = 3.6;
  const tapeHeight = tapeRange * pixelsPerUnit;

  const springSpeed = useSpring(clampedSpeed, { stiffness: 80, damping: 20, mass: 0.8 });
  const springOffset = useTransform(springSpeed, (v) => (v - min) * pixelsPerUnit);

  useEffect(() => {
    springSpeed.set(clampedSpeed);
  }, [clampedSpeed, springSpeed]);

  const majorTicks = Array.from({ length: Math.floor(tapeRange / 10) + 1 }, (_, i) => min + i * 10);

  const getTapeColor = (tick: number) => {
    if (tick >= criticalThreshold) return "#ef4444";
    if (tick >= warningThreshold) return "#eab308";
    return "#ffffff";
  };

  const getValueColor = () => {
    if (clampedSpeed >= criticalThreshold) return "#ef4444";
    if (clampedSpeed >= warningThreshold) return "#eab308";
    return "#22c55e";
  };

  return (
    <InstrumentBezel label="Airspeed">
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          width: 72,
          height: 200,
          background: "#0a0a0a",
          border: "2px solid #333",
        }}
      >
        {/* Warning / critical bands (high speed = top of tape) */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: `${((max - criticalThreshold) / tapeRange) * 100}%`,
            height: `${((criticalThreshold - warningThreshold) / tapeRange) * 100}%`,
            background: "rgba(234, 179, 8, 0.08)",
            borderTop: "1px dashed rgba(239, 68, 68, 0.4)",
            borderBottom: "1px dashed rgba(234, 179, 8, 0.4)",
          }}
        />
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none z-10"
          style={{
            height: `${((max - criticalThreshold) / tapeRange) * 100}%`,
            background: "rgba(239, 68, 68, 0.1)",
            borderBottom: "1px solid rgba(239, 68, 68, 0.5)",
          }}
        />

        {/* Scrolling speed tape */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-0 right-0"
            style={{
              height: tapeHeight,
              bottom: "50%",
              y: springOffset,
            }}
          >
            {majorTicks.map((tick) => {
              const yPos = (tick - min) * pixelsPerUnit;
              return (
                <div
                  key={tick}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ bottom: yPos, height: 0 }}
                >
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: getTapeColor(tick), opacity: 0.6 }}
                  />
                  <span
                    className="font-mono text-xs font-bold px-1 min-w-[28px] text-right"
                    style={{ color: getTapeColor(tick) }}
                  >
                    {tick}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: getTapeColor(tick), opacity: 0.6 }}
                  />
                </div>
              );
            })}
            {Array.from({ length: Math.floor(tapeRange / 5) + 1 }, (_, i) => min + i * 5)
              .filter((tick) => tick % 10 !== 0)
              .map((tick) => {
                const yPos = (tick - min) * pixelsPerUnit;
                return (
                  <div
                    key={`minor-${tick}`}
                    className="absolute left-2 w-3 h-px bg-gray-600"
                    style={{ bottom: yPos }}
                  />
                );
              })}
          </motion.div>
        </div>

        {/* Fixed pointer */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="flex items-center">
            <div
              className="w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "8px solid #fbbf24",
                filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))",
              }}
            />
            <div className="flex-1 h-0.5 bg-amber-400" />
            <div
              className="w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "8px solid #fbbf24",
                filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))",
              }}
            />
          </div>
        </div>

        {/* Digital readout */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded"
          style={{ background: "#111", border: "1px solid #444" }}
        >
          <motion.span
            className="font-mono text-lg font-bold leading-none tabular-nums"
            style={{ color: getValueColor() }}
            key={Math.floor(clampedSpeed * 10)}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          >
            {clampedSpeed.toFixed(1)}
          </motion.span>
        </div>

        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 z-20">
          M/S
        </div>
      </div>
    </InstrumentBezel>
  );
}

interface ArtificialHorizonIndicatorProps {
  pitch: number;
  roll: number;
  warningPitch?: number;
  criticalPitch?: number;
}

/**
 * Aviation-style attitude indicator (artificial horizon).
 * Pitch and roll drive the sky/ground sphere; fixed aircraft symbol stays centered.
 */
export function ArtificialHorizonIndicator({
  pitch,
  roll,
  warningPitch = 15,
  criticalPitch = 22,
}: ArtificialHorizonIndicatorProps) {
  const clampedPitch = Math.min(30, Math.max(-30, pitch));
  const clampedRoll = Math.min(60, Math.max(-60, roll));
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const pitchPxPerDeg = 3.2;

  const springPitch = useSpring(clampedPitch, { stiffness: 60, damping: 15, mass: 1 });
  const springRoll = useSpring(clampedRoll, { stiffness: 60, damping: 15, mass: 1 });
  const horizonYOffset = useTransform(springPitch, (p) => p * pitchPxPerDeg);

  useEffect(() => {
    springPitch.set(clampedPitch);
    springRoll.set(clampedRoll);
  }, [clampedPitch, clampedRoll, springPitch, springRoll]);

  const pitchLines = [-30, -20, -10, 0, 10, 20, 30];

  return (
    <InstrumentBezel label="Attitude">
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size, background: "#111" }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <clipPath id="horizon-clip">
              <circle cx={cx} cy={cy} r={radius} />
            </clipPath>
            <radialGradient id="bezel-shine" cx="30%" cy="20%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="#0a0a0a"
            stroke="#333"
            strokeWidth="2"
          />

          {/* Sky / ground — pitch & roll around instrument centre */}
          <g clipPath="url(#horizon-clip)">
            <g transform={`translate(${cx}, ${cy})`}>
              <motion.g style={{ rotate: springRoll, y: horizonYOffset }}>
                {/* Local origin = instrument centre; horizon at y=0 */}
                <rect x={-size * 2} y={-size * 2} width={size * 4} height={size * 2} fill="#1e6fd9" />
                <rect x={-size * 2} y={0} width={size * 4} height={size * 2} fill="#6b4423" />

                <line
                  x1={-size * 2}
                  y1={0}
                  x2={size * 2}
                  y2={0}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {pitchLines.map((deg) => {
                  if (deg === 0) return null;
                  const y = -deg * pitchPxPerDeg;
                  const lineWidth = deg % 20 === 0 ? 80 : 50;
                  const isWarning = Math.abs(deg) >= warningPitch;
                  const isCritical = Math.abs(deg) >= criticalPitch;
                  const color = isCritical ? "#ef4444" : isWarning ? "#eab308" : "#fff";
                  return (
                    <g key={deg}>
                      <line
                        x1={-lineWidth / 2}
                        y1={y}
                        x2={lineWidth / 2}
                        y2={y}
                        stroke={color}
                        strokeWidth={deg % 20 === 0 ? 1.5 : 1}
                        opacity={0.9}
                      />
                      {deg % 20 === 0 && (
                        <>
                          <text
                            x={-lineWidth / 2 - 14}
                            y={y + 4}
                            fill={color}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {Math.abs(deg)}
                          </text>
                          <text
                            x={lineWidth / 2 + 4}
                            y={y + 4}
                            fill={color}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {Math.abs(deg)}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Bank angle scale — rotates with the horizon */}
                {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((deg) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  const innerR = radius - 8;
                  const outerR =
                    radius - (deg % 30 === 0 ? 16 : deg % 10 === 0 ? 12 : 8);
                  return (
                    <line
                      key={`roll-tick-${deg}`}
                      x1={innerR * Math.cos(rad)}
                      y1={innerR * Math.sin(rad)}
                      x2={outerR * Math.cos(rad)}
                      y2={outerR * Math.sin(rad)}
                      stroke="#ccc"
                      strokeWidth={deg === 0 ? 2 : 1}
                    />
                  );
                })}
              </motion.g>
            </g>
          </g>

          {/* Fixed roll pointer at top of instrument */}
          <polygon
            points={`${cx},${cy - radius + 6} ${cx - 6},${cy - radius + 18} ${cx + 6},${cy - radius + 18}`}
            fill="#fbbf24"
          />

          {/* Fixed aircraft symbol */}
          <g>
            <line
              x1={cx - 50}
              y1={cy}
              x2={cx - 12}
              y2={cy}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1={cx + 12}
              y1={cy}
              x2={cx + 50}
              y2={cy}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="4" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <line
              x1={cx}
              y1={cy - 4}
              x2={cx}
              y2={cy + 8}
              stroke="#fbbf24"
              strokeWidth="2"
            />
          </g>

          {/* Bezel shine overlay */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#bezel-shine)" pointerEvents="none" />

          {/* Outer bezel ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#555"
            strokeWidth="3"
          />
        </svg>

        {/* Pitch / roll readout */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 text-[9px] font-mono font-bold">
          <span className="text-blue-300">P {clampedPitch.toFixed(1)}°</span>
          <span className="text-amber-300">R {clampedRoll.toFixed(1)}°</span>
        </div>
      </div>
    </InstrumentBezel>
  );
}

interface PrimaryFlightDisplayProps {
  altitude: number;
  pitch: number;
  roll: number;
  heading: number;
  speed: number;
}

/**
 * Primary flight display cluster — attitude center, altimeter right, heading & speed flanking.
 */
export function PrimaryFlightDisplay({
  altitude,
  pitch,
  roll,
  heading,
  speed,
}: PrimaryFlightDisplayProps) {
  const normalizedHeading = ((heading % 360) + 360) % 360;

  return (
    <div
      className="rounded-xl p-6 border border-gray-700"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Primary Flight Display
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">PFD ACTIVE</span>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-4 lg:gap-6">
        {/* Airspeed tape */}
        <AirspeedIndicator speed={speed} />

        {/* Attitude indicator */}
        <ArtificialHorizonIndicator pitch={pitch} roll={roll} />

        {/* Altimeter tape */}
        <AltitudeIndicator altitude={altitude} />

        {/* Heading indicator */}
        <InstrumentBezel label="Heading">
          <div
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              background: "#0a0a0a",
              border: "2px solid #333",
            }}
          >
            <motion.div
              className="absolute inset-2 rounded-full border border-gray-700"
              animate={{ rotate: -normalizedHeading }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
              style={{ originX: "50%", originY: "50%" }}
            >
              {["N", "E", "S", "W"].map((dir, i) => (
                <span
                  key={dir}
                  className="absolute text-[10px] font-bold text-gray-400"
                  style={{
                    top: i === 0 ? 2 : i === 2 ? "auto" : "50%",
                    bottom: i === 2 ? 2 : "auto",
                    left: i === 3 ? 4 : i === 1 ? "auto" : "50%",
                    right: i === 1 ? 4 : "auto",
                    transform:
                      i === 0 || i === 2
                        ? "translateX(-50%)"
                        : i === 1 || i === 3
                          ? "translateY(-50%)"
                          : undefined,
                    color: dir === "N" ? "#ef4444" : undefined,
                  }}
                >
                  {dir}
                </span>
              ))}
            </motion.div>
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
              style={{
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "8px solid #fbbf24",
              }}
            />
            <div className="absolute font-mono text-md font-bold text-amber-400">
              {Math.round(normalizedHeading).toString().padStart(3, "0")}°
            </div>
          </div>
        </InstrumentBezel>
      </div>
    </div>
  );
}
