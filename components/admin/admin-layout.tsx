import type React from "react"
import { AdminSidebar } from "./admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex min-h-screen">
        <AdminSidebar />
      </div>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
