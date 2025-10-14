"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { getAllGroups } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
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

      const groupsResult = await getAllGroups();

      if (groupsResult.success) {
        const activeGroups = groupsResult.groups?.filter(group => group.status !== "pending" && group.status !== "rejected") ?? []
        setGroups(activeGroups)
      }

      setIsLoading(false)
    }

    loadUserGroups()
  }, [router])

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
      <div className="flex gap-6 px-20 pt-10 text-black">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Home Feed</h1>
          </div>

          {groups.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No groups yet</h3>
              <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                Start your learning journey by creating your first study group or explore existing groups to join.
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
            <div className="space-y-4 px-4 md:px-20">
              <div className="grid gap-6 md:grid-cols-1">
                {groups.map((group) => (
                  <Link
                    key={group.$id}
                    href={`/dashboard/groups/${group.$id}`}
                    className="block rounded-lg border border-transparent bg-gradient-to-br from-[#C9E265] to-[#89D957] p-6 transition-colors hover:border-black"
                  >
                    <div className="relative text-center space-y-4">
                      {/* Member Count in the top-left corner */}
                      <div className="absolute top-4 left-4 flex items-center justify-start gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <p className="font-bold">
                          {group.memberCount}/{group.maxMembers}
                        </p>
                      </div>

                      {/* Time Schedule in the top-right corner */}
                      <div className="absolute top-4 right-4 text-sm">
                        {group.schedule}
                      </div>

                      {/* Group Image in the center */}
                      <div className="flex justify-center pt-15">
                        <img
                          src={group.imageUrl || "/placeholder.svg"}
                          alt={group.name}
                          className="h-32 w-32 object-contain rounded-full"
                        />
                      </div>

                      {/* Group Name (Math Wizard) and Subject */}
                      <h3 className="font-semibold text-2xl">{group.name}</h3>
                      <p className="text-sm">{group.subject}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>


          )}
        </div>
      </div>
    </DashboardLayout>
  )
}



