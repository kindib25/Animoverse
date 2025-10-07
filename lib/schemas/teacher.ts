import { z } from "zod"

export const teacherLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type TeacherLoginInput = z.infer<typeof teacherLoginSchema>

export const approveGroupSchema = z.object({
  groupId: z.string(),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
})

export type ApproveGroupInput = z.infer<typeof approveGroupSchema>

export const updateUserStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended", "inactive"]),
  reason: z.string().optional(),
})

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>
