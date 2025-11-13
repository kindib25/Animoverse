export const queryKeys = {
  // User queries
  user: {
    all: ["users"] as const,
    profile: (userId: string) => [...queryKeys.user.all, "profile", userId] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
  },

  // Group queries
  groups: {
    all: ["groups"] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.groups.all, "list", filters] as const,
    detail: (groupId: string) => [...queryKeys.groups.all, "detail", groupId] as const,
    search: (searchTerm: string) => [...queryKeys.groups.all, "search", searchTerm] as const,
    userGroups: (userId: string) => [...queryKeys.groups.all, "user", userId] as const,
    saved: (userId: string) => [...queryKeys.groups.all, "saved", userId] as const,
  },

  // Message queries
  messages: {
    all: ["messages"] as const,
    list: (groupId: string) => [...queryKeys.messages.all, "list", groupId] as const,
    infinite: (groupId: string) => [...queryKeys.messages.all, "infinite", groupId] as const,
  },

  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    allUsers: (filters?: Record<string, any>) => [...queryKeys.admin.all, "users", filters] as const,
    pendingGroups: (teacherId: string | undefined) => [...queryKeys.admin.all, "pending-groups"] as const,
    teacherGroups: (teacherId: string) => [...queryKeys.admin.all, "teacher-groups", teacherId] as const,
    groupMembers: (groupId: string) => [...queryKeys.admin.all, "group-members", groupId] as const,
  },
} as const
