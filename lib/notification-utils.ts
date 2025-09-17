export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission === "denied") {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === "granted"
}

export function sendClassNotification(title: string, body: string, icon?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  const notification = new Notification(title, {
    body,
    icon: icon || "/favicon.ico",
    badge: "/favicon.ico",
    tag: "class-notification",
    requireInteraction: false,
    silent: false,
  })

  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close()
  }, 5000)

  return notification
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
