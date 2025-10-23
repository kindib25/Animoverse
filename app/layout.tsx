import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import "./globals.css"

import { QueryProvider } from "@/lib/providers/query-provider"
import { AuthProvider } from "@/lib/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { StreamProvider } from "@/lib/context/stream-context"


// Load Poppins font once
const poppins = Poppins({
  weight: ['300', '400', '600'], // Light, Regular, Semi-Bold
  subsets: ['latin'],
});

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
      <head>
        <link href="https://fonts.cdnfonts.com/css/peace-sans" rel="stylesheet" />
      </head>
      <body className={`${poppins.className}`}>
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
