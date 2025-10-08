"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clientLogin } from "@/lib/appwrite/client-auth"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentLoginSchema, type StudentLoginInput } from "@/lib/schemas/student"
import { clientGetUserProfile } from "@/lib/appwrite/client-database"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentLoginInput>({
    resolver: zodResolver(studentLoginSchema),
  })

  const onSubmit = async (data: StudentLoginInput) => {
    setIsLoading(true)

    const result = await clientLogin(data.email, data.password)

   if (result.success && result.session) {
      const userResult = await clientGetUserProfile(result.session.userId)

      if (userResult.success && userResult.profile) {
        const userType = (userResult.profile as any).userType

        if (userType === "teacher" || userType === "admin") {
          // Redirect teachers to admin portal
          toast({
            title: "Welcome back!",
            description: "Redirecting to teacher portal...",
          })
          router.push("/admin/dashboard")
        } else {
          // Students go to regular dashboard
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          })
          router.push("/dashboard")
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        })
        router.push("/dashboard")
      }
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Please check your credentials and try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast({
      title: "Coming soon",
      description: "Google login will be available soon.",
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" {...register("email")} className="shad-input" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" {...register("password")} className="shad-input" />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full shad-button_primary" size="lg" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full bg-transparent" size="lg" onClick={handleGoogleLogin}>
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link href="/signup" className="font-medium text-green hover:text-green-700">
          Sign up
        </Link>
      </p>
    </form>
  )
}

