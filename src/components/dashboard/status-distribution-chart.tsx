"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlternanceApplication,
  ApplicationStatus,
  STATUS_CONFIG,
} from "@/types/application";

interface StatusDistributionChartProps {
  applications: AlternanceApplication[];
}

export function StatusDistributionChart({
  applications,
}: StatusDistributionChartProps) {
  const [chartTab, setChartTab] = useState<"statut" | "ville">("statut");

  const statusData = useMemo(() => {
    const statuses = Object.keys(STATUS_CONFIG) as ApplicationStatus[];
    return statuses
      .map((st) => {
        const count = applications.filter((a) => a.status === st).length;
        return {
          name: STATUS_CONFIG[st].label,
          value: count,
          color: STATUS_CONFIG[st].hexColor,
        };
      })
      .filter((item) => item.value > 0);
  }, [applications]);

  const cityData = useMemo(() => {
    let nantes = 0;
    let angers = 0;
    let autres = 0;

    applications.forEach((a) => {
      const c = a.city.toLowerCase();
      if (
        c.includes("nantes") ||
        c.includes("herblain") ||
        c.includes("rezé") ||
        c.includes("orvault") ||
        c.includes("carquefou") ||
        c.includes("chevrolière") ||
        c.includes("bouguenais")
      ) {
        nantes += 1;
      } else if (c.includes("angers") || c.includes("montreuil")) {
        angers += 1;
      } else {
        autres += 1;
      }
    });

    return [
      { name: "Nantes & Agglo (44)", count: nantes, fill: "#0f766e" },
      { name: "Angers & Agglo (49)", count: angers, fill: "#3b82f6" },
      { name: "Autres (Cholet, 35...)", count: autres, fill: "#64748b" },
    ];
  }, [applications]);

  const total = applications.length || 1;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Répartition des candidatures
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vue synthétique par statut ou par bassin d&apos;emploi
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={() => setChartTab("statut")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              chartTab === "statut"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Par statut
          </button>
          <button
            type="button"
            onClick={() => setChartTab("ville")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              chartTab === "ville"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Par ville
          </button>
        </div>
      </div>

      {chartTab === "statut" ? (
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 flex-1">
          <div className="h-48 w-48 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `${value} (${Math.round((value / total) * 100)}%)`,
                    "Candidatures",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {applications.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                Total
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            {statusData.map((item) => {
              const pct = Math.round((item.value / total) * 100);
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.value}
                    </span>
                    <span className="text-slate-400 w-9 text-right">
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cityData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={135}
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
                formatter={(value: number) => [
                  `${value} candidatures`,
                  "Nombre",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                {cityData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
