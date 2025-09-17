"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, PieChart, Pie, Cell, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  [key: string]: any
}

interface BaseChartProps {
  data: ChartData[]
  title: string
  description?: string
  className?: string
}

interface LineChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
}

interface BarChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
}

interface AreaChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
}

interface PieChartProps extends BaseChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
}

const defaultColors = [
  "#008080", // featured color
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#84cc16", // lime
]

export function AnalyticsLineChart({ data, title, description, xDataKey, yDataKey, color = "#008080", className }: LineChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis
              dataKey={xDataKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))"
              }}
            />
            <Line
              type="monotone"
              dataKey={yDataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AnalyticsBarChart({ data, title, description, xDataKey, yDataKey, color = "#008080", className }: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey={xDataKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))"
              }}
            />
            <Bar dataKey={yDataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AnalyticsAreaChart({ data, title, description, xDataKey, yDataKey, color = "#008080", className }: AreaChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <XAxis
              dataKey={xDataKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))"
              }}
            />
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke={color}
              fill={`${color}20`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPieChart({ data, title, description, dataKey, nameKey, colors = defaultColors, className }: PieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  change?: {
    value: number
    period: string
  }
  className?: string
}

export function MetricCard({ title, value, description, icon, change, className }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <Card className={`border-muted/50 hover:border-muted transition-colors ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-muted/50">{icon}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{formatValue(value)}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {change && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 text-sm font-medium ${
                change.value > 0 ? 'text-green-600' : change.value < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {change.value > 0 && '+'}
                {change.value.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">{change.period}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}