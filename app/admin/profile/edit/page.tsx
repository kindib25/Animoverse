"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUserProfile, TeacherAdminUpdateUserProfile } from "@/lib/hooks/use-user"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { uploadProfileImage } from "@/lib/appwrite/storage"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Loader2, Menu, Upload, X } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")
  const [grade, setGrade] = useState("")
  const [bio, setBio] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { data: profile, isLoading } = useUserProfile(userId)
  const updateProfileMutation = TeacherAdminUpdateUserProfile(userId)

  // Load current user
  useEffect(() => {
    async function loadUser() {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success) {
        router.push("/login")
        return
      }

      if (userResult.user) {
        setUserId(userResult.user.$id)
      }
    }

    loadUser()
  }, [router])

  // Prefill profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setGrade(profile.grade || "")
      setBio(profile.bio || "")
      if (profile.avatarUrl) {
        setImagePreview(profile.avatarUrl)
      }
    }
  }, [profile])

  // Handle image select
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

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(profile?.avatarUrl || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Submit form
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
      avatarUrl,
    })
  }

  const handleCancel = () => {
    router.push("/admin/profile")
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-white" />
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <div className="flex h-screen bg-[url('/bgDefault2.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-0" />
      <div className="relative z-10 flex w-full">
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex min-h-screen">
                  <AdminSidebar />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6 text-white" />
          </Button>

          <div className="mx-auto max-w-2xl p-10">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={imagePreview} className="object-cover" />
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
                      className="cursor-pointer bg-background py-5 px-4 text-white hover:bg-green hover:text-black transition font-mono flex items-center"
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

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  {/* Bio */}
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

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 cursor-pointer bg-accent py-6 text-black hover:bg-green hover:text-black transition font-mono"
                      disabled={updateProfileMutation.isPending || isUploadingImage}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 cursor-pointer py-6 bg-background gap-2 text-white hover:bg-green hover:text-black transition font-mono"
                      disabled={updateProfileMutation.isPending || isUploadingImage}
                    >
                      {isUploadingImage
                        ? "Uploading..."
                        : updateProfileMutation.isPending
                        ? "Saving..."
                        : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
