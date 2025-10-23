"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"
import { LayoutDashboard, UsersRound, Calendar, FileText, LogOut, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useUnreadNotificationCount } from "@/lib/hooks/use-notifications"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/admin/groups", icon: UsersRound },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Upcoming", href: "/admin/upcoming", icon: Calendar },
  { name: "Reports", href: "/admin/reports", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, logout } = useAuth()
  const [userId, setUserId] = useState<string>("")
  const { data: unreadCount = 0 } = useUnreadNotificationCount(userId)

  useEffect(() => {
    if (profile?.$id) {
      setUserId(profile.$id)
    }
  }, [profile])
  

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
                  ? "bg-green text-black"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

         <Link
          href="/admin/notifications"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
            pathname === "/dashboard/notifications"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
      </nav>

      {/* User profile + logout */}
      <div className="p-4 flex flex-col gap-3">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent hover:text-black transition-colors"
        >
          <Avatar className="text-black">
            <AvatarImage src={profile?.avatarUrl || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-gray-300">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {profile?.name || "New User"}
            </span>
            <span className="text-xs text-muted-foreground">
              @{profile?.username || "newuser"}
            </span>
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


