"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { clientGetCurrentUser, clientLogout } from "@/lib/appwrite/client-auth"
import { clientGetUserProfile, clientCreateUserProfile } from "@/lib/appwrite/client-database"
import type { AuthUser, User } from "@/lib/types"

interface AuthContextType {
  user: AuthUser | null
  profile: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const result = await clientGetCurrentUser()
      if (result.success && result.user) {
        setUser(result.user as AuthUser)

        const profileResult = await clientGetUserProfile(result.user.$id)
        if (profileResult.success && profileResult.profile) {
          setProfile(profileResult.profile as unknown as User)
        } else {
          console.log("[v0] Profile not found, creating new profile for existing user")
          const username = result.user.email.split("@")[0]
          const createResult = await clientCreateUserProfile(result.user.$id, {
            name: result.user.name,
            username,
            email: result.user.email,
            accountId: result.user.$id,
            userType: "student",
          })

          if (createResult.success && createResult.profile) {
            setProfile(createResult.profile as unknown as User)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const profileResult = await clientGetUserProfile(user.$id)
      if (profileResult.success && profileResult.profile) {
        setProfile(profileResult.profile as unknown as User)
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
  }

  const logout = async () => {
    try {
      await clientLogout()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
