"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Check, Smartphone } from "lucide-react"
import { pwaManager } from "@/lib/pwa-utils"

export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check installation status
    setCanInstall(pwaManager.canInstall())
    setIsInstalled(pwaManager.isAppInstalled())

    // Listen for install prompt availability
    const checkInstallability = () => {
      setCanInstall(pwaManager.canInstall())
    }

    window.addEventListener("beforeinstallprompt", checkInstallability)

    return () => {
      window.removeEventListener("beforeinstallprompt", checkInstallability)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)

    try {
      const success = await pwaManager.installApp()
      if (success) {
        setIsInstalled(true)
        setCanInstall(false)
      }
    } catch (error) {
      console.error("Installation failed:", error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-transparent">
        <Check className="h-4 w-4" />
        已安裝
      </Button>
    )
  }

  if (!canInstall) {
    // Show a hint about PWA capabilities even when install prompt isn't available
    return (
      <Button variant="outline" disabled className="gap-2 opacity-50 bg-transparent">
        <Smartphone className="h-4 w-4" />
        可安裝應用
      </Button>
    )
  }

  return (
    <Button onClick={handleInstall} disabled={isInstalling} className="gap-2">
      <Download className="h-4 w-4" />
      {isInstalling ? "安裝中..." : "安裝應用程式"}
    </Button>
  )
}
