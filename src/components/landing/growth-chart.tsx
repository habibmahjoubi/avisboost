"use client";

import { useState } from "react";

// Hardcoded growth data (30 days) — deterministic, no hydration mismatch
const CHART_DATA = [
  { label: "13", fullDate: "13 mars", monthLabel: "mars", sent: 2, clicked: 1, reviewed: 0 },
  { label: "14", fullDate: "14 mars", monthLabel: null, sent: 3, clicked: 1, reviewed: 0 },
  { label: "15", fullDate: "15 mars", monthLabel: null, sent: 2, clicked: 1, reviewed: 1 },
  { label: "16", fullDate: "16 mars", monthLabel: null, sent: 3, clicked: 2, reviewed: 1 },
  { label: "17", fullDate: "17 mars", monthLabel: null, sent: 4, clicked: 2, reviewed: 1 },
  { label: "18", fullDate: "18 mars", monthLabel: null, sent: 3, clicked: 2, reviewed: 1 },
  { label: "19", fullDate: "19 mars", monthLabel: null, sent: 4, clicked: 2, reviewed: 1 },
  { label: "20", fullDate: "20 mars", monthLabel: null, sent: 3, clicked: 1, reviewed: 0 },
  { label: "21", fullDate: "21 mars", monthLabel: null, sent: 5, clicked: 3, reviewed: 1 },
  { label: "22", fullDate: "22 mars", monthLabel: null, sent: 4, clicked: 2, reviewed: 1 },
  { label: "23", fullDate: "23 mars", monthLabel: null, sent: 5, clicked: 3, reviewed: 2 },
  { label: "24", fullDate: "24 mars", monthLabel: null, sent: 4, clicked: 3, reviewed: 1 },
  { label: "25", fullDate: "25 mars", monthLabel: null, sent: 5, clicked: 3, reviewed: 2 },
  { label: "26", fullDate: "26 mars", monthLabel: null, sent: 6, clicked: 3, reviewed: 2 },
  { label: "27", fullDate: "27 mars", monthLabel: null, sent: 5, clicked: 4, reviewed: 2 },
  { label: "28", fullDate: "28 mars", monthLabel: null, sent: 6, clicked: 4, reviewed: 2 },
  { label: "29", fullDate: "29 mars", monthLabel: null, sent: 5, clicked: 3, reviewed: 2 },
  { label: "30", fullDate: "30 mars", monthLabel: null, sent: 7, clicked: 4, reviewed: 3 },
  { label: "31", fullDate: "31 mars", monthLabel: null, sent: 6, clicked: 4, reviewed: 2 },
  { label: "1", fullDate: "1 avr.", monthLabel: "avr.", sent: 7, clicked: 5, reviewed: 3 },
  { label: "2", fullDate: "2 avr.", monthLabel: null, sent: 6, clicked: 4, reviewed: 2 },
  { label: "3", fullDate: "3 avr.", monthLabel: null, sent: 8, clicked: 5, reviewed: 3 },
  { label: "4", fullDate: "4 avr.", monthLabel: null, sent: 7, clicked: 5, reviewed: 3 },
  { label: "5", fullDate: "5 avr.", monthLabel: null, sent: 7, clicked: 5, reviewed: 3 },
  { label: "6", fullDate: "6 avr.", monthLabel: null, sent: 8, clicked: 6, reviewed: 4 },
  { label: "7", fullDate: "7 avr.", monthLabel: null, sent: 8, clicked: 5, reviewed: 3 },
  { label: "8", fullDate: "8 avr.", monthLabel: null, sent: 9, clicked: 6, reviewed: 4 },
  { label: "9", fullDate: "9 avr.", monthLabel: null, sent: 8, clicked: 6, reviewed: 4 },
  { label: "10", fullDate: "10 avr.", monthLabel: null, sent: 9, clicked: 7, reviewed: 5 },
  { label: "11", fullDate: "11 avr.", monthLabel: null, sent: 10, clicked: 7, reviewed: 5 },
];

export function GrowthChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = CHART_DATA;

  const maxVal = Math.max(...data.map((d) => d.sent), 1);

  // Trend line (linear regression on sent)
  const values = data.map((d) => d.sent);
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((a, v, i) => a + i * v, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trend = values.map((_, i) => Math.max(0, intercept + slope * i));
  const trendMax = Math.max(...trend, 0);
  const chartMax = Math.max(maxVal, trendMax, 1);

  const trendPoints = trend.map((val, i) => {
    const x = (i / (n - 1)) * 100;
    const y = 100 - (val / chartMax) * 100;
    return `${x},${y}`;
  }).join(" ");

  const labelInterval = 5;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
          Demandes envoyées
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
          Liens cliqués
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
          Avis Google obtenus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-[2px] bg-emerald-500 rounded" />
          <span className="text-muted-foreground">Tendance</span>
        </span>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs z-10 pointer-events-none whitespace-nowrap max-w-[90vw]">
            <p className="font-semibold mb-1">{data[hoveredIndex].fullDate}</p>
            <p>Envoyés : {data[hoveredIndex].sent}</p>
            <p>Cliqués : {data[hoveredIndex].clicked}</p>
            <p>Avis : {data[hoveredIndex].reviewed}</p>
          </div>
        )}

        {/* Bars + Trend */}
        <div className="relative h-36 sm:h-44">
          <div className="flex items-end gap-[2px] sm:gap-1 h-full relative z-[1]">
            {data.map((d, i) => {
              const sentH = (d.sent / chartMax) * 100;
              const clickedH = (d.clicked / chartMax) * 100;
              const reviewedH = (d.reviewed / chartMax) * 100;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                >
                  <div className="w-full h-full relative">
                    <div
                      className="w-full rounded-t-sm bg-primary/20 group-hover:bg-primary/30 transition-colors absolute bottom-0"
                      style={{ height: `${sentH}%`, minHeight: d.sent > 0 ? "2px" : "0" }}
                    />
                    <div
                      className="w-full rounded-t-sm bg-primary/50 group-hover:bg-primary/60 transition-colors absolute bottom-0"
                      style={{ height: `${clickedH}%`, minHeight: d.clicked > 0 ? "2px" : "0" }}
                    />
                    <div
                      className="w-full rounded-t-sm bg-primary group-hover:brightness-110 transition-all absolute bottom-0"
                      style={{ height: `${reviewedH}%`, minHeight: d.reviewed > 0 ? "2px" : "0" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* SVG trend line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={trendPoints}
              fill="none"
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* X-axis: month labels */}
        <div className="flex gap-[2px] sm:gap-1 mt-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              {d.monthLabel ? (
                <span className="text-[9px] sm:text-[10px] text-primary font-semibold leading-none">
                  {d.monthLabel}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* X-axis: day numbers */}
        <div className="flex gap-[2px] sm:gap-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              {i % labelInterval === 0 ? (
                <span className="text-[9px] sm:text-[10px] text-muted-foreground leading-none">
                  {d.label}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
