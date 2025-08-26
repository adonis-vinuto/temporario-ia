"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { city: "teste1", man: 186, woman: 80, total: 186 + 80 },
  { city: "teste2", man: 305, woman: 200, total: 305 + 200 },
  { city: "teste3", man: 237, woman: 120, total: 237 + 120 },
]

const chartConfig = {
  man: {
    label: "Homens",
    color: "#6b21a8", // bg-purple-800
  },
  woman: {
    label: "Mulheres",
    color: "#9333ea", // bg-purple-600
  },
  total: {
    label: "Total",
    color: "#c084fc", // bg-purple-400
  },
} satisfies ChartConfig

export function EmployeesByCityChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full bg-zinc-900">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} stroke="#3f3f46" />
        <XAxis
          dataKey="city"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="man" fill={chartConfig.man.color} radius={4} />
        <Bar dataKey="woman" fill={chartConfig.woman.color} radius={4} />
        <Bar dataKey="total" fill={chartConfig.total.color} radius={4} />
      </BarChart>
    </ChartContainer>
  )
}