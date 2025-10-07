"use client"

import { useEffect, useState } from "react"
import { StreamVideoClient } from "@stream-io/video-react-sdk"
import { useAuth } from "@/lib/context/auth-context"
import { useStreamToken } from "@/lib/hooks/use-stream-token"
import { STREAM_API_KEY } from "@/lib/stream/config"

export function useVideoClient() {
  const { user, profile } = useAuth()
  const { token, loading: tokenLoading } = useStreamToken()
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!user || !profile || !token || tokenLoading || !STREAM_API_KEY) {
      return
    }

    const client = new StreamVideoClient({
      apiKey: STREAM_API_KEY,
      user: {
        id: user.$id,
        name: profile.name,
        image: profile.avatarUrl,
      },
      token,
    })

    setVideoClient(client)
    setIsReady(true)

    return () => {
      client.disconnectUser()
      setVideoClient(null)
      setIsReady(false)
    }
  }, [user, profile, token, tokenLoading])

  return { videoClient, isReady }
}
