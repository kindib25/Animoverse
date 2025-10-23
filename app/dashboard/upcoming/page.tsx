"use client"


import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Loader2 } from "lucide-react"
import Link from "next/link"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { getUserUpcoming } from "@/lib/appwrite/database"
import { useRouter } from "next/navigation"

function isUpcoming(schedule: string): boolean {
  if (!schedule) return false

  // Parse schedule format: "Mon 10:00 - 11:00"
  const parts = schedule.split(" ")
  if (parts.length < 3) return false

  const shortDay = parts[0] // e.g., "Mon"
  const startTime = parts[1] // e.g., "10:00"

  // Get current day and time
  const now = new Date()
  const currentDay = now.toLocaleDateString("en-US", { weekday: "short" })
  const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"

  // Check if day matches
  if (shortDay !== currentDay) return false

  // Parse start time
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [currentHour, currentMinute] = currentTime.split(":").map(Number)

  // Convert to minutes for easier comparison
  const startMinutes = startHour * 60 + startMinute
  const currentMinutes = currentHour * 60 + currentMinute

  // Show if within 30 minutes before or after start time
  const timeDiff = Math.abs(startMinutes - currentMinutes)
  return timeDiff <= 480
}

export default function UpcomingPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }
      const groupsResult = await getUserUpcoming(userResult.user.$id);

       if (groupsResult.success && groupsResult.groups) {
        setGroups(groupsResult.groups)
      }

      setIsLoading(false)
    }

    loadUser()
  }, [])


  const upcomingSessions = groups?.filter((group: any) => group.status === "approved" && isUpcoming(group.schedule))

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
          <p className="text-muted-foreground">Loading upcoming sessions...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div>
          <h1 className="text-4xl font-peace-sans">Upcoming Schedules</h1>
          <p className="text-muted-foreground font-semibold">Your scheduled sessions for today</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingSessions.map((group: any) => (
              <Card key={group.$id} className="bg-green">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-black">{group.name}</CardTitle>
                      <CardDescription className="mt-1 text-black">{group.subject}</CardDescription>
                    </div>
                    <Badge variant="default">Today</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-black" />
                      <span className="text-black">{group.schedule}</span>
                    </div>
                    <Button asChild className=" shad-button_JoinSession">
                      <Link href={`/dashboard/groups/${group.$id}/call`}>
                        <Video className="mr-2 h-4 w-4" />
                        Join Session
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-10 w-10 text-black" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No upcoming sessions</h3>
            <p className="mt-2 max-w-sm text-balance text-muted-foreground">
              Join or create study groups to see your upcoming sessions here.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" asChild className="cursor-pointer bg-accent py-8 text-black hover:bg-green hover:text-black transition font-mono" >
                <Link href="/dashboard/create-group" >Create Group</Link>
              </Button>
              <Button variant="outline" asChild className="cursor-pointer py-8 gap-2 text-white hover:bg-green hover:text-black transition font-mono">
                <Link href="/dashboard/explore">Explore Groups</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
