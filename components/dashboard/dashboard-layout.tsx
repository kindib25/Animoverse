"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { TopCreators } from "./top-creators"
import { usePathname } from "next/navigation"
import { use } from "react"

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

  return (
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 bg-white">{children}</main>
      {!hideTopCreators && <TopCreators />}
    </div>
  )
}
