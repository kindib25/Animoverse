"use client"

import { use } from "react"
import { useGroup } from "@/lib/hooks/use-groups"
import { useGroupMembers } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AdminGroupReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: group } = useGroup(id)
  const { data: members, isLoading } = useGroupMembers(id)
  const [searchTerm, setSearchTerm] = useState("")

  const getMockAttendance = () => Math.floor(Math.random() * 30) + 70
  const getMockSessions = () => Math.floor(Math.random() * 10) + 1

  const getAccountStatus = (attendance: number) => {
    if (attendance >= 90) return { label: "Healthy", variant: "default" as const, icon: TrendingUp }
    if (attendance >= 75) return { label: "Needs Improvement", variant: "secondary" as const, icon: Minus }
    return { label: "At Risk", variant: "destructive" as const, icon: TrendingDown }
  }

  const membersWithStats = members?.map((member: any) => ({
    ...member,
    attendance: getMockAttendance(),
    sessions: getMockSessions(),
  }))

  const filteredMembers = membersWithStats?.filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalSessions = 10

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/admin/groups/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{group?.name}</h1>
            <p className="text-muted-foreground">Student attendance and performance reports</p>
          </div>
        </div>

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

            {isLoading ? (
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
                      <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Attendance</th>
                      <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Account Status</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
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
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">@{member.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">{member.attendance}%</span>
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
                            <Button variant="outline" size="sm" asChild className="text-white">
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
      </main>
    </div>
  )
}
