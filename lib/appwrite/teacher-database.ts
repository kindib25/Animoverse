"use server"

import { databases, DATABASE_ID, COLLECTIONS } from "./config"
import { Query } from "appwrite"

// Get all users for admin management
export async function getAllUsers(limit = 50) {
  try {
    const users = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
      Query.limit(limit),
      Query.orderDesc("createdAt"),
    ])
    return { success: true, users: users.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get pending groups for approval
export async function getPendingGroups(teacherId?: string) {
  try {
    const queries = [
      Query.equal("status", "pending"), // only get pending groups
      Query.orderDesc("$createdAt"), // order by creation date descending
    ]

    // If teacherId is provided, filter by that specific teacher
    if (teacherId) {
      queries.push(Query.equal("teacherId", teacherId))
    }

    const groups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS, // ✅ keeping your exact style
      queries
    )

    return { success: true, groups: groups.documents }
  } catch (error: any) {
    console.error("Error fetching pending groups:", error)
    return { success: false, error: error.message }
  }
}
// Approve or reject a group
export async function updateGroupStatus(groupId: string, status: "approved" | "rejected") {
  try {
    const group = await databases.updateDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId, {
      status,
    })
    return { success: true, group }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get groups assigned to a teacher
export async function getTeacherGroups(teacherId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("userId", teacherId),
      Query.equal("role", ["creator", "admin"]),
    ])

    const groupPromises = memberships.documents.map(async (membership: any) => {
      const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, membership.groupId)
      return group
    })

    const groups = await Promise.all(groupPromises)
    return { success: true, groups }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get group members with details
export async function getGroupMembers(groupId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("groupId", groupId),
      Query.equal("status", "approved"),
    ])

    const memberPromises = memberships.documents.map(async (membership: any) => {
      const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, membership.userId)
      return {
        ...user,
        role: membership.role,
        joinedAt: membership.joinedAt,
      }
    })

    const members = await Promise.all(memberPromises)
    return { success: true, members }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const [usersResult, groupsResult, pendingResult] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS, [Query.equal("status", "approved"), Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS, [Query.equal("status", "pending"), Query.limit(1)]),
    ])

    return {
      success: true,
      stats: {
        totalUsers: usersResult.total,
        activeGroups: groupsResult.total,
        pendingApprovals: pendingResult.total,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Search users
export async function searchUsers(searchTerm: string) {
  try {
    const users = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [Query.search("name", searchTerm)])
    return { success: true, users: users.documents }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
