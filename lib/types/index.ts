export interface User {
  $id: string
  name: string
  username: string
  email: string
  userType?: "student" | "teacher" | "admin"
  grade?: string
  subjects?: string[]
  studyPreferences?: string[]
  bio?: string
  avatarUrl?: string
  createdAt?: string
  followers?: number
  following?: number
  creates?: number
}

export interface Group {
  $id: string
  name: string
  description: string
  subject: string
  schedule: string
  teacher?: string
  teacherId: string
  studyPreferences: string[]
  creatorId: string
  imageUrl?: string
  memberCount: number
  maxMembers: number
  $createdAt: string
  status?: "pending" | "approved" | "rejected"
}

export interface GroupMember {
  $id: string
  groupId: string
  userId: string
  status: "pending" | "approved" | "rejected"
  role: "creator" | "admin" | "member"
  joinedAt: string
}

export interface Message {
  $id: string
  groupId: string
  userId: string
  content: string
  createdAt: string
  user?: User
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

export interface CallSession {
  $id: string
  groupId: string
  startTime: string
  endTime?: string
  duration?: number
  participants: string[]
  createdAt: string
}

export interface Attendance {
  $id: string
  userId: string
  groupId: string
  sessionId: string
  joinedAt: string
  leftAt?: string
  duration?: number
}

export interface Report {
  $id: string
  type: "user" | "group" | "session"
  targetId: string
  reportedBy: string
  reason: string
  status: "pending" | "reviewed" | "resolved"
  createdAt: string
}

export interface GroupStats {
  groupId: string
  rank: number
  sessionCount: number
  totalUptime: number
  averageAttendance: number
}

export interface UserStats {
  userId: string
  attendance: number
  accountStatus: "healthy" | "needs-improvement" | "at-risk"
  sessionCount: number
  lastActive: string
}
