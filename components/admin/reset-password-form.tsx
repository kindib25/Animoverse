"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clientResetPassword } from "@/lib/appwrite/client-auth"
import { useToast } from "../ui/use-toast"

interface ResetPasswordFormProps {
  userId: string
  secret: string
}

export function ResetPasswordForm({ userId, secret }: ResetPasswordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const result = await clientResetPassword(userId, secret, password, passwordConfirm)

    if (result.success) {
      toast({
        title: "Success",
        description: "Your password has been reset. Redirecting to login...",
      })
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reset password. The link may have expired.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-balance text-3xl md:text-4xl font-peace-sans tracking-tight">Create new password</h2>
        <p className="text-sm md:text-base font-normal">Enter your new password below.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shad-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Input
            id="passwordConfirm"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="shad-input"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          {showPassword ? "Hide" : "Show"} password
        </button>
      </div>

      <Button type="submit" className="w-full shad-button_Login" size="lg" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  )
}
