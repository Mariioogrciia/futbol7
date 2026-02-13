"use client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { stats } from "@/lib/data";

const COLORS = ["#22c55e", "#ef4444", "#fbbf24"];

const data = [
  { name: "Victorias", value: stats.won },
  { name: "Derrotas", value: stats.lost },
  { name: "Empates", value: stats.drawn },
];

export default function StatsChart() {
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
          <Tooltip formatter={(value: number) => `${value} partido(s)`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
