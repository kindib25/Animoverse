export interface User {
  $id: string
  name: string
  username: string
  email: string
  grade?: string
  subjects?: string[]
  studyPreferences?: string[]
  bio?: string
  avatarUrl?: string
  $createdAt?: string
  followers?: number
  following?: number
  creates?: number
  $updatedAt?: string
}

export interface Group {
  $id: string
  name: string
  description: string
  subject: string
  schedule: string
  teacher?: string
  studyPreferences: string[]
  creatorId: string
  imageUrl?: string
  memberCount: number
  maxMembers: number
  $createdAt: string
  $updatedAt: string
}

export interface GroupMember {
  $id: string
  groupId: string
  userId: string
  status: "pending" | "approved" | "rejected"
  role: "creator" | "admin" | "member"
  joinedAt: string
  $updatedAt: string
  $createdAt: string
}

export interface Message {
  $id: string
  groupId: string
  userId: string
  content: string
  createdAt: string
  user?: User
  $createdAt: string
  $updatedAt: string
}

export interface GroupWithMembership extends Group {
  membershipStatus?: "pending" | "approved" | "rejected"
  membershipRole?: "creator" | "admin" | "member"
}

export interface AuthUser {
  $id: string
  name: string
  email: string
}
