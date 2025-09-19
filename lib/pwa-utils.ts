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

      // Only register service worker in production
      if (process.env.NODE_ENV === "production") {
        this.registerServiceWorker()
      } else {
        console.log("[PWA] Service worker disabled in development/preview")
      }
    }
  }

  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })

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
}

export const pwaManager = new PWAManager()
