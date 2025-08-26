"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { SalaryHistory } from "@/lib/interface/SalaryHistory";

// Configuração do gráfico
const chartConfig = {
  salary: {
    label: "Salário",
    color: "#9333ea", // bg-purple-600
  },
};

export function SalaryProgressionChart({
  salaryHistory,
}: {
  salaryHistory?: SalaryHistory[];
}) {
  const chartData = salaryHistory?.map((item) => ({
    date: new Date(item.change_date),
    salary: item.new_salary,
    motive: item.motive_name,
  }));

  return (
    <div className="p-6 bg-zinc-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-4">
        Progressão de Salário
      </h1>
      <div className="w-[1200px] h-[600px] mx-auto">
        <LineChart width={1200} height={600} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(date, "dd/MM/yyyy")}
            tick={{ fill: "#ffffff" }}
            stroke="#ffffff"
          />
          <YAxis tick={{ fill: "#ffffff" }} stroke="#ffffff" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-zinc-700 p-2 rounded text-white">
                    <p>Data: {format(data.date, "dd/MM/yyyy")}</p>
                    <p>Salário: R$ {data.salary}</p>
                    <p>Motivo: {data.motive}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ color: "#ffffff" }} />
          <Line
            type="monotone"
            dataKey="salary"
            stroke={chartConfig.salary.color}
            strokeWidth={2}
            dot={{ r: 4, fill: chartConfig.salary.color }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </div>
    </div>
  );
}
