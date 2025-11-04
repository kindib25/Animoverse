"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Check, X, Menu } from "lucide-react"
import {
  getPendingMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest,
  checkMembershipStatus,
} from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function MembershipRequestsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function loadRequests() {
      const userResult = await clientGetCurrentUser()
      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }

      // Check if user is the creator
      const statusResult = await checkMembershipStatus(params.id as string, userResult.user.$id)
      if (!statusResult.success || statusResult.role !== "creator") {
        toast({
          title: "Access denied",
          description: "Only group creators can manage membership requests.",
          variant: "destructive",
        })
        router.push(`/dashboard/groups/${params.id}`)
        return
      }

      const result = await getPendingMembershipRequests(params.id as string)
      if (result.success && result.requests) {
        setRequests(result.requests)
      }
      setIsLoading(false)
    }

    loadRequests()
  }, [params.id, router, toast])

  const handleApprove = async (membershipId: string) => {
    setProcessingId(membershipId)
    const result = await approveMembershipRequest(membershipId, params.id as string)

    if (result.success) {
      setRequests(requests.filter((req) => req.membershipId !== membershipId))
      toast({
        title: "Request approved",
        description: "The user has been added to the group.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve request.",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const handleReject = async (membershipId: string) => {
    setProcessingId(membershipId)
    const result = await rejectMembershipRequest(membershipId)

    if (result.success) {
      setRequests(requests.filter((req) => req.membershipId !== membershipId))
      toast({
        title: "Request rejected",
        description: "The membership request has been rejected.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject request.",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
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



      <main className="flex-1 overflow-y-auto bg-white md:py-5">
        <div className="mx-auto max-w-4xl space-y-6 px-4">

           <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black mt-5 mb-10"
            onClick={() => setIsSidebarOpen(true)}
          >
             <Menu className="!w-6 !h-6" />
          </Button>

          <Button variant="ghost" asChild className="hidden md:inline-flex text-black bg-accent hover:bg-background hover:text-white">
            <Link href={`/dashboard/groups/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Group
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Membership Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending membership requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.membershipId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.user.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback>{request.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{request.user.name}</p>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.membershipId)}
                          disabled={processingId === request.membershipId}
                          className="shad-button_ReqJoin"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.membershipId)}
                          disabled={processingId === request.membershipId}
                          className="shad-button_ReqRejected"
                        >
                          <X className="h-4 w-4 mr-1 ml-1 " />
                          <span className="pr-3">Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
