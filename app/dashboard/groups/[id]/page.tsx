"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ArrowLeft } from "lucide-react"
import { getGroup, joinGroup } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [group, setGroup] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    async function loadGroup() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }

      const result = await getGroup(params.id as string)
      if (result.success) {
        setGroup(result.group)
      } else {
        toast({
          title: "Error",
          description: "Failed to load group details.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }

    loadGroup()
  }, [params.id, toast])

  const handleJoinGroup = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to join groups.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsJoining(true)
    const result = await joinGroup(group.$id, userId)

    if (result.success) {
      toast({
        title: "Request sent!",
        description: "Your request to join the group has been sent.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to join group.",
        variant: "destructive",
      })
    }
    setIsJoining(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Group not found.</p>
          <Button asChild>
            <Link href="/dashboard/explore">Browse Groups</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-400 to-pink-400">
              {group.imageUrl ? (
                <img
                  src={group.imageUrl || "/placeholder.svg"}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className="h-24 w-24 text-white/50" />
                </div>
              )}
            </div>
            <div className="space-y-6 p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    <Badge variant="secondary">
                      {group.memberCount || 0}/{group.maxMembers || 15}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Schedule: {group.schedule}</span>
                    </div>
                  </div>
                  <Badge>{group.subject}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="text-muted-foreground">{group.description}</p>
              </div>

              {group.teacher && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Teacher</h2>
                  <p className="text-muted-foreground">{group.teacher}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleJoinGroup} disabled={isJoining}>
                  {isJoining ? "Sending request..." : "Request Join"}
                </Button>
                <Button variant="outline" asChild className="bg-transparent">
                  <Link href={`/dashboard/groups/${group.$id}/chat`}>
                    <Users className="mr-2 h-4 w-4" />
                    Chat
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
