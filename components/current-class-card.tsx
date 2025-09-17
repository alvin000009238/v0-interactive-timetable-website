"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Calendar } from "lucide-react"
import {
  type ScheduleItem,
  getCurrentClass,
  getCurrentTime,
  getSubjectColor,
  getDailyScheduleWithBreaks,
} from "@/lib/schedule-utils"
import { useEffect, useState } from "react"

interface CurrentClassCardProps {
  schedule: ScheduleItem[]
}

export function CurrentClassCard({ schedule }: CurrentClassCardProps) {
  const [currentClass, setCurrentClass] = useState<ScheduleItem | null>(null)
  const [currentTime, setCurrentTime] = useState<{ day: string; period: number | null }>({ day: "", period: null })
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const updateCurrentClass = () => {
      const current = getCurrentClass(schedule)
      const timeInfo = getCurrentTime()
      setCurrentClass(current)
      setCurrentTime(timeInfo)
    }

    const updateTime = () => {
      setTime(new Date())
    }

    // Initial updates
    updateCurrentClass()
    updateTime()

    const timeInterval = setInterval(updateTime, 1000) // Update time every second
    const classInterval = setInterval(updateCurrentClass, 60000) // Update class every minute

    return () => {
      clearInterval(timeInterval)
      clearInterval(classInterval)
    }
  }, [schedule])

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  if (!currentTime.day || currentTime.day === "") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Clock className="h-6 w-6" />
            目前時間
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-lg font-mono">{formatCurrentTime(time)}</div>
          <div className="text-muted-foreground">今天是週末，沒有課程安排</div>
        </CardContent>
      </Card>
    )
  }

  const dailyScheduleWithBreaks = getDailyScheduleWithBreaks(schedule, currentTime.day)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Current Class Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center bg-white border-b">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-800 font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            {currentClass ? "目前課程" : "目前時間"}
          </CardTitle>
          <div className="text-sm text-slate-600 font-mono font-medium">{formatCurrentTime(time)}</div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {currentClass ? (
            <>
              <div className="text-center">
                <Badge variant="secondary" className={`text-lg px-4 py-2 ${getSubjectColor(currentClass.科目)}`}>
                  {currentClass.科目}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">節次</div>
                  <div className="text-xl font-semibold">第 {currentClass.節次} 節</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">時間</div>
                  <div className="text-xl font-semibold">{currentClass.時間}</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">星期</div>
                <div className="text-lg font-semibold">{currentClass.星期}</div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">現在是 {currentTime.day}，目前沒有課程</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            {currentTime.day} 課表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyScheduleWithBreaks.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.isBreak
                    ? "bg-gray-50 border-gray-200"
                    : currentClass && currentClass.節次 === item.節次 && currentClass.星期 === item.星期
                      ? "bg-accent/20 border-accent ring-2 ring-accent"
                      : "bg-white border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-medium ${item.isBreak ? "text-gray-500" : "text-foreground"}`}>
                    {item.isBreak ? "休息時間" : `第 ${item.節次} 節`}
                  </div>
                  <Badge
                    variant={item.isBreak ? "secondary" : "outline"}
                    className={item.isBreak ? "bg-gray-100 text-gray-600 border-gray-300" : getSubjectColor(item.科目)}
                  >
                    {item.科目}
                  </Badge>
                </div>
                <div className={`text-sm font-mono ${item.isBreak ? "text-gray-500" : "text-muted-foreground"}`}>
                  {item.時間}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
