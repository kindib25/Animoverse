"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useAdminStats } from "@/lib/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UsersRound, CircleAlert, Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/lib/context/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: stats, isLoading } = useAdminStats()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { profile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)


  useEffect(() => {
    async function checkAuth() {
      const result = await clientGetCurrentUser()
      if (!result.success || !result.user) {
        router.push("/admin/login")
        return
      }
      setUser(result.user)
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[url('/bgDefault2.svg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-0" />
      <div className="relative z-10 flex w-full">
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Dimmed background */}
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Sidebar Slide-in */}
              <motion.div
                className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex min-h-screen">
                  <AdminSidebar />
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6 text-white" />
          </Button>
          <div className="max-w-7xl mx-auto space-y-6 mt-0 md:mt-2 p-10">
          <div className="ml-7">
            <h1 className="text-3xl md:text-4xl font-peace-sans">Dashboard</h1>
            <p className="text-white">Welcome back, {profile?.name || "Admin"}</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3 p-5">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-transparent border-white border-2 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Loading...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-15 w-50 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-rows-1 lg:grid-cols-3 p-5">
              <Card className="bg-transparent border-white border-2 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Total Users</CardTitle>
                  <Users className="h-8 w-8 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green">{stats?.totalUsers || 0}</div>
                  <p className="text-sm text-white">Registered students</p>
                </CardContent>
              </Card>

              <Link href="/admin/groups">
                <Card className="bg-transparent border-white border-2 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Active Groups</CardTitle>
                    <UsersRound className="h-8 w-8 text-white" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-green">{stats?.activeGroups || 0}</div>
                    <p className="text-sm text-white">Currently active</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/groups/pending">
                <Card className="bg-green border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
                    <CircleAlert className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold">{stats?.pendingApprovals || 0}</div>
                    <p className="text-sm">Awaiting review</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}
