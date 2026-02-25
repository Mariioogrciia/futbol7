"use client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useTeamData } from "@/components/providers/team-provider";

const COLORS = ["#22c55e", "#ef4444", "#fbbf24"];

export default function StatsChart() {
  const { stats } = useTeamData();

  const data = [
    { name: "Victorias", value: stats.victorias },
    { name: "Derrotas", value: stats.derrotas },
    { name: "Empates", value: stats.empates },
  ];
  return (
    <div className="w-full max-w-md mx-auto bg-background rounded-xl shadow-lg p-6 border border-primary">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Resumen de la temporada</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value ?? 0} partido(s)`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
