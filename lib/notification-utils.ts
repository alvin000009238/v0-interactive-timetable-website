export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export async function requestNotificationPermission(): Promise<boolean> {
  console.log("[v0] Requesting notification permission...")

  if (!("Notification" in window)) {
    console.log("[v0] This browser does not support notifications")
    alert("您的瀏覽器不支援通知功能")
    return false
  }

  console.log("[v0] Current permission:", Notification.permission)

  if (Notification.permission === "granted") {
    console.log("[v0] Permission already granted")
    return true
  }

  if (Notification.permission === "denied") {
    console.log("[v0] Permission denied")
    alert("通知權限已被拒絕，請在瀏覽器設定中手動啟用")
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    console.log("[v0] Permission result:", permission)

    if (permission === "granted") {
      console.log("[v0] Permission granted successfully")
      return true
    } else {
      console.log("[v0] Permission not granted")
      alert("需要通知權限才能接收上課提醒")
      return false
    }
  } catch (error) {
    console.error("[v0] Error requesting permission:", error)
    return false
  }
}

export function sendClassNotification(title: string, body: string, icon?: string) {
  console.log("[v0] Attempting to send notification:", title, body)

  if (!("Notification" in window)) {
    console.log("[v0] Notifications not supported")
    return
  }

  if (Notification.permission !== "granted") {
    console.log("[v0] Permission not granted, current status:", Notification.permission)
    return
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || "/icon-192.png",
      badge: "/icon-192.png",
      tag: "class-notification",
      requireInteraction: true, // Make notifications stay until user interacts
      silent: false,
      vibrate: [200, 100, 200], // Add vibration for mobile devices
    })

    console.log("[v0] Notification created successfully")

    notification.onclick = () => {
      console.log("[v0] Notification clicked")
      window.focus()
      notification.close()
    }

    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  } catch (error) {
    console.error("[v0] Error creating notification:", error)
    return null
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!("Notification" in window)) {
    return { granted: false, denied: true, default: false }
  }

  return {
    granted: Notification.permission === "granted",
    denied: Notification.permission === "denied",
    default: Notification.permission === "default",
  }
}
