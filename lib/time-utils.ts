interface ServerTimeResponse {
  serverTime: string
  timestamp: number
  timezone: string
  localTime: string
}

interface TimeSync {
  serverTime: Date
  clientTime: Date
  latency: number
  offset: number
}

let timeSync: TimeSync | null = null
let lastSyncTime = 0
const SYNC_INTERVAL = 30000 // 30 seconds

export async function syncWithServerTime(): Promise<TimeSync> {
  const requestStart = Date.now()

  try {
    const response = await fetch("/api/time")
    const requestEnd = Date.now()

    if (!response.ok) {
      throw new Error("Failed to fetch server time")
    }

    const data: ServerTimeResponse = await response.json()
    const latency = requestEnd - requestStart
    const serverTime = new Date(data.serverTime)
    const clientTime = new Date()
    const offset = serverTime.getTime() - clientTime.getTime() + latency / 2

    timeSync = {
      serverTime,
      clientTime,
      latency,
      offset,
    }

    lastSyncTime = Date.now()

    console.log("[v0] Time sync completed:", {
      latency: `${latency}ms`,
      offset: `${offset}ms`,
      serverTime: serverTime.toISOString(),
      clientTime: clientTime.toISOString(),
    })

    return timeSync
  } catch (error) {
    console.error("[v0] Failed to sync with server time:", error)
    // Fallback to client time
    const now = new Date()
    timeSync = {
      serverTime: now,
      clientTime: now,
      latency: 0,
      offset: 0,
    }
    return timeSync
  }
}

export function getServerTime(): Date {
  if (!timeSync || Date.now() - lastSyncTime > SYNC_INTERVAL) {
    // If we haven't synced recently, use client time with last known offset
    const clientTime = new Date()
    if (timeSync) {
      return new Date(clientTime.getTime() + timeSync.offset)
    }
    return clientTime
  }

  // Calculate current server time based on sync
  const clientTime = new Date()
  return new Date(clientTime.getTime() + timeSync.offset)
}

export function getLatency(): number {
  return timeSync?.latency || 0
}

export function getTimeOffset(): number {
  return timeSync?.offset || 0
}

export function isTimeSynced(): boolean {
  return timeSync !== null && Date.now() - lastSyncTime < SYNC_INTERVAL
}

export async function ensureTimeSync(): Promise<void> {
  if (!timeSync || Date.now() - lastSyncTime > SYNC_INTERVAL) {
    await syncWithServerTime()
  }
}

export function getSyncStatusColor(): string {
  if (!timeSync) return "bg-gray-400" // No sync data

  const offset = Math.abs(timeSync.offset)

  if (offset <= 100) return "bg-green-500" // Excellent sync (≤100ms)
  if (offset <= 500) return "bg-yellow-500" // Good sync (≤500ms)
  if (offset <= 1000) return "bg-orange-500" // Fair sync (≤1000ms)
  return "bg-red-500" // Poor sync (>1000ms)
}

export function getSyncStatusText(): string {
  if (!timeSync) return "未同步"

  const offset = Math.abs(timeSync.offset)

  if (offset <= 100) return "同步良好"
  if (offset <= 500) return "同步正常"
  if (offset <= 1000) return "同步一般"
  return "同步較差"
}
