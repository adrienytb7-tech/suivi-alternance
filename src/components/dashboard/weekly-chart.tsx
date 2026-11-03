"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { parseISO, startOfWeek, format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { AlternanceApplication } from "@/types/application";

interface WeeklyChartProps {
  applications: AlternanceApplication[];
}

export function WeeklyEvolutionChart({ applications }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    const countsByWeek = new Map<string, { label: string; count: number; relances: number }>();

    applications.forEach((app) => {
      try {
        const parsed = parseISO(app.appliedDate);
        if (!isValid(parsed)) return;
        const weekStart = startOfWeek(parsed, { weekStartsOn: 1 });
        const key = format(weekStart, "yyyy-MM-dd");
        const label = `Sem. ${format(weekStart, "dd MMM", { locale: fr })}`;
        const existing = countsByWeek.get(key) || {
          label,
          count: 0,
          relances: 0,
        };
        existing.count += 1;
        if (app.status === "RELANCEE") {
          existing.relances += 1;
        }
        countsByWeek.set(key, existing);
      } catch {
        // ignore invalid dates
      }
    });

    return Array.from(countsByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([, val]) => val);
  }, [applications]);

  return (
    <div className="h-68 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCandidatures" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148, 163, 184, 0.2)"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#1e293b",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} démarches`, "Activité"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#0f766e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCandidatures)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
