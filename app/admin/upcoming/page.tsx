"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Video, Menu } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-peace-sans">Upcoming Sessions</h1>
              <p className="text-white/90">Scheduled group sessions for today</p>
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
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Clock className="h-6 w-6 text-black" />
                          </div>
                          <div>
                            <p className="font-medium">{session.name}</p>
                            <p className="text-sm text-muted-foreground">{session.schedule}</p>
                          </div>
                        </div>

                        {/* Move Join Call below schedule on small screens */}
                        <div className="mt-3 sm:mt-0 sm:ml-4">
                          <Button asChild className="w-full sm:w-auto shad-button_JoinSessionAdmin">
                            <Link href={`/admin/groups/${session.$id}/call`}>
                              <Video className="mr-2 h-4 w-4" />
                              Join Call
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No upcoming sessions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
