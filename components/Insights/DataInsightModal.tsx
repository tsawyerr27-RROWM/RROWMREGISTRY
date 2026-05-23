"use client";

import ModalShell from "@/components/ui/ModalShell";
import { AnimatePresence } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Legend,
} from "recharts";

type LineSpec = { key: string; label: string };

const LINE_STROKES = [
  "#0d9488",
  "#6366f1",
  "#78716c",
  "#0ea5e9",
  "#a855f7",
] as const;

const tooltipContentStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "13px",
  boxShadow: "0 10px 24px -8px rgba(15,23,42,0.12)",
} as const;

export function DataInsightModal({
  open,
  onClose,
  title,
  subtitle,
  chartLoading,
  kind,
  data,
  lines,
  barKey = "events",
  breakdown,
  insights,
  dataNotes,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  /** When true, chart area shows a quiet loading state (subtitle stays interpretive copy). */
  chartLoading?: boolean;
  kind: "line" | "bar";
  data: any[];
  lines?: LineSpec[];
  barKey?: string;
  breakdown?: { label: string; value: string }[];
  insights?: string[];
  /** Context for how chart/breakdown relate (e.g. overlapping categories, definitions). */
  dataNotes?: string[];
}) {
  const lineSpecs = lines || [{ key: "value", label: "Value" }];
  const showLegend = kind === "line" && lineSpecs.length > 1;
  const hasChartData = Array.isArray(data) && data.length > 0;
  const isLoadingChart = Boolean(chartLoading);

  return (
    <AnimatePresence>
      {open ? (
        <ModalShell
          isOpen={open}
          onClose={onClose}
          tone="light"
          panelClassName="flex min-h-0 w-full max-w-3xl max-h-[min(92vh,56rem)] flex-col overflow-hidden"
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden
            >
              <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl" />
              <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-slate-400/10 blur-3xl" />
            </div>
            <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-7 pb-8 pt-14 [scrollbar-gutter:stable] md:px-10 md:pb-10 md:pt-16">
              <div className="space-y-8">
              <header className="space-y-2 border-b border-black/[0.06] pb-8">
                <h2 className="font-serif text-[1.65rem] font-normal leading-[1.15] tracking-tight text-neutral-950 md:text-3xl">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
                    {subtitle}
                  </p>
                ) : null}
              </header>

              <div className="space-y-8">
                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-b from-white/90 to-neutral-50/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">

                  <div className="relative h-[min(22rem,42vh)] w-full p-2 md:h-[min(24rem,44vh)] md:p-2">
                    {!hasChartData ? (
                      isLoadingChart ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
                          <div
                            className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-emerald-600"
                            aria-hidden
                          />
                          <p className="text-sm text-neutral-500">
                            Retrieving series on file…
                          </p>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-500">
                          No series data for this period.
                        </div>
                      )
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        {kind === "bar" ? (
                          <BarChart
                            data={data}
                            margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                          >
                            <CartesianGrid
                              stroke="rgba(15,23,42,0.06)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11, fill: "#737373" }}
                              tickLine={false}
                              axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "#737373" }}
                              tickLine={false}
                              axisLine={false}
                              width={40}
                            />
                            <defs>
                              <linearGradient
                                id="insightBarFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="rgb(13 148 136)"
                                  stopOpacity={0.9}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="rgb(13 148 136)"
                                  stopOpacity={0.45}
                                />
                              </linearGradient>
                            </defs>
                            <Tooltip
                              contentStyle={tooltipContentStyle}
                              labelStyle={{
                                color: "#525252",
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                              itemStyle={{ color: "#171717" }}
                              cursor={{
                                stroke: "rgba(15,23,42,0.08)",
                                strokeWidth: 1,
                              }}
                            />
                            <Bar
                              dataKey={barKey}
                              fill="url(#insightBarFill)"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={48}
                            />
                          </BarChart>
                        ) : (
                          <LineChart
                            data={data}
                            margin={{
                              top: showLegend ? 28 : 8,
                              right: 8,
                              left: 0,
                              bottom: 4,
                            }}
                          >
                            <CartesianGrid
                              stroke="rgba(15,23,42,0.06)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11, fill: "#737373" }}
                              tickLine={false}
                              axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "#737373" }}
                              tickLine={false}
                              axisLine={false}
                              width={44}
                            />
                            <Tooltip
                              contentStyle={tooltipContentStyle}
                              labelStyle={{
                                color: "#525252",
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                              itemStyle={{ color: "#171717" }}
                              cursor={{
                                stroke: "rgba(15,23,42,0.08)",
                                strokeWidth: 1,
                              }}
                            />
                            {showLegend ? (
                              <Legend
                                verticalAlign="top"
                                align="right"
                                wrapperStyle={{ paddingBottom: 8 }}
                                formatter={(value: string) => value}
                              />
                            ) : null}
                            {lineSpecs.map((l, idx) => (
                              <Line
                                key={l.key}
                                type="monotone"
                                dataKey={l.key}
                                name={l.label}
                                stroke={LINE_STROKES[idx % LINE_STROKES.length]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                  r: 4,
                                  strokeWidth: 0,
                                  fill: LINE_STROKES[idx % LINE_STROKES.length],
                                }}
                                isAnimationActive
                                animationDuration={420}
                              />
                            ))}
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {dataNotes && dataNotes.length > 0 ? (
                  <div
                    className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 px-4 py-3.5 text-sm leading-relaxed text-neutral-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]"
                    role="note"
                  >
                    <p className="font-semibold text-neutral-900">
                      How to read this
                    </p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-4">
                      {dataNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {breakdown && breakdown.length > 0 ? (
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Breakdown
                    </h3>
                    <ul className="mt-4 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.06] bg-white/60">
                      {breakdown.map((b, i) => (
                        <li
                          key={`${b.label}-${i}`}
                          className="flex items-baseline justify-between gap-6 px-4 py-3.5 text-sm first:pt-4 last:pb-4"
                        >
                          <span className="text-neutral-600">{b.label}</span>
                          <span className="shrink-0 rounded-xl bg-neutral-100/90 px-3 py-1 text-right font-semibold tabular-nums text-neutral-950">
                            {b.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {insights && insights.length > 0 ? (
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Notes
                    </h3>
                    <ul className="mt-4 space-y-3 rounded-xl border border-black/[0.06] bg-white/60 px-4 py-4 text-sm leading-relaxed text-neutral-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
                      {insights.slice(0, 4).map((t, i) => (
                        <li
                          key={`${t}-${i}`}
                          className="border-l-[3px] border-emerald-500/50 pl-3.5"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </AnimatePresence>
  );
}

