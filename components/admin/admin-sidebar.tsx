"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import { LayoutDashboard, UsersRound, Calendar, FileText, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/admin/groups", icon: UsersRound },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Upcoming", href: "/admin/upcoming", icon: Calendar },
  { name: "Reports", href: "/admin/reports", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const router = useRouter()

     const handleLogout = async () => {
    try {
      await logout()
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }


  return (
    <aside className="flex w-80 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-30 items-center gap-2 px-7 py-4">
      <img src="/logoname.svg" alt="logo" className="w-50 h-auto" />
      </div>

      <nav className="flex-1 space-y-1 p-6">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-10 rounded-lg px-3 py-5 text-md font-medium transition-colors",
                isActive
                  ? "bg-green text-background"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 flex flex-col gap-3">
        <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent hover:text-background transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-primary-foreground">
            {profile?.name?.[0] || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{profile?.name || "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email || "@admin.lsu.edu"}</p>
          </div>
        </Link>

        <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
