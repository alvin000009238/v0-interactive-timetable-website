import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "互動課表網站",
  description: "智能互動課表應用程式，支援課程通知和離線使用",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["課表", "時間表", "學校", "課程", "通知"],
  authors: [{ name: "v0" }],
  creator: "v0",
  publisher: "v0",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "課表",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="課表" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
