import { z } from "zod"


export const studentLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .regex(/^[A-Za-z0-9._%+-]+@lsu\.edu\.ph$/, "Email must end with @lsu.edu.ph"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type StudentLoginInput = z.infer<typeof studentLoginSchema>

export const studentSignupSchema = z.object({
  name: z.string().min(8, "Name must be at least 8 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .regex(/^[A-Za-z0-9._%+-]+@lsu\.edu\.ph$/, "Email must end with @lsu.edu.ph"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type StudentSignupInput = z.infer<typeof studentSignupSchema>