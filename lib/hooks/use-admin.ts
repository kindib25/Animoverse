"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/constants/query-keys"
import {
  getAllUsers,
  updateGroupStatus,
  getTeacherGroups,
  getGroupMembers,
  getDashboardStats,
  searchUsers,
} from "@/lib/appwrite/teacher-database"
import { getPendingGroups } from "@/lib/appwrite/database"

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
    queryKey: ["pendingGroups", teacherId],
    queryFn: async () => {
      const { success, groups, error } = await getPendingGroups(teacherId)
      if (!success) throw new Error(error || "Failed to load pending groups")
      return groups
    },
    enabled: !!teacherId, // avoid fetching with empty ID
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
export function useUpdateGroupStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, status }: { groupId: string; status: "approved" | "rejected" }) => {
      const result = await updateGroupStatus(groupId, status)
      if (!result.success) throw new Error(result.error)
      return result.group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingGroups() })
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
