"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useAdminStats } from "@/lib/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UsersRound, CircleAlert } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/lib/context/auth-context"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: stats, isLoading } = useAdminStats()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
    const { profile } = useAuth()


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
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <AdminSidebar />

      <main className="flex-1 px-20 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-green">Welcome back, {profile?.name || "Admin"}</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
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
          <div className="grid gap-6 md:grid-cols-3">
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
          </div>
        )}
      </main>
    </div>
  )
}
