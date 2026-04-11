"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DataPoint = {
  label: string;
  fullDate: string;
  monthLabel: string | null;
  sent: number;
  clicked: number;
  reviewed: number;
};

function useWindowSize() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 640); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function useTrendLine(data: DataPoint[], key: "sent" | "clicked" | "reviewed") {
  return useMemo(() => {
    if (data.length < 2) return [];
    const values = data.map((d) => d[key]);
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((a, v, i) => a + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return values.map((_, i) => Math.max(0, intercept + slope * i));
  }, [data, key]);
}

export function StatsChart({ data }: { data: DataPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const isMobile = useWindowSize();

  const windowSize = isMobile ? 14 : 30;
  const maxOffset = Math.max(0, data.length - windowSize);

  // Ensure offset stays at end (most recent) by default
  const effectiveOffset = Math.min(offset, maxOffset);
  const visibleData = data.slice(effectiveOffset, effectiveOffset + windowSize);

  const canGoLeft = effectiveOffset > 0;
  const canGoRight = effectiveOffset < maxOffset;

  const trendSent = useTrendLine(visibleData, "sent");

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Aucune donnée sur cette période.
      </div>
    );
  }

  const maxVal = Math.max(...visibleData.map((d) => d.sent), 1);
  const trendMax = Math.max(...trendSent, 0);
  const chartMax = Math.max(maxVal, trendMax, 1);

  const labelInterval = visibleData.length > 20 ? 5 : visibleData.length > 10 ? 3 : visibleData.length > 7 ? 2 : 1;

  // SVG trend line points
  const trendPoints = trendSent.map((val, i) => {
    const x = (i / (visibleData.length - 1 || 1)) * 100;
    const y = 100 - (val / chartMax) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div>
      {/* Legend + Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
            Envoyés
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
            Cliqués
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            Avis obtenus
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-emerald-500 rounded" />
            <span className="text-muted-foreground">Tendance</span>
          </span>
        </div>

        {/* Navigation arrows */}
        {data.length > windowSize && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset(Math.max(0, effectiveOffset - 7))}
              disabled={!canGoLeft}
              className="p-2.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Période précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOffset(Math.min(maxOffset, effectiveOffset + 7))}
              disabled={!canGoRight}
              className="p-2.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Période suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Tooltip */}
        {hoveredIndex !== null && visibleData[hoveredIndex] && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs z-10 pointer-events-none whitespace-nowrap max-w-[90vw]">
            <p className="font-semibold mb-1">{visibleData[hoveredIndex].fullDate}</p>
            <p>Envoyés : {visibleData[hoveredIndex].sent}</p>
            <p>Cliqués : {visibleData[hoveredIndex].clicked}</p>
            <p>Avis : {visibleData[hoveredIndex].reviewed}</p>
          </div>
        )}

        {/* Bars + Trend overlay */}
        <div className="relative h-40 sm:h-48">
          {/* Bars container */}
          <div className="flex items-end gap-[2px] sm:gap-1 h-full relative z-[1]">
            {visibleData.map((d, i) => {
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

          {/* SVG trend line overlay */}
          {trendSent.length >= 2 && (
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
          )}
        </div>

        {/* X-axis: month labels */}
        <div className="flex gap-[2px] sm:gap-1 mt-1">
          {visibleData.map((d, i) => (
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
          {visibleData.map((d, i) => (
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
