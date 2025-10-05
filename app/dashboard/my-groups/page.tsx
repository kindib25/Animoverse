"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Users, Sparkles, Clock, BookOpen } from "lucide-react"
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

  useEffect(() => {
    async function loadUserGroups() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success || !userResult.user) {
        router.push("/login")
        return
      }

      const groupsResult = await getUserGroups(userResult.user.$id)

      if (groupsResult.success) {
        setGroups(groupsResult.groups ?? [])
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

  return (
    <DashboardLayout>
      <div className="space-y-6 px-20 pt-10 text-black">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Groups</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Created</span>
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-10 w-10 text-black" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">You haven't joined any groups yet</h3>
            <p className="mt-2 max-w-sm text-balance text-muted-foreground">
              Create your own study group or explore existing ones to start collaborating with other students.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="outline" className="cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono" >
                <Link href="/dashboard/create-group">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Group
                </Link>
              </Button>
              <Button variant="outline" asChild className="cursor-pointer py-8 gap-2 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono">
                <Link href="/dashboard/explore">Explore Groups</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const statusColor =
                group.membershipStatus === "pending"
                  ? "bg-yellow-500"
                  : group.membershipStatus === "approved"
                    ? "bg-green-500"
                    : "bg-blue-500"

              return (
                <Card key={group.$id} className="relative">
                  <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusColor}`} />
                  <CardHeader>
                    <div>
                      <h3 className="font-semibold text-lg pr-6">{group.name}</h3>
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
                    {group.membershipStatus === "approved" && (
                      <Button asChild className="w-full mt-4">
                        <Link href={`/dashboard/groups/${group.$id}`}>View Group</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
