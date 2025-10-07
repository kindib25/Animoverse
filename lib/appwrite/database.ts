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
  studyPreferences: string[]
  creatorId: string
  imageUrl?: string
}) {
  try {
    const group = await databases.createDocument(DATABASE_ID, COLLECTIONS.GROUPS, ID.unique(), {
      ...data,
      memberCount: 1,
      maxMembers: 15,
    })

    // Add creator as first member
    await databases.createDocument(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, ID.unique(), {
      groupId: group.$id,
      userId: data.creatorId,
      status: "approved",
      role: "creator",
      joinedAt: new Date().toISOString(),
    })

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

export async function getAllGroups() {
  try {
    const groups = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS)
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
      status: "pending",
      role: "member",
      joinedAt: new Date().toISOString(),
    })
    return { success: true, membership }
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

export async function getSavedGroups(userId: string) {
  try {
    const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUP_MEMBERS, [
      Query.equal("userId", userId),
      Query.equal("status", "approved"),
    ])

    const groupPromises = memberships.documents.map(async (membership: any) => {
      const groupResult = await getGroup(membership.groupId)
      return groupResult.group
    })

    const groups = await Promise.all(groupPromises)
    return { success: true, groups }
  } catch (error: any) {
    return { success: false, error: error.message }
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
