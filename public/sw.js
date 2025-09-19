const CACHE_NAME = "timetable-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.log("[SW] Cache failed:", error)
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === "document") {
          return caches.match("/")
        }
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "課程提醒",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification("課表提醒", options))
})

// Background notification scheduling system
const scheduledNotifications = new Map()

// Schedule notifications for upcoming classes
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATIONS") {
    const { schedule, enabled } = event.data

    if (!enabled) {
      // Clear all scheduled notifications
      scheduledNotifications.forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      scheduledNotifications.clear()
      return
    }

    scheduleClassNotifications(schedule)
  }
})

function scheduleClassNotifications(schedule) {
  // Clear existing notifications
  scheduledNotifications.forEach((timeoutId) => {
    clearTimeout(timeoutId)
  })
  scheduledNotifications.clear()

  const now = new Date()
  const today = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
  const todayName = dayNames[today]

  // Schedule notifications for today and tomorrow
  const daysToSchedule = [todayName, dayNames[(today + 1) % 7]]

  daysToSchedule.forEach((dayName, dayOffset) => {
    const daySchedule = schedule.filter((item) => item.星期 === dayName)

    daySchedule.forEach((classItem) => {
      const [startTime] = classItem.時間.split("-")
      const [hours, minutes] = startTime.split(":").map(Number)

      const classDate = new Date(now)
      classDate.setDate(now.getDate() + dayOffset)
      classDate.setHours(hours, minutes, 0, 0)

      // Schedule notification 2 minutes before class
      const notificationTime = new Date(classDate.getTime() - 2 * 60 * 1000)

      if (notificationTime > now) {
        const timeoutId = setTimeout(() => {
          self.registration.showNotification("課程提醒", {
            body: `${classItem.科目} 即將在 2 分鐘後開始`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [100, 50, 100],
            tag: `class-${classItem.星期}-${classItem.節次}`,
            requireInteraction: true,
            data: {
              classInfo: classItem,
              type: "class-reminder",
            },
          })
        }, notificationTime.getTime() - now.getTime())

        scheduledNotifications.set(`${dayName}-${classItem.節次}`, timeoutId)
      }

      // Schedule notification at class start time
      if (classDate > now) {
        const timeoutId = setTimeout(() => {
          self.registration.showNotification("上課時間", {
            body: `現在是 ${classItem.科目} 課程時間`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200],
            tag: `class-start-${classItem.星期}-${classItem.節次}`,
            requireInteraction: true,
            data: {
              classInfo: classItem,
              type: "class-start",
            },
          })
        }, classDate.getTime() - now.getTime())

        scheduledNotifications.set(`start-${dayName}-${classItem.節次}`, timeoutId)
      }
    })
  })
}
