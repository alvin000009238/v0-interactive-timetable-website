"use client"

import { useState, useEffect } from "react"
import { ScheduleHeader } from "@/components/schedule-header"
import { CurrentClassCard } from "@/components/current-class-card"
import { FullSchedule } from "@/components/full-schedule"
import type { ScheduleItem } from "@/lib/schedule-utils"
import scheduleData from "@/data/schedule.json"

export default function HomePage() {
  const [view, setView] = useState<"current" | "full">("current")
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  useEffect(() => {
    // Parse the schedule data
    setSchedule(scheduleData as ScheduleItem[])

    // Request notification permission if not already granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[PWA] Notification permission:", permission)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <ScheduleHeader view={view} onViewChange={setView} />

      <main className="container mx-auto px-4 py-8">
        {view === "current" ? (
          <div className="flex justify-center">
            <CurrentClassCard schedule={schedule} />
          </div>
        ) : (
          <FullSchedule schedule={schedule} />
        )}
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2025 互動式課表系統</p>
          <p className="text-xs mt-2">支援安裝至桌面 • 生產環境支援離線使用</p>
        </div>
      </footer>
    </div>
  )
}
