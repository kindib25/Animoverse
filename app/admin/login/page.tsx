"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { teacherLoginSchema, type TeacherLoginInput } from "@/lib/schemas/teacher"
import { clientGetUserProfile } from "@/lib/appwrite/client-database" // Import to check user role
import { clientLogin } from "@/lib/appwrite/client-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

   useEffect(() => {
  async function checkAuth() {
    const result = await clientGetCurrentUser()

    if (result.success && result.user) {
      const userResult = await clientGetUserProfile(result.user.$id)

      if (userResult.success && userResult.profile) {
        const userType = (userResult.profile as any).userType

        if (userType === "teacher" || userType === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Fallback if user profile not found
        router.push("/admin/login")
      }
    } else {
      setIsLoading(false)
    }
  }

  checkAuth()
}, [router])
  

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherLoginInput>({
    resolver: zodResolver(teacherLoginSchema),
  })

  const onSubmit = async (data: TeacherLoginInput) => {
    setIsLoading(true)

    try {
      const result = await clientLogin(data.email, data.password)

      if (result.success && result.session) {

        const userResult = await clientGetUserProfile(result.session.userId)
        if (userResult.success && userResult.profile) {
          const userType = (userResult.profile as any).userType

          if (userType === "teacher" || userType === "admin") {
            toast({
              title: "Welcome back!",
              description: "You've successfully logged in.",
            })
            router.push("/admin/dashboard")
          } else {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "Only teachers can access this portal.",
            })
            const { clientLogout } = await import("@/lib/appwrite/client-auth")
            await clientLogout()
          }
        } else {
          toast({
            title: "Login failed",
            description: "Unable to verify user permissions",
          })
          const { clientLogout } = await import("@/lib/appwrite/client-auth")
            await clientLogout()
        }
      } else {
        toast({
            variant: "destructive",
            title: "Login failed",
            description: result.error || "Please check your credentials and try again.",
          })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
              <Link href="/">
                <img src="/logoname.svg" alt="Logo" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Log in to your account
            </h2>
            <p className="text-pretty text-muted-foreground">
              Welcome Admin! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@lsu.edu"
                {...register("email")}
                className="shad-input"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="shad-input"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="py-2"></div>
            <Button
              type="submit"
              className="w-full shad-button_primary"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log-in"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden min-h-screen lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-[url('/night-bg1.gif')] bg-cover bg-center bg-no-repeat"></div>
    </div>
  )
}
