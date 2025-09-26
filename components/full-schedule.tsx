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
          <div className="hidden md:block overflow-x-auto">
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

          <div className="md:hidden space-y-4">
            {WEEKDAYS.map((day) => {
              const daySchedule = getScheduleByDay(schedule, day)
              return (
                <Card key={day} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PERIODS.map((period) => {
                      const classItem = daySchedule.find((item) => item.節次 === period)
                      const isCurrent = isCurrentClass(day, period)

                      return (
                        <div
                          key={period}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCurrent
                              ? "bg-accent/20 border-accent shadow-sm ring-1 ring-accent/50"
                              : "bg-card border-border"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`text-sm font-medium px-2 py-1 rounded ${
                                isCurrent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              第{period}節
                            </div>
                            {classItem && (
                              <div className="flex flex-col">
                                <Badge
                                  variant="outline"
                                  className={`text-xs mb-1 ${getSubjectColor(classItem.科目)} ${
                                    isCurrent ? "ring-1 ring-accent" : ""
                                  }`}
                                >
                                  {classItem.科目}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{classItem.時間}</span>
                              </div>
                            )}
                          </div>
                          {!classItem && <span className="text-sm text-muted-foreground">無課程</span>}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
