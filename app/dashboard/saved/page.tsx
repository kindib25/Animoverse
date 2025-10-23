"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Bookmark, Users, Clock, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge, } from "@/components/ui/badge"
import Link from "next/link"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { clientGetUserSavedGroups, clientUnsaveGroup } from "@/lib/appwrite/client-database"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function SavedPage() {
  const [savedGroups, setSavedGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    async function loadSavedGroups() {
      const userResult = await clientGetCurrentUser()
      if (userResult.success && userResult.user) {
        setUserId(userResult.user.$id)
        const result = await clientGetUserSavedGroups(userResult.user.$id)
        if (result.success && result.groups) {
          setSavedGroups(result.groups)
        }
      }
      setIsLoading(false)
    }

    loadSavedGroups()
  }, [])

  const handleUnsave = async (groupId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) return

    const result = await clientUnsaveGroup(userId, groupId)
    if (result.success) {
      setSavedGroups((prev) => prev.filter((group) => group.$id !== groupId))
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
          <p className="pl-2 text-muted-foreground">Loading saved groups...</p>
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
        {/* Header Section */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-peace-sans text-black">Saved Groups</h1>
              <p className="text-muted-foreground font-semibold mt-2">
                Groups you've bookmarked for quick access
              </p>
            </div>

            {savedGroups.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Bookmark className="h-10 w-10 text-black" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">No saved groups yet</h3>
                <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                  Save groups you're interested in to easily find them later.
                </p>
                <Button
                  asChild
                  className="mt-6 bg-background py-6 px-6 font-mono text-white hover:bg-green hover:text-black transition"
                  variant="outline"
                >
                  <Link href="/dashboard/explore">Explore Groups</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savedGroups.map((group: any) => (
                  <Link key={`${group.$id}-${Math.random()}`} href={`/dashboard/groups/${group.$id}`}>
                    <Card
                      key={group.$id}
                      onClick={() => router.push(`/dashboard/groups/${group.$id}`)}
                      className="cursor-pointer transition-all hover:shadow-lg h-full bg-gradient-to-br from-[#4ec66a] to-green hover:border-1 hover:border-black"
                    >
                      <CardHeader>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleUnsave(group.$id, e)}
                          className="h-8 w-8"
                        >
                          <Bookmark className="h-5 w-5 text-black fill-black" />
                        </Button>
                        <div className="flex items-center justify-center">
                          <div>
                            <div className="flex justify-center">
                              <img
                                src={group.imageUrl || "/placeholder.svg"}
                                alt={group.name}
                                className="h-32 w-32 object-contain rounded-full"
                              />
                            </div>
                            <h3 className="font-semibold text-2xl">{group.name}</h3>
                            <div className="flex items-center justify-center">
                              <Badge variant="secondary" className="mt-2">
                                {group.subject}
                              </Badge>
                            </div>
                          </div>

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
                            {group.memberCount || 0}/{group.maxMembers || 15}{" "}
                            members
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
