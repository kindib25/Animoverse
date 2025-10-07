"use client"

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { getMessages, sendMessage } from "@/lib/appwrite/database"
import { useToast } from "@/components/ui/use-toast"

// Query Keys
export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (groupId: string) => [...messageKeys.lists(), groupId] as const,
}

// Fetch messages for a group
export function useMessages(groupId: string) {
  return useQuery({
    queryKey: messageKeys.list(groupId),
    queryFn: async () => {
      const result = await getMessages(groupId)
      if (!result.success) throw new Error(result.error)
      return result.messages
    },
    enabled: !!groupId,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
  })
}

// Infinite query for messages (for pagination)
export function useInfiniteMessages(groupId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.list(groupId),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getMessages(groupId, 50)
      if (!result.success) throw new Error(result.error)
      return {
        messages: result.messages,
        nextCursor: pageParam + 50,
      }
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.messages && lastPage.messages.length === 50 ? lastPage.nextCursor : undefined
    },
    initialPageParam: 0,
    enabled: !!groupId,
  })
}

// Send message mutation
export function useSendMessage(groupId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) => sendMessage(groupId, userId, content),
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messageKeys.list(groupId) })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(messageKeys.list(groupId))

      // Optimistically update to the new value
      queryClient.setQueryData(messageKeys.list(groupId), (old: any) => {
        return [
          ...(old || []),
          {
            $id: `temp-${Date.now()}`,
            content: newMessage.content,
            userId: newMessage.userId,
            groupId,
            createdAt: new Date().toISOString(),
          },
        ]
      })

      return { previousMessages }
    },
    onError: (error: Error, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(messageKeys.list(groupId), context?.previousMessages)

      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: messageKeys.list(groupId) })
    },
  })
}
