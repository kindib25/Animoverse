"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createGroup,
  getGroups,
  getGroup,
  searchGroups,
  joinGroup,
  getUserGroups,
  getSavedGroups,
} from "@/lib/appwrite/database"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"


// Query Keys
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (filters: string) => [...groupKeys.lists(), { filters }] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  userGroups: (userId: string) => [...groupKeys.all, "user", userId] as const,
  savedGroups: (userId: string) => [...groupKeys.all, "saved", userId] as const,
  search: (term: string) => [...groupKeys.all, "search", term] as const,
}

// Fetch all groups
export function useGroups() {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: async () => {
      const result = await getGroups()
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
  })
}

// Fetch single group
export function useGroup(groupId: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: async () => {
      const result = await getGroup(groupId)
      if (!result.success) throw new Error(result.error)
      return result.group
    },
    enabled: !!groupId,
  })
}

// Fetch user's groups
export function useUserGroups(userId: string) {
  return useQuery({
    queryKey: groupKeys.userGroups(userId),
    queryFn: async () => {
      const result = await getUserGroups(userId)
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
    enabled: !!userId,
  })
}

// Fetch saved groups
export function useSavedGroups(userId: string) {
  return useQuery({
    queryKey: groupKeys.savedGroups(userId),
    queryFn: async () => {
      const result = await getSavedGroups(userId)
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
    enabled: !!userId,
  })
}

// Search groups
export function useSearchGroups(searchTerm: string) {
  return useQuery({
    queryKey: groupKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchGroups(searchTerm)
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
    enabled: searchTerm.length > 0,
  })
}

// Create group mutation
export function useCreateGroup() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch groups
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() })

        toast({
          title: "Success",
          description: "Group created successfully!",
        })

        if (data.group) {
          router.push(`/dashboard/groups/${data.group.$id}`)
        }
      } else {
        throw new Error(data.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      })
    },
  })
}

// Join group mutation
export function useJoinGroup() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => joinGroup(groupId, userId),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) })
        queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(variables.userId) })

        toast({
          title: "Success",
          description: "Join request sent successfully!",
        })
      } else {
        throw new Error(data.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      })
    },
  })
}
