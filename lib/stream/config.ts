import { StreamChat } from "stream-chat"
import { StreamVideoClient } from "@stream-io/video-react-sdk"

// Server-side Stream client (Node SDK)
let serverClient: StreamChat | null = null

export function getStreamServerClient() {
  if (!serverClient) {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    if (!apiKey || !apiSecret) {
      throw new Error("Stream API credentials are missing")
    }

    serverClient = StreamChat.getInstance(apiKey, apiSecret)
  }

  return serverClient
}

// Client-side Stream Chat initialization
export function initStreamChatClient(apiKey: string) {
  return StreamChat.getInstance(apiKey)
}

// Client-side Stream Video initialization
export function initStreamVideoClient(apiKey: string, token: string, userId: string, userName: string) {
  return new StreamVideoClient({
    apiKey,
    user: {
      id: userId,
      name: userName,
    },
    token,
  })
}

export const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || ""
