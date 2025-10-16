"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Search, Users, Clock, BookOpen, Loader2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  useJoinGroup,
  useSaveGroup,
  useUnsaveGroup,
} from "@/lib/hooks/use-groups"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { getAllGroups } from "@/lib/appwrite/database"
import { Sidebar } from "@/components/dashboard/sidebar"
import { clientCheckSavedStatus } from "@/lib/appwrite/client-database"

export default function ExplorePage() {
  const [allGroups, setGroups] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const joinGroupMutation = useJoinGroup()
  const saveGroupMutation = useSaveGroup()
  const unsaveGroupMutation = useUnsaveGroup()
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadUser() {
      const userResult = await clientGetCurrentUser()
      if (userResult.success && userResult.user) {
        setUserId(userResult.user.$id)
      }

      const groupsResult = await getAllGroups()
      if (groupsResult.success) {
        const activeGroups =
          groupsResult.groups?.filter(
            (group) =>
              group.status !== "pending" && group.status !== "rejected"
          ) ?? []
        setGroups(activeGroups)
      }

      setIsLoading(false)
    }

    loadUser()
  }, [])

  useEffect(() => {
    async function checkSavedStatuses() {
      if (!userId || allGroups.length === 0) return

      const savedChecks = await Promise.all(
        allGroups.map(async (group: any) => {
          const result = await clientCheckSavedStatus(userId, group.$id)
          return {
            groupId: group.$id,
            isSaved: result.isSaved || false,
          }
        })
      )

      const map: Record<string, boolean> = {}
      savedChecks.forEach((check) => {
        map[check.groupId] = check.isSaved
      })
      setSavedMap(map)
    }

    checkSavedStatuses()
  }, [userId, allGroups])

  const approvedGroups = allGroups.filter(
    (group: any) => group.status === "approved"
  )
  const filteredGroups = approvedGroups.filter((group: any) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleJoinGroup = (groupId: string) => {
    if (!userId) return
    joinGroupMutation.mutate({ groupId, userId })
  }

  const handleToggleSave = async (groupId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) return

    const isSaved = savedMap[groupId]
    if (isSaved) {
      await unsaveGroupMutation.mutateAsync({ userId, groupId })
      setSavedMap((prev) => ({ ...prev, [groupId]: false }))
    } else {
      await saveGroupMutation.mutateAsync({ userId, groupId })
      setSavedMap((prev) => ({ ...prev, [groupId]: true }))
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white py-10 lg:px-12">
        <div className="max-w-7xl mx-auto pt-10 space-y-6">
          <h1 className="text-3xl font-bold text-black">Search Groups</h1>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-background rounded-xl border-gray-300 selection:bg-background selection:text-white"
            />
          </div>

          {/* Groups Section */}
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted-foreground/25 rounded-xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-black" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                No groups available
              </h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Be the first to create a study group and help build the
                Animoverse community!
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 bg-accent py-6 px-6 font-mono text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition"
              >
                <Link href="/dashboard/create-group">Create First Group</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {filteredGroups.map((group: any) => {
                const isSaved = savedMap[group.$id] || false

                return (
                  <Link
                    key={group.$id}
                    href={`/dashboard/groups/${group.$id}`}
                  >
                    <Card className="hover:shadow-md transition-all rounded-xl border-gray-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {group.name}
                            </h3>
                            <Badge variant="secondary" className="mt-2">
                              {group.subject}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleToggleSave(group.$id, e)}
                            className="h-8 w-8"
                          >
                            <Bookmark
                              className={`h-5 w-5 ${
                                isSaved
                                  ? "fill-black text-black"
                                  : "text-gray-500"
                              }`}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{group.schedule}</span>
                        </div>

                        {group.teacher && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            <span>{group.teacher}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>
                            {group.memberCount || 0}/{group.maxMembers || 15}{" "}
                            members
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
