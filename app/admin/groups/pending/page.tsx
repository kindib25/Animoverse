"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle, Menu } from "lucide-react"
import { getPendingGroups, approveGroup, rejectGroup, getUserProfile } from "@/lib/appwrite/database"
import { getCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function PendingGroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
            <div>
              <h1 className="text-3xl md:text-4xl font-peace-sans">Pending Group Approvals</h1>
              <p className="text-white mt-2">Review and approve student-created groups assigned to you</p>
            </div>

            {groups.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-10 w-10 text-black/60" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">All caught up!</h3>
                  <p className="mt-2 text-muted-foreground">
                    There are no pending group approvals assigned to you at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {groups.map((group) => (
                  <Card key={group.$id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{group.subject}</Badge>
                        <Badge variant="outline">
                          <Users className="mr-1 h-3 w-3 text-black" />
                          <p className="text-black">{group.memberCount || 0}/{group.maxMembers || 15}</p>
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

                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="shad-button_ReqJoin md:w-40 w-40 cursor-pointer"
                          onClick={() => handleApprove(group.$id)}
                          disabled={processingId === group.$id}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="shad-button_ReqRejected md:w-40 w-40 cursor-pointer"
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
        </main>
      </div>
    </div>
  )
}
