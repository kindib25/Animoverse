import type React from "react"
import type { Metadata } from "next"
import { Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import "./globals.css"

import { QueryProvider } from "@/lib/providers/query-provider"
import { AuthProvider } from "@/lib/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Stream from "stream"
import { StreamProvider } from "@/lib/context/stream-context"

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
        {/* ✅ Wrap children inside QueryProvider */}
        <QueryProvider>
          <AuthProvider>
            <StreamProvider>
            <Suspense fallback={null}>{children}</Suspense>
            </StreamProvider>
          </AuthProvider>
        </QueryProvider>

        <Toaster />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
