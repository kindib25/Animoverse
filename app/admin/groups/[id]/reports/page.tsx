"use client"

import { use } from "react"
import { useGroup } from "@/lib/hooks/use-groups"
import { useGroupMembers } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Menu } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { calculateUserGroupStats, getGroupCallSessions } from "@/lib/appwrite/database"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminGroupReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: group } = useGroup(id)
  const { data: members, isLoading } = useGroupMembers(id)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [membersWithStats, setMembersWithStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      if (!members || !id) return

      setStatsLoading(true)
      try {
        const sessionsResult = await getGroupCallSessions(id)
        const sessions = sessionsResult.success ? sessionsResult.sessions ?? [] : []
        setTotalSessions(sessions.length)

        const statsPromises = members.map(async (member: any) => {
          const statsResult = await calculateUserGroupStats(member.$id, id)
          return {
            ...member,
            attendance: statsResult.success ? statsResult.stats?.attendance ?? 0 : 0,
            sessions: statsResult.success ? statsResult.stats?.sessionCount ?? 0 : 0,
          }
        })

        const stats = await Promise.all(statsPromises)
        setMembersWithStats(stats)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setMembersWithStats(members)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [members, id])

  const getAccountStatus = (attendance: number) => {
    if (attendance >= 90) return { label: "Healthy", variant: "default" as const, icon: TrendingUp }
    if (attendance >= 50) return { label: "Needs Improvement", variant: "secondary" as const, icon: Minus }
    return { label: "At Risk", variant: "destructive" as const, icon: TrendingDown }
  }


  const filteredMembers = membersWithStats?.filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )


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

        <main className="flex-1 overflow-y-auto ">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6 text-white" />
          </Button>
          <div className="mb-6">
            <Button variant="ghost" asChild className="m-4 hidden md:inline-flex">
              <Link href={`/admin/groups/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            <div className="mx-auto max-w-7xl mt-5 md:mt-10 md:p-0 p-5">
              <h1 className="text-3xl font-peace-sans">{group?.name}</h1>
              <p className="text-white">Student attendance and performance reports</p>
            </div>
          </div>
          <div className="mx-auto space-y-6 max-w-7xl md:p-0 p-5">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Session Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{totalSessions}</span>
                  <span className="text-muted-foreground">Total call sessions</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Performance</CardTitle>
                    <CardDescription>Attendance and engagement metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {isLoading || statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : filteredMembers && filteredMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                          <th className="pb-3 text-center text-sm font-medium text-muted-foreground px-10 md:px-0">Attendance</th>
                          <th className="pb-3 text-center text-sm font-medium text-muted-foreground px-10 md:px-0">Account Status</th>
                          <th className="pb-3 text-right pr-15 text-sm font-medium text-muted-foreground ">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member: any) => {
                          const status = getAccountStatus(member.attendance)
                          const StatusIcon = status.icon

                          return (
                            <tr key={member.$id} className="border-b last:border-0">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    {member.name[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm md:text-base">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">@{member.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-center">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                  <span className="font-medium md:text-base text-sm">{member.attendance}%</span>
                                  <span className="text-sm text-muted-foreground">({member.sessions} sessions)</span>
                                </div>
                              </td>
                              <td className="py-4 text-center">
                                <Badge variant={status.variant} className="gap-1">
                                  <StatusIcon className="h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="py-4 text-right">
                                <Button variant="outline" size="sm" asChild className="shad-button_viewDetails float-end">
                                  <Link href={`/admin/users/${member.$id}`}>View Details</Link>
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No students found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
