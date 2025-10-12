"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Search, Users, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useJoinGroup } from "@/lib/hooks/use-groups"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { getAllGroups } from "@/lib/appwrite/database"





export default function ExplorePage() {
  const [allGroups, setGroups] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const joinGroupMutation = useJoinGroup()

  useEffect(() => {
    async function loadUser() {
      const userResult = await clientGetCurrentUser()

      if (userResult.success && userResult.user) {
        setUserId(userResult.user.$id)
      }

      const groupsResult = await getAllGroups();

      if (groupsResult.success) {
        const activeGroups = groupsResult.groups?.filter(group => group.status !== "pending" && group.status !== "rejected") ?? []
        setGroups(activeGroups)
      }

      setIsLoading(false)
    }

    loadUser()
  }, [])

  const approvedGroups = allGroups.filter((group: any) => group.status === "approved")
  const filteredGroups = approvedGroups.filter((group: any) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )


  const handleJoinGroup = (groupId: string) => {
    if (!userId) return
    joinGroupMutation.mutate({ groupId, userId })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div>
          <h1 className="text-3xl font-bold">Search Groups</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-15 py-8 placeholder:text-lg selection:bg-background selection:text-white"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-10 w-10 text-black" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No groups available</h3>
            <p className="mt-2 max-w-sm text-balance text-muted-foreground">
              Be the first to create a study group and help build the Animoverse community!
            </p>
            <Button asChild variant="outline" className="mt-6 cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono">
              <Link href="/dashboard/create-group">Create First Group</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group: any) => (
              <Link
                    key={group.$id}
                    href={`/dashboard/groups/${group.$id}`}
                  >
              <Card key={group.$id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <Badge variant="secondary" className="mt-2">
                        {group.subject}
                      </Badge>
                    </div>
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
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
