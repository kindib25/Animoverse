"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { uploadProfileImage } from "@/lib/appwrite/storage"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X } from "lucide-react"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]
const studyPreferences = ["Group Discussion", "Sharing notes"]

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")
  const [grade, setGrade] = useState("")
  const [bio, setBio] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isCustomSubject, setIsCustomSubject] = useState(false)

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
      if (profile.avatarUrl) {
        setImagePreview(profile.avatarUrl)
      }
    }
  }, [profile])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(profile?.avatarUrl || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]))
  }

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference) ? prev.filter((p) => p !== preference) : [...prev, preference],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let avatarUrl = profile?.avatarUrl || ""

    if (selectedImage) {
      setIsUploadingImage(true)
      const uploadResult = await uploadProfileImage(selectedImage)
      setIsUploadingImage(false)

      if (!uploadResult.success) {
        toast({
          title: "Error",
          description: "Failed to upload profile picture",
          variant: "destructive",
        })
        return
      }

      avatarUrl = uploadResult.fileUrl || ""
    }

    updateProfileMutation.mutate({
      username,
      grade,
      bio,
      subjects: selectedSubjects,
      studyPreferences: selectedPreferences,
      avatarUrl,
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
                {imagePreview ? (
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={imagePreview || "/placeholder.svg"} className="object-cover" />
                      <AvatarFallback>
                        {username
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full cursor-pointer"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback>
                      {username
                        .split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="cursor-pointer bg-accent  text-black hover:bg-background hover:text-white transition font-mono"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingImage ? "Uploading..." : "Change profile photo"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" className="selection:bg-background selection:text-white" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  placeholder="e.g., Grade 10"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="selection:bg-background selection:text-white"
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
                  className="selection:bg-background selection:text-white"
                />
              </div>

              {/* Select Interested subjects) */}
              <div className="space-y-3">
                <Label>Interested subjects</Label>

                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={
                          subject === "Others"
                            ? isCustomSubject
                            : selectedSubjects.includes(subject)
                        }
                        onCheckedChange={() => {
                          if (subject === "Others") {
                            setIsCustomSubject((prev) => !prev)
                            if (isCustomSubject) {
                              // If unchecking "Others", clear custom subject
                              setSelectedSubjects((prev) =>
                                prev.filter((s) => subjects.includes(s))
                              )
                            }
                          } else {
                            setSelectedSubjects((prev) =>
                              prev.includes(subject)
                                ? prev.filter((s) => s !== subject)
                                : [...prev, subject]
                            )
                          }
                        }}
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

                {/* Custom subject input */}
                {isCustomSubject && (
                  <div className="mt-2">
                    <Input
                      id="custom-subject"
                      placeholder="Enter custom subject"
                      value={
                        selectedSubjects.find((s) => !subjects.includes(s)) || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        setSelectedSubjects((prev) => {
                          const filtered = prev.filter((s) => subjects.includes(s))
                          return value ? [...filtered, value] : filtered
                        })
                      }}
                      className="selection:bg-background selection:text-white"
                      autoFocus
                    />
                  </div>
                )}
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
                  onClick={handleCancel}
                  className="flex-1 cursor-pointer bg-accent py-6 text-black hover:bg-green hover:text-black transition font-mono"
                  disabled={updateProfileMutation.isPending || isUploadingImage}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer bg-background py-6 text-white hover:bg-green hover:text-black transition font-mono" disabled={updateProfileMutation.isPending || isUploadingImage}>
                  {isUploadingImage ? "Uploading..." : updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
