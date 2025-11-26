"use client"

import { useState } from "react"
import { useAllUsers } from "@/lib/hooks/use-admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAllUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [gradeFilter, setGradeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const getStatusBadge = (lastActive?: string) => {
    if (!lastActive) return <Badge variant="secondary">Inactive</Badge>

    const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActive === 0) return <Badge variant="default">Active</Badge>
    if (daysSinceActive < 7) return <Badge variant="secondary">Active</Badge>
    return <Badge className="text-black" variant="outline">Inactive</Badge>
  }


  const getStatusValue = (lastActive?: string) => {
    if (!lastActive) return "inactive"

    const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActive < 7) return "active"
    return "inactive"
  }

  const getLastLogin = (lastActive?: string) => {
    if (!lastActive) return "Never"

    const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActive === 0) return "Today"
    if (daysSinceActive === 1) return "Yesterday"
    if (daysSinceActive < 7) return `${daysSinceActive} days ago`
    return new Date(lastActive).toLocaleDateString()
  }

  const gradeOptions = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = !gradeFilter || user.grade === gradeFilter
    const matchesStatus = !statusFilter || getStatusValue(user.$createdAt) === statusFilter

    return matchesSearch && matchesGrade && matchesStatus
  })

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
            <h1 className="text-3xl font-peace-sans">Student Management</h1>
            <p className="text-white">View all registered students</p>
          </div>

          <div className="mx-auto space-y-6 max-w-7xl md:p-0 p-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View user accounts and their statuses</CardDescription>
                  </div>
                  <Badge variant="secondary">{filteredUsers?.length || 0} users</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>


                  <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white border-black hover:bg-gray-200">
                          Grade: {gradeFilter || "All"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setGradeFilter(null)}>All Grades</DropdownMenuItem>
                        {gradeOptions.map((grade) => (
                          <DropdownMenuItem key={grade} onClick={() => setGradeFilter(grade as string)}>
                            {grade}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white border-black hover:bg-gray-200">
                          Status: {statusFilter === "active" ? "Active" : statusFilter === "inactive" ? "Inactive" : "All"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear filters button */}
                    {(gradeFilter || statusFilter) && (
                      <Button
                        variant="destructive"
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => {
                          setGradeFilter(null)
                          setStatusFilter(null)
                        }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
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
                    <div className="overflow-x-auto pb-3">
                      <table className="w-full min-w-[650px]">
                        <thead>
                          <tr className="border-b">
                            <th className="pb-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">
                              Name
                            </th>
                            <th className="pb-3 text-left text-xs sm:text-sm font-medium text-muted-foreground px-2 sm:px-6 md:px-0">
                              Grade Level
                            </th>
                            <th className="pb-3 text-center text-xs sm:text-sm font-medium text-muted-foreground px-2 sm:px-6 md:px-0">
                              Status
                            </th>
                            <th className="pb-3 text-center text-xs sm:text-sm font-medium text-muted-foreground px-2 sm:px-6 md:px-0  md:pl-10">
                              Last Login
                            </th>
                            <th className="pb-3 text-right text-xs sm:text-sm font-medium text-muted-foreground pr-8 md:pr-20">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredUsers.map((user: any) => (
                            <tr
                              key={user.$id}
                              className="border-b last:border-0 hover:bg-muted/20 transition"
                            >
                              {/* NAME */}
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                    {user.name[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-[13px] sm:text-sm">{user.name}</p>
                                    <p className="text-xs text-muted-foreground leading-tight">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* GRADE */}
                              <td className="py-2 text-xs sm:text-sm text-muted-foreground">
                                {user.grade || "-"}
                              </td>

                              {/* STATUS */}
                              <td className="py-2 text-center">
                                {getStatusBadge(user.$createdAt)}
                              </td>

                              {/* LAST LOGIN */}
                              <td className="py-2 text-center text-xs sm:text-sm text-muted-foreground md:pl-10">
                                {getLastLogin(user.$createdAt)}
                              </td>

                              {/* ACTIONS */}
                              <td className="py-2 text-right whitespace-nowrap pl-10 md:pl-20">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="shad-button_view"
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
