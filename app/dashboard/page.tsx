"use client"

import { useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopCreators } from "@/components/dashboard/top-creators"
import { Button } from "@/components/ui/button"
import { Users, Sparkles, Loader2, PenLine } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useInfiniteGroups } from "@/lib/hooks/use-groups"
import { useQueryClient } from "@tanstack/react-query"

export default function DashboardPage() {
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteGroups(3)

  const groups = data?.pages.flatMap((page) => page.groups) ?? []

  // Infinite looping effect
  useEffect(() => {
    if (!loaderRef.current) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px", threshold: 1.0 }
    )

    const node = loaderRef.current
    observer.observe(node)
    return () => observer.unobserve(node)
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, queryClient])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-gray-500 h-10 w-10" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="flex h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex min-h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white">
        <div className="px-20 pt-10 text-black">
          <h1 className="text-3xl font-bold mb-6">Home Feed</h1>
          {groups.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No groups yet</h3>
              <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                Start your learning journey by creating your first study group or explore existing groups to join.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer bg-accent py-8 text-[#172232] hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
                >
                  <Link href="/dashboard/create-group">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Group
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="cursor-pointer py-8 gap-2 text-white hover:bg-[#C3DB3F] hover:text-[#172232] transition font-mono"
                >
                  <Link href="/dashboard/explore">Explore Groups</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-4 md:px-20">
              <div className="grid gap-6 md:grid-cols-1">
                <AnimatePresence>
                  {data?.pages.flatMap((page, pageIndex) =>
                    page.groups.map((group) => (
                      <motion.div
                        key={`${pageIndex}-${group.$id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link
                          href={`/dashboard/groups/${group.$id}`}
                          className="block rounded-lg border border-transparent bg-gradient-to-br from-[#C9E265] to-[#89D957] p-6 transition-colors hover:border-black"
                        >
                          <div className="relative text-center space-y-4">
                            <div className="absolute top-4 left-4 flex items-center justify-start gap-2 text-sm">
                              <Users className="h-4 w-4" />
                              <p className="font-bold">
                                {group.memberCount}/{group.maxMembers}
                              </p>
                            </div>
                            <div className="absolute top-4 right-4 text-sm">
                              {group.schedule}
                            </div>
                            <div className="flex justify-center pt-15">
                              <img
                                src={group.imageUrl || "/placeholder.svg"}
                                alt={group.name}
                                className="h-32 w-32 object-contain rounded-full"
                              />
                            </div>
                            <h3 className="font-semibold text-2xl">{group.name}</h3>
                            <p className="text-sm">{group.subject}</p>
                            <p className="text-sm">{group.description}</p>
                            <div className="flex items-center gap-2 justify-center">
                            <PenLine className="h-4 w-4" />
                            <span>{group.creator?.name || "Unknown"}</span>
                          </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div ref={loaderRef} className="py-10 text-center text-muted-foreground">
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                    <span>Loading more groups...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-screen">
        <TopCreators />
      </div>
    </div>
  )
}
