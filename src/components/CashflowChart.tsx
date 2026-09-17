"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/invoice";
import type { MonthlyCashflowPoint } from "@/lib/actions/dashboard";

const PAID_COLOR = "#059669"; // status: paid / good
const UNPAID_COLOR = "#B45309"; // status: unpaid / pending
const GRID_COLOR = "#E4E7EB";
const AXIS_TEXT = "#64748B";

const WIDTH = 720;
const HEIGHT = 220;
const PADDING_LEFT = 48;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function compactIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

function niceMax(value: number) {
  if (value <= 0) return 1_000_000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

export function CashflowChart({ data }: { data: MonthlyCashflowPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxRaw = Math.max(1, ...data.map((d) => Math.max(d.tertagih, d.belumDibayar)));
  const max = niceMax(maxRaw);
  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(22, groupWidth / 2 - 4);
  const gap = 2;

  const yToPx = (v: number) => PADDING_TOP + plotHeight - (v / max) * plotHeight;
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  const hoveredPoint = hovered !== null ? data[hovered] : null;
  const tooltipX = hovered !== null ? PADDING_LEFT + hovered * groupWidth + groupWidth / 2 : 0;

  if (data.every((d) => d.tertagih === 0 && d.belumDibayar === 0)) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Belum ada data cashflow untuk ditampilkan
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: PAID_COLOR }}
          />
          Tertagih
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: UNPAID_COLOR }}
          />
          Belum Dibayar
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Tren cashflow bulanan: tertagih vs belum dibayar"
      >
        {gridSteps.map((step) => {
          const y = PADDING_TOP + plotHeight - step * plotHeight;
          return (
            <g key={step}>
              <line
                x1={PADDING_LEFT}
                x2={WIDTH - PADDING_RIGHT}
                y1={y}
                y2={y}
                stroke={GRID_COLOR}
                strokeWidth={1}
              />
              <text x={PADDING_LEFT - 8} y={y + 3} fontSize={9} fill={AXIS_TEXT} textAnchor="end">
                {compactIdr(step * max)}
              </text>
            </g>
          );
        })}

        {data.map((point, i) => {
          const groupX = PADDING_LEFT + i * groupWidth;
          const barsCenterOffset = (groupWidth - (barWidth * 2 + gap)) / 2;
          const xPaid = groupX + barsCenterOffset;
          const xUnpaid = xPaid + barWidth + gap;
          const hPaid = (point.tertagih / max) * plotHeight;
          const hUnpaid = (point.belumDibayar / max) * plotHeight;
          const isHovered = hovered === i;

          return (
            <g
              key={point.key}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <rect
                x={groupX}
                y={PADDING_TOP}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
              />
              <rect
                x={xPaid}
                y={yToPx(point.tertagih)}
                width={barWidth}
                height={Math.max(hPaid, 0)}
                rx={4}
                fill={PAID_COLOR}
                opacity={isHovered ? 1 : 0.9}
              />
              <rect
                x={xUnpaid}
                y={yToPx(point.belumDibayar)}
                width={barWidth}
                height={Math.max(hUnpaid, 0)}
                rx={4}
                fill={UNPAID_COLOR}
                opacity={isHovered ? 1 : 0.9}
              />
              <text
                x={groupX + groupWidth / 2}
                y={HEIGHT - 8}
                fontSize={9}
                fill={AXIS_TEXT}
                textAnchor="middle"
              >
                {point.label.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(tooltipX / WIDTH) * 100}%`,
            top: 4,
          }}
        >
          <div className="mb-1 font-medium text-foreground">{hoveredPoint.label}</div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: PAID_COLOR }}
            />
            Tertagih:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(hoveredPoint.tertagih)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: UNPAID_COLOR }}
            />
            Belum Dibayar:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(hoveredPoint.belumDibayar)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
