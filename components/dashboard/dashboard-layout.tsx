"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const router = useRouter()
  const { profile, isLoading } = useAuth()


  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white text-2xl">Loading...</p>
        </div>
      </div>


    )
  }


  return (
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <div className="hidden md:flex min-h-screen">
      <Sidebar />
      </div>
      <main className="flex-1 p-6 lg:p-8 bg-white">{children}</main>
    </div>
  )
}
