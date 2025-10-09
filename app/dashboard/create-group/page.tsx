"use client"
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
import { PlusCircle, Upload } from "lucide-react"
import { createGroup } from "@/lib/appwrite/database"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { createGroupSchema, type CreateGroupInput } from "@/lib/schemas/group"

const subjects = ["Math", "Science", "English", "Filipino", "ICT", "Others"]
const studyPreferences = ["Group Discussion", "Sharing notes"]
const teachers = ["Mr. Kean Baba", "Ms. Roda Mae", "Mrs. Russel Ashley Kook"]

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()

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
      studyPreferences: [],
    },
  })

  const selectedPreferences = watch("studyPreferences")
  const subject = watch("subject")
  const teacher = watch("teacher")

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const userResult = await clientGetCurrentUser()

      if (!userResult.success) {
        throw new Error("Authentication required")
      }

      const result = await createGroup({
        name: data.name,
        description: data.description || "",
        subject: data.subject,
        schedule: `${data.startTime} - ${data.endTime}`,
        teacher: data.teacher,
        studyPreferences: data.studyPreferences,
        creatorId: userResult.user ? userResult.user.$id : "",
        maxMembers: data.maxMembers || 15,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to create group")
      }

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
    const updated = current.includes(preference) ? current.filter((p) => p !== preference) : [...current, preference]
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
                <Input id="groupName" className="selection:bg-background selection:text-white" placeholder="Enter group name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">Drag photo here</p>
                  <p className="mb-3 text-xs text-muted-foreground">SVG, PNG, JPG</p>
                  <Button type="button" variant="outline" size="sm" className="bg-transparent">
                    Select from computer
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      id="startTime"
                      className="selection:bg-background selection:text-white"
                      {...register("startTime")}
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      id="endTime"
                      className="selection:bg-background selection:text-white"
                      {...register("endTime")}
                    />
                  </div>
                  {(errors.startTime || errors.endTime) && (
                    <p className="text-sm text-destructive">Please select both start and end times.</p>
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
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select
                    value={watch("teacher")}
                    onValueChange={(value) =>
                      setValue("teacher", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.teacher && <p className="text-sm text-destructive">{errors.teacher.message}</p>}
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input id="maxMembers" type="number" placeholder="15" {...register("maxMembers", { valueAsNumber: true })} min={2} max={50} />

                  {errors.maxMembers && <p className="text-sm text-destructive">{errors.maxMembers.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label>Study Preferences</Label>
                  <div className="space-y-2">
                    {studyPreferences.map((preference) => (
                      <div key={preference} className="flex items-center space-x-2">
                        <Checkbox
                          id={`create-${preference}`}
                          checked={selectedPreferences?.includes(preference)}
                          onCheckedChange={() => handlePreferenceToggle(preference)}
                        />
                        <label
                          htmlFor={`create-${preference}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {preference}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.studyPreferences && (
                    <p className="text-sm text-destructive">{errors.studyPreferences.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="selection:bg-background selection:text-white" placeholder="Describe your group..." {...register("description")} rows={4} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="cursor-pointer bg-background py-6 px-10 text-[#ffffff] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
                  disabled={createGroupMutation.isPending}
                >
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
