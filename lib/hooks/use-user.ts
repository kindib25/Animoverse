"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserProfile, updateUserProfile, createUserProfile } from "@/lib/appwrite/database"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Fetch user profile
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      const result = await getUserProfile(userId)
      if (!result.success) throw new Error(result.error)
      return result.profile
    },
    enabled: !!userId,
  })
}

// Create user profile mutation
export function useCreateUserProfile() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => createUserProfile(userId, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.setQueryData(userKeys.detail(variables.userId), result.profile)

        toast({
          title: "Success",
          description: "Profile created successfully!",
        })

        router.push("/dashboard")
      } else {
        throw new Error(result.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      })
    },
  })
}

// Update user profile mutation
export function useUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      router.push("/dashboard/profile")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}

export function TeacherAdminUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      router.push("/admin/profile")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}

//Setup Username
export function useSetUsername(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Username Set",
        description: "Your username is all set!",
      })

      router.push("/onboarding/grade")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}

//Setup User's Grade level
export function useSetUserGrade(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Grade Level Set",
        description: "Your grade level has been set!",
      })

      router.push("/onboarding/subjects")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}

//Setup User's Interested Subjects
export function useSetUserSubjects(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Subjects Selected",
        description: "Your interests have been saved!",
      })

      router.push("/onboarding/study-preferences")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}

//Setup User's Study Preferences
export function useSetUserPreferences(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(userKeys.detail(userId))

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(userId), (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousProfile }
    },
    onError: (error: Error, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(userId), context?.previousProfile)

      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        title: "Study Preferences Selected",
        description: "Your preferences have been saved!",
      })

      router.push("/onboarding/complete")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
    },
  })
}