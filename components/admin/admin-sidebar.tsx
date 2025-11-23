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
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { getUserProfile } from "@/lib/appwrite/database"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/admin/groups", icon: UsersRound },
  { name: "Upcoming", href: "/admin/upcoming", icon: Calendar },
  { name: "Users", href: "/admin/animo_users", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile: authProfile, logout } = useAuth()
  const [profile, setProfile] = useState<any>(authProfile)
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { data: unreadCount = 0, refetch } = useUnreadNotificationCount(userId)

  useEffect(() => {
    async function loadUser() {
      try {
        if (authProfile && authProfile.$id) {
          setProfile(authProfile)
          setUserId(authProfile.$id)
        } else {
          const result = await clientGetCurrentUser()
          if (result.success && result.user) {
            const userResult = await getUserProfile(result.user.$id)
            if (userResult.success && userResult.profile) {
              setProfile(userResult.profile)
              setUserId(userResult.profile.$id)
            } else {
              router.push("/admin/login")
            }
          } else {
            router.push("/admin/login")
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [authProfile, router])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [userId, refetch])


  const handleLogout = async () => {
    try {
      await logout()
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }


  // 🕓 Profile loading skeleton only
  if (isLoading) {
    return (
      <aside className="flex w-80 flex-col bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex h-30 items-center gap-2 px-7 py-4">
          <img src="/logonamelsu.svg" alt="logo"/>
        </div>

        {/* Navigation stays visible */}
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
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
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
              pathname === "/admin/notifications"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Bell className="h-5 w-5" />
            Notifications
          </Link>
        </nav>

        {/* Skeleton for avatar + name only */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse" />
            <div className="flex flex-col space-y-2">
              <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </aside>
    )
  }


  return (
    <aside className="flex w-80 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-30 items-center gap-2 px-7 py-4">
        <img src="/logonamelsu.svg" alt="logo" />
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


