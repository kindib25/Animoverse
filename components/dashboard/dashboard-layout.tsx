"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { TopCreators } from "./top-creators"
import { usePathname } from "next/navigation"
import { use } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const hideTopCreators = [
    "/dashboard/explore",
    "/dashboard/saved",
    "/dashboard/upcoming",
    "/dashboard/my-groups",
    "/dashboard/create-group",
  ].includes(pathname)

  const router = useRouter()
  const { profile, isLoading } = useAuth()
  
 
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  
  return (
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 bg-white">{children}</main>
      {!hideTopCreators && <TopCreators />}
    </div>
  )
}
