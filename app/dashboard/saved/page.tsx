"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Bookmark, Users, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { clientGetSavedGroups } from "@/lib/appwrite/client-database"

export default function SavedPage() {
  const [savedGroups, setSavedGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSavedGroups() {
      const userResult = await clientGetCurrentUser()
      if (userResult.success && userResult.user) {
        const result = await clientGetSavedGroups(userResult.user.$id)
        if (result.success && result.groups) {
          const approvedGroups = result.groups.filter((group: any) => group.status === "approved")
          setSavedGroups(approvedGroups)
        }
      }
      setIsLoading(false)
    }

    loadSavedGroups()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading saved groups...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Groups</h1>
          <p className="text-muted-foreground mt-2">Groups you've joined and can access anytime</p>
        </div>

        {savedGroups.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Bookmark className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No saved groups yet</h3>
            <p className="mt-2 max-w-sm text-balance text-muted-foreground">
              Save groups you're interested in to easily find them later.
            </p>
            <Button asChild className="mt-6 bg-transparent" variant="outline">
              <Link href="/dashboard/explore">Explore Groups</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedGroups.map((group: any) => (
              <Link key={group.$id} href={`/dashboard/groups/${group.$id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-lg h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {group.subject}
                        </Badge>
                      </div>
                      <Bookmark className="h-5 w-5 text-primary fill-primary" />
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
                  <CardFooter>
                    <Button className="w-full bg-transparent" variant="outline">
                      View Group
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
