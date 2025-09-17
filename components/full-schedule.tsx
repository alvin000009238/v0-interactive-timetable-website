"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  type ScheduleItem,
  WEEKDAYS,
  PERIODS,
  getScheduleByDay,
  getCurrentTime,
  getSubjectColor,
} from "@/lib/schedule-utils"
import { useEffect, useState } from "react"

interface FullScheduleProps {
  schedule: ScheduleItem[]
}

export function FullSchedule({ schedule }: FullScheduleProps) {
  const [currentTime, setCurrentTime] = useState<{ day: string; period: number | null }>({ day: "", period: null })

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(getCurrentTime())
    }

    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const isCurrentClass = (day: string, period: number) => {
    return currentTime.day === day && currentTime.period === period
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">完整課表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-3 bg-muted font-semibold">節次</th>
                  {WEEKDAYS.map((day) => (
                    <th key={day} className="border border-border p-3 bg-muted font-semibold min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="border border-border p-3 text-center font-semibold bg-muted">第 {period} 節</td>
                    {WEEKDAYS.map((day) => {
                      const daySchedule = getScheduleByDay(schedule, day)
                      const classItem = daySchedule.find((item) => item.節次 === period)
                      const isCurrent = isCurrentClass(day, period)

                      return (
                        <td
                          key={`${day}-${period}`}
                          className={`border border-border p-2 text-center ${
                            isCurrent ? "bg-accent/20 ring-2 ring-accent" : ""
                          }`}
                        >
                          {classItem ? (
                            <div className="space-y-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSubjectColor(classItem.科目)} ${
                                  isCurrent ? "ring-2 ring-accent" : ""
                                }`}
                              >
                                {classItem.科目}
                              </Badge>
                              <div className="text-xs text-muted-foreground">{classItem.時間}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">-</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
