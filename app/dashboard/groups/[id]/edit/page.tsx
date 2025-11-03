"use client"

import React, { useEffect, useState, useRef, DragEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Upload, X, Menu, Edit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { clientGetAllTeachers } from "@/lib/appwrite/client-database"
import { uploadGroupImage } from "@/lib/appwrite/storage"
import { createGroupSchema, type CreateGroupInput } from "@/lib/schemas/group"
import { useToast } from "@/components/ui/use-toast"
import { useGroup, useUpdateGroup } from "@/lib/hooks/use-groups"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]
const studyPreferences = ["Group Discussion", "Sharing notes"]
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function EditGroupPage() {
    const router = useRouter()
    const params = useParams()
    const groupId = params?.id as string
    const { toast } = useToast()

    // Data hooks
    const { data: group, isLoading: isLoadingGroup } = useGroup(groupId)
    const updateMutation = useUpdateGroup()

    const [teachers, setTeachers] = useState<any[]>([])
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isLoadingUser, setIsLoadingUser] = useState(true)

    // Image handling
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    // Sidebar mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
            maxMembers: 15,
        },
    })

    const selectedPreferences = watch("studyPreferences")
    const subject = watch("subject")
    const selectedTeacher = watch("teacher")
    const selectedDay = watch("day")
    const [isCustomSubject, setIsCustomSubject] = useState(false)

    // Load current user & teachers
    useEffect(() => {
        async function loadUser() {
            const result = await clientGetCurrentUser()
            if (result.success) setCurrentUser(result.user)
            setIsLoadingUser(false)
        }
        loadUser()

        async function loadTeachers() {
            const res = await clientGetAllTeachers()
            if (res.success && res.teachers) setTeachers(res.teachers)
            setIsLoadingTeachers(false)
        }
        loadTeachers()
    }, [])

    // Prefill form when group is loaded
    useEffect(() => {
        if (!group) return

        // Auth: only allow creator to edit
        if (currentUser && group.creatorId !== currentUser.$id) {
            toast({ title: "Unauthorized", description: "You can only edit your own groups", variant: "destructive" })
            router.push(`/dashboard/groups/${groupId}`)
            return
        }

        setValue("name", group.name || "")
        setValue("description", group.description || "")
        setValue("subject", group.subject || "")
        setValue("maxMembers", group.maxMembers ?? 15)
        setValue("studyPreferences", group.studyPreferences || [])

        // Teacher
        if (group.teacher) {
            setValue("teacher", group.teacher)
        }
        if (group.teacherId) {
            setValue("teacherId", group.teacherId)
        }

        // Parse schedule: expected format "Mon 08:00 - 09:00"
        if (group.schedule) {
            const parts = group.schedule.split(" ")
            const dayPart = parts[0] || ""
            const day = daysOfWeek.find((d) => d.toLowerCase().startsWith(dayPart.toLowerCase())) || ""
            const startTime = parts[1] || ""
            const endTime = parts[3] || ""
            setValue("day", day)
            setValue("startTime", startTime)
            setValue("endTime", endTime)
        }

        // Image preview (could be URL)
        if (group.imageUrl) setImagePreview(group.imageUrl)
    }, [group, currentUser, setValue, router, toast, groupId])

    // Image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Please select an image smaller than 5MB", variant: "destructive" })
            return
        }
        setSelectedImage(file)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleRemoveImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            // reuse the file handling
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
            handleImageSelect(fakeEvent)
        }
    }
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true) }
    const handleDragLeave = () => setIsDragOver(false)

    const handlePreferenceToggle = (preference: string) => {
        const current = selectedPreferences || []
        const updated = current.includes(preference) ? current.filter((p) => p !== preference) : [...current, preference]
        setValue("studyPreferences", updated, { shouldValidate: true })
    }

    // Update mutation
    const onSubmit = async (data: CreateGroupInput) => {
        let imageUrl = imagePreview || ""

        if (selectedImage) {
            setIsUploadingImage(true)
            const uploadResult = await uploadGroupImage(selectedImage)
            setIsUploadingImage(false)
            if (!uploadResult.success) {
                toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
                return
            }
            imageUrl = uploadResult.fileUrl || ""
        }

        const shortDay = data.day ? data.day.slice(0, 3) : ""

        updateMutation.mutate({
            groupId,
            data: {
                name: data.name,
                description: data.description || "",
                subject: data.subject,
                schedule: `${shortDay} ${data.startTime} - ${data.endTime}`,
                studyPreferences: data.studyPreferences,
                maxMembers: data.maxMembers || 15,
                teacher: data.teacher,
                teacherId: data.teacherId,
                ...(imageUrl && { imageUrl }),
            },
        })
    }

    useEffect(() => {
        if (updateMutation.isSuccess) {
            toast({ title: "Group updated", description: "Your group was updated successfully." })
            router.push(`/dashboard/groups/${groupId}`)
        }
        if (updateMutation.isError) {
            toast({ title: "Update failed", description: "Could not update group.", variant: "destructive" })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateMutation.status])

    if (isLoadingGroup || isLoadingUser) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!group || !currentUser || group.creatorId !== currentUser.$id) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Group not found or unauthorized</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <div className="flex min-h-screen overflow-hidden bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
            {/* Sidebar for md+ */}
            <div className="hidden md:flex min-h-screen">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsSidebarOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        <motion.div className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                            <div className="flex min-h-screen">
                                <Sidebar />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-white">
                <Button variant="ghost" size="icon" className="sm:flex md:hidden cursor-pointer text-black m-3" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="!w-6 !h-6" />
                </Button>

                <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
                    <div className="mx-auto w-full max-w-2xl sm:max-w-4xl">
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <Edit className="mb-2 h-8 w-8" />
                                <CardTitle className="text-2xl ml-1">Edit Group</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="groupName">Group name</Label>
                                        <Input id="groupName" placeholder="Enter group name" {...register("name")} className="selection:bg-background selection:text-white" />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Image</Label>
                                        {imagePreview ? (
                                            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors">
                                                <div className="relative rounded-lg border-2 border-border overflow-hidden w-full">
                                                    {/* Use next/image when the preview is a data URL or remote allowed by next.config */}
                                                    {/* If next/image fails with data URL, you can fallback to img tag. */}
                                                    {imagePreview.startsWith("data:") ? (
                                                        // data URLs are fine with img
                                                        <img src={imagePreview} alt="Group preview" className="w-full h-48 object-contain" />
                                                    ) : (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Group preview"
                                                            width={400}
                                                            height={200}
                                                            className="w-full h-48 object-contain"
                                                        />
                                                    )}

                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 cursor-pointer" onClick={handleRemoveImage}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors">
                                                <div className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-8 text-center transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-dashed border-border"}`} onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                                    {isDragOver && <div className="absolute inset-0 bg-primary/10 rounded-lg z-10 pointer-events-none" />}
                                                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                                    <p className="mb-1 text-sm font-medium">Drag photo here</p>
                                                    <p className="mb-3 text-xs text-muted-foreground">SVG, PNG, JPG (max 5MB)</p>
                                                    <Button type="button" variant="outline" size="sm" className="cursor-pointer py-6 gap-2 text-white hover:bg-green hover:text-black transition font-mono" onClick={() => fileInputRef.current?.click()}>
                                                        Select from computer
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    </div>

                                    {/* Schedule */}
                                    <div className="space-y-2">
                                        <Label>Schedule</Label>
                                        <div className="flex items-center gap-2">
                                            <Select value={selectedDay} onValueChange={(value) => setValue("day", value, { shouldValidate: true })}>
                                                <SelectTrigger id="day">
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {daysOfWeek.map((day) => (
                                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Input type="time" id="startTime" {...register("startTime")} />
                                            <span>to</span>
                                            <Input type="time" id="endTime" {...register("endTime")} />
                                        </div>
                                        {(errors.startTime || errors.endTime) && <p className="text-sm text-destructive">Please select both start and end times.</p>}
                                    </div>

                                    {/* Subject / Teacher / Max / Preferences */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxMembers">Maximum Members</Label>
                                            <Input id="maxMembers" type="number" placeholder="15" {...register("maxMembers", { valueAsNumber: true })} min={2} max={50} className="selection:bg-background selection:text-white" />
                                            {errors.maxMembers && <p className="text-sm text-destructive">{errors.maxMembers.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Select value={isCustomSubject ? "Others" : subject} onValueChange={(value) => {
                                                if (value === "Others") { setIsCustomSubject(true); setValue("subject", "", { shouldValidate: true }) } else { setIsCustomSubject(false); setValue("subject", value, { shouldValidate: true }) }
                                            }}>
                                                <SelectTrigger id="subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                                <SelectContent>{subjects.map((subj) => <SelectItem key={subj} value={subj}>{subj}</SelectItem>)}</SelectContent>
                                            </Select>

                                            {isCustomSubject && (
                                                <div className="mt-2">
                                                    <Input id="customSubject" placeholder="Enter custom subject" {...register("subject")} onChange={(e) => setValue("subject", e.target.value, { shouldValidate: true })} className="selection:bg-background selection:text-white" autoFocus />
                                                </div>
                                            )}

                                            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="teacher">Assigned Teacher</Label>
                                            <Select value={selectedTeacher} onValueChange={(value) => {
                                                const selected = teachers.find((t) => t.name === value)
                                                setValue("teacher", value, { shouldValidate: true })
                                                if (selected) setValue("teacherId", selected.$id, { shouldValidate: true })
                                            }} disabled={isLoadingTeachers}>
                                                <SelectTrigger id="teacher"><SelectValue placeholder={isLoadingTeachers ? "Loading..." : "Select a teacher"} /></SelectTrigger>
                                                <SelectContent>
                                                    {teachers.map((teacher) => <SelectItem key={teacher.$id} value={teacher.name}>{teacher.name}</SelectItem>)}
                                                    {teachers.length === 0 && !isLoadingTeachers && <div className="px-2 py-1.5 text-sm text-muted-foreground">No teachers available</div>}
                                                </SelectContent>
                                            </Select>
                                            {errors.teacher && <p className="text-sm text-destructive">{errors.teacher.message}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Study Preferences</Label>
                                            <div className="space-y-2">
                                                {studyPreferences.map((pref) => (
                                                    <div key={pref} className="flex items-center space-x-2">
                                                        <Checkbox id={`edit-${pref}`} checked={selectedPreferences?.includes(pref)} onCheckedChange={() => handlePreferenceToggle(pref)} />
                                                        <label htmlFor={`edit-${pref}`} className="text-sm font-medium">{pref}</label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.studyPreferences && <p className="text-sm text-destructive">{errors.studyPreferences.message}</p>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" placeholder="Describe your group..." {...register("description")} rows={4} className="selection:bg-background selection:text-white" />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <Button type="button" variant="outline" className="py-6 px-10 bg-transparent cursor-pointer" onClick={() => router.back()}>Cancel</Button>
                                        <Button type="submit" className="bg-background py-6 px-10 text-white hover:bg-green hover:text-black transition font-mono cursor-pointer" disabled={updateMutation.isPending || isUploadingImage}>
                                            {isUploadingImage ? "Uploading image..." : updateMutation.isPending ? "Updating..." : "Update Group"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
