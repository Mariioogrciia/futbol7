"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTeamData } from "@/components/providers/team-provider";

const CHART_COLORS = {
  win:  "#10b981", // emerald-500
  loss: "#ef4444", // red-500
  draw: "#f59e0b", // amber-500
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0D1520] px-4 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-xs font-black text-white">{payload[0].name}</p>
      <p className="text-lg font-black tabular-nums" style={{ color: payload[0].payload.fill }}>
        {payload[0].value} partido{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-bold text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsChart() {
  const { stats } = useTeamData();

  const data = [
    { name: "Victorias", value: stats.victorias,  fill: CHART_COLORS.win },
    { name: "Derrotas",  value: stats.derrotas,   fill: CHART_COLORS.loss },
    { name: "Empates",   value: stats.empates,    fill: CHART_COLORS.draw },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm font-bold">
        Sin partidos registrados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.fill} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
