"use client"

import { useState } from "react"
import { useAllUsers } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAllUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredUsers = users?.filter(
    (user: any) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (lastActive?: string) => {
    if (!lastActive) return <Badge variant="secondary">Inactive</Badge>

    const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActive === 0) return <Badge variant="default">Active</Badge>
    if (daysSinceActive < 7) return <Badge variant="secondary">Active</Badge>
    return <Badge className="text-black" variant="outline">Inactive</Badge>
  }

  const getLastLogin = (lastActive?: string) => {
    if (!lastActive) return "Never"

    const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActive === 0) return "Today"
    if (daysSinceActive === 1) return "Yesterday"
    if (daysSinceActive < 7) return `${daysSinceActive} days ago`
    return new Date(lastActive).toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-[url('/bgDefault2.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-0" />
      <div className="relative z-10 flex w-full">
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Dimmed background */}
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Sidebar Slide-in */}
              <motion.div
                className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex min-h-screen">
                  <AdminSidebar />
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto ">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6 text-white" />
          </Button>
          <div className="mx-auto max-w-7xl mt-5 md:mt-10 p-5">
            <h1 className="text-3xl font-peace-sans">User Management</h1>
            <p className="text-white">View and manage all registered users</p>
          </div>

          <div className="mx-auto space-y-6 max-w-7xl md:p-0 p-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Badge variant="secondary">{users?.length || 0} users</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-16 w-full animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="pb-3 text-center text-sm font-medium text-muted-foreground px-10 md:px-0">
                          Status
                        </th>
                        <th className="pb-3 text-center text-sm font-medium text-muted-foreground px-10 md:px-0">
                          Last Login
                        </th>
                        <th className="pb-3 text-right text-sm font-medium text-muted-foreground pr-7 md:pr-15">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user: any) => (
                        <tr key={user.$id} className="border-b last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                {user.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-sm md:text-base">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-center">
                            {getStatusBadge(user.$createdAt)}
                          </td>

                          <td className="py-4 text-center text-sm text-muted-foreground">
                            {getLastLogin(user.$createdAt)}
                          </td>

                          <td className="py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="shad-button_viewDetails float-end"
                            >
                              <Link href={`/admin/users/${user.$id}`}>
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No users found</p>
              )}
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
