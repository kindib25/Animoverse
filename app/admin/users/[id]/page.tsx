"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUserProfile } from "@/lib/appwrite/database"
import { getUserGroups } from "@/lib/appwrite/database"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Calendar, BookOpen, Users, Menu } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ["user-profile", id],
        queryFn: async () => {
            const result = await getUserProfile(id)
            if (!result.success) throw new Error(result.error)
            return result.profile
        },
    })

    const { data: groups, isLoading: loadingGroups } = useQuery({
        queryKey: ["user-groups", id],
        queryFn: async () => {
            const result = await getUserGroups(id)
            if (!result.success) throw new Error(result.error)
            return result.groups
        },
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
                            <motion.div
                                className="fixed inset-0 bg-black/40 z-40"
                                onClick={() => setIsSidebarOpen(false)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

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

                <main className="flex-1 overflow-y-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="!w-6 !h-6 text-white" />
                    </Button>

                    <Button variant="ghost" asChild className="hidden md:inline-flex mb-4 mt-6 ml-6">
                        <Link href="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="mb-6 px-5 md:px-20 pt-5 md:pt-10">
                        {loadingProfile ? (
                            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                        ) : (
                            <div>
                                <h1 className="text-3xl font-peace-sans">{profile?.name}</h1>
                                <p className="text-white">@{profile?.username}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3 px-2 md:px-20">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loadingProfile ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{profile?.email}</span>
                                            </div>
                                            {profile?.grade && (
                                                <div className="flex items-center gap-3">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Grade {profile.grade}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    Joined {profile?.$createdAt ? new Date(profile.$createdAt).toLocaleDateString() : "Unknown"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{groups?.length || 0} groups</span>
                                            </div>
                                        </>
                                    )}

                                    {profile?.subjects && profile.subjects.length > 0 && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium">Subjects</p>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.subjects.map((subject: string) => (
                                                    <Badge key={subject} variant="secondary">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {profile?.bio && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium">Bio</p>
                                            <p className="text-sm text-muted-foreground">{profile.bio}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrolled Groups</CardTitle>
                                    <CardDescription>Groups this user is a member of</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingGroups ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                                            ))}
                                        </div>
                                    ) : groups && groups.length > 0 ? (
                                        <div className="space-y-3">
                                            {groups.map((group: any) => (
                                                <div key={group.$id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div>
                                                        <p className="font-medium">{group.name}</p>
                                                        <p className="text-sm text-muted-foreground">{group.subject}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={group.membershipStatus === "approved" ? "default" : "secondary"}>
                                                            {group.membershipStatus}
                                                        </Badge>
                                                        <Button variant="outline" size="sm" asChild className="shad-button_viewDetails">
                                                            <Link href={`/admin/groups/${group.$id}`}>View</Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="py-8 text-center text-muted-foreground">Not enrolled in any groups</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
