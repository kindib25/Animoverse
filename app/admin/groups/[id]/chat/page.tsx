"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Menu, Loader2 } from "lucide-react"
import { useStreamChat } from "@/lib/context/stream-context"
import { Channel, MessageInput, MessageList, Window, Chat } from "stream-chat-react"
import { useGroup } from "@/lib/hooks/use-groups"
import "stream-chat-react/dist/css/v2/index.css"
import { motion, AnimatePresence } from "framer-motion"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function GroupChatPage() {
  const params = useParams()
  const groupId = params.id as string
  const { chatClient, isReady } = useStreamChat()
  const { data: group } = useGroup(groupId)
  const [channel, setChannel] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!chatClient || !isReady || !groupId) return

    const initChannel = async () => {
      try {
        const newChannel = chatClient.channel("messaging", groupId, {
          name: group?.name || `Group ${groupId}`,
        } as any)

        await newChannel.watch()
        setChannel(newChannel)
      } catch (error) {
        console.error("[Stream Channel Error]", error)
      }
    }

    initChannel()

    return () => {
      if (channel) {
        channel.stopWatching()
      }
    }
  }, [chatClient, isReady, groupId, group?.name])

  if (!isReady || !channel || !chatClient) {
    return (
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-white" />
          <p className="text-white text-lg">Loading chat...</p>
        </div>
    )
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

        <main className="flex-1 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="sm:flex md:hidden cursor-pointer text-black m-3 hover:bg-black/30 hover:backdrop-blur-sm "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="!w-6 !h-6 text-white" />
          </Button>
          <div className="mx-auto max-w-4xl">
            <Card className="flex h-[calc(100vh-8rem)] flex-col min-h-screen md:min-h-5">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/groups/${params.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                    <CardTitle className="flex items-center gap-3">
                      <img
                        src={group?.imageUrl || "/placeholder.svg"}
                        alt={group?.name || "Group Chat"}
                        className="h-10 w-10 object-contain rounded-full"
                      />
                      <span>{group?.name || "Group Chat"}</span>
                    </CardTitle>
                  </div>
                  <Button variant="outline" size="sm" asChild className="bg-transparent">
                    <Link href={`/admin/groups/${params.id}/call`}>
                      <Phone className="m-4 md:mr-2 h-4 w-4" />
                      <span className="hidden md:inline-flex">Join Call</span>
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <Chat client={chatClient} theme="str-chat__theme-light">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                  </Channel>
                </Chat>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
