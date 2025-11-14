"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clientForgotPassword } from "@/lib/appwrite/client-auth"
import { useToast } from "../ui/use-toast"


export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await clientForgotPassword(email)

    if (result.success) {
      setSubmitted(true)
      toast({
        title: "Recovery email sent",
        description: "Check your email for password reset instructions.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send recovery email. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-balance text-3xl md:text-4xl font-peace-sans tracking-tight">Check your email</h3>
          <p className="text-sm font-normal">
            We've sent a password reset link to <span className="font-medium underline">{email}</span>. Follow the link to reset your password.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full shad-button_Login">
            <Link href="/login">Back to Login</Link>
          </Button>
          <button
            onClick={() => {
              setSubmitted(false)
              setEmail("")
            }}
            className="w-full text-sm text-primary hover:underline cursor-pointer"
          >
            Try another email
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-balance text-2xl md:text-4xl font-peace-sans tracking-tight">Reset your password</h2>
        <p className="text-sm md:text-base font-normal">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="shad-input"
        />
      </div>

      <Button type="submit" className="w-full shad-button_Login" size="lg" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send recovery email"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  )
}
