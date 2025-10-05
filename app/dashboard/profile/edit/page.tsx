"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserProfile, useUpdateUserProfile } from "@/lib/hooks/use-user"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]
const studyPreferences = ["Group Discussion", "Sharing notes"]

export default function EditProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")
  const [grade, setGrade] = useState("")
  const [bio, setBio] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const { data: profile, isLoading } = useUserProfile(userId)
  const updateProfileMutation = useUpdateUserProfile(userId)

  useEffect(() => {
    async function loadUser() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success) {
        router.push("/login")
        return
      }

      if (userResult.success && userResult.user) {
        setUserId(userResult.user.$id)
      }
    }

    loadUser()
  }, [router])

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setGrade(profile.grade || "")
      setBio(profile.bio || "")
      setSelectedSubjects(profile.subjects || [])
      setSelectedPreferences(profile.studyPreferences || [])
    }
  }, [profile])

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]))
  }

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference) ? prev.filter((p) => p !== preference) : [...prev, preference],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateProfileMutation.mutate({
      username,
      grade,
      bio,
      subjects: selectedSubjects,
      studyPreferences: selectedPreferences,
    })
  }

  const handleCancel = () => {
    router.push("/dashboard/profile")
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" />
                  <AvatarFallback>
                    {username
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer bg-accent py-3 px-4 text-[#172232]">
                  Change profile photo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  placeholder="e.g., Grade 10"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Interested subjects</Label>
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <label
                        htmlFor={subject}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Study preferences</Label>
                <div className="space-y-2">
                  {studyPreferences.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference}
                        checked={selectedPreferences.includes(preference)}
                        onCheckedChange={() => handlePreferenceToggle(preference)}
                      />
                      <label
                        htmlFor={preference}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {preference}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 cursor-pointer bg-accent py-6 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer py-6 bg-background gap-2 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
