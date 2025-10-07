"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { StreamChat } from "stream-chat"
import { useAuth } from "./auth-context"
import { useStreamToken } from "@/lib/hooks/use-stream-token"
import { STREAM_API_KEY } from "@/lib/stream/config"

interface StreamContextType {
  chatClient: StreamChat | null
  isReady: boolean
}

const StreamContext = createContext<StreamContextType>({
  chatClient: null,
  isReady: false,
})

export function StreamProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const { token, loading: tokenLoading } = useStreamToken()
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!user || !profile || !token || tokenLoading) {
      return
    }

    const client = StreamChat.getInstance(STREAM_API_KEY)

    const connectUser = async () => {
      try {
        await client.connectUser(
          {
            id: user.$id,
            name: profile.name,
            image: profile.avatarUrl,
          },
          token,
        )

        setChatClient(client)
        setIsReady(true)
      } catch (error) {
        console.error("[Stream Connection Error]", error)
      }
    }

    connectUser()

    return () => {
      if (client) {
        client.disconnectUser()
        setChatClient(null)
        setIsReady(false)
      }
    }
  }, [user, profile, token, tokenLoading])

  return <StreamContext.Provider value={{ chatClient, isReady }}>{children}</StreamContext.Provider>
}

export function useStreamChat() {
  const context = useContext(StreamContext)
  if (!context) {
    throw new Error("useStreamChat must be used within StreamProvider")
  }
  return context
}
