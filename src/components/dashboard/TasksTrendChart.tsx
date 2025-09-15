import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
} from "recharts";
import styles from "../../styles/Dashboard.module.css";

interface Point {
  date: string; // YYYY-MM-DD
  created: number;
  completed: number;
}

interface Props {
  data: Point[];
  title?: string;
  initialRange?: 30; // days
  onPointClick?: (date: string) => void;
}

export default function TasksTrendChart({
  data,
  title = "Tasks (created vs completed)",
  initialRange = 30,
  onPointClick,
}: Props) {
  const ranges = [7, 14, 30, 90];
  const [range, setRange] = useState<number>(initialRange);

  // ensure data sorted asc by date
  const sorted = useMemo(() => {
    return [...(data || [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  // sliced data for selected range (last N days)
  const sliced = useMemo(() => {
    if (!sorted.length) return [];
    const N = Math.max(1, range);
    return sorted.slice(Math.max(0, sorted.length - N));
  }, [sorted, range]);

  const totals = useMemo(() => {
    const created = sliced.reduce((s, p) => s + (p.created || 0), 0);
    const completed = sliced.reduce((s, p) => s + (p.completed || 0), 0);
    return { created, completed };
  }, [sliced]);

  const tickFormatter = (v: string) => {
    if (!v) return "";
    return v.slice(5);
  };

  const tooltipFormatter = (value: number, name: string) => {
    const label = name === "created" ? "Created" : "Completed";
    return [`${value}`, label];
  };

  const tooltipLabelFormatter = (label: string) => {
    try {
      const d = new Date(label);
      return d.toLocaleDateString();
    } catch {
      return label;
    }
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h4 className={styles.cardTitle}>{title}</h4>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* <div className={styles.rangeTotals}>
            <small style={{ color: "#6b7280" }}>In range</small>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700 }}>{totals.created}</div>
                <small style={{ color: "#6b7280" }}>created</small>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700 }}>{totals.completed}</div>
                <small style={{ color: "#6b7280" }}>completed</small>
              </div>
            </div>
          </div> */}

          <div className={styles.rangeButtons}>
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`${styles.rangeBtn} ${
                  r === range ? styles.rangeActive : ""
                }`}
                aria-pressed={r === range}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart
            data={sliced}
            margin={{ top: 8, right: 18, left: 0, bottom: 6 }}
            onClick={(e: any) => {
              if (e && e.activeLabel && onPointClick) {
                onPointClick(e.activeLabel as string);
              }
            }}
          >
            <defs>
              <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 6"
              stroke="#eef2ff"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              minTickGap={10}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={tooltipLabelFormatter}
              wrapperStyle={{ zIndex: 1000, outline: "none" }}
            />
            <Legend verticalAlign="top" height={36} />

            <Area
              type="monotone"
              dataKey="created"
              name="created"
              stroke="#6366f1"
              fill="url(#gradCreated)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="completed"
              stroke="#10b981"
              fill="url(#gradCompleted)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {sliced.length > 30 && (
              <Brush
                dataKey="date"
                height={24}
                stroke="#94a3b8"
                travellerWidth={10}
                startIndex={Math.max(
                  0,
                  sliced.length - Math.min(sliced.length, range)
                )}
                endIndex={sliced.length - 1}
                tickFormatter={(d: string) => d.slice(5)}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
