"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Video } from "lucide-react"
import Link from "next/link"

function isUpcoming(schedule: string): boolean {
  if (!schedule) return false

  const parts = schedule.split(" ")
  if (parts.length < 3) return false

  const shortDay = parts[0]
  const startTime = parts[1]

  const now = new Date()
  const currentDay = now.toLocaleDateString("en-US", { weekday: "short" })
  const currentTime = now.toTimeString().slice(0, 5)

  if (shortDay !== currentDay) return false

  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [currentHour, currentMinute] = currentTime.split(":").map(Number)

  const startMinutes = startHour * 60 + startMinute
  const currentMinutes = currentHour * 60 + currentMinute

  const timeDiff = Math.abs(startMinutes - currentMinutes)
  return timeDiff <= 480 // within 8 hours of now
}

export default function AdminUpcomingPage() {
  const { profile } = useAuth()
  const { data: groups, isLoading } = useTeacherGroups(profile?.$id || "")

  const upcomingSessions = groups?.filter(
    (group: any) => group.status === "approved" && isUpcoming(group.schedule)
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upcoming Sessions</h1>
          <p className="text-muted-foreground">Scheduled group sessions for today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
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
                {upcomingSessions.map((session: any) => (
                  <div
                    key={session.$id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-6 w-6 text-background" />
                      </div>
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground">{session.schedule}</p>
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
      </main>
    </div>
  )
}
