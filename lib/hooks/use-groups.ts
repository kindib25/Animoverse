"use client"

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import {
  createGroup,
  getGroups,
  getGroup,
  searchGroups,
  joinGroup,
  getUserGroups,
  saveGroup,
  unsaveGroup,
  checkSavedStatus,
  getUserSavedGroups,
  getInfiniteGroups,
  getNewInfiniteGroups,
  updateGroup,
} from "@/lib/appwrite/database"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Group } from "@/lib/types"


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
  infinite: (userId: string) => [...groupKeys.all, "infinite", userId] as const,
  bookmarkedGroups: (userId: string) => [...groupKeys.all, "bookmarked", userId] as const,
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


export function useInfiniteGroups(limit = 6) {
  return useInfiniteQuery({
    queryKey: ["groups"],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {

      const { groups, nextCursor } = await getInfiniteGroups(limit, pageParam)


      if (!nextCursor) {
        const { groups: firstGroups, nextCursor: firstCursor } =
          await getInfiniteGroups(limit, undefined)

        return {
          groups: [...groups, ...firstGroups],
          nextCursor: firstCursor,
        }
      }

      return { groups, nextCursor }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}

// Fetch bookmarked groups
export function useBookmarkedGroups(userId: string) {
  return useQuery({
    queryKey: groupKeys.bookmarkedGroups(userId),
    queryFn: async () => {
      const result = await getUserSavedGroups(userId)
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
    enabled: !!userId,
  })
}

// Save group mutation
export function useSaveGroup() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) => saveGroup(userId, groupId),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: groupKeys.bookmarkedGroups(variables.userId) })
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() })

        if (!data.alreadySaved) {
          toast({
            title: "Saved",
            description: "Group saved successfully!",
          })
        }
      } else {
        throw new Error(data.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save group",
        variant: "destructive",
      })
    },
  })
}

// Unsave group mutation
export function useUnsaveGroup() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) => unsaveGroup(userId, groupId),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: groupKeys.bookmarkedGroups(variables.userId) })
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() })

        toast({
          title: "Removed",
          description: "Group removed from saved",
        })
      } else {
        throw new Error(data.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsave group",
        variant: "destructive",
      })
    },
  })
}

// Check saved status query
export function useCheckSavedStatus(userId: string, groupId: string) {
  return useQuery({
    queryKey: [...groupKeys.bookmarkedGroups(userId), groupId],
    queryFn: async () => {
      const result = await checkSavedStatus(userId, groupId)
      if (!result.success) throw new Error(result.error)
      return result.isSaved
    },
    enabled: !!userId && !!groupId,
  })
}

export function useNewInfiniteGroups(
  subjects: string[] | undefined,
  studyPreferences: string[] | undefined,
  limit = 6
) {
  return useInfiniteQuery({
    queryKey: ["new-groups", subjects, studyPreferences], // ✅ include both filters
    enabled:
      (!!subjects && subjects.length > 0) ||
      (!!studyPreferences && studyPreferences.length > 0), // ✅ enable if either has values
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const { groups, nextCursor } = await getNewInfiniteGroups(
        subjects ?? [],
        studyPreferences ?? [],
        limit,
        pageParam
      )

      return {
        groups: groups ?? [],
        nextCursor: nextCursor ?? null, // explicitly null when done
      }
    },
    getNextPageParam: (lastPage) => {
      // ✅ stop fetching if there’s no nextCursor
      if (!lastPage.nextCursor) return undefined
      return lastPage.nextCursor
    },
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 5, // optional: keeps cache for 5 mins
    gcTime: 1000 * 60 * 30,   // optional: garbage collect after 30 mins
  })
}

// Update group mutation
export function useUpdateGroup() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: any }) => updateGroup(groupId, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) })
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() })

        toast({
          title: "Success",
          description: "Group updated successfully!",
        })

        router.push(`/dashboard/groups/${variables.groupId}`)
      } else {
        throw new Error(data.error)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update group",
        variant: "destructive",
      })
    },
  })
}