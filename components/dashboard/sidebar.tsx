"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Bookmark, Calendar, Users, PlusCircle, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Explore", href: "/dashboard/explore", icon: Compass },
  { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { name: "Upcoming", href: "/dashboard/upcoming", icon: Calendar },
  { name: "My Groups", href: "/dashboard/my-groups", icon: Users },
  { name: "Create Group", href: "/dashboard/create-group", icon: PlusCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userResult = await clientGetCurrentUser()
        if (!userResult?.success || !userResult?.user) {
          router.push("/login")
          return
        }

        const profileResult = await getUserProfile(userResult.user.$id)
        if (profileResult?.success && profileResult?.profile) {
          setProfile(profileResult.profile)
        }
      } catch (error) {
        console.error("Error loading sidebar profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])


  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <aside className="flex w-80 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-30 items-center gap-2 px-7 py-4">
        <img src="/logoname.svg" alt="logo" className="w-50 h-auto" />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 p-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-10 rounded-lg px-3 py-5 text-md font-medium transition-colors",
                isActive
                  ? "bg-green text-background"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile + logout */}
      <div className="p-4 flex flex-col gap-3">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent hover:text-background transition-colors"
        >
          <Avatar className="text-background">
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
