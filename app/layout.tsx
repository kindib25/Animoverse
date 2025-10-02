import type React from "react"
import type { Metadata } from "next"
import { Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import "./globals.css"

// Load Space Mono font once
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Animoverse - Student Study Groups",
  description: "Connect with study partners and collaborate on your learning journey",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
