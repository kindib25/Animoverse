"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth"
import { useToast } from "../ui/use-toast"


export function Logo() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const userResult = await clientGetCurrentUser()

        if (!userResult.success || !userResult.user) {
          router.push("/login")
          return
        }

        setUserId(userResult.user.$id)
      } catch (error) {
        console.error("Error loading user:", error)
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router, toast])

  return (
    <aside>
      {/* Logo */}
      <div className="flex h-30 items-center gap-2 px-10 py-4">
        <img src="/logoname.svg" alt="logo" className="w-50 h-auto" />
      </div>

    </aside>
  )
}
