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
        </div>
      </footer>
    </div>
  )
}
