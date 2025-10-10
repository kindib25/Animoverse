"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle } from "lucide-react"
import { getPendingGroups, approveGroup, rejectGroup, getUserProfile } from "@/lib/appwrite/database"
import { getCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"

export default function PendingGroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  async function loadCurrentUser() {
    const userResult = await getCurrentUser()
    if (userResult.success && userResult.user) {
      setCurrentUserId(userResult.user.$id)
      loadPendingGroups(userResult.user.$id)
    } else {
      setIsLoading(false)
    }
  }

  async function loadPendingGroups(teacherId: string) {
    setIsLoading(true)
    const result = await getPendingGroups(teacherId)

    if (result.success && result.groups) {
      // Fetch creator details for each group
      const groupsWithCreators = await Promise.all(
        result.groups.map(async (group: any) => {
          const creatorResult = await getUserProfile(group.creatorId)
          return {
            ...group,
            creator: creatorResult.success ? creatorResult.profile : null,
          }
        }),
      )
      setGroups(groupsWithCreators)
    } else {
      toast({
        title: "Error",
        description: "Failed to load pending groups",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  async function handleApprove(groupId: string) {
    setProcessingId(groupId)
    const result = await approveGroup(groupId)

    if (result.success) {
      toast({
        title: "Group approved",
        description: "The group has been approved and is now visible to students.",
      })
      setGroups((prev) => prev.filter((g) => g.$id !== groupId))
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve group",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  async function handleReject(groupId: string) {
    setProcessingId(groupId)
    const result = await rejectGroup(groupId)

    if (result.success) {
      toast({
        title: "Group rejected",
        description: "The group has been rejected.",
      })
      setGroups((prev) => prev.filter((g) => g.$id !== groupId))
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject group",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading pending groups...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Group Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve student-created groups assigned to you</p>
        </div>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-background/60" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">All caught up!</h3>
              <p className="mt-2 text-muted-foreground">
                There are no pending group approvals assigned to you at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.$id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{group.subject}</Badge>
                    <Badge variant="outline">
                      <Users className="mr-1 h-3 w-3 text-background" />
                      <p className="text-background">{group.memberCount || 0}/{group.maxMembers || 15}</p>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{group.description}</p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Schedule:</span> {group.schedule}
                    </p>
                    {group.teacher && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Teacher:</span> {group.teacher}
                      </p>
                    )}
                    {group.creator && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Created by:</span> {group.creator.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(group.$id)}
                      disabled={processingId === group.$id}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(group.$id)}
                      disabled={processingId === group.$id}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
