import { type NextRequest, NextResponse } from "next/server"
import { getStreamServerClient } from "@/lib/stream/config"

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json({ error: "userId and userName are required" }, { status: 400 })
    }

    const serverClient = getStreamServerClient()

    // Create or update user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: userName,
    })

    // Generate token for the user
    const token = serverClient.createToken(userId)

    return NextResponse.json({ token, userId })
  } catch (error: any) {
    console.error("[Stream Token Generation Error]", error)
    return NextResponse.json({ error: error.message || "Failed to generate token" }, { status: 500 })
  }
}
