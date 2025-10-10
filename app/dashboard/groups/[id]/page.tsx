"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ArrowLeft, MessageSquare, Phone } from "lucide-react"
import { getGroup, joinGroup, checkMembershipStatus } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [group, setGroup] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    async function loadGroup() {
      const userResult = await clientGetCurrentUser()
      if (userResult.success && userResult.user) {
        setUserId(userResult.user.$id)

        const statusResult = await checkMembershipStatus(params.id as string, userResult.user.$id)
        if (statusResult.success && statusResult.hasMembership) {
          setMembershipStatus(statusResult.status)
          setMembershipRole(statusResult.role)
        }
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

    if (group.memberCount >= group.maxMembers) {
      toast({
        title: "Group Full",
        description: "This group has reached the maximum number of members.",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)
    const result = await joinGroup(group.$id, userId)

    if (result.success) {
      setMembershipStatus("pending_join")
      toast({
        title: "Request sent!",
        description: "Your request to join the group has been sent to the creator.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send join request.",
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
            <Link href="/dashboard">Back to Home</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const isCreator = membershipRole === "creator"
  const isMember = membershipStatus === "approved"
  const isPending = membershipStatus === "pending_join"
  const isRejected = membershipStatus === "rejected"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 px-4">
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
                      <span>{group.schedule}</span>
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
                {!membershipStatus && (
                  <Button
                    className="flex-1"
                    onClick={handleJoinGroup}
                    disabled={isJoining || group.memberCount >= group.maxMembers}
                  >
                    {group.memberCount >= group.maxMembers
                      ? "Group Full"
                      : isJoining
                        ? "Sending request..."
                        : "Request to Join"}
                  </Button>
                )}

                {isPending && (
                  <Button className="flex-1" disabled variant="secondary">
                    Request Pending
                  </Button>
                )}

                {isRejected && (
                  <Button className="flex-1" disabled variant="destructive">
                    Request Rejected
                  </Button>
                )}

                {(isMember || isCreator) && (
                  <>
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/groups/${group.$id}/chat`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="text-white">
                      <Link href={`/dashboard/groups/${group.$id}/call`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </Link>
                    </Button>
                  </>
                )}

                {isCreator && (
                  <Button asChild variant="secondary">
                    <Link href={`/dashboard/groups/${group.$id}/requests`}>Manage Requests</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
