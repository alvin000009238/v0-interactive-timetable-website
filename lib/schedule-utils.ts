export interface ScheduleItem {
  星期: string
  節次: number
  時間: string
  科目: string
}

export interface BreakPeriod {
  星期: string
  節次: number
  時間: string
  科目: string
  isBreak: boolean
}

export const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五"]
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

export function getCurrentTime(): { day: string; period: number | null } {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Map JavaScript day to Chinese weekday
  const dayMap: { [key: number]: string } = {
    1: "星期一",
    2: "星期二",
    3: "星期三",
    4: "星期四",
    5: "星期五",
  }

  const day = dayMap[currentDay] || ""

  // Define period times in minutes from midnight
  const periodTimes = [
    { period: 1, start: 8 * 60 + 10, end: 9 * 60 }, // 08:10-09:00
    { period: 2, start: 9 * 60 + 10, end: 10 * 60 }, // 09:10-10:00
    { period: 3, start: 10 * 60 + 10, end: 11 * 60 }, // 10:10-11:00
    { period: 4, start: 11 * 60 + 10, end: 12 * 60 }, // 11:10-12:00
    { period: 5, start: 13 * 60, end: 13 * 60 + 50 }, // 13:00-13:50
    { period: 6, start: 14 * 60, end: 14 * 60 + 50 }, // 14:00-14:50
    { period: 7, start: 15 * 60 + 5, end: 15 * 60 + 55 }, // 15:05-15:55
    { period: 8, start: 16 * 60 + 5, end: 16 * 60 + 55 }, // 16:05-16:55
  ]

  // Find current period
  const currentPeriod = periodTimes.find((p) => currentTimeInMinutes >= p.start && currentTimeInMinutes <= p.end)

  return {
    day,
    period: currentPeriod?.period || null,
  }
}

export function getCurrentClass(schedule: ScheduleItem[]): ScheduleItem | null {
  const { day, period } = getCurrentTime()

  if (!day || !period) return null

  return schedule.find((item) => item.星期 === day && item.節次 === period) || null
}

export function getScheduleByDay(schedule: ScheduleItem[], day: string): ScheduleItem[] {
  return schedule.filter((item) => item.星期 === day).sort((a, b) => a.節次 - b.節次)
}

export function getDailyScheduleWithBreaks(
  schedule: ScheduleItem[],
  day: string,
): (ScheduleItem & { isBreak?: boolean })[] {
  const daySchedule = getScheduleByDay(schedule, day)
  const scheduleWithBreaks: (ScheduleItem & { isBreak?: boolean })[] = []

  // Define break periods between classes
  const breakPeriods = [
    { after: 1, time: "09:00-09:10", name: "休息" },
    { after: 2, time: "10:00-10:10", name: "休息" },
    { after: 3, time: "11:00-11:10", name: "休息" },
    { after: 4, time: "12:00-13:00", name: "午休" },
    { after: 5, time: "13:50-14:00", name: "休息" },
    { after: 6, time: "14:50-15:05", name: "休息" },
    { after: 7, time: "15:55-16:05", name: "休息" },
  ]

  for (let period = 1; period <= 8; period++) {
    const classItem = daySchedule.find((item) => item.節次 === period)

    if (classItem) {
      scheduleWithBreaks.push({ ...classItem, isBreak: false })
    }

    // Add break after this period if it exists
    const breakAfter = breakPeriods.find((bp) => bp.after === period)
    if (breakAfter && period < 8) {
      // Don't add break after last period
      scheduleWithBreaks.push({
        星期: day,
        節次: period + 0.5, // Use decimal to indicate break
        時間: breakAfter.time,
        科目: breakAfter.name,
        isBreak: true,
      })
    }
  }

  return scheduleWithBreaks
}

export function isInBreakPeriod(): { isBreak: boolean; breakType: string; nextPeriod: number | null } {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Define break periods with their types and next period
  const breakPeriods = [
    { start: 9 * 60, end: 9 * 60 + 10, type: "課間休息", nextPeriod: 2 }, // 09:00-09:10
    { start: 10 * 60, end: 10 * 60 + 10, type: "課間休息", nextPeriod: 3 }, // 10:00-10:10
    { start: 11 * 60, end: 11 * 60 + 10, type: "課間休息", nextPeriod: 4 }, // 11:00-11:10
    { start: 12 * 60, end: 13 * 60, type: "午休時間", nextPeriod: 5 }, // 12:00-13:00
    { start: 13 * 60 + 50, end: 14 * 60, type: "課間休息", nextPeriod: 6 }, // 13:50-14:00
    { start: 14 * 60 + 50, end: 15 * 60 + 5, type: "課間休息", nextPeriod: 7 }, // 14:50-15:05
    { start: 15 * 60 + 55, end: 16 * 60 + 5, type: "課間休息", nextPeriod: 8 }, // 15:55-16:05
  ]

  const currentBreak = breakPeriods.find((bp) => currentTimeInMinutes >= bp.start && currentTimeInMinutes < bp.end)

  return {
    isBreak: !!currentBreak,
    breakType: currentBreak?.type || "",
    nextPeriod: currentBreak?.nextPeriod || null,
  }
}

export function getNextClass(schedule: ScheduleItem[]): ScheduleItem | null {
  const { day } = getCurrentTime()
  const breakInfo = isInBreakPeriod()

  if (!day || !breakInfo.isBreak || !breakInfo.nextPeriod) return null

  return schedule.find((item) => item.星期 === day && item.節次 === breakInfo.nextPeriod) || null
}

export function formatTime(timeString: string): string {
  return timeString
}

export function getSubjectColor(subject: string): string {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-orange-100 text-orange-800 border-orange-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-yellow-100 text-yellow-800 border-yellow-200",
    "bg-red-100 text-red-800 border-red-200",
  ]

  // Simple hash function to consistently assign colors
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}
