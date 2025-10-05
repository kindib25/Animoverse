import { z } from "zod"


export const studentLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type StudentLoginInput = z.infer<typeof studentLoginSchema>

export const studentSignupSchema = z.object({
  name: z.string().min(8, "Name must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  })

export type StudentSignupInput = z.infer<typeof studentSignupSchema>