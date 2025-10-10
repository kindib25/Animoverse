import { z } from "zod"

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(50, "Group name must be less than 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Please select a subject"),
  startTime: z.string().nonempty("Start time is required"),
  endTime: z.string().nonempty("End time is required"),
  teacher: z.string().min(1, "Please select a teacher"),
  status: z.string().optional(),
  teacherId: z.string().optional(),
  studyPreferences: z.array(z.string()).min(1, "Select at least one study preference"),
  maxMembers: z.number().min(2, "Minimum of 2 members").max(50, "Maximum of 50 members").optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
