"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ArrowLeft, MessageSquare, Phone, Menu, Edit, Trash2 } from "lucide-react"
import { getGroup, joinGroup, checkMembershipStatus, deleteGroup } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)


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

  const handleDeleteGroup = async () => {
    setIsDeleting(true)
    const result = await deleteGroup(group.$id, userId)

    if (result.success) {
      toast({
        title: "Success",
        description: "Group deleted successfully!",
      })
      router.push("/dashboard/my-groups")
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete group.",
        variant: "destructive",
      })
    }
    setIsDeleting(false)
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
    <div className="flex h-screen overflow-hidden bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      {/* Sidebar */}
      <div className="hidden md:flex min-h-screen">
        <Sidebar />
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
                <Sidebar />
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white py-5">

        <div className="max-w-7xl mx-auto space-y-6"></div>
        <div className="mx-auto max-w-4xl space-y-6 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6" />
          </Button>

          <Button variant="ghost" asChild className="hidden md:inline-flex text-black bg-accent hover:bg-background hover:text-white">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <Card>
            <CardContent className="">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-[#4ec66a] to-green">
                <Link href={`/dashboard/groups/${group.$id}/edit`} className="absolute top-3 right-3 rounded-md bg-white/80 p-2 hover:bg-white transition">
                  <Edit className="h-4 w-4 text-black" />
                </Link>
                {group.imageUrl ? (
                  <div className="flex justify-center pt-10 md:pt-20">
                    <img
                      src={group.imageUrl || "/placeholder.svg"}
                      alt={group.name}
                      className="h-30 w-30 md:h-60 md:w-60 object-contain rounded-full"
                    />
                  </div>
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
                      <Badge variant="secondary" className="text-sm">
                        {group.memberCount || 0}/{group.maxMembers || 15}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{group.schedule}</span>
                      </div>
                    </div>
                    <Badge className="text-sm">{group.subject}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">About</h2>
                  <p className="text-muted-foreground">{group.description}</p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Study Preferences</h2>
                  <p className="text-muted-foreground">
                    {Array.isArray(group.studyPreferences) && group.studyPreferences.length === 2
                      ? group.studyPreferences.join(' / ')
                      : group.studyPreferences}
                  </p>
                </div>

                {group.teacher && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Assigned Teacher</h2>
                    <p className="text-muted-foreground">{group.teacher}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-center items-center">
                  {!membershipStatus && (
                    <Button
                      className="shad-button_ReqJoin"
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
                    <Button className="shad-button_ReqPending" disabled variant="secondary">
                      Request Pending
                    </Button>
                  )}

                  {isRejected && (
                    <Button className="shad-button_ReqRejected" disabled variant="destructive">
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
                    <>
                      <Button asChild variant="secondary">
                        <Link href={`/dashboard/groups/${group.$id}/requests`}>Manage Requests</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/80">
                              Are you sure you want to delete "{group.name}"? This action cannot be undone. All group
                              members, messages, and sessions will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteGroup}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
