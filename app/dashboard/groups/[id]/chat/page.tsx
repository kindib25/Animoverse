"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone } from "lucide-react"
import { useStreamChat } from "@/lib/context/stream-context"
import { Channel, MessageInput, MessageList, Window, Chat } from "stream-chat-react"
import { useGroup } from "@/lib/hooks/use-groups"
import "stream-chat-react/dist/css/v2/index.css"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function GroupChatPage() {
  const params = useParams()
  const groupId = params.id as string
  const { chatClient, isReady } = useStreamChat()
  const { data: group } = useGroup(groupId)
  const [channel, setChannel] = useState<any>(null)

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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat">
      <div className="hidden md:flex min-h-screen">
        <Sidebar />
      </div>


      <main className="flex-1 overflow-y-auto bg-white md:py-5">
        <div className="mx-auto max-w-4xl">
          <Card className="flex h-[calc(100vh-8rem)] flex-col min-h-screen md:min-h-5">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/groups/${params.id}`}>
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
                  <Link href={`/dashboard/groups/${params.id}/call`}>
                    <Phone className="mx-2 md:mr-2 h-4 w-4" />
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
  )
}
