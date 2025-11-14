"use client"

import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { useSearchParams } from 'next/navigation'
import Link from "next/link"


export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const secret = searchParams.get("secret")

  if (!userId || !secret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground">The password reset link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#087830]">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Link href="/">
                <img src="/logoname.svg" alt="Logo" />
              </Link>
            </div>
          </div>

          <ResetPasswordForm userId={userId} secret={secret} />
        </div>
      </div>
      <img
        src="/night-bg2.gif"
        alt="side image"
        className="hidden lg:block h-screen w-1/2 object-cover bg-no-repeat bg-gray-600"
      />
    </div>
  )
}
