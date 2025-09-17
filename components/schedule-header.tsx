"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

interface ScheduleHeaderProps {
  view: "current" | "full"
  onViewChange: (view: "current" | "full") => void
}

export function ScheduleHeader({ view, onViewChange }: ScheduleHeaderProps) {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-primary">互動式課表</h1>
            <p className="text-muted-foreground mt-1">即時顯示當前課程與完整課表</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === "current" ? "default" : "outline"}
              onClick={() => onViewChange("current")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              當前課程
            </Button>
            <Button
              variant={view === "full" ? "default" : "outline"}
              onClick={() => onViewChange("full")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              完整課表
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
