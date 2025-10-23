"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserProfile, getUserGroups } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [groupCount, setGroupCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success) {
        router.push("/login")
        return
      }

      const profileResult = await getUserProfile(userResult.user?.$id || "")

      if (profileResult.success) {
        setProfile(profileResult.profile)
      }

      const groupsResult = await getUserGroups(userResult.user?.$id || "")
      if (groupsResult.success && groupsResult.groups) {
        setGroupCount(groupsResult.groups.length)
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AdminLayout>
    )
  }

  const isProfileComplete = profile?.grade && profile?.subjects?.length > 0 && profile?.studyPreferences?.length > 0

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {!isProfileComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile to get better study group matches.{" "}
              <Link href="/admin/profile/edit" className="font-medium underline">
                Edit profile
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback className="text-3xl">
                  {profile?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>


              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{profile?.name || "User"}</h1>
                <p className="text-muted-foreground">@{profile?.username || "username"}</p>
                {profile?.bio ? (
                  <p className="text-sm">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No bio yet</p>
                )}
              </div>

              {profile?.grade && (
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {profile.grade}
                </Badge>
              )}

              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{groupCount}</span>
                  <span className="text-sm text-muted-foreground">Assigned Groups</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{profile?.subjects?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{profile?.studyPreferences?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">Following</span>
                </div>
              </div>

              <Button asChild className="w-full max-w-xs cursor-pointer bg-background py-6 px-10 text-[#ffffff] hover:bg-green hover:text-black transition font-mono">
                <Link href="/admin/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {(profile?.subjects?.length > 0 || profile?.studyPreferences?.length > 0) && (
          <Card>
            <CardContent className="p-6 space-y-4">
              {profile?.subjects?.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-bold">Interested Subjects</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((subject: string) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile?.studyPreferences?.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-bold">Study Preferences</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.studyPreferences.map((pref: string) => (
                      <Badge key={pref} variant="outline">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
