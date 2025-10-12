"use client"
import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups, usePendingGroups, useUpdateGroupStatus } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, X, MessageSquare, Users } from "lucide-react"

export default function AdminGroupsPage() {
  const { profile } = useAuth()
  const { data: assignedGroups, isLoading: loadingAssigned } = useTeacherGroups(profile?.$id || "")
  const { data: pendingGroups, isLoading: loadingPending } = usePendingGroups(profile?.$id || "")
  const updateStatus = useUpdateGroupStatus()

  const handleApprove = async (groupId: string) => {
    await updateStatus.mutateAsync({ groupId, status: "approved" })
  }

  const handleReject = async (groupId: string) => {
    await updateStatus.mutateAsync({ groupId, status: "rejected" })
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Manage and monitor study groups</p>
        </div>

        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assigned">Assigned Groups</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingGroups && pendingGroups.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingGroups.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {loadingAssigned ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assignedGroups && assignedGroups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedGroups.map((group: any) => (
                  <Card key={group.$id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Link href={`/admin/groups/${group.$id}`}>
                            <Users className="mr-2 h-4 w-4" />
                            Members
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Link href={`/admin/groups/${group.$id}/chat`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex min-h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">No assigned groups yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {loadingPending ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingGroups && pendingGroups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingGroups.map((group: any) => (
                  <Card key={group.$id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 cursor-pointer"
                          onClick={() => handleApprove(group.$id)}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 cursor-pointer"
                          onClick={() => handleReject(group.$id)}
                          disabled={updateStatus.isPending}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex min-h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">No pending groups</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
