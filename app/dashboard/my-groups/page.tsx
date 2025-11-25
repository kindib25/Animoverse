"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Users, Sparkles, Clock, X, Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getUserGroups } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function MyGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removedGroupIds, setRemovedGroupIds] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showRejectedModal, setShowRejectedModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting" | "joinpending" | "approved" | "rejected">("all")

  // Load removed group IDs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("removedGroupIds")
      if (saved) {
        setRemovedGroupIds(JSON.parse(saved))
      }
    }
  }, [])

  // Save removed group IDs to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const timeout = setTimeout(() => {
      localStorage.setItem("removedGroupIds", JSON.stringify(removedGroupIds))
    }, 300)
    return () => clearTimeout(timeout)
  }, [removedGroupIds])

  // Load user's groups
  useEffect(() => {
    async function loadUserGroups() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }

      const groupsResult = await getUserGroups(userResult.user.$id)

      if (groupsResult.success && groupsResult.groups) {
        setGroups(groupsResult.groups)
      }

      setIsLoading(false)
    }

    loadUserGroups()
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
          <p className="text-muted-foreground">Loading your groups...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Filter out removed rejected groups
  const visibleGroups = groups
    .filter((g) => !removedGroupIds.includes(g.$id))
    .filter((g) => {
      if (activeFilter === "all") return true

      const isPendingApproval = g.status === "pending"
      const isJoinPending = g.membershipStatus === "pending_join"
      const isApproved = g.status === "approved" && g.membershipStatus === "approved"
      const isRejected = g.status === "rejected" || g.membershipStatus === "rejected"

      switch (activeFilter) {
        case "awaiting":
          return isPendingApproval
        case "joinpending":
          return isJoinPending
        case "approved":
          return isApproved
        case "rejected":
          return isRejected
        default:
          return true
      }
    })
  const rejectedGroups = groups.filter(
    (g) => g.status === "rejected" || g.membershipStatus === "rejected"
  )

  const handleRemove = (groupId: string) => {
    setRemovedGroupIds((prev) => [...prev, groupId])
  }

  return (
    <div className="flex h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex min-h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
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
      <main className="flex-1 overflow-y-auto bg-white">
        <Button
          variant="ghost"
          size="icon"
          className="sm:flex md:hidden cursor-pointer text-black m-3"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="!w-6 !h-6" />
        </Button>


        {/* Header Section */}
        <div className="max-w-7xl mx-auto pt-10 space-y-6 p-5">
          <div className="space-y-6 text-black">
            <div className="flex flex-col items-center justify-between gap-7">
              <h1 className="text-4xl font-peace-sans">
                My Groups
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-sm">
                {/* SHOW ALL */}
                <Badge
                  variant="outline"
                  className={`mt-2 mr-2 w-[200px] border-gray-500 text-gray-600 flex items-center gap-2 cursor-pointer py-1
      ${activeFilter === "all" ? "bg-gray-200" : ""}`}
                  onClick={() => setActiveFilter("all")}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  Show All
                </Badge>
                
                {/* AWAITING TEACHER APPROVAL */}
                <Badge
                  variant="outline"
                  className={`mt-2 mr-2 w-[200px] border-orange-500 text-orange-500 flex items-center gap-2 cursor-pointer py-1
      ${activeFilter === "awaiting" ? "bg-orange-100" : ""}`}
                  onClick={() => setActiveFilter("awaiting")}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Awaiting Teacher Approval
                </Badge>

                {/* JOIN REQUEST PENDING */}
                <Badge
                  variant="outline"
                  className={`mt-2 mr-2 w-[200px] border-yellow-500 text-yellow-500 flex items-center gap-2 cursor-pointer py-1
      ${activeFilter === "joinpending" ? "bg-yellow-100" : ""}`}
                  onClick={() => setActiveFilter("joinpending")}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Join Request Pending
                </Badge>

                {/* APPROVED */}
                <Badge
                  variant="outline"
                  className={`mt-2 mr-2 w-[200px] border-green-500 text-green-500 flex items-center gap-2 cursor-pointer py-1
      ${activeFilter === "approved" ? "bg-green-100" : ""}`}
                  onClick={() => setActiveFilter("approved")}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Approved
                </Badge>

                {/* REJECTED */}
                <Badge
                  variant="outline"
                  className={`mt-2 mr-2 w-[200px] border-red-500 text-red-500 flex items-center gap-2 cursor-pointer py-1
      ${activeFilter === "rejected" ? "bg-red-100" : ""}`}
                  onClick={() => setActiveFilter("rejected")}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Rejected
                </Badge>
              </div>
            </div>
          </div>


          {/* Empty State */}
          {visibleGroups.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-black" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-black">
                No groups found.
              </h3>
              <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                Create your own study group or explore existing ones to start collaborating with other students.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer bg-accent py-8 text-black hover:bg-green hover:text-black transition font-mono"
                >
                  <Link href="/dashboard/create-group">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Group
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="cursor-pointer py-8 gap-2 bg-background text-white hover:bg-green hover:text-black transition font-mono"
                >
                  <Link href="/dashboard/explore">Explore Groups</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleGroups.map((group) => {
                const isPendingApproval = group.status === "pending"
                const isJoinRequestPending = group.membershipStatus === "pending_join"
                const isPendingRejected = group.status === "rejected"
                const isJoinRequestRejected = group.membershipStatus === "rejected"
                const isActive =
                  group.membershipStatus === "approved" && group.status === "approved"

                const statusColor = isPendingApproval
                  ? "bg-orange-500"
                  : isJoinRequestPending
                    ? "bg-yellow-500"
                    : isPendingRejected || isJoinRequestRejected
                      ? "bg-red-500"
                      : "bg-green-500"

                const removeButton =
                  (isJoinRequestRejected || isPendingRejected) &&
                    !removedGroupIds.includes(group.$id) ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 flex items-center gap-1 cursor-pointer"
                      onClick={() => handleRemove(group.$id)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  ) : null

                const cardContent = (
                  <Card
                    className={`relative ${isPendingApproval || isJoinRequestPending
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:shadow-lg transition-shadow"
                      }`}
                  >
                    <div
                      className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor}`}
                    />
                    {removeButton}

                    <CardHeader>
                      <div className="flex flex-col justify-center items-center pt-5">
                        <img
                          src={group.imageUrl || "/placeholder.svg"}
                          alt={group.name}
                          className="h-32 w-32 object-contain rounded-full"
                        />
                        <h3 className="font-semibold text-2xl">{group.name}</h3>
                        {isPendingApproval && (
                          <Badge
                            variant="outline"
                            className="mt-2 mr-2 border-orange-500 text-orange-500"
                          >
                            Awaiting Teacher Approval
                          </Badge>
                        )}
                        {isJoinRequestPending && (
                          <Badge
                            variant="outline"
                            className="mt-2 mr-2 border-yellow-500 text-yellow-500"
                          >
                            Join Request Pending
                          </Badge>
                        )}
                        {isJoinRequestRejected && (
                          <Badge
                            variant="outline"
                            className="mt-2 mr-2 border-red-500 text-red-500"
                          >
                            Rejected
                          </Badge>
                        )}
                        {isPendingRejected && (
                          <Badge
                            variant="outline"
                            className="mt-2 mr-2 border-red-500 text-red-500"
                          >
                            Group Rejected
                          </Badge>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {group.subject}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 flex justify-center items-center flex-col">
                      <div className="flex items-center gap-2 text-sm text-black">
                        <Clock className="h-4 w-4" />
                        <span>{group.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black">
                        <Users className="h-4 w-4" />
                        <span>
                          {group.memberCount || 0}/{group.maxMembers || 15} members
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )

                return (
                  <div key={group.$id}>
                    {isActive ? (
                      <Link href={`/dashboard/groups/${group.$id}`}>{cardContent}</Link>
                    ) : (
                      cardContent
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rejected Groups Popup */}
        <AnimatePresence>
          {showRejectedModal && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowRejectedModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              {/* Popup Container */}
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-3xl max-h-[80vh] overflow-y-auto relative p-6">
                  <button
                    onClick={() => setShowRejectedModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                  >
                    <X className="h-5 w-5 cursor-pointer" />
                  </button>

                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    Rejected Groups
                  </h2>

                  {rejectedGroups.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">
                      No rejected groups found.
                    </p>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {rejectedGroups.map((group) => (
                        <Card key={group.$id} className="relative">
                          <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-red-500" />
                          <CardHeader>
                            <div className="flex flex-col items-center justify-center pt-3">
                              <img
                                src={group.imageUrl || "/placeholder.svg"}
                                alt={group.name}
                                className="h-24 w-24 rounded-full object-cover"
                              />
                              <h3 className="mt-3 font-semibold text-lg">
                                {group.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="mt-2 border-red-500 text-red-500"
                              >
                                Rejected
                              </Badge>
                              <Badge variant="secondary" className="mt-2">
                                {group.subject}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-sm text-black">
                              <Clock className="h-4 w-4" />
                              <span>{group.schedule}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-black">
                              <Users className="h-4 w-4" />
                              <span>
                                {group.memberCount || 0}/{group.maxMembers || 15} members
                              </span>
                            </div>
                            <p className="text-red-600 text-sm mt-3">
                              This group was rejected by teacher/admin.
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
