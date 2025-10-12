"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Users, Sparkles, Clock, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getUserGroups } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useRouter } from "next/navigation"

export default function MyGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removedGroupIds, setRemovedGroupIds] = useState<string[]>([])

  // Load removed group IDs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("removedGroupIds")
      if (saved) {
        setRemovedGroupIds(JSON.parse(saved))
      }
    }
  }, [])

  // Save removed group IDs to localStorage (slight debounce)
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
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading your groups...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Filter out removed rejected groups
  const visibleGroups = groups.filter((group) => !removedGroupIds.includes(group.$id))

  const handleRemove = (groupId: string) => {
    setRemovedGroupIds((prev) => [...prev, groupId])
  }

  const handleRestoreRemoved = () => {
    setRemovedGroupIds([])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Groups</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Awaiting Teacher Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Join Request Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Approved</span>
            </div>
          </div>
        </div>

        {/* Count and restore removed button */}
        <div className="flex items-center justify-between float-end">
          {removedGroupIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreRemoved}
              className="text-sm p-5 bg-background text-white hover:text-background  hover:bg-green cursor-pointer"
            >
              Rejected
            </Button>
          )}
        </div>

        {visibleGroups.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-10 w-10 text-black" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">You haven't joined any groups yet</h3>
            <p className="mt-2 max-w-sm text-balance text-muted-foreground">
              Create your own study group or explore existing ones to start collaborating with other students.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                asChild
                variant="outline"
                className="cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
              >
                <Link href="/dashboard/create-group">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Group
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="cursor-pointer py-8 gap-2 bg-[#172232] text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
              >
                <Link href="/dashboard/explore">Explore Groups</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleGroups.map((group) => {
              const isPendingApproval = group.status === "pending"
              const isPendingRejected = group.status === "rejected"
              const isJoinRequestPending = group.membershipStatus === "pending_join"
              const isJoinRequestRejected = group.membershipStatus === "rejected"
              const isActive = group.membershipStatus === "approved" && group.status === "approved"

              const statusColor = isPendingApproval
                ? "bg-orange-500"
                : isJoinRequestPending
                ? "bg-yellow-500"
                : isJoinRequestRejected || isPendingRejected
                ? "bg-red-500"
                : "bg-green-500"

              const removeButton =
                (isJoinRequestRejected || isPendingRejected) && !removedGroupIds.includes(group.$id) ? (
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
                  className={`relative ${
                    isPendingApproval || isJoinRequestPending
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:shadow-lg transition-shadow"
                  }`}
                >
                  <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor}`} />
                  {removeButton}

                  <CardHeader>
                    <div>
                      <h3 className="font-semibold text-lg pr-6">{group.name}</h3>
                      {isPendingApproval && (
                        <Badge variant="outline" className="mt-2 mr-2 border-orange-500 text-orange-500">
                          Awaiting Teacher Approval
                        </Badge>
                      )}
                      {isJoinRequestPending && (
                        <Badge variant="outline" className="mt-2 mr-2 border-yellow-500 text-yellow-500">
                          Join Request Pending
                        </Badge>
                      )}
                      {isJoinRequestRejected && (
                        <Badge variant="outline" className="mt-2 mr-2 border-red-500 text-red-500">
                          Rejected
                        </Badge>
                      )}
                      {isPendingRejected && (
                        <Badge variant="outline" className="mt-2 mr-2 border-red-500 text-red-500">
                          Group Rejected
                        </Badge>
                      )}
                      <Badge variant="secondary" className="mt-2">
                        {group.subject}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{group.schedule}</span>
                    </div>
                    {group.teacher && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{group.teacher}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {group.memberCount || 0}/{group.maxMembers || 15} members
                      </span>
                    </div>

                    {isPendingApproval && (
                      <div className="mt-4 rounded-md bg-orange-50 border border-orange-200 p-3 text-center text-sm text-orange-700">
                        Group will be visible to others once approved by {group.teacher || "the assigned teacher"}.
                      </div>
                    )}

                    {isJoinRequestPending && (
                      <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-center text-sm text-yellow-700">
                        Waiting for group admin to approve your join request.
                      </div>
                    )}

                    {isJoinRequestRejected && (
                      <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-center text-sm text-red-700">
                        Your join request was rejected. You can remove this group from your list.
                      </div>
                    )}
                    {isPendingRejected && (
                      <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-center text-sm text-red-700">
                        This group was rejected by the teacher or admin. You can remove it from your list.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )

              return (
                <div key={group.$id}>
                  {isActive ? <Link href={`/dashboard/groups/${group.$id}`}>{cardContent}</Link> : cardContent}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
