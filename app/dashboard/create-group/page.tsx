"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Upload, X } from "lucide-react"
import { createGroup } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { createGroupSchema, type CreateGroupInput } from "@/lib/schemas/group"
import { clientGetAllTeachers } from "@/lib/appwrite/client-database"
import { useEffect, useState, useRef, DragEvent } from "react"
import Image from "next/image"
import { uploadGroupImage } from "@/lib/appwrite/storage"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]
const studyPreferences = ["Group Discussion", "Sharing notes"]
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      startTime: "",
      endTime: "",
      teacher: "",
      status: "",
      teacherId: "",
      studyPreferences: [],
      day: "",
    },
  })

  const selectedPreferences = watch("studyPreferences")
  const subject = watch("subject")
  const selectedTeacher = watch("teacher")
  const selectedDay = watch("day")

  useEffect(() => {
    async function loadTeachers() {
      const result = await clientGetAllTeachers()
      if (result.success && result.teachers) {
        setTeachers(result.teachers)
      }
      setIsLoadingTeachers(false)
    }
    loadTeachers()
  }, [])

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
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleImageSelect({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const userResult = await clientGetCurrentUser()
      if (!userResult.success) throw new Error("Authentication required")

      let imageUrl = ""
      if (selectedImage) {
        setIsUploadingImage(true)
        const uploadResult = await uploadGroupImage(selectedImage)
        setIsUploadingImage(false)

        if (!uploadResult.success) {
          throw new Error("Failed to upload image")
        }

        imageUrl = uploadResult.fileUrl || ""
      }

      const shortDay = data.day ? data.day.slice(0, 3) : ""
      const result = await createGroup({
        name: data.name,
        description: data.description || "",
        subject: data.subject,
        schedule: `${shortDay} ${data.startTime} - ${data.endTime}`,
        teacher: data.teacher,
        status: "pending",
        teacherId: data.teacherId,
        studyPreferences: data.studyPreferences,
        creatorId: userResult.user ? userResult.user.$id : "",
        maxMembers: data.maxMembers || 15,
        imageUrl,
      })

      if (!result.success) throw new Error(result.error || "Failed to create group")
      return result.group
    },
    onSuccess: () => {
      toast({
        title: "Group created!",
        description: "Your study group has been created successfully.",
      })
      router.push("/dashboard/my-groups")
    },
    onError: (error: Error) => {
      if (error.message === "Authentication required") {
        toast({
          title: "Authentication required",
          description: "Please log in to create a group.",
          variant: "destructive",
        })
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    },
  })

  const handlePreferenceToggle = (preference: string) => {
    const current = selectedPreferences || []
    const updated = current.includes(preference)
      ? current.filter((p) => p !== preference)
      : [...current, preference]
    setValue("studyPreferences", updated, { shouldValidate: true })
  }

  const onSubmit = (data: CreateGroupInput) => {
    createGroupMutation.mutate(data)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="flex col-2">
            <PlusCircle className="mb-2 h-8 w-8" />
            <CardTitle className="text-2xl ml-1">Create Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group name</Label>
                <Input id="groupName" placeholder="Enter group name" {...register("name")} className="selection:bg-background selection:text-white"/>
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                
                {imagePreview ? (
                  <div className="relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors">
                  <div className="relative rounded-lg border-2 border-border overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Group preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>
                  
                ) : (
                  <div className="relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors">
                  <div
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors ${
                      isDragOver ? "border-primary bg-primary/5" : "border-dashed border-border"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDragOver && (
                      <div className="absolute inset-0 bg-primary/10 rounded-lg z-10 pointer-events-none" />
                    )}
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium">Drag photo here</p>
                    <p className="mb-3 text-xs text-muted-foreground">SVG, PNG, JPG (max 5MB)</p>
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer py-6 gap-2 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono">
                      Select from computer
                    </Button>
                  </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedDay}
                    onValueChange={(value) => setValue("day", value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="time" id="startTime" {...register("startTime")} />
                  <span>to</span>
                  <Input type="time" id="endTime" {...register("endTime")} />
                </div>
                {(errors.startTime || errors.endTime) && (
                  <p className="text-sm text-destructive">Please select both start and end times.</p>
                )}
              </div>

              {/* Subject and Teacher */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    placeholder="15"
                    {...register("maxMembers", { valueAsNumber: true })}
                    min={2}
                    max={50}
                    className="selection:bg-background selection:text-white"
                  />
                  {errors.maxMembers && (
                    <p className="text-sm text-destructive">{errors.maxMembers.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={subject}
                    onValueChange={(value) => setValue("subject", value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Assigned Teacher</Label>
                  <Select
                    value={selectedTeacher}
                    onValueChange={(value) => {
                      const selected = teachers.find((t) => t.name === value)
                      setValue("teacher", value, { shouldValidate: true })
                      if (selected) {
                        setValue("teacherId", selected.$id, { shouldValidate: true })
                      }
                    }}
                    disabled={isLoadingTeachers}
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder={isLoadingTeachers ? "Loading..." : "Select a teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.$id} value={teacher.name}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                      {teachers.length === 0 && !isLoadingTeachers && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No teachers available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.teacher && (
                    <p className="text-sm text-destructive">{errors.teacher.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Study Preferences</Label>
                  <div className="space-y-2">
                    {studyPreferences.map((pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={`create-${pref}`}
                          checked={selectedPreferences?.includes(pref)}
                          onCheckedChange={() => handlePreferenceToggle(pref)}
                        />
                        <label htmlFor={`create-${pref}`} className="text-sm font-medium">
                          {pref}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.studyPreferences && (
                    <p className="text-sm text-destructive">
                      {errors.studyPreferences.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your group..."
                  {...register("description")}
                  rows={4}
                  className="selection:bg-background selection:text-white"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={createGroupMutation.isPending || isUploadingImage}
                  className="bg-background py-6 px-10 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono cursor-pointer"
                >
                  {isUploadingImage
                    ? "Uploading image..."
                    : createGroupMutation.isPending
                    ? "Creating..."
                    : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
