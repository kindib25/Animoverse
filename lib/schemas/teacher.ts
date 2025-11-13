import { z } from "zod"

export const teacherLoginSchema = z.object({
   email: z
    .string()
    .email("Invalid email address")
    .regex(/^[A-Za-z0-9._%+-]+@lsu\.edu\.ph$/, "Email must end with @lsu.edu.ph"),
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
