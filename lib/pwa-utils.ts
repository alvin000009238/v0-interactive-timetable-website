// PWA installation utilities (simplified for v0 preview)

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private isInstalled = false
  private swRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window !== "undefined") {
      // Check if app is already installed
      this.isInstalled = window.matchMedia("(display-mode: standalone)").matches

      // Listen for install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
        this.deferredPrompt = e as BeforeInstallPromptEvent
        console.log("[PWA] Install prompt available")
      })

      if (process.env.NODE_ENV === "production") {
        this.registerServiceWorker()
      } else {
        console.log("[PWA] Service worker registration skipped in development/preview")
      }
    }
  }

  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })

        this.swRegistration = registration
        console.log("[PWA] Service Worker registered:", registration)

        registration.addEventListener("updatefound", () => {
          console.log("[PWA] New service worker available")
        })
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error)
      }
    }
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log("[PWA] No install prompt available")
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("[PWA] App installed successfully")
        this.deferredPrompt = null
        return true
      } else {
        console.log("[PWA] App installation dismissed")
      }
    } catch (error) {
      console.error("[PWA] Installation failed:", error)
    }

    return false
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled
  }

  isAppInstalled(): boolean {
    return this.isInstalled
  }

  async scheduleNotifications(schedule: any[], enabled: boolean) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[PWA] Service worker notifications not available in development/preview")
      return
    }

    if (!this.swRegistration) {
      console.log("[PWA] Service worker not registered")
      return
    }

    try {
      // Send schedule data to service worker
      if (this.swRegistration.active) {
        this.swRegistration.active.postMessage({
          type: "SCHEDULE_NOTIFICATIONS",
          schedule,
          enabled,
        })
        console.log("[PWA] Notifications scheduled in service worker")
      }
    } catch (error) {
      console.error("[PWA] Failed to schedule notifications:", error)
    }
  }

  getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration
  }
}

export const pwaManager = new PWAManager()
