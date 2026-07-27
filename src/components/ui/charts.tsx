'use client'

import * as React from 'react'

export type MiniBarChartProps = {
  data: { label: string; value: number }[]
  highlightIndex?: number
  className?: string
}

/**
 * Small sparkline-style bar row (e.g. last 7 days). Hand-rolled SVG rather
 * than a charting library — no chart dependency (recharts, chart.js, etc.)
 * was found anywhere in this project, so this avoids introducing one for a
 * handful of bars.
 */
export function MiniBarChart({ data, highlightIndex, className }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const activeIndex = highlightIndex ?? data.length - 1

  return (
    <div className={`flex h-16 items-end gap-1.5 ${className ?? ''}`} role="img" aria-label="Recent activity">
      {data.map((point, i) => {
        const heightPct = Math.max(12, (point.value / max) * 100)
        const isActive = i === activeIndex
        return (
          <div
            key={point.label}
            title={`${point.label}: ${point.value}`}
            className={`flex-1 rounded-md transition-all ${isActive ? 'bg-primary-500' : 'bg-gray-50'}`}
            style={{ height: `${heightPct}%` }}
          />
        )
      })}
    </div>
  )
}

export type AreaChartPoint = { label: string; value: number }

export type AreaChartProps = {
  data: AreaChartPoint[]
  height?: number
  yTicks?: number
  formatY?: (value: number) => string
  className?: string
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!
    const p1 = points[i + 1]!
    const midX = (p0.x + p1.x) / 2
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

/**
 * Yearly/monthly earnings-style area chart. Hand-rolled SVG (see MiniBarChart
 * note above) with a gradient fill and a smoothed line through the points.
 */
export function AreaChart({ data, height = 260, yTicks = 4, formatY, className }: AreaChartProps) {
  const gradientId = React.useId()
  const paddingLeft = 56
  const paddingBottom = 28
  const paddingTop = 12
  const width = 1000

  const max = Math.max(...data.map((d) => d.value), 1)
  const niceMax = Math.ceil(max / 1000) * 1000 || 1000
  const plotWidth = width - paddingLeft
  const plotHeight = height - paddingBottom - paddingTop

  const points = data.map((d, i) => ({
    x: paddingLeft + (i / (data.length - 1 || 1)) * plotWidth,
    y: paddingTop + plotHeight - (d.value / niceMax) * plotHeight,
  }))

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? paddingLeft} ${paddingTop + plotHeight} L ${paddingLeft} ${paddingTop + plotHeight} Z`

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (niceMax / yTicks) * i)

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-500, #F25B38)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-primary-500, #F25B38)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = paddingTop + plotHeight - (tick / niceMax) * plotHeight
          return (
            <g key={tick}>
              <line x1={paddingLeft} y1={y} x2={width} y2={y} stroke="#EAEAEA" strokeWidth={1} />
              <text x={0} y={y + 4} fontSize={12} fill="#788191">
                {formatY ? formatY(tick) : tick}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="#F25B38" strokeWidth={2.5} strokeLinecap="round" />

        {data.map((d, i) => (
          <text key={d.label} x={points[i]!.x} y={height} fontSize={12} fill="#788191" textAnchor="middle">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
