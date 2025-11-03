"use server"

import { databases, DATABASE_ID, COLLECTIONS } from "./config"
import { ID, Query } from "appwrite"


// User Profile Operations
export async function createUserProfile(
  userId: string,
  data: {
    name: string
    username: string
    email: string
    accountId: string
    userType: "student" | "teacher" | "admin"
    grade?: string
    subjects?: string[]
    studyPreferences?: string[]
    bio?: string
  },
) {
  try {
    const profile = await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, userId, data)
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId)
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}



export async function updateUserProfile(userId: string, data: any) {
  try {
    const profile = await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userId, data)
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Group Operations
export async function createGroup(data: {
  name: string
  description: string
  subject: string
  schedule: string
  teacher?: string
  status?: string
  teacherId?: string
  studyPreferences: string[]
  creatorId: string
  imageUrl?: string
  maxMembers?: number
}) {
  try {
    const creatorProfile = await getUserProfile(data.creatorId)
    const isTeacher = creatorProfile.success && creatorProfile.profile?.userType === "teacher"

    const group = await databases.createDocument(DATABASE_ID, COLLECTIONS.GROUPS, ID.unique(), {
      ...data,
      memberCount: 1,
      maxMembers: data.maxMembers || 15,
    })

    // Add creator as first member
    await databases.createDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, ID.unique(), {
      groupId: group.$id,
      userId: data.creatorId,
      status: "approved",
      role: "creator",
      joinedAt: new Date().toISOString(),
    })

    if (!isTeacher) {
      const admins = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        Query.equal("userType", ["teacher", "admin"]),
      ])

      const creator = await getUserProfile(data.creatorId)
      const notificationPromises = admins.documents.map((admin: any) =>
        createNotification({
          recipientId: admin.$id,
          type: "group_submitted",
          title: "New Group Submission",
          message: `${creator.profile?.name || "A student"} has submitted "${group.name}" for approval`,
          groupId: group.$id,
          userId: data.creatorId,
        }),
      )

      await Promise.all(notificationPromises)
    }

    return { success: true, group }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getGroups(limit = 50) {
  try {
    const groups = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS, [
      Query.limit(limit),
      Query.orderDesc("createdAt"),
    ])
    return { success: true, groups: groups.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getGroup(groupId: string) {
  try {
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)
    return { success: true, group }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function searchGroups(searchTerm: string) {
  try {
    const groups = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS, [Query.search("name", searchTerm)])
    return { success: true, groups: groups.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Group Membership Operations
export async function joinGroup(groupId: string, userId: string) {
  try {
    const membership = await databases.createDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, ID.unique(), {
      groupId,
      userId,
      status: "pending_join",
      role: "member",
      joinedAt: new Date().toISOString(),
    })

    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)
    const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId)

    if (group.creatorId) {
      await createNotification({
        recipientId: group.creatorId,
        type: "join_request",
        title: "New Join Request",
        message: `${user.name} has requested to join "${group.name}"`,
        groupId: groupId,
        userId: userId,
        relatedId: membership.$id,
      })
    }
    return { success: true, membership }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function checkMembershipStatus(groupId: string, userId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("groupId", groupId),
      Query.equal("userId", userId),
    ])

    if (memberships.documents.length > 0) {
      const membership = memberships.documents[0]
      return {
        success: true,
        hasMembership: true,
        status: membership.status,
        role: membership.role,
      }
    }

    return { success: true, hasMembership: false }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getPendingMembershipRequests(groupId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("groupId", groupId),
      Query.equal("status", "pending_join"),
      Query.orderDesc("joinedAt"),
    ])

    // Fetch user details for each pending request
    const requestPromises = memberships.documents.map(async (membership: any) => {
      const userResult = await getUserProfile(membership.userId)
      return {
        membershipId: membership.$id,
        user: userResult.profile,
        requestedAt: membership.joinedAt,
      }
    })

    const requests = await Promise.all(requestPromises)
    return { success: true, requests }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function approveMembershipRequest(membershipId: string, groupId: string) {
  try {
    const membership = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, membershipId)

    // Update membership status
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, membershipId, {
      status: "approved",
    })

    // Increment group member count
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId, {
      memberCount: (group.memberCount || 0) + 1,
    })
    if (membership.userId) {
      await createNotification({
        recipientId: membership.userId,
        type: "join_approved",
        title: "Join Request Approved",
        message: `Your request to join "${group.name}" has been approved!`,
        groupId: groupId,
        relatedId: membershipId,
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function rejectMembershipRequest(membershipId: string) {
  try {
    const membership = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, membershipId)

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, membershipId, {
      status: "rejected",
    })

    if (membership.userId && membership.groupId) {
      const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, membership.groupId)
      await createNotification({
        recipientId: membership.userId,
        type: "join_rejected",
        title: "Join Request Rejected",
        message: `Your request to join "${group.name}" has been rejected.`,
        groupId: membership.groupId,
        relatedId: membershipId,
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserGroups(userId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("userId", userId),
    ])

    // Fetch full group details for each membership
    const groupPromises = memberships.documents.map(async (membership: any) => {
      const groupResult = await getGroup(membership.groupId)
      return {
        ...groupResult.group,
        membershipStatus: membership.status,
        membershipRole: membership.role,
      }
    })

    const groups = await Promise.all(groupPromises)
    return { success: true, groups }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function getAllGroups() {
  try {
    const groups = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS)
    return { success: true, groups: groups.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserUpcoming(userId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("userId", userId),
    ])

    // Fetch full group details for each membership
    const groupPromises = memberships.documents.map(async (membership: any) => {
      const groupResult = await getGroup(membership.groupId)
      return {
        ...groupResult.group,
        membershipStatus: membership.status,
        membershipRole: membership.role,
      }
    })

    const groups = await Promise.all(groupPromises)
    return { success: true, groups }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function getInfiniteGroups(limit = 6, cursor?: string) {
  try {
    const queries = [
      Query.notEqual("status", "pending"),
      Query.notEqual("status", "rejected"),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]

    if (cursor) {
      queries.push(Query.cursorAfter(cursor))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      queries
    )

    const groups = response.documents

    const creatorIds = [...new Set(groups.map((g: any) => g.creatorId).filter(Boolean))]

    const userResponses = await Promise.all(
      creatorIds.map(async (id) => {
        try {
          return await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, id)
        } catch {
          return null
        }
      })
    )


    const userMap = userResponses.reduce((acc, user) => {
      if (user) acc[user.$id] = user
      return acc
    }, {} as Record<string, any>)

    const mergedGroups = groups.map((group: any) => ({
      ...group,
      creator: userMap[group.creatorId] || null,
      creatorName: userMap[group.creatorId]?.name || "Unknown",
    }))

    const lastDoc = groups[groups.length - 1]
    const hasMore = groups.length === limit
    const nextCursor = hasMore ? lastDoc.$id : null

    return {
      groups: mergedGroups,
      nextCursor,
    }
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    throw new Error(error.message)
  }
}

// Message Operations
export async function sendMessage(groupId: string, userId: string, content: string) {
  try {
    const message = await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
      groupId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    })
    return { success: true, message }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getMessages(groupId: string, limit = 50) {
  try {
    const messages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
      Query.equal("groupId", groupId),
      Query.limit(limit),
      Query.orderDesc("createdAt"),
    ])
    return { success: true, messages: messages.documents.reverse() }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}



// Additional Group Operations
export async function getPendingGroups(teacherId?: string) {
  try {
    const queries = [
      Query.equal("status", "pending"),
      Query.orderDesc("$createdAt"),
    ]

    if (teacherId) {
      queries.push(Query.equal("teacherId", teacherId))
    }

    const groups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      queries
    )

    return { success: true, groups: groups.documents }
  } catch (error: any) {
    console.error("[getPendingGroups] Failed:", error?.message ?? error)
    return { success: false, error: error?.message ?? "Unknown error" }
  }
}
export async function approveGroup(groupId: string) {
  try {
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId, {
      status: "approved",
    })

    if (group.creatorId) {
      await createNotification({
        recipientId: group.creatorId,
        type: "group_approved",
        title: "Group Approved",
        message: `Your group "${group.name}" has been approved and is now live!`,
        groupId: groupId,
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function rejectGroup(groupId: string) {
  try {
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId, {
      status: "rejected",
    })

    if (group.creatorId) {
      await createNotification({
        recipientId: group.creatorId,
        type: "group_rejected",
        title: "Group Rejected",
        message: `Your group "${group.name}" has been rejected. Please review and resubmit.`,
        groupId: groupId,
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Saved Groups Operations
export async function saveGroup(userId: string, groupId: string) {
  try {
    // Check if already saved
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, [
      Query.equal("userId", userId),
      Query.equal("groupId", groupId),
    ])

    if (existing.documents.length > 0) {
      return { success: true, alreadySaved: true }
    }

    const savedGroup = await databases.createDocument(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, ID.unique(), {
      userId,
      groupId,
      $createdAt: new Date().toISOString(),
    })
    return { success: true, savedGroup }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function unsaveGroup(userId: string, groupId: string) {
  try {
    const saved = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, [
      Query.equal("userId", userId),
      Query.equal("groupId", groupId),
    ])

    if (saved.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, saved.documents[0].$id)
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function checkSavedStatus(userId: string, groupId: string) {
  try {
    const saved = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, [
      Query.equal("userId", userId),
      Query.equal("groupId", groupId),
    ])

    return { success: true, isSaved: saved.documents.length > 0 }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserSavedGroups(userId: string) {
  try {
    const savedGroups = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_GROUPS, [
      Query.equal("userId", userId),
      Query.orderDesc("savedAt"),
    ])

    const groupPromises = savedGroups.documents.map(async (saved: any) => {
      const groupResult = await getGroup(saved.groupId)
      return groupResult.group
    })

    const groups = await Promise.all(groupPromises)
    return { success: true, groups }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function getNewInfiniteGroups(
  subjects: string[] = [],
  studyPreferences: string[] = [],
  limit = 6,
  cursor?: string
) {
  try {
    // 🛑 No filters at all → return empty
    if (
      (!subjects || subjects.length === 0) &&
      (!studyPreferences || studyPreferences.length === 0)
    ) {
      return { groups: [], nextCursor: null }
    }

    const normalizedSubjects = subjects.map((s) => s.trim())
    const normalizedPreferences = studyPreferences.map((p) => p.trim())

    const queries: any[] = [
      Query.notEqual("status", "pending"),
      Query.notEqual("status", "rejected"),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]

    // ✅ Build subject filter
    let subjectFilter: any = null
    if (normalizedSubjects.length === 1) {
      subjectFilter = Query.equal("subject", normalizedSubjects[0])
    } else if (normalizedSubjects.length > 1) {
      subjectFilter = Query.or(normalizedSubjects.map((s) => Query.equal("subject", s)))
    }

    // ✅ Build study preference filter
    let preferenceFilter: any = null
    if (normalizedPreferences.length === 1) {
      preferenceFilter = Query.contains("studyPreferences", normalizedPreferences[0])
    } else if (normalizedPreferences.length > 1) {
      preferenceFilter = Query.or(
        normalizedPreferences.map((p) => Query.contains("studyPreferences", p))
      )
    }

    // ✅ Combine filters
    if (subjectFilter && preferenceFilter) {
      queries.push(Query.and([subjectFilter, preferenceFilter]))
    } else if (subjectFilter) {
      queries.push(subjectFilter)
    } else if (preferenceFilter) {
      queries.push(preferenceFilter)
    }

    // ✅ Pagination
    if (cursor) {
      queries.push(Query.cursorAfter(cursor))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      queries
    )

    const groups = response.documents ?? []

    // ✅ Pagination
    let nextCursor: string | null = null
    if (groups.length > 0) {
      const lastDoc = groups[groups.length - 1]
      nextCursor = groups.length === limit ? lastDoc.$id : null
    }

    // ✅ Fetch creator info (same logic)
    const creatorIds = [...new Set(groups.map((g: any) => g.creatorId).filter(Boolean))]
    let userMap: Record<string, any> = {}

    if (creatorIds.length > 0) {
      try {
        const usersRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal("$id", creatorIds)]
        )
        userMap = Object.fromEntries(usersRes.documents.map((u) => [u.$id, u]))
      } catch (e) {
        console.warn("Failed to fetch creators", e)
      }
    }

    const mergedGroups = groups.map((group: any) => ({
      ...group,
      creator: userMap[group.creatorId] || null,
    }))

    return { groups: mergedGroups, nextCursor }
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    return { groups: [], nextCursor: null }
  }
}

// Notification Operations
export async function createNotification(data: {
  recipientId?: string
  type: "group_approved" | "group_rejected" | "join_request" | "join_approved" | "join_rejected" | "group_submitted"
  title: string
  message: string
  groupId?: string
  userId?: string
  relatedId?: string // membershipId or groupId depending on type
}) {
  try {
    const notification = await databases.createDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, ID.unique(), {
      ...data,
      isRead: false,
    })
    return { success: true, notification }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const notifications = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [
      Query.equal("recipientId", userId),
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
    ])
    return { success: true, notifications: notifications.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const notifications = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [
      Query.equal("recipientId", userId),
      Query.equal("isRead", false),
    ])
    return { success: true, count: notifications.documents.length }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, notificationId, {
      isRead: true,
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notifications = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [
      Query.equal("recipientId", userId),
      Query.equal("isRead", false),
    ])

    const updatePromises = notifications.documents.map((notification: any) =>
      databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, notification.$id, {
        isRead: true,
      }),
    )

    await Promise.all(updatePromises)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, notificationId)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


// Group Reports and Statistics
export async function getGroupCallSessions(groupId: string) {
  try {
    const sessions = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CALL_SESSIONS, [
      Query.equal("groupId", groupId),
      Query.orderDesc("startedAt"), // fixed field name
    ])
    return { success: true, sessions: sessions.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getGroupAttendance(groupId: string) {
  try {
    const attendance = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ATTENDANCE, [
      Query.equal("groupId", groupId),
    ])
    return { success: true, attendance: attendance.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserGroupAttendance(userId: string, groupId: string) {
  try {
    const attendance = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ATTENDANCE, [
      Query.equal("userId", userId),
      Query.equal("groupId", groupId),
    ])
    return { success: true, attendance: attendance.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function calculateGroupStats(groupId: string) {
  try {
    const [sessionsResult, attendanceResult] = await Promise.all([
      getGroupCallSessions(groupId),
      getGroupAttendance(groupId),
    ])

    if (!sessionsResult.success || !attendanceResult.success) {
      return { success: false, error: "Failed to fetch data" }
    }

    const sessions = sessionsResult.sessions || []
    const attendance = attendanceResult.attendance || []

    // Calculate totals
    const totalUptimeMinutes = sessions.reduce((sum: number, s: any) => sum + (s.durationMinutes || 0), 0)
    const totalAttendance = attendance.length
    const uniqueParticipants = new Set(attendance.map((a: any) => a.userId)).size

    const averageAttendance =
      sessions.length && uniqueParticipants
        ? Math.min(100, Math.round((totalAttendance / (sessions.length * uniqueParticipants)) * 100))
        : 0

    return {
      success: true,
      stats: {
        sessionCount: sessions.length,
        totalUptime: totalUptimeMinutes, // in minutes
        averageAttendance,
      },
    }
  } catch (error: any) {
    console.error("calculateGroupStats error:", error)
    return { success: false, error: error.message }
  }
}

export async function calculateUserGroupStats(userId: string, groupId: string) {
  try {
    const attendanceResult = await getUserGroupAttendance(userId, groupId)
    const sessionsResult = await getGroupCallSessions(groupId)

    if (!attendanceResult.success || !sessionsResult.success) {
      return { success: false, error: "Failed to fetch data" }
    }

    const userAttendance = attendanceResult.attendance || []
    const sessions = sessionsResult.sessions || []

    const attendance = sessions.length > 0 ? (userAttendance.length / sessions.length) * 100 : 0
    const sessionCount = userAttendance.length

    return {
      success: true,
      stats: {
        attendance: Math.round(attendance),
        sessionCount,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateGroup(
  groupId: string,
  data: {
    name?: string
    description?: string
    subject?: string
    schedule?: string
    imageUrl?: string
    maxMembers?: number
    studyPreferences?: string[]
  },
) {
  try {
    const group = await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId, data)
    return { success: true, group }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteGroup(groupId: string, userId: string) {
  try {
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)

    if (group.creatorId !== userId) {
      return { success: false, error: "Only the group creator can delete the group" }
    }

    // Delete all group members
    const members = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("groupId", groupId),
    ])

    const deletePromises = members.documents.map((member: any) =>
      databases.deleteDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, member.$id),
    )

    await Promise.all(deletePromises)

    // Delete the group itself
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}