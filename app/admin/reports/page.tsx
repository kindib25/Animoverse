"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Clock, Menu } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { calculateGroupStats } from "@/lib/appwrite/database"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminReportsPage() {
  const { profile } = useAuth()
  const { data: groups, isLoading } = useTeacherGroups(profile?.$id || "")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [groupsWithStats, setGroupsWithStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!groups) return

      setStatsLoading(true)
      try {
        const statsPromises = groups.map(async (group: any) => {
          const statsResult = await calculateGroupStats(group.$id)
          return {
            ...group,
            sessions: statsResult.success ? (statsResult.stats?.sessionCount ?? 0) : 0,
            uptime: statsResult.success ? (statsResult.stats?.totalUptime ?? 0) : 0,
          }
        })

        const stats = await Promise.all(statsPromises)
        const sorted = stats.sort((a: any, b: any) => b.uptime - a.uptime)
        setGroupsWithStats(sorted)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setGroupsWithStats(groups)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [groups])

  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const isDataLoading = isLoading || statsLoading

  return (
    <div className="flex h-screen bg-[url('/bgDefault2.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-0" />
      <div className="relative z-10 flex w-full">
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

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

          <div className="max-w-7xl mx-auto space-y-6 p-10">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-peace-sans">Overall Group Report</h1>
              <p className="text-white/90">Performance analytics and rankings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Group Rankings</CardTitle>
                <CardDescription>Based on session count and total uptime</CardDescription>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : groupsWithStats && groupsWithStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                          <th className="pb-3 text-left pl-15 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Number of Sessions</th>
                          <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Total Uptime</th>
                          <th className="pb-3 text-right pr-15 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupsWithStats.map((group: any, index: number) => (
                          <tr key={group.$id} className="border-b last:border-0">
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}  {/* Gold */}
                                {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}   {/* Silver */}
                                {index === 2 && <Trophy className="h-5 w-5 text-amber-700" />}  {/* Bronze */}
                                <span className="font-bold">{index + 1}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <span className="text-sm font-medium text-primary">{group.name[0]}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{group.name}</p>
                                  <p className="text-sm text-muted-foreground">{group.subject}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <Badge variant="secondary" className="gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {group.sessions}
                              </Badge>
                            </td>
                            <td className="py-4 text-center">
                              <Badge variant="outline" className="gap-1 text-black">
                                <Clock className="h-3 w-3" />
                                {formatUptime(group.uptime)}
                              </Badge>
                            </td>
                            <td className="py-4 text-right">
                              <Button variant="outline" size="sm" asChild className="shad-button_viewDetails float-end">
                                <Link href={`/admin/groups/${group.$id}/reports`}>View Details</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No groups to display</p>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Performing Group</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                  ) : groupsWithStats && groupsWithStats.length > 0 ? (
                    <div>
                      <p className="text-2xl font-bold">{groupsWithStats[0].name}</p>
                      <p className="text-sm text-muted-foreground">{groupsWithStats[0].sessions} sessions</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-10 w-1/3 animate-pulse rounded bg-muted" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">
                        {groupsWithStats?.reduce((acc: number, group: any) => acc + group.sessions, 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Across all groups</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">
                        {formatUptime(groupsWithStats?.reduce((acc: number, group: any) => acc + group.uptime, 0) || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Combined duration</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
