"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"

export function useStreamToken() {
  const { user, profile } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchToken() {
      if (!user || !profile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/stream/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.$id,
            userName: profile.name,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch Stream token")
        }

        const data = await response.json()
        setToken(data.token)
        setError(null)
      } catch (err: any) {
        console.error("[Stream Token Error]", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [user, profile])

  return { token, loading, error }
}
