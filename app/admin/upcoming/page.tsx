"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function AdminUpcomingPage() {
  const { profile } = useAuth()
  const { data: groups, isLoading } = useTeacherGroups(profile?.$id || "")

  const upcomingSessions = groups?.map((group: any) => ({
    ...group,
    time: "4-5 PM",
    isOnCall: Math.random() > 0.7,
  }))

  return (
    <div className="flex min-h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <AdminSidebar />

      <main className="flex-1 px-20 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upcoming Sessions</h1>
          <p className="text-green">Scheduled group sessions and active calls</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions
                    .filter((session: any) => !session.isOnCall)
                    .map((session: any) => (
                      <div key={session.$id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{session.name}</p>
                            <p className="text-sm text-muted-foreground">{session.time}</p>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/admin/groups/${session.$id}/call`}>
                            <Video className="mr-2 h-4 w-4" />
                            Join Call
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No upcoming sessions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">On Call</CardTitle>
              <CardDescription>Currently active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : upcomingSessions && upcomingSessions.some((s: any) => s.isOnCall) ? (
                <div className="space-y-3">
                  {upcomingSessions
                    .filter((session: any) => session.isOnCall)
                    .map((session: any) => (
                      <div key={session.$id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                            <Users className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{session.name}</p>
                            <Badge variant="default" className="mt-1">
                              Live
                            </Badge>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/admin/groups/${session.$id}/call`}>
                            <Video className="mr-2 h-4 w-4" />
                            Join
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No active calls</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
