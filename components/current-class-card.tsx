"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Calendar, ArrowRight, Bell, BellOff } from "lucide-react"
import {
  type ScheduleItem,
  getCurrentClass,
  getCurrentTime,
  getSubjectColor,
  getDailyScheduleWithBreaks,
  isInBreakPeriod,
  getNextClass,
  isClassStartingSoon,
  didClassJustStart,
} from "@/lib/schedule-utils"
import {
  requestNotificationPermission,
  sendClassNotification,
  getNotificationPermissionStatus,
} from "@/lib/notification-utils"
import { useEffect, useState } from "react"

interface CurrentClassCardProps {
  schedule: ScheduleItem[]
}

export function CurrentClassCard({ schedule }: CurrentClassCardProps) {
  const [currentClass, setCurrentClass] = useState<ScheduleItem | null>(null)
  const [nextClass, setNextClass] = useState<ScheduleItem | null>(null)
  const [breakInfo, setBreakInfo] = useState<{ isBreak: boolean; breakType: string; nextPeriod: number | null }>({
    isBreak: false,
    breakType: "",
    nextPeriod: null,
  })
  const [currentTime, setCurrentTime] = useState<{ day: string; period: number | null }>({ day: "", period: null })
  const [time, setTime] = useState(new Date())
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotifiedClass, setLastNotifiedClass] = useState<string>("")

  useEffect(() => {
    const updateCurrentClass = () => {
      const current = getCurrentClass(schedule)
      const timeInfo = getCurrentTime()
      const breakPeriodInfo = isInBreakPeriod()
      const next = getNextClass(schedule)

      setCurrentClass(current)
      setCurrentTime(timeInfo)
      setBreakInfo(breakPeriodInfo)
      setNextClass(next)

      if (notificationsEnabled) {
        console.log("[v0] Checking for notifications...")

        // Check if a class just started
        const { justStarted, class: startedClass } = didClassJustStart(schedule)
        if (justStarted && startedClass) {
          const classKey = `${startedClass.星期}-${startedClass.節次}-started`
          console.log("[v0] Class just started:", classKey, "Last notified:", lastNotifiedClass)

          if (lastNotifiedClass !== classKey) {
            console.log("[v0] Sending class started notification")
            sendClassNotification("🔔 上課時間到了！", `現在是第 ${startedClass.節次} 節 - ${startedClass.科目}`)
            setLastNotifiedClass(classKey)
          }
        }

        // Check if a class is starting soon
        const { isStarting, class: upcomingClass, minutesUntil } = isClassStartingSoon(schedule)
        if (isStarting && upcomingClass) {
          const classKey = `${upcomingClass.星期}-${upcomingClass.節次}-soon`
          console.log("[v0] Class starting soon:", classKey, "Minutes until:", minutesUntil)

          if (lastNotifiedClass !== classKey) {
            console.log("[v0] Sending class starting soon notification")
            sendClassNotification(
              "⏰ 即將上課提醒",
              `${minutesUntil} 分鐘後開始第 ${upcomingClass.節次} 節 - ${upcomingClass.科目}`,
            )
            setLastNotifiedClass(classKey)
          }
        }
      }
    }

    const updateTime = () => {
      setTime(new Date())
    }

    const permissionStatus = getNotificationPermissionStatus()
    setNotificationsEnabled(permissionStatus.granted)

    updateCurrentClass()
    updateTime()

    const timeInterval = setInterval(updateTime, 1000)
    const classInterval = setInterval(updateCurrentClass, 10000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(classInterval)
    }
  }, [schedule, notificationsEnabled, lastNotifiedClass])

  const toggleNotifications = async () => {
    console.log("[v0] Toggling notifications, current state:", notificationsEnabled)

    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setNotificationsEnabled(true)
        console.log("[v0] Notifications enabled, sending test notification")
        sendClassNotification("✅ 通知已啟用", "您將收到上課時間提醒")
      }
    } else {
      console.log("[v0] Disabling notifications")
      setNotificationsEnabled(false)
    }
  }

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
          <Button
            onClick={toggleNotifications}
            variant={notificationsEnabled ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsEnabled ? "通知已啟用" : "啟用通知"}
          </Button>
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
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-800 font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              {breakInfo.isBreak ? breakInfo.breakType : currentClass ? "目前課程" : "目前時間"}
            </CardTitle>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={toggleNotifications}
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{notificationsEnabled ? "通知已啟用" : "啟用通知"}</span>
              </Button>
            </div>
          </div>
          <div className="text-sm text-slate-600 font-mono font-medium">{formatCurrentTime(time)}</div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {breakInfo.isBreak && nextClass ? (
            <>
              <div className="text-center">
                <div className="text-lg text-muted-foreground mb-4">
                  {breakInfo.breakType === "午休時間" ? "午休時間，下節課程：" : "休息時間，下節課程："}
                </div>
                <Badge variant="secondary" className={`text-lg px-4 py-2 ${getSubjectColor(nextClass.科目)}`}>
                  {nextClass.科目}
                </Badge>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">目前</div>
                  <div className="text-lg font-semibold text-orange-600">{breakInfo.breakType}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">下節課</div>
                  <div className="text-lg font-semibold">第 {nextClass.節次} 節</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">下節課時間</div>
                <div className="text-xl font-semibold">{nextClass.時間}</div>
              </div>
            </>
          ) : currentClass ? (
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
                      : breakInfo.isBreak && nextClass && nextClass.節次 === item.節次 && nextClass.星期 === item.星期
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300"
                        : "bg-white border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-medium ${item.isBreak ? "text-gray-500" : "text-foreground"}`}>
                    {item.isBreak ? "休息時間" : `第 ${item.節次} 節`}
                    {breakInfo.isBreak &&
                      nextClass &&
                      !item.isBreak &&
                      nextClass.節次 === item.節次 &&
                      nextClass.星期 === item.星期 && (
                        <span className="ml-2 text-xs text-blue-600 font-semibold">← 下節課</span>
                      )}
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
