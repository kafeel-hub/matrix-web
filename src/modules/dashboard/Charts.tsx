/**
 * Small, dependency-free SVG chart primitives for the Dashboard's
 * TailAdmin-style visualizations. Deliberately simple, well-understood
 * techniques (scaled rectangles, plain polylines, stroke-dasharray rings)
 * rather than complex arc-path math — this project has no charting
 * library and these can't be visually verified by rendering in a browser
 * during development, so reliability took priority over exactly
 * replicating every curve of the reference design.
 */

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string; // any valid CSS color
  height?: number;
  valueFormat?: (value: number) => string;
}

export function BarChart({ data, color = "#d4af37", height = 220, valueFormat }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidthPct = 100 / data.length;

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="group relative flex h-full flex-col justify-end"
            style={{ width: `${barWidthPct}%` }}
          >
            <div
              className="mx-auto w-2/3 rounded-t-sm transition-all"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: d.value > 0 ? 2 : 0 }}
              title={valueFormat ? valueFormat(d.value) : String(d.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px]">
        {data.map((d, i) => (
          <div key={i} className="truncate text-center text-[10px] text-ink-700/50" style={{ width: `${barWidthPct}%` }}>
            {data.length > 15 && i % Math.ceil(data.length / 15) !== 0 ? "" : d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AreaSeries {
  name: string;
  color: string;
  values: number[];
}

interface AreaChartProps {
  labels: string[];
  series: AreaSeries[];
  height?: number;
}

/**
 * Simple multi-series area/line chart. Points are placed at even
 * intervals across the width (a plain linear x-scale, no date-aware
 * spacing) and connected with straight line segments — a polyline
 * approximation rather than a smoothed curve, which keeps the path math
 * unambiguous.
 */
export function AreaChart({ labels, series, height = 220 }: AreaChartProps) {
  const width = 600; // viewBox units; scales responsively via the SVG's own width:100%
  const padding = 8;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const min = 0;
  const range = max - min || 1;
  const n = labels.length;

  function pointsFor(values: number[]) {
    return values.map((v, i) => {
      const x = n <= 1 ? width / 2 : padding + (i / (n - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return [x, y] as const;
    });
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={padding + f * (height - padding * 2)}
            y2={padding + f * (height - padding * 2)}
            stroke="#e4e7ec"
            strokeWidth={1}
          />
        ))}
        {series.map((s) => {
          const points = pointsFor(s.values);
          const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
          const areaPath = `${linePath} L${points[points.length - 1]?.[0] ?? 0},${height - padding} L${points[0]?.[0] ?? 0},${height - padding} Z`;
          return (
            <g key={s.name}>
              <path d={areaPath} fill={s.color} fillOpacity={0.08} stroke="none" />
              <path d={linePath} fill="none" stroke={s.color} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-ink-700/50">
        <span>{labels[0]}</span>
        {labels.length > 2 && <span>{labels[Math.floor((labels.length - 1) / 2)]}</span>}
        <span>{labels[labels.length - 1]}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-xs text-ink-700/70">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StackedBarChartProps {
  labels: string[];
  segments: { name: string; color: string; values: number[] }[];
  height?: number;
  valueFormat?: (value: number) => string;
}

/**
 * Same scaled-rectangle technique as BarChart, stacked — only meaningful
 * when the segments are genuinely additive parts of a whole (e.g. making
 * charge cost + profit = sales), not just two series plotted together.
 */
export function StackedBarChart({ labels, segments, height = 220, valueFormat }: StackedBarChartProps) {
  const totals = labels.map((_, i) => segments.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const max = Math.max(...totals, 1);
  const barWidthPct = 100 / labels.length;

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {labels.map((_, i) => (
          <div key={i} className="flex h-full flex-col justify-end" style={{ width: `${barWidthPct}%` }}>
            <div
              className="mx-auto flex w-2/3 flex-col-reverse overflow-hidden rounded-t-sm"
              style={{ height: `${(totals[i] / max) * 100}%` }}
              title={valueFormat ? valueFormat(totals[i]) : String(totals[i])}
            >
              {segments.map((s) => (
                <div
                  key={s.name}
                  style={{
                    height: totals[i] > 0 ? `${((s.values[i] ?? 0) / totals[i]) * 100}%` : 0,
                    backgroundColor: s.color,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px]">
        {labels.map((label, i) => (
          <div key={i} className="truncate text-center text-[10px] text-ink-700/50" style={{ width: `${barWidthPct}%` }}>
            {labels.length > 15 && i % Math.ceil(labels.length / 15) !== 0 ? "" : label}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-xs text-ink-700/70">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

/**
 * A tiny trend line for embedding inside a stat card — no axis, no
 * labels, just a shape. Same plain-polyline approach as AreaChart, scaled
 * down.
 */
export function Sparkline({ values, color = "#d4af37", width = 100, height = 36 }: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} preserveAspectRatio="none">
      <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

interface RadialGaugeProps {
  percentage: number; // 0-100
  label: string;
  sublabel?: string;
  color?: string;
}

/**
 * A circular progress ring (stroke-dasharray technique), not the
 * reference design's semi-donut arc — a full ring is a simpler, more
 * reliable SVG technique to get right without being able to render and
 * check it, and reads the same way at a glance (percentage filled).
 */
export function RadialGauge({ percentage, label, sublabel, color = "#d4af37" }: RadialGaugeProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 180" className="h-44 w-44">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#e4e7ec" strokeWidth={14} />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="86" textAnchor="middle" className="fill-ink-900" style={{ fontSize: 28, fontWeight: 700 }}>
          {clamped.toFixed(1)}%
        </text>
        <text x="90" y="106" textAnchor="middle" className="fill-ink-700/50" style={{ fontSize: 11 }}>
          {label}
        </text>
      </svg>
      {sublabel && <p className="mt-1 text-center text-xs text-ink-700/60">{sublabel}</p>}
    </div>
  );
}
