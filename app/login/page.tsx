"use client"

import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
   useEffect(() => {
    const checkUser = async () => {
      const userResult = await clientGetCurrentUser()

      if (userResult.success && userResult.user) {
        router.push("/dashboard")
      } 
      setIsLoading(false)
    }

    checkUser()
  }, [router])
  

  return (
    <div className="relative flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Link href="/">
              <img src="/logoname.svg" alt="Logo"/>
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight">Log in to your account</h2>
            <p className="text-pretty text-muted-foreground">Welcome back! Please enter your details.</p>
          </div>

          <LoginForm />
        </div>
      </div>
       <img
            src="/night-bg2.gif"
            alt="side image"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat bg-gray-600"
          />
    </div>
  )
}

