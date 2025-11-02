import { type NextRequest, NextResponse } from "next/server"
import { ID, Query } from "appwrite"
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, userId, userName, startedAt, endedAt, durationMinutes, participants } = body

    console.log("[DEBUG] Checking group membership:", { groupId, userId }) //debugging line

    // ✅ 1. Check user membership
    const membershipQuery = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUP_MEMBERS,
      [Query.equal("groupId", groupId), Query.equal("userId", userId)]
    )

    if (membershipQuery.total === 0) {
      return NextResponse.json({ error: "User not in group" }, { status: 403 })
    }

    const membership = membershipQuery.documents[0].role // e.g. "creator" or "member"

    console.log("[DEBUG] Membership query result:", membershipQuery.documents[0])
    console.log("[DEBUG] Membership role:", membership)

    // ✅ 2. If creator → create new call session and attendance
    if (membership === "creator") {
      const callSession = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CALL_SESSIONS,
        ID.unique(),
        {
          groupId,
          creatorId: userId,
          startedAt,
          endedAt,
          durationMinutes,
          participantCount: participants.length,
        }
      )

      // Create attendance records for all participants
      await Promise.all(
        participants.map((p: any) =>
          databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ATTENDANCE,
            ID.unique(),
            {
              callSessionId: callSession.$id,
              groupId,
              userId: p.userId,
              userName: p.userName,
              joinedAt: p.joinedAt,
              leftAt: p.leftAt,
              durationMinutes: p.durationMinutes,
            }
          )
        )
      )

      return NextResponse.json({ success: true, callSessionId: callSession.$id }, { status: 201 })
    }

    // ✅ 3. If member → only add attendance + increment participantCount
    else if (membership === "member") {
      // Find existing call session for this group & creator
      const existingSessions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CALL_SESSIONS,
        [
          Query.equal("groupId", groupId),
          Query.orderDesc("startedAt"), // sort latest first
          Query.limit(1), // only get the latest one
        ]
      )

      if (existingSessions.total === 0) {
        return NextResponse.json({ error: "No active session found for group" }, { status: 404 })
      }

      const callSession = existingSessions.documents[0]

      // Add attendance record
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ATTENDANCE,
        ID.unique(),
        {
          callSessionId: callSession.$id,
          groupId,
          userId,
          userName,
          joinedAt: startedAt,
          leftAt: endedAt,
          durationMinutes,
        }
      )

      // Increment participant count
      const updatedCount = (callSession.participantCount || 0) + 1
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CALL_SESSIONS,
        callSession.$id,
        { participantCount: updatedCount }
      )

      return NextResponse.json({ success: true, updatedCount }, { status: 200 })
    }

    // ✅ 4. Handle unexpected membership types
    else {
      return NextResponse.json({ error: "Invalid membership type" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v1] Call session logic error:", error)
    return NextResponse.json({ error: "Failed to process call session" }, { status: 500 })
  }
}
