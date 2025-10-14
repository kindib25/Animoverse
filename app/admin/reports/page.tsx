"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function AdminReportsPage() {
  const { profile } = useAuth()
  const { data: groups, isLoading } = useTeacherGroups(profile?.$id || "")

  const groupsWithStats = groups
    ?.map((group: any, index: number) => ({
      ...group,
      rank: index + 1,
      sessions: Math.floor(Math.random() * 10) + 1,
      uptime: Math.floor(Math.random() * 20) + 5,
    }))
    .sort((a: any, b: any) => b.sessions - a.sessions)

  const formatUptime = (hours: number) => {
    if (hours < 1) return `${hours * 60} mins`
    return `${hours} hrs`
  }

  return (
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <AdminSidebar />

      <main className="flex-1 px-20 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Overall Group Report</h1>
          <p className="text-green">Performance analytics and rankings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Group Rankings</CardTitle>
            <CardDescription>Based on session count and total uptime</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Number of Sessions</th>
                      <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Total Uptime</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupsWithStats.map((group: any, index: number) => (
                      <tr key={group.$id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
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
                          <Button variant="outline" size="sm" asChild className="text-white">
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
              {groupsWithStats && groupsWithStats.length > 0 ? (
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
              <p className="text-2xl font-bold">
                {groupsWithStats?.reduce((acc: number, group: any) => acc + group.sessions, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Across all groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatUptime(groupsWithStats?.reduce((acc: number, group: any) => acc + group.uptime, 0) || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Combined duration</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
