"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Bookmark, Calendar, Users, PlusCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <span className="text-xl font-bold">Animoverse</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>NU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">New User</span>
            <span className="text-xs text-muted-foreground">@newuser</span>
          </div>
        </Link>
      </div>
    </aside>
  )
}
