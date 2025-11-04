"use client"
import { useAuth } from "@/lib/context/auth-context"
import { useTeacherGroups, usePendingGroups, useUpdateGroupStatus } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, X, MessageSquare, Users, Menu, Calendar } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminGroupsPage() {
  const { profile } = useAuth()
  const { data: assignedGroups, isLoading: loadingAssigned } = useTeacherGroups(profile?.$id || "")
  const { data: pendingGroups, isLoading: loadingPending } = usePendingGroups(profile?.$id || "")
  const updateStatus = useUpdateGroupStatus()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleApprove = async (groupId: string) => {
    await updateStatus.mutateAsync({ groupId, status: "approved" })
  }

  const handleReject = async (groupId: string) => {
    await updateStatus.mutateAsync({ groupId, status: "rejected" })
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
          <div className="max-w-7xl mx-auto mt-0 md:mt-2 p-10">
            <h1 className="text-3xl md:text-4xl font-peace-sans">Groups</h1>
            <p className="text-white/90 md:text-base text-sm">Manage and monitor study groups</p>
          </div>

          <Tabs defaultValue="assigned" className="max-w-7xl mx-auto space-y-6 px-2 md:px-10">
            <TabsList>
              <TabsTrigger value="assigned"><span className="text-sm md:text-lg">Assigned Groups</span></TabsTrigger>
              <TabsTrigger value="pending">
                <span className="text-sm md:text-lg">Pending Approval</span>
                {pendingGroups && pendingGroups.length > 0 && (
                  <Badge variant="destructive" className="md:ml-2">
                    {pendingGroups.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              {loadingAssigned ? (
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
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
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {assignedGroups.map((group: any) => (
                    <Card key={group.$id}>
                      <CardHeader>
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{group.schedule}</span>
                          </div>
                          <Badge className="text-sm bg-black/10">{group.subject}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <h2 className="font-semibold">About</h2>
                          <p className="text-muted-foreground">{group.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 shad-button_ReqJoin py-7">
                            <Link href={`/admin/groups/${group.$id}`}>
                              <Users className="mr-2 h-4 w-4" />
                              Members
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1 shad-button_ReqJoin py-7">
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
                <div className="grid gap-4 md:grid-cols-2">
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
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {pendingGroups.map((group: any) => (
                    <Card key={group.$id}>
                      <CardHeader>
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{group.schedule}</span>
                          </div>
                          <Badge className="text-sm bg-black/10">{group.subject}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="space-y-2">
                            <h2 className="font-semibold">About</h2>
                            <p className="text-muted-foreground">{group.description}</p>
                          </div>
                          <div className="space-y-2">
                            <h2 className="font-semibold">Created by</h2>
                            {group.creator && (
                              <p className="text-muted-foreground">{group.creator.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                          <Button
                            size="sm"
                            className="shad-button_ReqJoin cursor-pointer md:w-40 w-40"
                            onClick={() => handleApprove(group.$id)}
                            disabled={updateStatus.isPending}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="shad-button_ReqRejected cursor-pointer md:w-40 w-40"
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
    </div>
  )
}
