"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/constants/query-keys"
import {
  getAllUsers,
  updateGroupStatus,
  getPendingGroups,
  getTeacherGroups,
  getGroupMembers,
  getDashboardStats,
  searchUsers,
} from "@/lib/appwrite/teacher-database"

// Get dashboard statistics
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => {
      const result = await getDashboardStats()
      if (!result.success) throw new Error(result.error)
      return result.stats
    },
  })
}

// Get all users
export function useAllUsers(filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.admin.allUsers(filters),
    queryFn: async () => {
      const result = await getAllUsers()
      if (!result.success) throw new Error(result.error)
      return result.users
    },
  })
}

// Get pending groups
export function usePendingGroups(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.admin.pendingGroups(teacherId),
    queryFn: async () => {
      const result = await getPendingGroups(teacherId)
      if (!result.success) throw new Error(result.error)

      const groups = result.groups || []

      const groupsWithCreators = await Promise.all(
        groups.map(async (group: any) => {
          // normalize group id
          const groupId = group.$id || group.id || group.groupId
          let creator: any = null

          try {
            const membersRes = await getGroupMembers(groupId)
            if (membersRes.success) {
              const members = membersRes.members || []

              // prefer explicit creatorId if present on group
              const creatorId = group.creatorId || group.createdBy || group.ownerId
              if (creatorId) {
                creator = members.find((m: any) => m.$id === creatorId || m.id === creatorId) || null
              }

              // fallback: find a member with creator/owner role or isCreator flag
              if (!creator) {
                creator =
                  members.find(
                    (m: any) =>
                      m.role === "creator" ||
                      m.role === "owner" ||
                      m.isCreator === true ||
                      m.is_owner === true
                  ) || null
              }
            }
          } catch {
            // ignore member fetch errors and leave creator as null
            creator = null
          }

          return { ...group, creator }
        })
      )

      return groupsWithCreators
    },
    enabled: !!teacherId,
  })
}

// Get teacher's assigned groups
export function useTeacherGroups(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.admin.teacherGroups(teacherId),
    queryFn: async () => {
      const result = await getTeacherGroups(teacherId)
      if (!result.success) throw new Error(result.error)
      return result.groups
    },
    enabled: !!teacherId,
  })
}

// Get group members
export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: queryKeys.admin.groupMembers(groupId),
    queryFn: async () => {
      const result = await getGroupMembers(groupId)
      if (!result.success) throw new Error(result.error)
      return result.members
    },
    enabled: !!groupId,
  })
}

// Approve or reject group
export function useUpdateGroupStatus(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, status }: { groupId: string; status: "approved" | "rejected" }) => {
      const result = await updateGroupStatus(groupId, status)
      if (!result.success) throw new Error(result.error)
      return (result as { success: true; group: any }).group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingGroups(teacherId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.teacherGroups(teacherId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

// Search users
export function useSearchUsers(searchTerm: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.allUsers(), "search", searchTerm],
    queryFn: async () => {
      const result = await searchUsers(searchTerm)
      if (!result.success) throw new Error(result.error)
      return result.users
    },
    enabled: searchTerm.length > 0,
  })
}
