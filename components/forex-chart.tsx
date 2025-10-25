"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ForexPair {
  pair: string
  currentRate: number
  change: number
  changePercent: string
  data: { time: string; rate: number }[]
}

const forexData: ForexPair[] = [
  {
    pair: "USD/MZN",
    currentRate: 63.45,
    change: 1.45,
    changePercent: "+2.3%",
    data: [
      { time: "09:00", rate: 62.0 },
      { time: "10:00", rate: 62.3 },
      { time: "11:00", rate: 62.8 },
      { time: "12:00", rate: 62.5 },
      { time: "13:00", rate: 63.1 },
      { time: "14:00", rate: 63.45 },
    ],
  },
  {
    pair: "EUR/MZN",
    currentRate: 68.92,
    change: 1.22,
    changePercent: "+1.8%",
    data: [
      { time: "09:00", rate: 67.7 },
      { time: "10:00", rate: 67.9 },
      { time: "11:00", rate: 68.2 },
      { time: "12:00", rate: 68.5 },
      { time: "13:00", rate: 68.7 },
      { time: "14:00", rate: 68.92 },
    ],
  },
  {
    pair: "GBP/MZN",
    currentRate: 79.15,
    change: -0.4,
    changePercent: "-0.5%",
    data: [
      { time: "09:00", rate: 79.55 },
      { time: "10:00", rate: 79.4 },
      { time: "11:00", rate: 79.3 },
      { time: "12:00", rate: 79.25 },
      { time: "13:00", rate: 79.2 },
      { time: "14:00", rate: 79.15 },
    ],
  },
]

export function ForexChart() {
  const [selectedPair, setSelectedPair] = useState<ForexPair>(forexData[0])

  const isPositive = selectedPair.change > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Forex Trading</CardTitle>
            <CardDescription>Taxas de câmbio em tempo real</CardDescription>
          </div>
          <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {selectedPair.changePercent}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currency Pair Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {forexData.map((forex) => (
            <Button
              key={forex.pair}
              variant={selectedPair.pair === forex.pair ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPair(forex)}
              className={
                selectedPair.pair === forex.pair
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  : "bg-transparent"
              }
            >
              {forex.pair}
            </Button>
          ))}
        </div>

        {/* Current Rate Display */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Taxa Atual</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{selectedPair.currentRate.toFixed(2)}</span>
            <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? "+" : ""}
              {selectedPair.change.toFixed(2)} ({selectedPair.changePercent})
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedPair.data}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">Comprar</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">Vender</Button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Abertura</p>
            <p className="text-sm font-semibold">{selectedPair.data[0].rate.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Máxima</p>
            <p className="text-sm font-semibold">{Math.max(...selectedPair.data.map((d) => d.rate)).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mínima</p>
            <p className="text-sm font-semibold">{Math.min(...selectedPair.data.map((d) => d.rate)).toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
